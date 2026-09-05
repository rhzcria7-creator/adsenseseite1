import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, X, AlertCircle, Info } from "lucide-react";
import { cn, copyText } from "@/lib/utils";
import { useFavorites } from "@/lib/store";
import { Button } from "./primitives";

/* ---------- Toasts ---------- */
type Tone = "success" | "error" | "info";
interface Toast { id: number; title: string; description?: string; tone: Tone }
const ToastCtx = createContext<{ toast: (t: Omit<Toast, "id">) => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { ...t, id }].slice(-4));
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 2800);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.25 }} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-bg px-4 py-3 shadow-[var(--shadow-pop)]">
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", t.tone === "success" && "bg-ok/15 text-ok", t.tone === "error" && "bg-danger/15 text-danger", t.tone === "info" && "bg-accent/15 text-accent")}>
                {t.tone === "success" ? <Check size={12} /> : t.tone === "error" ? <AlertCircle size={12} /> : <Info size={12} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-fg">{t.title}</div>
                {t.description && <div className="mt-0.5 text-xs text-fg-2">{t.description}</div>}
              </div>
              <button onClick={() => setItems((p) => p.filter((x) => x.id !== t.id))} className="text-fg-3 hover:text-fg" aria-label="Fechar">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------- Copy button ---------- */
export function CopyButton({ text, label = "Copiar", size = "sm", variant = "outline", className, disabled }: { text: string; label?: string; size?: "sm" | "md" | "icon"; variant?: "outline" | "primary" | "ghost" | "secondary"; className?: string; disabled?: boolean }) {
  const [ok, setOk] = useState(false);
  const { toast } = useToast();
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={disabled || !text}
      className={className}
      aria-label={label}
      onClick={async () => {
        const done = await copyText(text);
        setOk(done);
        toast(done ? { title: "Copiado para a área de transferência", tone: "success" } : { title: "Não foi possível copiar", tone: "error" });
        setTimeout(() => setOk(false), 1600);
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {ok ? (
          <motion.span key="ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="inline-flex items-center gap-1.5 text-ok">
            <Check size={15} /> {size !== "icon" && "Copiado"}
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="inline-flex items-center gap-1.5">
            <Copy size={15} /> {size !== "icon" && label}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}

/* ---------- Favorite button ---------- */
export function FavoriteButton({ id, kind, title, path, className, showLabel = false }: { id: string; kind: string; title: string; path: string; className?: string; showLabel?: boolean }) {
  const { isFav, toggle } = useFavorites();
  const { toast } = useToast();
  const fav = isFav(id);
  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle({ id, kind, title, path });
        toast({ title: added ? "Salvo nos favoritos" : "Removido dos favoritos", tone: added ? "success" : "info" });
      }}
      className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl border border-line px-2.5 text-sm text-fg-2 transition-colors hover:border-line-2 hover:text-fg", fav && "border-rose-500/40 text-rose-500", className)}
    >
      <motion.span key={String(fav)} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
        <Heart size={16} className={cn(fav && "fill-current")} />
      </motion.span>
      {showLabel && (fav ? "Favorito" : "Favoritar")}
    </button>
  );
}
