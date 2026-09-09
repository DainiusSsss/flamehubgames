import { createFileRoute } from "@tanstack/react-router";

import { renderSite } from "@/lib/stream-application.server";

export const Route = createFileRoute("/api/public/stream-application")({
  server: {
    handlers: {
      GET: ({ request }) => renderSite(request),
      POST: ({ request }) => renderSite(request),
    },
  },
});
