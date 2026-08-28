import { ExternalLink, Maximize2, Play } from "lucide-react";
import { useRef, useState } from "react";

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
  const stageRef = useRef<HTMLDivElement>(null);

  const goFullscreen = () => {
    const node = stageRef.current;
    if (!node) return;
    void node.requestFullscreen?.().catch(() => undefined);
  };

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
            </div>

            {item.note ? (
              <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
            ) : null}
          </article>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="h-[90vh] max-w-[96vw] gap-3 p-4">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2 text-2xl">
              {active?.emoji} {active?.name}
              <span className="text-xs font-normal text-muted-foreground">{label} preview</span>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={goFullscreen}
                type="button"
              >
                <Maximize2 className="size-4" />
                Fullscreen
              </Button>
            </DialogTitle>
          </DialogHeader>
          {active ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <div ref={stageRef} className="min-h-0 flex-1 bg-background">
                <iframe
                  key={active.id}
                  title={active.name}
                  src={active.direct ? active.url : proxyUrl(active.url)}
                  className="size-full rounded-xl border border-border bg-background"
                  style={{ width: "100%", height: "100%" }}
                  allow="autoplay; fullscreen; clipboard-write; gamepad; microphone; camera; pointer-lock"
                  allowFullScreen
                  {...({
                    allowfullscreen: "true",
                    webkitallowfullscreen: "true",
                    mozallowfullscreen: "true",
                  } as Record<string, string>)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Streamed through FlameHub&apos;s own <code>/render-site</code> route. Press
                Fullscreen for the whole screen, or{" "}
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
