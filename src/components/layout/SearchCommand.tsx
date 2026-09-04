import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, CornerDownLeft, Search, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { suggest, trending } from "@/lib/content";
import { useStore } from "@/lib/store";
import { cn, KIND_LABEL } from "@/lib/utils";
import { Kbd } from "../ui/primitives";

export function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const { searchHistory, pushSearch, clearSearchHistory, history } = useStore();
  const results = useMemo(() => (q.trim() ? suggest(q, 9) : []), [q]);
  const hot = useMemo(() => trending(6), []);

  useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => ref.current?.focus(), 30); } }, [open]);
  useEffect(() => { setIdx(0); }, [q]);

  const go = (path: string) => { if (q.trim()) pushSearch(q); onClose(); nav(path); };
  const onKey = (e: React.KeyboardEvent) => {
    const list = results.length ? results : hot;
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    if (e.key === "Enter") { e.preventDefault(); if (list[idx]) go(list[idx].path); else if (q.trim()) go(`/buscar?q=${encodeURIComponent(q)}`); }
    if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div role="dialog" aria-modal aria-label="Busca" className="fixed inset-x-3 top-[8vh] z-[90] mx-auto max-w-2xl overflow-hidden rounded-2xl border bg-surface shadow-pop"
            initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.18 }}>
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="h-4.5 w-4.5 text-fg-3" />
              <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Buscar ferramentas, prompts, artigos…" className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg-3" />
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-fg-3 hover:bg-surface-2" aria-label="Fechar"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {q.trim() ? (
                results.length ? (
                  <ul role="listbox">
                    {results.map((r, i) => (
                      <li key={r.id} role="option" aria-selected={i === idx}>
                        <button onMouseEnter={() => setIdx(i)} onClick={() => go(r.path)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", i === idx ? "bg-surface-2" : "hover:bg-surface-2/60")}>
                          <span className="w-[74px] shrink-0 text-[11px] font-medium uppercase tracking-wide text-fg-3">{KIND_LABEL[r.kind]}</span>
                          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{r.title}</span><span className="block truncate text-xs text-fg-3">{r.description}</span></span>
                          {i === idx && <CornerDownLeft className="h-4 w-4 text-fg-3" />}
                        </button>
                      </li>
                    ))}
                    <li><button onClick={() => go(`/buscar?q=${encodeURIComponent(q)}`)} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-brand hover:bg-surface-2/60">Ver todos os resultados para “{q}” <ArrowRight className="h-4 w-4" /></button></li>
                  </ul>
                ) : <p className="px-3 py-8 text-center text-sm text-fg-3">Nada encontrado para “{q}”. Tente outro termo.</p>
              ) : (
                <div className="space-y-4 p-1">
                  {searchHistory.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between px-2 pb-1.5"><p className="text-[11px] font-semibold uppercase tracking-wide text-fg-3">Buscas recentes</p><button onClick={clearSearchHistory} className="text-[11px] text-fg-3 hover:text-fg">limpar</button></div>
                      <div className="flex flex-wrap gap-1.5 px-2">{searchHistory.map((s) => <button key={s} onClick={() => setQ(s)} className="inline-flex items-center gap-1 rounded-lg border bg-surface-2/60 px-2.5 py-1 text-xs text-fg-2 hover:bg-surface-2"><Clock className="h-3 w-3" />{s}</button>)}</div>
                    </section>
                  )}
                  {history.length > 0 && (
                    <section>
                      <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-3">Visitados recentemente</p>
                      {history.slice(0, 3).map((h) => <button key={h.id} onClick={() => go(h.path)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-2/60"><span className="w-[74px] shrink-0 text-[11px] uppercase tracking-wide text-fg-3">{KIND_LABEL[h.kind]}</span><span className="truncate">{h.title}</span></button>)}
                    </section>
                  )}
                  <section>
                    <p className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-3"><TrendingUp className="h-3 w-3" /> Em alta hoje</p>
                    {hot.map((r, i) => <button key={r.id} onMouseEnter={() => setIdx(i)} onClick={() => go(r.path)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm", i === idx ? "bg-surface-2" : "hover:bg-surface-2/60")}><span className="w-[74px] shrink-0 text-[11px] uppercase tracking-wide text-fg-3">{KIND_LABEL[r.kind]}</span><span className="truncate">{r.title}</span></button>)}
                  </section>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 border-t px-4 py-2 text-[11px] text-fg-3"><span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span><span className="flex items-center gap-1"><Kbd>↵</Kbd> abrir</span><span className="flex items-center gap-1"><Kbd>esc</Kbd> fechar</span></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
