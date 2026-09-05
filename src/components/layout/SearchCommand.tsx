import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { kindMeta, search, trending } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

export function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (q.trim() ? search(q, { limit: 12 }) : trending(8)), [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  const go = (path: string) => {
    onClose();
    nav(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Busca"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 top-[10vh] z-[95] mx-auto max-w-xl overflow-hidden rounded-2xl border border-line bg-bg shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="text-fg-3" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(results.length - 1, i + 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (results[idx]) go(results[idx].path);
                    else if (q.trim()) go(`/busca?q=${encodeURIComponent(q)}`);
                  }
                  if (e.key === "Escape") onClose();
                }}
                placeholder="Buscar ferramentas, prompts, artigos, vídeos…"
                className="h-14 w-full bg-transparent text-[15px] text-fg placeholder:text-fg-3 focus:outline-none"
              />
              <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-fg-3 sm:block">ESC</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!q.trim() && <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-fg-3">Em alta hoje</div>}
              {results.length === 0 && <div className="px-3 py-8 text-center text-sm text-fg-3">Nenhum resultado para “{q}”.</div>}
              {results.map((r, i) => (
                <button key={r.id} onMouseEnter={() => setIdx(i)} onClick={() => go(r.path)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors", i === idx ? "bg-bg-3" : "hover:bg-bg-2")}>
                  <Badge tone={r.kind === "tool" ? "accent" : "neutral"} className="w-[84px] justify-center">{kindMeta[r.kind].label}</Badge>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-fg">{r.title}</div>
                    <div className="truncate text-xs text-fg-3">{r.excerpt}</div>
                  </div>
                  {i === idx ? <CornerDownLeft size={14} className="text-fg-3" /> : <ArrowRight size={14} className="text-fg-3 opacity-0" />}
                </button>
              ))}
              {q.trim() && (
                <button onClick={() => go(`/busca?q=${encodeURIComponent(q)}`)} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-accent hover:bg-bg-2">
                  Ver todos os resultados para “{q}” <ArrowRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
