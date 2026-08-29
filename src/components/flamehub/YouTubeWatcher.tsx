import { Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function extractVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const fromQuery = url.searchParams.get("v");
    if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    if (/^[\w-]{11}$/.test(last)) return last;
  } catch {
    /* not a URL */
  }
  return null;
}

export function YouTubeWatcher() {
  const [value, setValue] = useState("");

  const load = (event: React.FormEvent) => {
    event.preventDefault();
    const id = extractVideoId(value);
    if (!id) {
      toast.error("Paste a full YouTube link or an 11-character video ID.");
      return;
    }
    const embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    const win = window.open(
      embed,
      "_blank",
      "width=1200,height=800,menubar=no,status=no,toolbar=no",
    );
    if (!win) toast.error("Allow pop-ups for FlameHub, then hit the button again.");
  };

  return (
    <form
      onSubmit={load}
      className="flame-surface flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-2">
        <Youtube className="size-5 text-accent" />
        <p className="text-lg leading-none">Unblocked YouTube Watcher</p>
      </div>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Paste a YouTube link…"
        className="sm:ml-auto sm:max-w-sm"
        aria-label="YouTube video URL"
      />
      <Button type="submit">Load Unblocked Video</Button>
    </form>
  );
}
