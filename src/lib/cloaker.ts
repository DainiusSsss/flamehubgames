export function openCloaked(url: string): boolean {
  const win = window.open("about:blank", "_blank", "width=1200,height=800,menubar=no,status=no,toolbar=no");
  if (!win) return false;

  const iframe = win.document.createElement("iframe");
  iframe.src = url;
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "none";
  iframe.setAttribute("allow", "fullscreen");
  iframe.setAttribute("allowfullscreen", "true");
  win.document.body.style.margin = "0";
  win.document.body.style.padding = "0";
  win.document.body.style.overflow = "hidden";
  win.document.body.appendChild(iframe);
  return true;
}
