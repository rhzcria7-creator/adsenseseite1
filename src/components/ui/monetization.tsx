import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Google AdSense
 * - O script é carregado uma única vez em index.html (head).
 * - Cada AdSlot renderiza um <ins class="adsbygoogle"> e chama push() uma vez.
 * - Sem incentivo a cliques; rótulo "Publicidade" para transparência.
 * - Substitua os data-ad-slot pelos IDs reais das unidades criadas no painel.
 */
export const ADSENSE_CLIENT = "ca-pub-2412850402145505";

declare global { interface Window { adsbygoogle?: unknown[] } }

type Format = "horizontal" | "rectangle" | "vertical" | "in-article" | "auto";
const SLOT_IDS: Record<Format, string> = { horizontal: "1111111111", rectangle: "2222222222", vertical: "3333333333", "in-article": "4444444444", auto: "5555555555" };
const minH: Record<Format, string> = { horizontal: "min-h-[90px]", rectangle: "min-h-[250px]", vertical: "min-h-[600px]", "in-article": "min-h-[120px]", auto: "min-h-[100px]" };

export function AdSlot({ format = "auto", className, label = "Publicidade" }: { format?: Format; className?: string; label?: string }) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current || !ref.current) return;
    // Só empurra se o elemento tiver largura (evita erro "availableWidth=0")
    if (ref.current.offsetWidth === 0) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); pushed.current = true; } catch { /* bloqueador de anúncios */ }
  }, []);
  const isArticle = format === "in-article";
  return (
    <div className={cn("w-full", className)} aria-label={label}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-[0.14em] text-fg-3">{label}</p>
      <div className={cn("overflow-hidden rounded-xl border border-dashed bg-surface-2/40", minH[format])}>
        <ins ref={ref} className="adsbygoogle block" style={{ display: "block", textAlign: isArticle ? "center" : undefined }}
          data-ad-client={ADSENSE_CLIENT} data-ad-slot={SLOT_IDS[format]}
          data-ad-format={isArticle ? "fluid" : format === "auto" || format === "horizontal" ? "auto" : undefined}
          data-ad-layout={isArticle ? "in-article" : undefined}
          data-full-width-responsive={format === "auto" || format === "horizontal" ? "true" : undefined} />
      </div>
    </div>
  );
}

/** Anúncio no topo/rodapé de listas — horizontal em desktop, auto em mobile. */
export function AdBanner({ className }: { className?: string }) {
  return <AdSlot format="horizontal" className={cn("my-8", className)} />;
}
/** Anúncio dentro de artigos e ferramentas. */
export function AdInArticle({ className }: { className?: string }) {
  return <AdSlot format="in-article" className={cn("my-10", className)} />;
}
/** Sidebar sticky (desktop) — em mobile aparece como retângulo. */
export function AdSidebar({ className }: { className?: string }) {
  return (
    <div className={cn("lg:sticky lg:top-24", className)}>
      <div className="hidden lg:block"><AdSlot format="vertical" /></div>
      <div className="lg:hidden"><AdSlot format="rectangle" /></div>
    </div>
  );
}
