import { motion } from "framer-motion";
import { Eraser, Lightbulb } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TOOLS, toolBySlug, toolCategory } from "@/data/tools";
import { useStore } from "@/lib/store";
import { useSEO } from "@/lib/seo";
import type { ToolMeta } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Container, PageHeader } from "@/components/layout/Shell";
import { ToolRow } from "@/components/content/Cards";
import { Accordion, CopyButton, FavoriteButton } from "@/components/ui/feedback";
import { AdSlot, AffiliateBox, Newsletter } from "@/components/ui/monetization";
import { Button } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";

/* ------------------------------- ToolShell -------------------------------- */

export function ToolShell({ meta, children, examples }: { meta: ToolMeta; children: ReactNode; examples?: { label: string; onClick: () => void }[] }) {
  const cat = toolCategory(meta.category);
  const { pushHistory } = useStore();
  useSEO({ title: `${meta.name} — grátis e online`, description: meta.description, path: `/ferramentas/${meta.slug}`, keywords: [...meta.tags, meta.name] });
  useEffect(() => {
    pushHistory({ kind: "tool", slug: meta.slug, title: meta.name, path: `/ferramentas/${meta.slug}` });
  }, [meta.slug, meta.name, pushHistory]);

  const related = meta.related.map(toolBySlug).filter(Boolean) as ToolMeta[];
  const sameCat = TOOLS.filter((t) => t.category === meta.category && t.slug !== meta.slug && !meta.related.includes(t.slug)).slice(0, 4);

  return (
    <Container wide>
      <PageHeader
        eyebrow={cat.name}
        title={meta.name}
        description={meta.description}
        crumbs={[{ label: "Ferramentas", to: "/ferramentas" }, { label: cat.name, to: `/ferramentas/categoria/${cat.slug}` }, { label: meta.name }]}
        aside={<FavoriteButton kind="tool" slug={meta.slug} title={meta.name} path={`/ferramentas/${meta.slug}`} />}
      />

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0">
          <motion.section aria-label="Ferramenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="border border-strong bg-elev">
            <div className="flex items-center justify-between border-b border-line px-4 py-2 sm:px-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">nexo / {meta.slug}</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-subtle">
                <span className="h-1.5 w-1.5 bg-mint" /> local
              </span>
            </div>
            <div className="p-4 sm:p-6">{children}</div>
          </motion.section>

          {examples && examples.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 inline-flex items-center gap-1 text-xs text-muted">
                <Lightbulb className="h-3.5 w-3.5" /> Exemplos:
              </span>
              {examples.map((e) => (
                <button key={e.label} onClick={e.onClick} className="border border-line px-2.5 py-1 text-xs transition-colors hover:border-strong">
                  {e.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            <AdSlot format="horizontal" id={`tool-${meta.slug}-mid`} />
          </div>

          <Reveal className="mt-12 grid gap-10 md:grid-cols-2">
            <section>
              <h2 className="border-b border-strong pb-2 font-display text-xl font-bold">Como funciona</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-[15px]">{meta.howItWorks}</p>
            </section>
            <section>
              <h2 className="border-b border-strong pb-2 font-display text-xl font-bold">Exemplos</h2>
              <ul className="mt-4 space-y-2">
                {meta.examples.map((ex) => (
                  <li key={ex} className="flex gap-3 text-sm text-muted sm:text-[15px]">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-accent" />
                    {ex}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="mb-2 font-display text-xl font-bold">Perguntas frequentes</h2>
            <Accordion items={meta.faq.map((f) => ({ q: f.q, a: f.a }))} />
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="border-b border-strong pb-2 font-display text-xl font-bold">Ferramentas relacionadas</h2>
            <div className="grid gap-x-10 sm:grid-cols-2">
              <div className="divide-y divide-[var(--line)]">
                {related.map((r) => (
                  <ToolRow key={r.slug} tool={r} />
                ))}
              </div>
              <div className="divide-y divide-[var(--line)]">
                {sameCat.map((r) => (
                  <ToolRow key={r.slug} tool={r} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="eyebrow mb-2 border-b border-strong pb-2">Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {meta.tags.map((t) => (
                <Link key={t} to={`/tags/${t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="border border-line px-2 py-1 font-mono text-[11px] text-muted hover:border-strong hover:text-fg">
                  #{t}
                </Link>
              ))}
            </div>
          </div>
          <AdSlot format="rectangle" id={`tool-${meta.slug}-side`} />
          <AffiliateBox tag="Ferramenta parceira" title="Gerenciador de senhas" description="Guarde as senhas geradas aqui em um cofre criptografado. Espaço para parceiro de afiliado." />
          <Newsletter compact />
        </aside>
      </div>
    </Container>
  );
}

/* ------------------------------- Helpers ---------------------------------- */

export function ToolGrid({ children, cols = 2, className }: { children: ReactNode; cols?: 1 | 2 | 3 | 4; className?: string }) {
  const c = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return <div className={cn("grid gap-4", c, className)}>{children}</div>;
}

export function ResultPanel({ children, className, title = "Resultado" }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <motion.div layout className={cn("mt-6 border-t border-strong pt-4", className)}>
      <div className="eyebrow mb-3">{title}</div>
      {children}
    </motion.div>
  );
}

export function BigNumber({ value, label, sub, accent, className }: { value: ReactNode; label?: string; sub?: ReactNode; accent?: boolean; className?: string }) {
  return (
    <div className={className}>
      {label && <div className="text-xs font-medium uppercase tracking-wider text-muted">{label}</div>}
      <motion.div key={String(value)} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={cn("mt-1 break-words font-display text-3xl font-bold tracking-tight tabular sm:text-4xl lg:text-5xl", accent && "text-accent")}>
        {value}
      </motion.div>
      {sub && <div className="mt-1 text-sm text-muted">{sub}</div>}
    </div>
  );
}

export function KV({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-[var(--line)] border-y border-line text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-muted">{k}</dt>
          <dd className="text-right font-medium tabular">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Actions({ copy, onClear, extra, className }: { copy?: string; onClear?: () => void; extra?: ReactNode; className?: string }) {
  return (
    <div className={cn("mt-5 flex flex-wrap items-center gap-2", className)}>
      {copy !== undefined && <CopyButton text={copy} label="Copiar resultado" />}
      {onClear && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <Eraser className="h-3.5 w-3.5" /> Limpar
        </Button>
      )}
      {extra}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="mt-3 border-l-2 border-red-600 pl-3 text-sm text-red-600">{children}</p>;
}

export function OutputArea({ value, rows = 8, mono = true, className }: { value: string; rows?: number; mono?: boolean; className?: string }) {
  return <textarea readOnly value={value} rows={rows} aria-label="Saída" className={cn("w-full resize-y border border-line bg-page p-3 text-sm leading-relaxed text-fg focus:outline-none", mono && "font-mono text-[13px]", className)} />;
}

export function Bar({ value, max = 100, className, tone = "accent" }: { value: number; max?: number; className?: string; tone?: "accent" | "fg" | "mint" | "amber" | "red" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const colors = { accent: "bg-accent", fg: "bg-fg", mint: "bg-mint", amber: "bg-amber", red: "bg-red-600" };
  return (
    <div className={cn("h-1.5 w-full bg-[var(--line)]", className)}>
      <motion.div className={cn("h-full", colors[tone])} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}
