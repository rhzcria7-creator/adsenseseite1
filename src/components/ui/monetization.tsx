import { useEffect, useRef } from "react";
import { cn, SITE } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * AdSense slot. The library script is loaded once in index.html.
 * Each slot pushes to `adsbygoogle` exactly once after mount.
 * While Auto Ads / slot IDs are not approved, the container renders a discreet
 * labeled placeholder so the layout is stable (no CLS).
 */
export type AdFormat = "auto" | "horizontal" | "rectangle" | "vertical" | "fluid";

interface AdSlotProps {
  slot?: string; // data-ad-slot from AdSense panel
  format?: AdFormat;
  className?: string;
  label?: boolean;
  minHeight?: number;
}

export function AdSlot({ slot = "auto", format = "auto", className, label = true, minHeight = 120 }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    if (!ref.current) return;
    if (ref.current.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* blocked or not loaded */
    }
  }, []);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl border border-dashed border-line bg-bg-2/60", className)} style={{ minHeight }} aria-label="Publicidade">
      {label && <span className="absolute left-2 top-1.5 z-10 text-[10px] font-medium uppercase tracking-wider text-fg-3">Publicidade</span>}
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block", minHeight }}
        data-ad-client={SITE.adsenseClient}
        data-ad-slot={slot}
        data-ad-format={format === "auto" || format === "fluid" ? "auto" : format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

/** Wide banner between content sections (desktop + mobile responsive). */
export function AdBanner({ className }: { className?: string }) {
  return <AdSlot format="horizontal" minHeight={110} className={cn("my-8", className)} />;
}

/** In-article ad, inserted by the Body renderer. */
export function AdInArticle({ className }: { className?: string }) {
  return <AdSlot format="fluid" minHeight={250} className={cn("my-10", className)} />;
}

/** Sticky sidebar unit (desktop only). */
export function AdSidebar({ className }: { className?: string }) {
  return (
    <div className={cn("hidden lg:block", className)}>
      <AdSlot format="vertical" minHeight={600} className="sticky top-24" />
    </div>
  );
}

/** Compact unit shown only on mobile. */
export function AdMobile({ className }: { className?: string }) {
  return <AdSlot format="rectangle" minHeight={250} className={cn("lg:hidden my-6", className)} />;
}
