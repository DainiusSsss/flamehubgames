import { Play } from "lucide-react";
import { toast } from "sonner";

import { openCloaked } from "@/lib/cloaker";
import type { HubItem } from "@/lib/flamehub-data";

export function HubGrid({ items, label }: { items: HubItem[]; label: string }) {
  const launch = (item: HubItem) => {
    const opened = openCloaked(item.url);
    if (!opened) {
      toast.error("Allow pop-ups for FlameHub, then tap Launch again.");
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={label}>
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
            <button
              type="button"
              onClick={() => launch(item)}
              className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Play className="size-4" />
              Launch
            </button>
          </div>

          {item.note ? (
            <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
