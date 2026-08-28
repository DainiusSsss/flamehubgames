/**
 * Opens a blank window and injects a full-screen iframe pointing at the target
 * URL. Because the document is created at runtime in an `about:blank` window,
 * the host page's framing rules no longer apply to the embedded site.
 */
export function openCloaked(url: string, title = "New Tab") {
  const win = window.open("about:blank", "_blank");
  if (!win) return false;

  const doc = win.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
  <head>
    <title>${title.replace(/[<>&]/g, "")}</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; }
      iframe { display: block; width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      src="${url}"
      allow="autoplay; fullscreen; clipboard-write; gamepad; microphone; camera; pointer-lock; encrypted-media"
      allowfullscreen="true"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
    ></iframe>
  </body>
</html>`);
  doc.close();

  return true;
}
