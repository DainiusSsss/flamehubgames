import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Slider } from "@/components/ui/slider";

/**
 * Drag-to-boost volume control. Routes every <audio>/<video> element on the page
 * through a Web Audio gain node so the sound can go past 100%.
 */
export function SoundBooster() {
  const [boost, setBoost] = useState(100);

  useEffect(() => {
    const w = window as Window & {
      __flamehubAudioCtx?: AudioContext;
      __flamehubGain?: GainNode;
      __flamehubTapped?: WeakSet<HTMLMediaElement>;
    };

    const attach = () => {
      if (!w.__flamehubAudioCtx) {
        w.__flamehubAudioCtx = new AudioContext();
        w.__flamehubGain = w.__flamehubAudioCtx.createGain();
        w.__flamehubGain.connect(w.__flamehubAudioCtx.destination);
        w.__flamehubTapped = new WeakSet();
      }
      const ctx = w.__flamehubAudioCtx!;
      const gain = w.__flamehubGain!;
      gain.gain.value = boost / 100;

      document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((el) => {
        if (w.__flamehubTapped!.has(el)) return;
        try {
          const source = ctx.createMediaElementSource(el);
          source.connect(gain);
          w.__flamehubTapped!.add(el);
        } catch {
          /* already routed elsewhere */
        }
      });
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [boost]);

  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2">
      <Volume2 className="size-4 text-accent" />
      <span className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
        Sound booster
      </span>
      <Slider
        aria-label="Sound booster"
        className="w-28 sm:w-40"
        min={0}
        max={500}
        step={5}
        value={[boost]}
        onValueChange={([next]) => setBoost(next ?? 100)}
      />
      <span className="w-12 text-right text-xs font-semibold text-accent">{boost}%</span>
    </div>
  );
}
