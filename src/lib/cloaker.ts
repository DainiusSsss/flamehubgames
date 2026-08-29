/**
 * Opens a blank window and injects a full-window iframe pointing at the target
 * URL. The document is built at runtime inside an `about:blank` window, so the
 * host page's framing rules no longer apply to the embedded site.
 *
 * The iframe `src` is assigned from a JSON-encoded string inside the injected
 * script instead of being inlined into an HTML attribute, so query strings,
 * ampersands and quotes survive intact.
 */
export function openCloaked(url: string, title = "New Tab") {
  const win = window.open("about:blank", "_blank");
  if (!win) return false;

  const safeTitle = title.replace(/[<>&]/g, "");
  const doc = win.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
  <head>
    <title>${safeTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
      iframe { display: block; width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      id="stage"
      allow="autoplay; fullscreen; clipboard-write; gamepad; microphone; camera; pointer-lock; encrypted-media"
      allowfullscreen="true"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
    ></iframe>
    <script>
      document.getElementById("stage").src = ${JSON.stringify(url)};
    </script>
  </body>
</html>`);
  doc.close();

  return true;
}
