import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HubItem } from "@/lib/flamehub-data";
import { proxyUrl } from "@/lib/flamehub-session";

export function HubGrid({ items, label }: { items: HubItem[]; label: string }) {
  const [active, setActive] = useState<HubItem | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="flame-surface group rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <span className="text-3xl" aria-hidden>
                {item.emoji}
              </span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground transition-colors hover:text-accent"
                aria-label={`Open ${item.name} in a new tab`}
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
            <h3 className="mt-3 text-2xl leading-none">{item.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.tagline}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => setActive(item)}>
                <Play className="size-4" />
                Launch
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={item.url} target="_blank" rel="noreferrer noopener">
                  New tab
                </a>
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="h-[85vh] max-w-6xl gap-3 p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {active?.emoji} {active?.name}
              <span className="text-xs font-normal text-muted-foreground">{label} preview</span>
            </DialogTitle>
          </DialogHeader>
          {active ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <iframe
                key={active.id}
                title={active.name}
                src={proxyUrl(active.url)}
                className="min-h-0 flex-1 rounded-xl border border-border bg-background"
                allow="autoplay; fullscreen; clipboard-write; gamepad; microphone; camera"
              />
              <p className="text-xs text-muted-foreground">
                Streamed through FlameHub&apos;s own <code>/render-site</code> server route. If a
                site fights the embed,{" "}
                <a
                  href={active.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-accent underline"
                >
                  open it in a new tab
                </a>
                .
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
