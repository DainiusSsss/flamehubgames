import { Maximize2, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { HubItem } from "@/lib/flamehub-data";
import { streamUrl } from "@/lib/stream-url";

const FRAME_ALLOW =
  "autoplay; fullscreen; clipboard-write; gamepad; microphone; camera; pointer-lock; encrypted-media";

const FULLSCREEN_ATTRS = {
  allowfullscreen: "true",
  webkitallowfullscreen: "true",
  mozallowfullscreen: "true",
} as Record<string, string>;

export function HubGrid({ items, label }: { items: HubItem[]; label: string }) {
  const [active, setActive] = useState<HubItem | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const goFullscreen = () => {
    void stageRef.current?.requestFullscreen?.().catch(() => undefined);
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="flame-surface group rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <span className="text-3xl" aria-hidden>
                {item.emoji}
              </span>
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

      {active ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <span className="truncate text-lg">
              {active.emoji} {active.name}
              <span className="ml-2 text-xs text-muted-foreground">{label}</span>
            </span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" type="button" onClick={goFullscreen}>
                <Maximize2 className="size-4" />
                Fullscreen
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setActive(null)}>
                <X className="size-4" />
                Close
              </Button>
            </div>
          </div>
          <div ref={stageRef} className="min-h-0 flex-1 bg-background">
            <iframe
              key={active.id}
              title={active.name}
              src={streamUrl(active.url)}
              style={{ width: "100%", height: "100%", border: 0, display: "block" }}
              allow={FRAME_ALLOW}
              allowFullScreen
              {...FULLSCREEN_ATTRS}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
