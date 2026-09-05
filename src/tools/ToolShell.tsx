import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Eraser, Download } from "lucide-react";
import type { ToolMeta } from "@/lib/types";
import { toolBySlug, categoryBySlug, toolsByCategory } from "@/data/tools";
import { cn, downloadText } from "@/lib/utils";
import { useSeo, breadcrumbLd, faqLd, softwareLd } from "@/lib/seo";
import { useTrackVisit, useToolUsage } from "@/lib/store";
import { Breadcrumbs } from "@/components/layout/Shell";
import { Accordion, Button, Field, Icon, Input, Select, Stat, Textarea } from "@/components/ui/primitives";
import { CopyButton, FavoriteButton } from "@/components/ui/feedback";
import { AdBanner, AdMobile, AdSidebar } from "@/components/ui/monetization";
import { Pop, Reveal } from "@/components/ui/motion";
import { ToolCard } from "@/components/content/Cards";

/* ---------- Layout ---------- */
export function ToolLayout({ tool, children, wide = false }: { tool: ToolMeta; children: ReactNode; wide?: boolean }) {
  const cat = categoryBySlug(tool.category)!;
  const path = `/ferramentas/${tool.slug}`;
  useSeo({
    title: tool.seoTitle ?? `${tool.name} Online Grátis`,
    description: tool.description,
    path,
    jsonLd: [softwareLd({ name: tool.name, description: tool.description, path }), faqLd(tool.faq), breadcrumbLd([{ name: "Ferramentas", path: "/ferramentas" }, { name: cat.name, path: `/ferramentas/categoria/${cat.slug}` }, { name: tool.name, path }])],
  });
  useTrackVisit({ id: `tool:${tool.slug}`, kind: "tool", title: tool.name, path });
  const { bump } = useToolUsage();
  useEffect(() => {
    bump(tool.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug]);

  const related = useMemo(() => {
    const r = tool.related.map(toolBySlug).filter(Boolean) as ToolMeta[];
    const same = toolsByCategory(tool.category).filter((t) => t.slug !== tool.slug && !r.includes(t));
    return [...r, ...same].slice(0, 4);
  }, [tool]);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Ferramentas", path: "/ferramentas" }, { name: cat.name, path: `/ferramentas/categoria/${cat.slug}` }, { name: tool.name }]} />
      <div className={cn("grid gap-10", !wide && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
        <div className="min-w-0">
          <header className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fg text-bg"><Icon name={tool.icon} size={22} /></span>
                <div>
                  <h1 className="h-display text-3xl sm:text-4xl">{tool.name}</h1>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-2">{tool.description}</p>
                </div>
              </div>
              <FavoriteButton id={`tool:${tool.slug}`} kind="tool" title={tool.name} path={path} showLabel className="hidden shrink-0 sm:inline-flex" />
            </div>
          </header>

          <section className="surface p-5 sm:p-7" aria-label="Ferramenta">{children}</section>

          <AdBanner />

          <section className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="h-title mb-3 text-xl">Como usar</h2>
              <ol className="space-y-2.5">
                {tool.howTo.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-fg-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-3 font-mono text-xs font-semibold text-fg">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            {tool.examples.length > 0 && (
              <div>
                <h2 className="h-title mb-3 text-xl">Exemplos</h2>
                <ul className="space-y-2">
                  {tool.examples.map((e, i) => (
                    <li key={i} className="rounded-xl border border-line bg-bg-2 px-4 py-3 font-mono text-[13px] text-fg-2">{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <AdMobile />

          <section className="mt-10">
            <h2 className="h-title mb-4 text-xl">Perguntas frequentes</h2>
            <Accordion items={tool.faq.map((f) => ({ q: f.q, a: f.a }))} />
          </section>

          {related.length > 0 && (
            <section className="mt-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="h-title text-xl">Ferramentas relacionadas</h2>
                <Link to={`/ferramentas/categoria/${cat.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-fg-2 hover:text-fg">Ver {cat.name.toLowerCase()} <ArrowRight size={14} /></Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((t) => <ToolCard key={t.slug} tool={t} compact />)}
              </div>
            </section>
          )}
        </div>

        {!wide && (
          <aside className="space-y-6">
            <AdSidebar />
            <Reveal>
              <div className="surface-2 p-5">
                <div className="eyebrow mb-3">Mais em {cat.name}</div>
                <ul className="space-y-1">
                  {toolsByCategory(tool.category).filter((t) => t.slug !== tool.slug).slice(0, 8).map((t) => (
                    <li key={t.slug}>
                      <Link to={`/ferramentas/${t.slug}`} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-fg-2 transition-colors hover:bg-bg hover:text-fg">
                        <Icon name={t.icon} size={15} className="text-fg-3" /> {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ---------- Formula tool (inputs → result rows) ---------- */
export type FieldDef =
  | { key: string; label: string; type: "number"; default?: string; placeholder?: string; suffix?: string; prefix?: string; min?: number; step?: number; hint?: string; half?: boolean }
  | { key: string; label: string; type: "text"; default?: string; placeholder?: string; hint?: string; half?: boolean }
  | { key: string; label: string; type: "date"; default?: string; hint?: string; half?: boolean }
  | { key: string; label: string; type: "time"; default?: string; hint?: string; half?: boolean }
  | { key: string; label: string; type: "select"; default?: string; options: { value: string; label: string }[]; hint?: string; half?: boolean }
  | { key: string; label: string; type: "textarea"; default?: string; placeholder?: string; hint?: string };

export interface ResultRow { label: string; value: string; hint?: string; big?: boolean }
export interface FormulaResult { rows: ResultRow[]; note?: string; error?: string; extra?: ReactNode; copy?: string }

export function useFormValues(fields: FieldDef[]) {
  const initial = useMemo(() => Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""])), [fields]);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));
  const reset = () => setValues(initial);
  return { values, set, reset };
}

export function FormFields({ fields, values, set }: { fields: FieldDef[]; values: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const half = "half" in f && f.half;
        const cls = half ? "" : f.type === "textarea" ? "sm:col-span-2" : "sm:col-span-2 md:col-span-1";
        const common = { id: f.key, value: values[f.key] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(f.key, e.target.value) };
        return (
          <Field key={f.key} label={f.label} hint={"hint" in f ? f.hint : undefined} className={cls}>
            {f.type === "number" && <Input inputMode="decimal" placeholder={f.placeholder} suffix={f.suffix} prefix={f.prefix} {...common} />}
            {f.type === "text" && <Input placeholder={f.placeholder} {...common} />}
            {f.type === "date" && <Input type="date" {...common} />}
            {f.type === "time" && <Input type="time" {...common} />}
            {f.type === "textarea" && <Textarea placeholder={f.placeholder} {...common} />}
            {f.type === "select" && (
              <Select {...common}>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            )}
          </Field>
        );
      })}
    </div>
  );
}

export function ResultPanel({ result, onClear }: { result: FormulaResult | null; onClear: () => void }) {
  const copyText = result?.copy ?? result?.rows.map((r) => `${r.label}: ${r.value}`).join("\n") ?? "";
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="eyebrow">Resultado</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClear}><Eraser size={14} /> Limpar</Button>
          <CopyButton text={copyText} disabled={!result || !!result.error} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        {!result ? (
          <Pop k="empty" className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-fg-3">Preencha os campos para ver o resultado.</Pop>
        ) : result.error ? (
          <Pop k="err" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{result.error}</Pop>
        ) : (
          <Pop k={copyText}>
            <div className={cn("grid gap-3", result.rows.length > 1 && "sm:grid-cols-2", result.rows.length > 3 && "lg:grid-cols-3")}>
              {result.rows.map((r, i) => <Stat key={i} label={r.label} value={r.value} hint={r.hint} big={r.big ?? i === 0} />)}
            </div>
            {result.note && <p className="mt-3 text-[13px] leading-relaxed text-fg-3">{result.note}</p>}
            {result.extra && <div className="mt-4">{result.extra}</div>}
          </Pop>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FormulaTool({ fields, compute }: { fields: FieldDef[]; compute: (v: Record<string, string>) => FormulaResult | null }) {
  const { values, set, reset } = useFormValues(fields);
  const result = useMemo(() => {
    try {
      return compute(values);
    } catch (e) {
      return { rows: [], error: e instanceof Error ? e.message : "Erro ao calcular." };
    }
  }, [values, compute]);
  return (
    <div>
      <FormFields fields={fields} values={values} set={set} />
      <ResultPanel result={result} onClear={reset} />
    </div>
  );
}

/* ---------- Text tool (textarea → output) ---------- */
export interface TextToolOption { key: string; label: string; type: "select" | "toggle" | "number"; default: string; options?: { value: string; label: string }[] }

export function TextTool({ placeholder = "Cole ou digite seu texto aqui…", options = [], transform, outputLabel = "Resultado", initial = "", filename = "resultado.txt", mono = false, stats }: { placeholder?: string; options?: TextToolOption[]; transform: (input: string, opts: Record<string, string>) => string; outputLabel?: string; initial?: string; filename?: string; mono?: boolean; stats?: (input: string, output: string) => { label: string; value: string }[] }) {
  const [input, setInput] = useState(initial);
  const [opts, setOpts] = useState<Record<string, string>>(Object.fromEntries(options.map((o) => [o.key, o.default])));
  const output = useMemo(() => {
    try {
      return transform(input, opts);
    } catch (e) {
      return e instanceof Error ? `Erro: ${e.message}` : "Erro";
    }
  }, [input, opts, transform]);
  const st = stats?.(input, output);
  return (
    <div className="grid gap-5">
      {options.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {options.map((o) => (
            <Field key={o.key} label={o.label} className="min-w-[160px] flex-1">
              {o.type === "select" ? (
                <Select value={opts[o.key]} onChange={(e) => setOpts((p) => ({ ...p, [o.key]: e.target.value }))}>
                  {o.options!.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </Select>
              ) : o.type === "number" ? (
                <Input inputMode="numeric" value={opts[o.key]} onChange={(e) => setOpts((p) => ({ ...p, [o.key]: e.target.value }))} />
              ) : (
                <Select value={opts[o.key]} onChange={(e) => setOpts((p) => ({ ...p, [o.key]: e.target.value }))}>
                  <option value="1">Sim</option>
                  <option value="0">Não</option>
                </Select>
              )}
            </Field>
          ))}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">Entrada</span>
            <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}><Eraser size={14} /> Limpar</Button>
          </div>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} className={cn("min-h-[260px]", mono && "font-mono text-sm")} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">{outputLabel}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => downloadText(filename, output)} disabled={!output}><Download size={14} /> Baixar</Button>
              <CopyButton text={output} disabled={!output} />
            </div>
          </div>
          <Textarea readOnly value={output} className={cn("min-h-[260px] bg-bg-2", mono && "font-mono text-sm")} />
        </div>
      </div>
      {st && st.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {st.map((s) => <Stat key={s.label} label={s.label} value={s.value} />)}
        </div>
      )}
    </div>
  );
}
