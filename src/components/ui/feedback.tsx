import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Copy, Heart, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import type { ContentKind } from "@/lib/types";
import { cn, copyToClipboard } from "@/lib/utils";
import { Button } from "./primitives";

/* --------------------------------- Toasts --------------------------------- */

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn("pointer-events-auto flex w-full max-w-sm items-start gap-3 border bg-elev px-4 py-3 text-sm", t.tone === "error" ? "border-red-600" : t.tone === "success" ? "border-mint" : "border-strong")}
          >
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0", t.tone === "error" ? "bg-red-600" : t.tone === "success" ? "bg-mint" : "bg-accent")} />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{t.title}</div>
              {t.description && <div className="mt-0.5 text-xs text-muted">{t.description}</div>}
            </div>
            <button onClick={() => dismissToast(t.id)} aria-label="Fechar" className="text-subtle hover:text-fg">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- CopyButton ------------------------------- */

export function CopyButton({ text, label = "Copiar", className, size = "sm", variant = "secondary" }: { text: string; label?: string; className?: string; size?: "sm" | "md"; variant?: "secondary" | "primary" | "ghost" }) {
  const [done, setDone] = useState(false);
  const { toast } = useStore();
  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={!text}
      onClick={async () => {
        const ok = await copyToClipboard(text);
        setDone(ok);
        toast(ok ? { title: "Copiado para a área de transferência", tone: "success" } : { title: "Não foi possível copiar", tone: "error" });
        window.setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copiado" : label}
    </Button>
  );
}

/* ----------------------------- FavoriteButton ----------------------------- */

export function FavoriteButton({ kind, slug, title, path, compact }: { kind: ContentKind; slug: string; title: string; path: string; compact?: boolean }) {
  const { isFavorite, toggleFavorite, toast } = useStore();
  const id = `${kind}:${slug}`;
  const fav = isFavorite(id);
  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={() => {
        toggleFavorite({ kind, slug, title, path });
        toast({ title: fav ? "Removido dos favoritos" : "Salvo nos favoritos", description: title });
      }}
      className={cn("inline-flex items-center gap-2 border transition-colors", compact ? "h-8 w-8 justify-center" : "h-8 px-3 text-xs font-medium", fav ? "border-accent text-accent" : "border-line text-muted hover:border-strong hover:text-fg")}
    >
      <motion.span whileTap={{ scale: 0.8 }} className="inline-flex">
        <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
      </motion.span>
      {!compact && (fav ? "Favorito" : "Favoritar")}
    </button>
  );
}

/* -------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[var(--line)] border-y border-line">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid gap-3 py-5 sm:grid-cols-[120px_1fr]">
          <Skeleton className="h-3 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- Accordion ------------------------------- */

export function Accordion({ items, className }: { items: { q: string; a: ReactNode }[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={cn("divide-y divide-[var(--line)] border-y border-line", className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:text-accent"
            >
              <span className="font-display text-base font-medium leading-snug sm:text-lg">{it.q}</span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="mt-1 shrink-0 text-subtle">
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 text-sm leading-relaxed text-muted sm:text-[15px]">{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------- Tabs ---------------------------------- */

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn("flex gap-6 overflow-x-auto border-b border-line no-scrollbar", className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button key={t.value} role="tab" aria-selected={active} onClick={() => onChange(t.value)} className={cn("relative whitespace-nowrap pb-3 text-sm font-medium transition-colors", active ? "text-fg" : "text-muted hover:text-fg")}>
            {t.label}
            {typeof t.count === "number" && <span className="ml-1.5 font-mono text-[10px] text-subtle">{t.count}</span>}
            {active && <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-fg" transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------- Empty --------------------------------- */

export function Empty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-line px-6 py-14 text-center">
      <div className="mx-auto mb-4 h-8 w-8 border border-line" />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* -------------------------------- Callout --------------------------------- */

export function Callout({ children, tone = "default", title }: { children: ReactNode; tone?: "default" | "warn" | "info"; title?: string }) {
  return (
    <div className={cn("border-l-2 bg-elev px-4 py-3 text-sm leading-relaxed", tone === "warn" ? "border-amber" : tone === "info" ? "border-signal" : "border-accent")}>
      {title && <div className="mb-1 font-medium">{title}</div>}
      <div className="text-muted">{children}</div>
    </div>
  );
}
