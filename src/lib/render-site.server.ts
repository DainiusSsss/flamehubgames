const BLOCKED_HOSTS =
  /^(localhost|127\.|0\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i;

const PROXY_PATH = "/render-site";

/** Headers that stop a page from rendering inside our own window. */
const STRIPPED_RESPONSE_HEADERS = [
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
  "permissions-policy",
  "content-encoding",
  "content-length",
  "strict-transport-security",
  "report-to",
  "reporting-endpoints",
];

function proxied(absolute: string) {
  return `${PROXY_PATH}?url=${encodeURIComponent(absolute)}`;
}

function absolutise(value: string, base: URL): string | null {
  const raw = value.trim();
  if (!raw) return null;
  if (/^(data:|blob:|javascript:|mailto:|tel:|#|about:)/i.test(raw)) return null;
  if (raw.startsWith(PROXY_PATH)) return null;
  try {
    return new URL(raw, base).toString();
  } catch {
    return null;
  }
}

/** Rewrites document URLs so sub-requests keep flowing through this route. */
function rewriteHtml(html: string, base: URL): string {
  let out = html
    // drop meta CSP tags the upstream page ships inline
    .replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, "")
    // src / href / action / poster attributes
    .replace(
      /\b(src|href|action|poster|data-src)=("|')([^"']*)\2/gi,
      (match, attr: string, quote: string, value: string) => {
        const abs = absolutise(value, base);
        return abs ? `${attr}=${quote}${proxied(abs)}${quote}` : match;
      },
    )
    // srcset lists
    .replace(/\bsrcset=("|')([^"']*)\1/gi, (match, quote: string, value: string) => {
      const rewritten = value
        .split(",")
        .map((part) => {
          const [url, ...rest] = part.trim().split(/\s+/);
          const abs = url ? absolutise(url, base) : null;
          return abs ? [proxied(abs), ...rest].join(" ") : part.trim();
        })
        .join(", ");
      return `srcset=${quote}${rewritten}${quote}`;
    })
    // integrity hashes break once we rewrite/stream assets
    .replace(/\sintegrity=("|')[^"']*\1/gi, "");

  const runtimePatch = `<script>(function(){
    var P='${PROXY_PATH}?url=';
    function abs(u){try{return new URL(u,'${base.toString()}').toString()}catch(e){return null}}
    function wrap(u){
      if(typeof u!=='string')return u;
      if(u.indexOf(P)===0||/^(data:|blob:|javascript:|#)/i.test(u))return u;
      var a=abs(u);return a?P+encodeURIComponent(a):u;
    }
    var of=window.fetch;
    window.fetch=function(input,init){
      try{
        if(typeof input==='string')input=wrap(input);
        else if(input&&input.url)input=new Request(wrap(input.url),input);
      }catch(e){}
      return of.call(this,input,init);
    };
    var oo=XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open=function(m,u){
      try{arguments[1]=wrap(u)}catch(e){}
      return oo.apply(this,arguments);
    };
  })();</script>`;

  const injection = `${runtimePatch}<style>html,body{width:100%;height:100%;margin:0}</style>`;

  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (match) => `${match}${injection}`);
  } else {
    out = `${injection}${out}`;
  }
  return out;
}

function passthroughHeaders(upstream: Response, extra: Record<string, string> = {}) {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.includes(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("cache-control", "no-store");
  for (const [key, value] of Object.entries(extra)) headers.set(key, value);
  return headers;
}

/**
 * Server-side page fetcher behind /render-site?url=...
 * Fetches external pages and their sub-resources, strips framing restrictions and
 * streams non-HTML bodies straight through so media and scripts stay responsive.
 */
export async function renderSite(request: Request): Promise<Response> {
  const target = new URL(request.url).searchParams.get("url");

  if (!target) {
    return new Response("Missing ?url= query parameter", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid url", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (!/^https?:$/.test(parsed.protocol) || BLOCKED_HOSTS.test(parsed.hostname)) {
    return new Response("Only public http(s) URLs can be previewed", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const outgoing = new Headers({
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    accept:
      request.headers.get("accept") ??
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
    referer: parsed.origin + "/",
    origin: parsed.origin,
  });
  const range = request.headers.get("range");
  if (range) outgoing.set("range", range);

  try {
    const upstream = await fetch(parsed.toString(), {
      method: request.method === "POST" ? "POST" : "GET",
      redirect: "follow",
      headers: outgoing,
      body: request.method === "POST" ? await request.arrayBuffer() : null,
    });

    const contentType = upstream.headers.get("content-type") ?? "text/html; charset=utf-8";

    // Non-HTML (scripts, styles, images, media): stream chunks straight through.
    if (!contentType.includes("html")) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: passthroughHeaders(upstream, { "content-type": contentType }),
      });
    }

    const html = rewriteHtml(await upstream.text(), new URL(upstream.url || parsed.toString()));

    return new Response(html, {
      status: upstream.status,
      headers: passthroughHeaders(upstream, {
        "content-type": "text/html; charset=utf-8",
        "x-rendered-from": parsed.origin,
      }),
    });
  } catch (error) {
    console.error("render-site failed", error);
    return new Response(
      `<!doctype html><html><body style="font-family:system-ui;background:#1a120e;color:#fdf1e2;padding:32px">
        <h1>Preview unavailable</h1>
        <p>FlameHub could not fetch <strong>${parsed.hostname}</strong>. Use "Open in new tab" instead.</p>
      </body></html>`,
      { status: 502, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
}
