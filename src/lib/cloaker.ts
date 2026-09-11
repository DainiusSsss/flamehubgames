export function openCloaked(url: string): boolean {
  const safeUrl = JSON.stringify(url);
  const rawHtml = `
<html>
<head>
  <title>New Tab</title>
  <style>html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }</style>
</head>
<body>
  <script>window.location.replace(${safeUrl});<\/script>
</body>
</html>
`;
  const blob = new Blob([rawHtml], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, "_blank", "width=1200,height=800,menubar=no,status=no,toolbar=no");
  return !!win;
}
