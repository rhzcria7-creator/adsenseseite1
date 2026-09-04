import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, CornerDownLeft, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suggest } from "@/lib/content";
import { useStore } from "@/lib/store";
import type { SearchDoc } from "@/lib/types";
import { cn, KIND_LABEL } from "@/lib/utils";
import { Badge, Kbd } from "@/components/ui/primitives";

const QUICK = [
  { label: "Calculadora de porcentagem", path: "/ferramentas/porcentagem" },
  { label: "Prompt Builder", path: "/prompts/builder" },
  { label: "Gerador de senha", path: "/ferramentas/gerador-de-senha" },
  { label: "QR Code", path: "/ferramentas/qr-code" },
  { label: "Juros compostos", path: "/ferramentas/juros-compostos" },
  { label: "Contador de palavras", path: "/ferramentas/contador-de-palavras" },
];

export function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { searchHistory, pushSearch, history } = useStore();

  const results = useMemo<SearchDoc[]>(() => suggest(q, 9), [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  const go = (path: string) => {
    if (q.trim()) pushSearch(q);
    onClose();
    navigate(path);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active].path);
      else if (q.trim()) go(`/buscar?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="search" className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 px-4 pt-[10vh] backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Busca global"
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl border border-strong bg-page"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 shrink-0 text-subtle" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Buscar ferramentas, prompts, artigos, tutoriais…"
                aria-label="Buscar"
                aria-autocomplete="list"
                className="h-14 w-full bg-transparent text-base outline-none placeholder:text-subtle"
              />
              {q && (
                <button onClick={() => setQ("")} aria-label="Limpar" className="text-subtle hover:text-fg">
                  <X className="h-4 w-4" />
                </button>
              )}
              <Kbd>esc</Kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {q.trim() ? (
                results.length ? (
                  <ul role="listbox" className="py-2">
                    {results.map((r, i) => (
                      <li key={r.id} role="option" aria-selected={i === active}>
                        <button
                          onMouseEnter={() => setActive(i)}
                          onClick={() => go(r.path)}
                          className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors", i === active ? "bg-fg text-bg" : "hover:bg-[var(--line)]/50")}
                        >
                          <Badge tone={i === active ? "accent" : "outline"} className="w-[84px] justify-center">
                            {KIND_LABEL[r.kind]}
                          </Badge>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{r.title}</span>
                            <span className={cn("block truncate text-xs", i === active ? "opacity-70" : "text-muted")}>{r.description}</span>
                          </span>
                          <CornerDownLeft className={cn("h-3.5 w-3.5 shrink-0", i === active ? "opacity-70" : "opacity-0")} />
                        </button>
                      </li>
                    ))}
                    <li className="px-4 pt-2">
                      <button onClick={() => go(`/buscar?q=${encodeURIComponent(q.trim())}`)} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-fg">
                        Ver todos os resultados para “{q.trim()}” <ArrowRight className="h-3 w-3" />
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="px-4 py-10 text-center text-sm text-muted">
                    Nada encontrado para “{q}”.{" "}
                    <button onClick={() => go(`/buscar?q=${encodeURIComponent(q.trim())}`)} className="underline underline-offset-2">
                      Buscar com filtros
                    </button>
                  </div>
                )
              ) : (
                <div className="grid gap-6 p-4 sm:grid-cols-2">
                  <div>
                    <div className="eyebrow mb-2">Acesso rápido</div>
                    <ul className="space-y-1">
                      {QUICK.map((s) => (
                        <li key={s.path}>
                          <button onClick={() => go(s.path)} className="flex w-full items-center justify-between py-1.5 text-left text-sm text-muted hover:text-fg">
                            {s.label} <ArrowRight className="h-3 w-3 opacity-40" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="eyebrow mb-2">{searchHistory.length ? "Buscas recentes" : "Visitados recentemente"}</div>
                    <ul className="space-y-1">
                      {(searchHistory.length ? searchHistory.slice(0, 6).map((s) => ({ label: s, path: `/buscar?q=${encodeURIComponent(s)}` })) : history.slice(0, 6).map((h) => ({ label: h.title, path: h.path }))).map((s) => (
                        <li key={s.path + s.label}>
                          <button onClick={() => go(s.path)} className="flex w-full items-center gap-2 py-1.5 text-left text-sm text-muted hover:text-fg">
                            <Clock className="h-3 w-3 shrink-0 opacity-50" /> <span className="truncate">{s.label}</span>
                          </button>
                        </li>
                      ))}
                      {!searchHistory.length && !history.length && <li className="text-xs text-subtle">Seu histórico aparecerá aqui.</li>}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-subtle">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> navegar
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd> abrir
              </span>
              <span className="ml-auto font-mono">{results.length ? `${results.length} resultados` : "busca local"}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
