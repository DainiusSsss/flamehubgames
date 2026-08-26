import { createFileRoute } from "@tanstack/react-router";

import { renderSite } from "@/lib/render-site.server";

export const Route = createFileRoute("/render-site")({
  server: {
    handlers: {
      GET: ({ request }) => renderSite(request),
    },
  },
});
