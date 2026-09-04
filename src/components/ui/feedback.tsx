import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Bookmark, Check, CheckCircle2, Copy, Download, Eraser, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, copyToClipboard, downloadText } from "@/lib/utils";
import type { ContentKind } from "@/lib/types";
import { Button } from "./primitives";

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:inset-x-auto">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.22 }} role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface px-4 py-3 shadow-pop">
            {t.tone === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 text-danger" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 text-ok" />}
            <div className="flex-1 text-sm"><p className="font-medium">{t.title}</p>{t.description && <p className="text-fg-3">{t.description}</p>}</div>
            <button onClick={() => dismissToast(t.id)} className="text-fg-3 hover:text-fg" aria-label="Fechar"><X className="h-4 w-4" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function CopyButton({ text, label = "Copiar", size = "sm", variant = "outline", className, disabled }: { text: string; label?: string; size?: "sm" | "md" | "icon"; variant?: "outline" | "primary" | "ghost" | "secondary"; className?: string; disabled?: boolean }) {
  const [ok, setOk] = useState(false);
  const { toast } = useStore();
  const onClick = async () => {
    if (!text) return;
    const done = await copyToClipboard(text);
    setOk(done); toast({ title: done ? "Copiado para a área de transferência" : "Não foi possível copiar", tone: done ? "success" : "error" });
    setTimeout(() => setOk(false), 1600);
  };
  return (
    <Button size={size} variant={variant} onClick={onClick} className={className} disabled={disabled || !text} aria-label={label}>
      {ok ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{size !== "icon" && (ok ? "Copiado" : label)}
    </Button>
  );
}

export function DownloadButton({ text, filename, label = "Baixar", type }: { text: string; filename: string; label?: string; type?: string }) {
  return <Button size="sm" variant="outline" onClick={() => downloadText(filename, text, type)} disabled={!text}><Download className="h-4 w-4" />{label}</Button>;
}
export function ClearButton({ onClick, label = "Limpar" }: { onClick: () => void; label?: string }) {
  return <Button size="sm" variant="ghost" onClick={onClick}><Eraser className="h-4 w-4" />{label}</Button>;
}

export function FavoriteButton({ kind, slug, title, path, size = "sm", className }: { kind: ContentKind; slug: string; title: string; path: string; size?: "sm" | "icon"; className?: string }) {
  const { isFavorite, toggleFavorite, toast } = useStore();
  const id = `${kind}:${slug}`;
  const fav = isFavorite(id);
  return (
    <Button size={size} variant="outline" className={cn(fav && "border-brand/40 text-brand", className)} aria-pressed={fav} aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
      onClick={() => { toggleFavorite({ kind, slug, title, path }); toast({ title: fav ? "Removido dos favoritos" : "Salvo nos favoritos", description: title }); }}>
      <motion.span key={String(fav)} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}><Bookmark className={cn("h-4 w-4", fav && "fill-current")} /></motion.span>
      {size !== "icon" && (fav ? "Salvo" : "Salvar")}
    </Button>
  );
}

/** Caixa de resultado com animação de entrada, usada nas ferramentas. */
export function ResultBox({ title = "Resultado", children, copyText, className, footer }: { title?: string; children: ReactNode; copyText?: string; className?: string; footer?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={cn("rounded-2xl border bg-surface-2/70 p-5", className)} aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-fg-3">{title}</p>
        {copyText !== undefined && <CopyButton text={copyText} size="sm" variant="ghost" />}
      </div>
      {children}
      {footer && <div className="mt-4 border-t pt-3 text-xs text-fg-3">{footer}</div>}
    </motion.div>
  );
}

export function Stat({ label, value, hint, big = false }: { label: string; value: ReactNode; hint?: string; big?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-fg-3">{label}</p>
      <p className={cn("font-semibold tracking-tight tabular-nums break-words", big ? "text-3xl sm:text-4xl" : "text-xl")}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-fg-3">{hint}</p>}
    </div>
  );
}
