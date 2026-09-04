import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RotateCcw } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES, toolBySlug } from "@/data/tools";
import type { ToolMeta } from "@/lib/types";
import { cn, formatCurrency, formatNumber, parseNum } from "@/lib/utils";
import { Accordion, Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { ClearButton, CopyButton, DownloadButton, FavoriteButton, ResultBox, Stat } from "@/components/ui/feedback";
import { ToolCard } from "@/components/content/Cards";
import { AdInArticle } from "@/components/ui/monetization";
import { Reveal } from "@/components/ui/motion";

export interface ToolProps { meta: ToolMeta }

/* -------------------------------- Layout ---------------------------------- */
export function ToolShell({ meta, children }: { meta: ToolMeta; children: ReactNode }) {
  const related = meta.related.map(toolBySlug).filter(Boolean) as ToolMeta[];
  const sameCat = TOOLS.filter((t) => t.category === meta.category && t.slug !== meta.slug && !meta.related.includes(t.slug)).slice(0, 4);
  const cat = TOOL_CATEGORIES.find((c) => c.slug === meta.category)!;
  return (
    <div className="space-y-12">
      <section className="rounded-3xl border bg-surface p-5 shadow-card sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3 border-b pb-4">
          <p className="font-mono text-[12px] text-fg-3">nexo / {cat.slug} / {meta.slug}</p>
          <div className="flex items-center gap-2"><span className="hidden rounded-md bg-ok/10 px-2 py-0.5 text-[11px] font-medium text-ok sm:inline">100% local</span><FavoriteButton kind="tool" slug={meta.slug} title={meta.name} path={`/ferramentas/${meta.slug}`} size="sm" /></div>
        </div>
        {children}
      </section>

      <AdInArticle />

      <Reveal><section className="grid gap-8 lg:grid-cols-2">
        <div><h2 className="text-xl font-semibold tracking-tight">Como funciona</h2><p className="mt-3 leading-7 text-fg-2">{meta.howItWorks}</p><p className="mt-3 leading-7 text-fg-2">{meta.description}</p></div>
        <div><h2 className="text-xl font-semibold tracking-tight">Exemplos</h2><ul className="mt-3 space-y-2">{meta.examples.map((e) => <li key={e} className="flex gap-3 rounded-xl border bg-surface px-4 py-3 text-sm text-fg-2"><span className="text-brand">→</span>{e}</li>)}</ul></div>
      </section></Reveal>

      <Reveal><section><h2 className="mb-4 text-xl font-semibold tracking-tight">Perguntas frequentes</h2><Accordion items={meta.faq.map((f) => ({ q: f.q, a: f.a }))} /></section></Reveal>

      {(related.length > 0 || sameCat.length > 0) && (
        <Reveal><section>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold tracking-tight">Ferramentas relacionadas</h2><Link to={`/ferramentas/categoria/${cat.slug}`} className="flex items-center gap-1 text-sm text-brand hover:underline">Ver {cat.name.toLowerCase()} <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[...related, ...sameCat].slice(0, 8).map((r) => <ToolCard key={r.slug} tool={r} compact />)}</div>
        </section></Reveal>
      )}
    </div>
  );
}

/* --------------------------- Helpers de formulário -------------------------- */
export function ToolActions({ onClear, copyText, downloadName, children }: { onClear?: () => void; copyText?: string; downloadName?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {copyText !== undefined && <CopyButton text={copyText} />}
      {downloadName && copyText !== undefined && <DownloadButton text={copyText} filename={downloadName} />}
      {children}
      {onClear && <ClearButton onClick={onClear} />}
    </div>
  );
}

export const fmt = (n: number, d = 2) => formatNumber(n, d);
export const money = (n: number) => formatCurrency(n);
export const pct = (n: number, d = 2) => `${formatNumber(n, d)}%`;

/* ------------------------------- FormulaTool -------------------------------- */
export type FieldDef = { key: string; label: string; type?: "number" | "text" | "date" | "select"; placeholder?: string; hint?: string; default?: string; options?: { value: string; label: string }[]; min?: number; step?: number; suffix?: string };
export type ResultRow = { label: string; value: string; hint?: string; big?: boolean };
export interface FormulaConfig {
  fields: FieldDef[];
  compute: (v: Record<string, string>, n: Record<string, number>) => { rows: ResultRow[]; formula?: string; table?: string[][]; note?: string } | { error: string } | null;
}

export function FormulaTool({ config }: { config: FormulaConfig }) {
  const init = useMemo(() => Object.fromEntries(config.fields.map((f) => [f.key, f.default ?? ""])), [config]);
  const [v, setV] = useState<Record<string, string>>(init);
  const n = useMemo(() => Object.fromEntries(config.fields.map((f) => [f.key, parseNum(v[f.key] ?? "")])), [v, config]);
  const filled = config.fields.filter((f) => f.type !== "select").some((f) => (v[f.key] ?? "") !== "");
  const out = filled ? config.compute(v, n) : null;
  const copyText = out && "rows" in out ? out.rows.map((r) => `${r.label}: ${r.value}`).join("\n") : "";
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {config.fields.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint} className={f.type === "select" || config.fields.length === 1 ? "sm:col-span-2" : ""}>
              {f.type === "select" ? (
                <Select value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })}>{f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
              ) : (
                <div className="relative">
                  <Input type={f.type === "date" ? "date" : "text"} inputMode={f.type === "number" || !f.type ? "decimal" : undefined} placeholder={f.placeholder} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} className={f.suffix ? "pr-12" : ""} />
                  {f.suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-3">{f.suffix}</span>}
                </div>
              )}
            </Field>
          ))}
        </div>
        <ToolActions onClear={() => setV(init)} copyText={copyText || undefined} />
      </div>
      <div>
        {!out ? <EmptyResult /> : "error" in out ? <ResultBox title="Atenção"><p className="text-sm text-danger">{out.error}</p></ResultBox> : (
          <ResultBox copyText={copyText} footer={out.formula ? <span className="font-mono">{out.formula}</span> : undefined}>
            <div className={cn("grid gap-5", out.rows.length > 2 ? "sm:grid-cols-2" : "")}>{out.rows.map((r) => <Stat key={r.label} label={r.label} value={r.value} hint={r.hint} big={r.big} />)}</div>
            {out.note && <p className="mt-4 text-xs leading-5 text-fg-3">{out.note}</p>}
            {out.table && <div className="mt-5 max-h-72 overflow-auto rounded-xl border bg-surface"><table className="w-full text-[13px]"><thead className="sticky top-0 bg-surface-2"><tr>{out.table[0].map((h) => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr></thead><tbody>{out.table.slice(1).map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-3 py-1.5 tabular-nums text-fg-2">{c}</td>)}</tr>)}</tbody></table></div>}
          </ResultBox>
        )}
      </div>
    </div>
  );
}

export function EmptyResult({ text = "Preencha os campos para ver o resultado." }: { text?: string }) {
  return <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-dashed p-6 text-center text-sm text-fg-3">{text}</div>;
}

/* --------------------------------- TextTool -------------------------------- */
export function TextTool({ transform, placeholder = "Cole ou digite o texto aqui…", options, outputLabel = "Resultado", stats, mono = false, rows = 8 }: {
  transform: (input: string, opts: Record<string, string | boolean>) => string;
  placeholder?: string; outputLabel?: string; mono?: boolean; rows?: number;
  options?: { key: string; label: string; type: "checkbox" | "select" | "text"; default?: string | boolean; options?: { value: string; label: string }[]; placeholder?: string }[];
  stats?: (input: string, output: string) => { label: string; value: string }[];
}) {
  const initOpts = useMemo(() => Object.fromEntries((options ?? []).map((o) => [o.key, o.default ?? (o.type === "checkbox" ? false : "")])), [options]);
  const [input, setInput] = useState("");
  const [opts, setOpts] = useState<Record<string, string | boolean>>(initOpts);
  const output = useMemo(() => { try { return transform(input, opts); } catch (e) { return `Erro: ${(e as Error).message}`; } }, [input, opts, transform]);
  const st = stats?.(input, output);
  return (
    <div className="space-y-4">
      {options && options.length > 0 && (
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3 rounded-xl border bg-surface-2/50 p-3">
          {options.map((o) => o.type === "checkbox" ? (
            <label key={o.key} className="flex items-center gap-2 text-sm text-fg-2"><input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" checked={Boolean(opts[o.key])} onChange={(e) => setOpts({ ...opts, [o.key]: e.target.checked })} />{o.label}</label>
          ) : o.type === "select" ? (
            <label key={o.key} className="text-sm text-fg-2"><span className="mb-1 block text-xs">{o.label}</span><Select className="h-9 min-w-[160px]" value={String(opts[o.key])} onChange={(e) => setOpts({ ...opts, [o.key]: e.target.value })}>{o.options!.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</Select></label>
          ) : (
            <label key={o.key} className="text-sm text-fg-2"><span className="mb-1 block text-xs">{o.label}</span><Input className="h-9 min-w-[160px]" placeholder={o.placeholder} value={String(opts[o.key])} onChange={(e) => setOpts({ ...opts, [o.key]: e.target.value })} /></label>
          ))}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Entrada"><Textarea rows={rows} placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)} className={mono ? "font-mono text-[13px]" : ""} /></Field>
        <Field label={outputLabel}><Textarea rows={rows} readOnly value={output} className={cn("bg-surface-2/60", mono ? "font-mono text-[13px]" : "")} /></Field>
      </div>
      {st && input && <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2">{st.map((s) => <span key={s.label}><span className="text-fg-3">{s.label}:</span> <strong className="tabular-nums text-fg">{s.value}</strong></span>)}</div>}
      <ToolActions onClear={() => setInput("")} copyText={output} downloadName="resultado.txt"><Button size="sm" variant="ghost" onClick={() => setInput(output)} disabled={!output}><RotateCcw className="h-4 w-4" />Usar resultado como entrada</Button></ToolActions>
    </div>
  );
}

/* ------------------------------- TemplateTool ------------------------------- */
export function TemplateTool({ fields, build, outputLabel = "Resultado", cta = "Gerar", helper }: { fields: FieldDef[]; build: (v: Record<string, string>) => string; outputLabel?: string; cta?: string; helper?: string }) {
  const init = useMemo(() => Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""])), [fields]);
  const [v, setV] = useState<Record<string, string>>(init);
  const [out, setOut] = useState("");
  const [seed, setSeed] = useState(0);
  const generate = () => { setSeed((s) => s + 1); setOut(build({ ...v, __seed: String(seed + 1) })); };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint} className={f.type === "text" && (f.placeholder?.length ?? 0) > 40 ? "sm:col-span-2" : f.type === "select" ? "" : ""}>
              {f.type === "select" ? <Select value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })}>{f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
                : <Input placeholder={f.placeholder} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />}
            </Field>
          ))}
        </div>
        {helper && <p className="text-xs text-fg-3">{helper}</p>}
        <div className="flex flex-wrap gap-2"><Button onClick={generate}>{cta}</Button><ClearButton onClick={() => { setV(init); setOut(""); }} /></div>
      </div>
      <div>
        {out ? <ResultBox title={outputLabel} copyText={out}><pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-fg">{out}</pre></ResultBox> : <EmptyResult text={`Preencha os campos e clique em “${cta}”.`} />}
      </div>
    </div>
  );
}

export function pickSeeded<T>(arr: T[], seed: string | number, offset = 0): T { let h = 7; const s = String(seed); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return arr[(h + offset * 97) % arr.length]; }
export const rnd = (n: number) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
export const shuffle = <T,>(arr: T[]) => { const c = [...arr]; for (let i = c.length - 1; i > 0; i--) { const j = rnd(i + 1); [c[i], c[j]] = [c[j], c[i]]; } return c; };
