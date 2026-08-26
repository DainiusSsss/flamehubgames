const BLOCKED_HOSTS = /^(localhost|127\.|0\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i;

/**
 * Server-side page fetcher behind /render-site?url=...
 * Fetches the raw markup of an external page and returns it as text/html so it
 * can be previewed inside FlameHub instead of being blocked by frame headers.
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

  try {
    const upstream = await fetch(parsed.toString(), {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });

    const contentType = upstream.headers.get("content-type") ?? "text/html; charset=utf-8";

    if (!contentType.includes("html")) {
      const buffer = await upstream.arrayBuffer();
      return new Response(buffer, {
        status: upstream.status,
        headers: { "content-type": contentType, "cache-control": "no-store" },
      });
    }

    let html = await upstream.text();
    const base = `<base href="${parsed.origin}${parsed.pathname.replace(/[^/]*$/, "")}">`;

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (match) => `${match}${base}`);
    } else {
      html = `${base}${html}`;
    }

    return new Response(html, {
      status: upstream.status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-rendered-from": parsed.origin,
      },
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
