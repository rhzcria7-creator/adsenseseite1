import { useCallback, useEffect, useMemo, useState } from "react";
import type { ToolMeta } from "@/lib/types";
import { formatCurrency, formatNumber, parseNum } from "@/lib/utils";
import { Field, Input, Segmented, Select, Toggle } from "@/components/ui/primitives";
import { Actions, Bar, BigNumber, ErrorText, KV, ResultPanel, ToolGrid, ToolShell } from "./ToolShell";

export type ToolProps = { meta: ToolMeta };

export function useFields<T extends Record<string, string | boolean>>(defaults: T) {
  const [v, setV] = useState<T>(defaults);
  const set = useCallback(<K extends keyof T>(k: K, val: T[K]) => setV((p) => ({ ...p, [k]: val })), []);
  const reset = useCallback(() => setV(defaults), [defaults]);
  const apply = useCallback((partial: Partial<T>) => setV((p) => ({ ...p, ...partial })), []);
  return { v, set, reset, apply };
}

const cur = (n: number) => formatCurrency(n);
const num = (n: number, d = 2) => formatNumber(n, d);
const pct = (n: number, d = 2) => `${formatNumber(n, d)}%`;

/* ------------------------------ Porcentagem ------------------------------- */
const P_DEF = { mode: "of", a: "15", b: "240" };
export function Porcentagem({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(P_DEF);
  const a = parseNum(v.a);
  const b = parseNum(v.b);
  const invalid = Number.isNaN(a) || Number.isNaN(b);
  let result = NaN;
  let label = "";
  let explain = "";
  if (!invalid) {
    if (v.mode === "of") {
      result = (a / 100) * b;
      label = `${num(a)}% de ${num(b)}`;
      explain = `${num(b)} × ${num(a)} ÷ 100 = ${num(result)}`;
    } else if (v.mode === "is") {
      result = b === 0 ? NaN : (a / b) * 100;
      label = `${num(a)} é quanto % de ${num(b)}`;
      explain = `${num(a)} ÷ ${num(b)} × 100 = ${pct(result)}`;
    } else {
      result = a === 0 ? NaN : ((b - a) / a) * 100;
      label = `Variação de ${num(a)} para ${num(b)}`;
      explain = `(${num(b)} − ${num(a)}) ÷ ${num(a)} × 100 = ${pct(result)}`;
    }
  }
  const out = v.mode === "of" ? num(result) : pct(result);
  return (
    <ToolShell meta={meta} examples={[{ label: "15% de 240", onClick: () => apply({ mode: "of", a: "15", b: "240" }) }, { label: "45 é quanto % de 250", onClick: () => apply({ mode: "is", a: "45", b: "250" }) }, { label: "De 80 para 100", onClick: () => apply({ mode: "change", a: "80", b: "100" }) }]}>
      <Segmented value={v.mode} onChange={(m) => set("mode", m)} options={[{ value: "of", label: "X% de Y" }, { value: "is", label: "X é quanto % de Y" }, { value: "change", label: "Variação de X para Y" }]} />
      <ToolGrid className="mt-5">
        <Field label={v.mode === "of" ? "Porcentagem (X)" : "Valor X"}>
          <Input inputMode="decimal" value={v.a} onChange={(e) => set("a", e.target.value)} suffix={v.mode === "of" ? "%" : undefined} />
        </Field>
        <Field label="Valor Y">
          <Input inputMode="decimal" value={v.b} onChange={(e) => set("b", e.target.value)} />
        </Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe dois números válidos."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <BigNumber label={label} value={Number.isNaN(result) ? "—" : out} accent sub={explain} />
          <Actions copy={out} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* -------------------------------- Desconto -------------------------------- */
const D_DEF = { price: "199", d1: "30", d2: "" };
export function Desconto({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(D_DEF);
  const price = parseNum(v.price);
  const d1 = parseNum(v.d1);
  const d2 = v.d2 ? parseNum(v.d2) : 0;
  const invalid = Number.isNaN(price) || Number.isNaN(d1) || Number.isNaN(d2);
  const after1 = price * (1 - d1 / 100);
  const final = after1 * (1 - d2 / 100);
  const real = price ? (1 - final / price) * 100 : 0;
  return (
    <ToolShell meta={meta} examples={[{ label: "R$ 199 com 30%", onClick: () => apply({ price: "199", d1: "30", d2: "" }) }, { label: "20% + 10% acumulados", onClick: () => apply({ price: "100", d1: "20", d2: "10" }) }]}>
      <ToolGrid cols={3}>
        <Field label="Preço original">
          <Input inputMode="decimal" prefix="R$" value={v.price} onChange={(e) => set("price", e.target.value)} />
        </Field>
        <Field label="Desconto">
          <Input inputMode="decimal" suffix="%" value={v.d1} onChange={(e) => set("d1", e.target.value)} />
        </Field>
        <Field label="2º desconto (opcional)" hint="Cupom sobre o valor já reduzido">
          <Input inputMode="decimal" suffix="%" value={v.d2} onChange={(e) => set("d2", e.target.value)} placeholder="0" />
        </Field>
      </ToolGrid>
      <ErrorText>{invalid && "Verifique os valores informados."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-2">
            <BigNumber label="Preço final" value={cur(final)} accent />
            <BigNumber label="Você economiza" value={cur(price - final)} sub={`Desconto real: ${pct(real)}`} />
          </div>
          <Bar value={real} className="mt-4" />
          <Actions copy={`Preço final: ${cur(final)} (economia ${cur(price - final)}, desconto real ${pct(real)})`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ------------------------------ Juros simples ----------------------------- */
const JS_DEF = { c: "1000", i: "2", t: "12", unit: "m" };
export function JurosSimples({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(JS_DEF);
  const c = parseNum(v.c), i = parseNum(v.i), t = parseNum(v.t);
  const invalid = [c, i, t].some(Number.isNaN) || t < 0;
  const j = c * (i / 100) * t;
  return (
    <ToolShell meta={meta} examples={[{ label: "R$ 1.000 a 2% a.m. por 12 meses", onClick: () => apply(JS_DEF) }, { label: "R$ 5.000 a 8% a.a. por 3 anos", onClick: () => apply({ c: "5000", i: "8", t: "3", unit: "a" }) }]}>
      <ToolGrid cols={4}>
        <Field label="Capital"><Input inputMode="decimal" prefix="R$" value={v.c} onChange={(e) => set("c", e.target.value)} /></Field>
        <Field label="Taxa"><Input inputMode="decimal" suffix={v.unit === "m" ? "% a.m." : "% a.a."} value={v.i} onChange={(e) => set("i", e.target.value)} /></Field>
        <Field label="Prazo"><Input inputMode="decimal" suffix={v.unit === "m" ? "meses" : "anos"} value={v.t} onChange={(e) => set("t", e.target.value)} /></Field>
        <Field label="Unidade"><Select value={v.unit} onChange={(e) => set("unit", e.target.value)}><option value="m">Mensal</option><option value="a">Anual</option></Select></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe valores numéricos válidos."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-2">
            <BigNumber label="Juros" value={cur(j)} accent />
            <BigNumber label="Montante" value={cur(c + j)} sub={`J = ${num(c)} × ${num(i)}% × ${num(t)}`} />
          </div>
          <Actions copy={`Juros: ${cur(j)} · Montante: ${cur(c + j)}`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ----------------------------- Juros compostos ---------------------------- */
const JC_DEF = { c: "10000", i: "1", t: "24", a: "0", unitI: "m", unitT: "m" };
export function JurosCompostos({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(JC_DEF);
  const c = parseNum(v.c), iRaw = parseNum(v.i), tRaw = parseNum(v.t), a = parseNum(v.a || "0");
  const invalid = [c, iRaw, tRaw, a].some(Number.isNaN) || tRaw <= 0;
  const i = v.unitI === "a" ? Math.pow(1 + iRaw / 100, 1 / 12) - 1 : iRaw / 100;
  const n = Math.round(v.unitT === "a" ? tRaw * 12 : tRaw);
  const rows = useMemo(() => {
    if (invalid) return [];
    const r: { m: number; juros: number; aportado: number; saldo: number }[] = [];
    let saldo = c, aportado = c;
    for (let m = 1; m <= Math.min(n, 1200); m++) {
      const juros = saldo * i;
      saldo += juros + a;
      aportado += a;
      r.push({ m, juros, aportado, saldo });
    }
    return r;
  }, [c, i, n, a, invalid]);
  const last = rows[rows.length - 1];
  const totalInvested = last?.aportado ?? c;
  const totalInterest = (last?.saldo ?? c) - totalInvested;
  const [showAll, setShowAll] = useState(false);
  return (
    <ToolShell meta={meta} examples={[{ label: "R$ 10 mil a 1% a.m. por 24 meses", onClick: () => apply(JC_DEF) }, { label: "R$ 500/mês a 0,8% por 10 anos", onClick: () => apply({ c: "0", i: "0.8", t: "10", a: "500", unitI: "m", unitT: "a" }) }, { label: "12% a.a. por 5 anos", onClick: () => apply({ c: "20000", i: "12", t: "5", a: "0", unitI: "a", unitT: "a" }) }]}>
      <ToolGrid cols={4}>
        <Field label="Capital inicial"><Input inputMode="decimal" prefix="R$" value={v.c} onChange={(e) => set("c", e.target.value)} /></Field>
        <Field label="Aporte mensal"><Input inputMode="decimal" prefix="R$" value={v.a} onChange={(e) => set("a", e.target.value)} /></Field>
        <Field label="Taxa de juros">
          <div className="flex">
            <Input inputMode="decimal" value={v.i} onChange={(e) => set("i", e.target.value)} className="border-r-0" />
            <Select value={v.unitI} onChange={(e) => set("unitI", e.target.value)} className="w-24"><option value="m">% a.m.</option><option value="a">% a.a.</option></Select>
          </div>
        </Field>
        <Field label="Prazo">
          <div className="flex">
            <Input inputMode="decimal" value={v.t} onChange={(e) => set("t", e.target.value)} className="border-r-0" />
            <Select value={v.unitT} onChange={(e) => set("unitT", e.target.value)} className="w-24"><option value="m">meses</option><option value="a">anos</option></Select>
          </div>
        </Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe valores válidos (prazo maior que zero)."}</ErrorText>
      {!invalid && last && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="Montante final" value={cur(last.saldo)} accent />
            <BigNumber label="Total investido" value={cur(totalInvested)} />
            <BigNumber label="Juros ganhos" value={cur(totalInterest)} sub={`${pct((totalInterest / Math.max(totalInvested, 1)) * 100, 1)} sobre o investido`} />
          </div>
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-muted"><span>Investido</span><span>Juros</span></div>
            <div className="flex h-2 w-full overflow-hidden bg-[var(--line)]">
              <div className="bg-fg transition-all duration-500" style={{ width: `${(totalInvested / last.saldo) * 100}%` }} />
              <div className="bg-accent transition-all duration-500" style={{ width: `${(totalInterest / last.saldo) * 100}%` }} />
            </div>
            <div className="mt-1 text-xs text-subtle">Taxa mensal equivalente: {pct(i * 100, 4)} · {n} meses</div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm tabular">
              <thead><tr className="border-b border-strong text-left text-xs uppercase tracking-wider text-muted"><th className="py-2 pr-3 font-medium">Mês</th><th className="py-2 pr-3 font-medium">Juros</th><th className="py-2 pr-3 font-medium">Aportado</th><th className="py-2 font-medium">Saldo</th></tr></thead>
              <tbody className="divide-y divide-[var(--line)]">
                {(showAll ? rows : rows.filter((r, idx) => idx < 6 || idx === rows.length - 1 || r.m % 12 === 0)).map((r) => (
                  <tr key={r.m}><td className="py-1.5 pr-3 text-muted">{r.m}</td><td className="py-1.5 pr-3">{cur(r.juros)}</td><td className="py-1.5 pr-3">{cur(r.aportado)}</td><td className="py-1.5 font-medium">{cur(r.saldo)}</td></tr>
                ))}
              </tbody>
            </table>
            {rows.length > 8 && <button onClick={() => setShowAll((s) => !s)} className="mt-3 text-xs font-medium underline underline-offset-2">{showAll ? "Mostrar resumo" : `Mostrar todos os ${rows.length} meses`}</button>}
          </div>
          <Actions copy={`Montante: ${cur(last.saldo)} · Investido: ${cur(totalInvested)} · Juros: ${cur(totalInterest)}`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ------------------------------ Regra de três ----------------------------- */
const R3_DEF = { a: "3", b: "12", c: "7", inverse: false };
export function RegraDeTres({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(R3_DEF);
  const a = parseNum(v.a), b = parseNum(v.b), c = parseNum(v.c);
  const invalid = [a, b, c].some(Number.isNaN);
  const x = v.inverse ? (a * b) / c : (b * c) / a;
  return (
    <ToolShell meta={meta} examples={[{ label: "3 canetas = R$ 12; 7 canetas = ?", onClick: () => apply(R3_DEF) }, { label: "4 pedreiros, 10 dias; 8 pedreiros = ? (inversa)", onClick: () => apply({ a: "4", b: "10", c: "8", inverse: true }) }]}>
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <Field label="A"><Input inputMode="decimal" value={v.a} onChange={(e) => set("a", e.target.value)} /></Field>
        <span className="hidden pt-5 text-center font-display text-xl text-subtle sm:block">está para</span>
        <Field label="B"><Input inputMode="decimal" value={v.b} onChange={(e) => set("b", e.target.value)} /></Field>
        <Field label="C"><Input inputMode="decimal" value={v.c} onChange={(e) => set("c", e.target.value)} /></Field>
        <span className="hidden pt-5 text-center font-display text-xl text-subtle sm:block">assim como</span>
        <Field label="X (?)"><Input readOnly value={invalid || !Number.isFinite(x) ? "" : num(x, 4)} className="border-accent font-semibold" /></Field>
      </div>
      <div className="mt-4 max-w-xs"><Toggle checked={v.inverse} onChange={(b) => set("inverse", b)} label="Proporção inversa" /></div>
      <ErrorText>{invalid && "Informe A, B e C."}</ErrorText>
      {!invalid && Number.isFinite(x) && (
        <ResultPanel>
          <BigNumber value={num(x, 4)} accent sub={v.inverse ? `X = (A × B) ÷ C = (${num(a)} × ${num(b)}) ÷ ${num(c)}` : `X = (B × C) ÷ A = (${num(b)} × ${num(c)}) ÷ ${num(a)}`} />
          <Actions copy={num(x, 4)} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ----------------------------------- IMC ---------------------------------- */
const IMC_DEF = { w: "70", h: "175" };
export function IMC({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(IMC_DEF);
  const w = parseNum(v.w);
  let h = parseNum(v.h);
  if (h > 3) h = h / 100;
  const invalid = Number.isNaN(w) || Number.isNaN(h) || h <= 0 || w <= 0;
  const imc = w / (h * h);
  const cls = imc < 18.5 ? ["Abaixo do peso", "amber"] : imc < 25 ? ["Peso normal", "mint"] : imc < 30 ? ["Sobrepeso", "amber"] : imc < 35 ? ["Obesidade grau I", "red"] : imc < 40 ? ["Obesidade grau II", "red"] : ["Obesidade grau III", "red"];
  return (
    <ToolShell meta={meta} examples={[{ label: "70 kg, 1,75 m", onClick: () => apply(IMC_DEF) }, { label: "95 kg, 1,70 m", onClick: () => apply({ w: "95", h: "170" }) }]}>
      <ToolGrid>
        <Field label="Peso"><Input inputMode="decimal" suffix="kg" value={v.w} onChange={(e) => set("w", e.target.value)} /></Field>
        <Field label="Altura" hint="Em cm (175) ou metros (1,75)"><Input inputMode="decimal" suffix="cm/m" value={v.h} onChange={(e) => set("h", e.target.value)} /></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe peso e altura válidos."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-2">
            <BigNumber label="IMC" value={num(imc, 1)} accent sub={cls[0]} />
            <BigNumber label="Faixa saudável para sua altura" value={`${num(18.5 * h * h, 1)} – ${num(24.9 * h * h, 1)} kg`} />
          </div>
          <div className="mt-5 flex h-2 w-full overflow-hidden">
            <div className="w-[18.5%] bg-amber/60" /><div className="w-[26%] bg-mint" /><div className="w-[20%] bg-amber" /><div className="flex-1 bg-red-600" />
          </div>
          <div className="relative mt-1 h-3"><span className="absolute -translate-x-1/2 text-[10px] font-mono" style={{ left: `${Math.min(100, Math.max(0, (imc / 50) * 100))}%` }}>▲</span></div>
          <Actions copy={`IMC ${num(imc, 1)} — ${cls[0]}`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ----------------------------- Dividir conta ------------------------------ */
const DC_DEF = { total: "240", people: "4", tip: "10", round: true };
export function DividirConta({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(DC_DEF);
  const total = parseNum(v.total), people = parseNum(v.people), tip = parseNum(v.tip || "0");
  const invalid = [total, people, tip].some(Number.isNaN) || people < 1;
  const withTip = total * (1 + tip / 100);
  const each = withTip / Math.floor(people);
  const shown = v.round ? Math.ceil(each) : each;
  return (
    <ToolShell meta={meta} examples={[{ label: "R$ 240 + 10% para 4", onClick: () => apply(DC_DEF) }, { label: "R$ 89,90 + 12% para 3", onClick: () => apply({ total: "89,90", people: "3", tip: "12", round: false }) }]}>
      <ToolGrid cols={3}>
        <Field label="Valor da conta"><Input inputMode="decimal" prefix="R$" value={v.total} onChange={(e) => set("total", e.target.value)} /></Field>
        <Field label="Pessoas"><Input inputMode="numeric" value={v.people} onChange={(e) => set("people", e.target.value)} /></Field>
        <Field label="Serviço / gorjeta"><Input inputMode="decimal" suffix="%" value={v.tip} onChange={(e) => set("tip", e.target.value)} /></Field>
      </ToolGrid>
      <div className="mt-3 flex flex-wrap gap-2">{[0, 10, 12, 15, 20].map((t) => <button key={t} onClick={() => set("tip", String(t))} className={`border px-2.5 py-1 text-xs ${String(t) === v.tip ? "border-fg bg-fg text-bg" : "border-line hover:border-strong"}`}>{t}%</button>)}</div>
      <div className="mt-3 max-w-xs"><Toggle checked={v.round} onChange={(b) => set("round", b)} label="Arredondar para cima" /></div>
      <ErrorText>{invalid && "Informe conta e número de pessoas (mínimo 1)."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="Por pessoa" value={cur(shown)} accent />
            <BigNumber label="Total com serviço" value={cur(withTip)} />
            <BigNumber label="Serviço" value={cur(withTip - total)} />
          </div>
          <Actions copy={`${cur(shown)} por pessoa (${Math.floor(people)} pessoas, total ${cur(withTip)})`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ----------------------------- Margem de lucro ---------------------------- */
const ML_DEF = { mode: "fromPrice", cost: "40", price: "100", margin: "40" };
export function MargemDeLucro({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(ML_DEF);
  const cost = parseNum(v.cost);
  const price = v.mode === "fromPrice" ? parseNum(v.price) : cost / (1 - parseNum(v.margin) / 100);
  const invalid = Number.isNaN(cost) || Number.isNaN(price) || cost <= 0 || price <= 0 || (v.mode === "fromMargin" && parseNum(v.margin) >= 100);
  const profit = price - cost;
  const margin = (profit / price) * 100;
  const markup = (profit / cost) * 100;
  return (
    <ToolShell meta={meta} examples={[{ label: "Custo 40, preço 100", onClick: () => apply({ mode: "fromPrice", cost: "40", price: "100", margin: "40" }) }, { label: "Custo 25 com margem 40%", onClick: () => apply({ mode: "fromMargin", cost: "25", price: "", margin: "40" }) }]}>
      <Segmented value={v.mode} onChange={(m) => set("mode", m)} options={[{ value: "fromPrice", label: "Tenho custo e preço" }, { value: "fromMargin", label: "Quero definir a margem" }]} />
      <ToolGrid className="mt-5">
        <Field label="Custo"><Input inputMode="decimal" prefix="R$" value={v.cost} onChange={(e) => set("cost", e.target.value)} /></Field>
        {v.mode === "fromPrice" ? <Field label="Preço de venda"><Input inputMode="decimal" prefix="R$" value={v.price} onChange={(e) => set("price", e.target.value)} /></Field> : <Field label="Margem desejada"><Input inputMode="decimal" suffix="%" value={v.margin} onChange={(e) => set("margin", e.target.value)} /></Field>}
      </ToolGrid>
      <ErrorText>{invalid && "Verifique os valores (margem deve ser menor que 100%)."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label={v.mode === "fromMargin" ? "Preço de venda" : "Lucro por unidade"} value={cur(v.mode === "fromMargin" ? price : profit)} accent />
            <BigNumber label="Margem (sobre venda)" value={pct(margin, 1)} />
            <BigNumber label="Markup (sobre custo)" value={pct(markup, 1)} />
          </div>
          <Actions copy={`Preço ${cur(price)} · Lucro ${cur(profit)} · Margem ${pct(margin, 1)} · Markup ${pct(markup, 1)}`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ------------------------------ Parcelamento ------------------------------ */
const PAR_DEF = { p: "3000", i: "2.5", n: "12" };
export function Parcelamento({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(PAR_DEF);
  const p = parseNum(v.p), i = parseNum(v.i) / 100, n = Math.round(parseNum(v.n));
  const invalid = [p, i, n].some(Number.isNaN) || p <= 0 || n < 1;
  const pmt = i === 0 ? p / n : (p * i) / (1 - Math.pow(1 + i, -n));
  const schedule = useMemo(() => {
    if (invalid) return [];
    let bal = p;
    return Array.from({ length: Math.min(n, 600) }, (_, k) => {
      const juros = bal * i;
      const amort = pmt - juros;
      bal -= amort;
      return { k: k + 1, juros, amort, bal: Math.max(0, bal) };
    });
  }, [p, i, n, pmt, invalid]);
  const [full, setFull] = useState(false);
  return (
    <ToolShell meta={meta} examples={[{ label: "R$ 3.000 em 12× a 2,5%", onClick: () => apply(PAR_DEF) }, { label: "R$ 50.000 em 48× a 1,2%", onClick: () => apply({ p: "50000", i: "1.2", n: "48" }) }]}>
      <ToolGrid cols={3}>
        <Field label="Valor financiado"><Input inputMode="decimal" prefix="R$" value={v.p} onChange={(e) => set("p", e.target.value)} /></Field>
        <Field label="Taxa mensal"><Input inputMode="decimal" suffix="% a.m." value={v.i} onChange={(e) => set("i", e.target.value)} /></Field>
        <Field label="Parcelas"><Input inputMode="numeric" value={v.n} onChange={(e) => set("n", e.target.value)} /></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe valor, taxa e número de parcelas."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="Parcela mensal" value={cur(pmt)} accent />
            <BigNumber label="Total pago" value={cur(pmt * n)} />
            <BigNumber label="Juros totais" value={cur(pmt * n - p)} sub={`${pct(((pmt * n) / p - 1) * 100, 1)} sobre o valor`} />
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm tabular">
              <thead><tr className="border-b border-strong text-left text-xs uppercase tracking-wider text-muted"><th className="py-2 pr-3 font-medium">Parcela</th><th className="py-2 pr-3 font-medium">Juros</th><th className="py-2 pr-3 font-medium">Amortização</th><th className="py-2 font-medium">Saldo devedor</th></tr></thead>
              <tbody className="divide-y divide-[var(--line)]">{(full ? schedule : schedule.slice(0, 6)).map((r) => <tr key={r.k}><td className="py-1.5 pr-3 text-muted">{r.k}</td><td className="py-1.5 pr-3">{cur(r.juros)}</td><td className="py-1.5 pr-3">{cur(r.amort)}</td><td className="py-1.5 font-medium">{cur(r.bal)}</td></tr>)}</tbody>
            </table>
            {schedule.length > 6 && <button onClick={() => setFull((f) => !f)} className="mt-3 text-xs font-medium underline underline-offset-2">{full ? "Mostrar menos" : `Ver todas as ${schedule.length} parcelas`}</button>}
          </div>
          <Actions copy={`${n}× de ${cur(pmt)} · Total ${cur(pmt * n)} · Juros ${cur(pmt * n - p)}`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ---------------------------- Média ponderada ----------------------------- */
export function MediaPonderada({ meta }: ToolProps) {
  const init = [{ v: "7", w: "2" }, { v: "8", w: "3" }, { v: "6", w: "1" }];
  const [rows, setRows] = useState(init);
  const parsed = rows.map((r) => ({ v: parseNum(r.v), w: parseNum(r.w || "1") })).filter((r) => !Number.isNaN(r.v) && !Number.isNaN(r.w));
  const sumW = parsed.reduce((a, r) => a + r.w, 0);
  const wavg = sumW ? parsed.reduce((a, r) => a + r.v * r.w, 0) / sumW : NaN;
  const avg = parsed.length ? parsed.reduce((a, r) => a + r.v, 0) / parsed.length : NaN;
  const upd = (i: number, k: "v" | "w", val: string) => setRows((p) => p.map((r, j) => (j === i ? { ...r, [k]: val } : r)));
  return (
    <ToolShell meta={meta} examples={[{ label: "Notas 7, 8, 6 (pesos 2, 3, 1)", onClick: () => setRows(init) }, { label: "Quatro provas iguais", onClick: () => setRows([{ v: "6.5", w: "1" }, { v: "8", w: "1" }, { v: "7.5", w: "1" }, { v: "9", w: "1" }]) }]}>
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium uppercase tracking-wider text-muted"><span>Valor / nota</span><span>Peso</span><span className="w-8" /></div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input inputMode="decimal" value={r.v} onChange={(e) => upd(i, "v", e.target.value)} placeholder="Nota" />
            <Input inputMode="decimal" value={r.w} onChange={(e) => upd(i, "w", e.target.value)} placeholder="1" />
            <button onClick={() => setRows((p) => p.filter((_, j) => j !== i))} disabled={rows.length <= 1} aria-label="Remover" className="w-8 border border-line text-subtle hover:border-strong disabled:opacity-30">×</button>
          </div>
        ))}
      </div>
      {rows.length < 12 && <button onClick={() => setRows((p) => [...p, { v: "", w: "1" }])} className="mt-3 text-xs font-medium underline underline-offset-2">+ adicionar linha</button>}
      {parsed.length > 0 && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-2">
            <BigNumber label="Média ponderada" value={num(wavg, 2)} accent sub={`Σ(valor × peso) ÷ ${num(sumW)}`} />
            <BigNumber label="Média simples" value={num(avg, 2)} sub={`${parsed.length} valores`} />
          </div>
          <Actions copy={`Média ponderada: ${num(wavg, 2)}`} onClear={() => setRows([{ v: "", w: "1" }])} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ----------------------------------- ROI ---------------------------------- */
const ROI_DEF = { inv: "2000", ret: "5000", months: "6" };
export function ROI({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(ROI_DEF);
  const inv = parseNum(v.inv), ret = parseNum(v.ret), months = parseNum(v.months || "0");
  const invalid = [inv, ret].some(Number.isNaN) || inv <= 0;
  const roi = ((ret - inv) / inv) * 100;
  const annual = months > 0 ? (Math.pow(1 + roi / 100, 12 / months) - 1) * 100 : NaN;
  return (
    <ToolShell meta={meta} examples={[{ label: "Investiu 2.000, retornou 5.000", onClick: () => apply(ROI_DEF) }, { label: "Campanha: 12.000 → 15.500 em 3 meses", onClick: () => apply({ inv: "12000", ret: "15500", months: "3" }) }]}>
      <ToolGrid cols={3}>
        <Field label="Investimento"><Input inputMode="decimal" prefix="R$" value={v.inv} onChange={(e) => set("inv", e.target.value)} /></Field>
        <Field label="Retorno total"><Input inputMode="decimal" prefix="R$" value={v.ret} onChange={(e) => set("ret", e.target.value)} /></Field>
        <Field label="Período (opcional)"><Input inputMode="decimal" suffix="meses" value={v.months} onChange={(e) => set("months", e.target.value)} /></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe investimento e retorno."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="ROI" value={pct(roi, 1)} accent sub={roi < 0 ? "Prejuízo" : "Lucro"} />
            <BigNumber label="Ganho líquido" value={cur(ret - inv)} />
            <BigNumber label="ROI anualizado" value={Number.isNaN(annual) ? "—" : pct(annual, 1)} sub={months > 0 ? `${num(months)} meses` : "informe o período"} />
          </div>
          <Actions copy={`ROI ${pct(roi, 1)} · Ganho ${cur(ret - inv)}`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* --------------------------- Calculadora de horas ------------------------- */
function toMin(s: string) {
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
}
const fmtHM = (m: number) => `${Math.floor(m / 60)}h${String(Math.round(m % 60)).padStart(2, "0")}`;
const CH_DEF = { mode: "between", start: "08:00", end: "17:30", brk: "60", list: "08:15\n07:45\n09:00\n08:30\n07:30" };
export function CalculadoraDeHoras({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(CH_DEF);
  let total = NaN, err = "";
  if (v.mode === "between") {
    const s = toMin(v.start), e = toMin(v.end), b = parseNum(v.brk || "0");
    if ([s, e, b].some(Number.isNaN)) err = "Use o formato HH:MM.";
    else total = (e >= s ? e - s : 1440 - s + e) - b;
  } else {
    const mins = v.list.split(/\n|,|;/).map((x) => x.trim()).filter(Boolean).map(toMin);
    if (mins.some(Number.isNaN)) err = "Cada linha deve estar no formato HH:MM.";
    else total = mins.reduce((a, b) => a + b, 0);
  }
  return (
    <ToolShell meta={meta} examples={[{ label: "08:00 → 17:30 com 1h de pausa", onClick: () => apply({ ...CH_DEF, mode: "between" }) }, { label: "Somar jornadas da semana", onClick: () => apply({ ...CH_DEF, mode: "sum" }) }]}>
      <Segmented value={v.mode} onChange={(m) => set("mode", m)} options={[{ value: "between", label: "Entre dois horários" }, { value: "sum", label: "Somar horas" }]} />
      {v.mode === "between" ? (
        <ToolGrid cols={3} className="mt-5">
          <Field label="Entrada"><Input value={v.start} onChange={(e) => set("start", e.target.value)} placeholder="08:00" /></Field>
          <Field label="Saída"><Input value={v.end} onChange={(e) => set("end", e.target.value)} placeholder="17:30" /></Field>
          <Field label="Intervalo"><Input inputMode="numeric" suffix="min" value={v.brk} onChange={(e) => set("brk", e.target.value)} /></Field>
        </ToolGrid>
      ) : (
        <Field label="Horas (uma por linha, HH:MM)" className="mt-5"><textarea value={v.list} onChange={(e) => set("list", e.target.value)} rows={5} className="w-full border border-line bg-elev p-3 font-mono text-sm focus:border-strong focus:outline-none" /></Field>
      )}
      <ErrorText>{err}</ErrorText>
      {!err && !Number.isNaN(total) && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="Total" value={fmtHM(total)} accent />
            <BigNumber label="Em decimal" value={`${num(total / 60, 2)} h`} />
            <BigNumber label="Em minutos" value={num(total, 0)} />
          </div>
          <Actions copy={`${fmtHM(total)} (${num(total / 60, 2)} h)`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ---------------------------- Valor hora freelancer ----------------------- */
const VH_DEF = { income: "8000", costs: "1500", tax: "6", hoursDay: "6", daysWeek: "5", weeksOff: "4", billable: "65" };
export function ValorHoraFreelancer({ meta }: ToolProps) {
  const { v, set, reset } = useFields(VH_DEF);
  const n = (k: keyof typeof VH_DEF) => parseNum(v[k]);
  const invalid = (Object.keys(VH_DEF) as (keyof typeof VH_DEF)[]).some((k) => Number.isNaN(n(k)));
  const weeksYear = 52 - n("weeksOff");
  const hoursMonth = (n("hoursDay") * n("daysWeek") * weeksYear) / 12;
  const billableHours = hoursMonth * (n("billable") / 100);
  const gross = (n("income") + n("costs")) / (1 - n("tax") / 100);
  const rate = gross / billableHours;
  return (
    <ToolShell meta={meta}>
      <ToolGrid cols={4}>
        <Field label="Renda líquida desejada/mês"><Input inputMode="decimal" prefix="R$" value={v.income} onChange={(e) => set("income", e.target.value)} /></Field>
        <Field label="Custos fixos/mês"><Input inputMode="decimal" prefix="R$" value={v.costs} onChange={(e) => set("costs", e.target.value)} /></Field>
        <Field label="Impostos"><Input inputMode="decimal" suffix="%" value={v.tax} onChange={(e) => set("tax", e.target.value)} /></Field>
        <Field label="Horas faturáveis"><Input inputMode="decimal" suffix="%" value={v.billable} onChange={(e) => set("billable", e.target.value)} /></Field>
        <Field label="Horas por dia"><Input inputMode="decimal" value={v.hoursDay} onChange={(e) => set("hoursDay", e.target.value)} /></Field>
        <Field label="Dias por semana"><Input inputMode="decimal" value={v.daysWeek} onChange={(e) => set("daysWeek", e.target.value)} /></Field>
        <Field label="Semanas de folga/ano"><Input inputMode="decimal" value={v.weeksOff} onChange={(e) => set("weeksOff", e.target.value)} /></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Preencha todos os campos."}</ErrorText>
      {!invalid && Number.isFinite(rate) && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="Valor-hora mínimo" value={cur(rate)} accent />
            <BigNumber label="Faturamento bruto/mês" value={cur(gross)} />
            <BigNumber label="Horas faturáveis/mês" value={num(billableHours, 0)} sub={`de ${num(hoursMonth, 0)} trabalhadas`} />
          </div>
          <KV rows={[["Diária (hora × horas/dia)", cur(rate * n("hoursDay"))], ["Projeto de 40 h", cur(rate * 40)], ["Valor-hora com 20% de margem", cur(rate * 1.2)]]} />
          <Actions copy={`Valor-hora: ${cur(rate)}`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* --------------------------- Álcool ou gasolina --------------------------- */
const AG_DEF = { alc: "3.89", gas: "5.79", kmAlc: "", kmGas: "" };
export function AlcoolOuGasolina({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields(AG_DEF);
  const alc = parseNum(v.alc), gas = parseNum(v.gas);
  const invalid = Number.isNaN(alc) || Number.isNaN(gas) || gas <= 0;
  const kmA = parseNum(v.kmAlc), kmG = parseNum(v.kmGas);
  const useReal = !Number.isNaN(kmA) && !Number.isNaN(kmG) && kmA > 0 && kmG > 0;
  const ratio = alc / gas;
  const costAlc = useReal ? alc / kmA : NaN;
  const costGas = useReal ? gas / kmG : NaN;
  const better = useReal ? (costAlc < costGas ? "Etanol" : "Gasolina") : ratio < 0.7 ? "Etanol" : "Gasolina";
  return (
    <ToolShell meta={meta} examples={[{ label: "Etanol 3,89 × Gasolina 5,79", onClick: () => apply(AG_DEF) }, { label: "Com consumo real", onClick: () => apply({ alc: "4.19", gas: "5.99", kmAlc: "8.5", kmGas: "12" }) }]}>
      <ToolGrid cols={4}>
        <Field label="Preço do etanol"><Input inputMode="decimal" prefix="R$" value={v.alc} onChange={(e) => set("alc", e.target.value)} /></Field>
        <Field label="Preço da gasolina"><Input inputMode="decimal" prefix="R$" value={v.gas} onChange={(e) => set("gas", e.target.value)} /></Field>
        <Field label="km/l com etanol (opcional)"><Input inputMode="decimal" value={v.kmAlc} onChange={(e) => set("kmAlc", e.target.value)} placeholder="8,5" /></Field>
        <Field label="km/l com gasolina (opcional)"><Input inputMode="decimal" value={v.kmGas} onChange={(e) => set("kmGas", e.target.value)} placeholder="12" /></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe os dois preços."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <BigNumber label={useReal ? "Pelo consumo real do seu carro" : "Pela regra dos 70%"} value={`Abasteça com ${better}`} accent />
          <KV rows={useReal ? [["Custo por km (etanol)", cur(costAlc)], ["Custo por km (gasolina)", cur(costGas)], ["Economia por km", cur(Math.abs(costAlc - costGas))]] : [["Relação etanol ÷ gasolina", num(ratio, 3)], ["Limite de referência", "0,700"], ["Preço máximo do etanol para compensar", cur(gas * 0.7)]]} />
          <Actions copy={`Compensa: ${better} (relação ${num(ratio, 3)})`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ================================== DATAS ================================= */

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtBR = (d: Date) => d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

function diffYMD(from: Date, to: Date) {
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  if (d < 0) {
    m--;
    d += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }
  return { y, m, d };
}
const parseDate = (s: string) => {
  const d = new Date(s + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
};

export function CalculadoraDeIdade({ meta }: ToolProps) {
  const { v, set, reset } = useFields({ birth: "1990-03-15", ref: todayISO() });
  const b = parseDate(v.birth), r = parseDate(v.ref);
  const invalid = !b || !r || b > r;
  const ymd = !invalid ? diffYMD(b!, r!) : null;
  const days = !invalid ? Math.floor((r!.getTime() - b!.getTime()) / 86400000) : 0;
  let next = 0;
  if (!invalid) {
    const nb = new Date(r!.getFullYear(), b!.getMonth(), b!.getDate());
    if (nb < r!) nb.setFullYear(nb.getFullYear() + 1);
    next = Math.round((nb.getTime() - r!.getTime()) / 86400000);
  }
  return (
    <ToolShell meta={meta}>
      <ToolGrid>
        <Field label="Data de nascimento"><Input type="date" value={v.birth} onChange={(e) => set("birth", e.target.value)} /></Field>
        <Field label="Calcular em"><Input type="date" value={v.ref} onChange={(e) => set("ref", e.target.value)} /></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe datas válidas (nascimento anterior à referência)."}</ErrorText>
      {ymd && (
        <ResultPanel>
          <BigNumber value={`${ymd.y} anos, ${ymd.m} meses e ${ymd.d} dias`} accent />
          <KV rows={[["Total em dias", num(days, 0)], ["Total em semanas", num(days / 7, 1)], ["Total em meses", num(ymd.y * 12 + ymd.m, 0)], ["Próximo aniversário", next === 0 ? "Hoje! 🎂" : `em ${next} dias`], ["Dia da semana em que nasceu", b!.toLocaleDateString("pt-BR", { weekday: "long" })]]} />
          <Actions copy={`${ymd.y} anos, ${ymd.m} meses e ${ymd.d} dias`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

export function DiferencaEntreDatas({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields({ a: "2025-01-01", b: "2025-12-31", inclusive: false as boolean });
  const a = parseDate(v.a), b = parseDate(v.b);
  const invalid = !a || !b;
  const [from, to] = !invalid && a! > b! ? [b!, a!] : [a!, b!];
  const days = !invalid ? Math.round((to.getTime() - from.getTime()) / 86400000) + (v.inclusive ? 1 : 0) : 0;
  let business = 0;
  if (!invalid) {
    const d = new Date(from);
    const end = new Date(to);
    if (!v.inclusive) end.setDate(end.getDate() - 1);
    while (d <= end) {
      const wd = d.getDay();
      if (wd !== 0 && wd !== 6) business++;
      d.setDate(d.getDate() + 1);
    }
  }
  const ymd = !invalid ? diffYMD(from, to) : null;
  return (
    <ToolShell meta={meta} examples={[{ label: "Ano de 2025", onClick: () => apply({ a: "2025-01-01", b: "2025-12-31", inclusive: false }) }, { label: "Hoje até o Natal", onClick: () => apply({ a: todayISO(), b: `${new Date().getFullYear()}-12-25`, inclusive: false }) }]}>
      <ToolGrid cols={3}>
        <Field label="Data inicial"><Input type="date" value={v.a} onChange={(e) => set("a", e.target.value)} /></Field>
        <Field label="Data final"><Input type="date" value={v.b} onChange={(e) => set("b", e.target.value)} /></Field>
        <div className="pt-6"><Toggle checked={v.inclusive} onChange={(x) => set("inclusive", x)} label="Incluir o último dia" /></div>
      </ToolGrid>
      <ErrorText>{invalid && "Informe as duas datas."}</ErrorText>
      {ymd && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="Dias" value={num(days, 0)} accent />
            <BigNumber label="Dias úteis (seg–sex)" value={num(business, 0)} />
            <BigNumber label="Semanas" value={num(days / 7, 1)} />
          </div>
          <KV rows={[["Anos, meses e dias", `${ymd.y}a ${ymd.m}m ${ymd.d}d`], ["Meses (aprox.)", num(days / 30.44, 1)], ["Horas", num(days * 24, 0)], ["Fins de semana", num(days - business - (v.inclusive ? 0 : 0), 0)]]} />
          <Actions copy={`${days} dias (${business} úteis)`} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

export function SomarDias({ meta }: ToolProps) {
  const { v, set, reset, apply } = useFields({ base: todayISO(), n: "90", unit: "d", op: "add", business: false as boolean });
  const base = parseDate(v.base);
  const n = Math.round(parseNum(v.n));
  const invalid = !base || Number.isNaN(n);
  let result: Date | null = null;
  if (!invalid) {
    result = new Date(base!);
    const sign = v.op === "add" ? 1 : -1;
    if (v.unit === "d") {
      if (v.business) {
        let left = Math.abs(n);
        while (left > 0) {
          result.setDate(result.getDate() + sign);
          const wd = result.getDay();
          if (wd !== 0 && wd !== 6) left--;
        }
      } else result.setDate(result.getDate() + sign * n);
    } else if (v.unit === "w") result.setDate(result.getDate() + sign * n * 7);
    else if (v.unit === "m") result.setMonth(result.getMonth() + sign * n);
    else result.setFullYear(result.getFullYear() + sign * n);
  }
  return (
    <ToolShell meta={meta} examples={[{ label: "Hoje + 90 dias", onClick: () => apply({ base: todayISO(), n: "90", unit: "d", op: "add", business: false }) }, { label: "Hoje + 30 dias úteis", onClick: () => apply({ base: todayISO(), n: "30", unit: "d", op: "add", business: true }) }]}>
      <ToolGrid cols={4}>
        <Field label="Data base"><Input type="date" value={v.base} onChange={(e) => set("base", e.target.value)} /></Field>
        <Field label="Operação"><Select value={v.op} onChange={(e) => set("op", e.target.value)}><option value="add">Somar</option><option value="sub">Subtrair</option></Select></Field>
        <Field label="Quantidade"><Input inputMode="numeric" value={v.n} onChange={(e) => set("n", e.target.value)} /></Field>
        <Field label="Unidade"><Select value={v.unit} onChange={(e) => set("unit", e.target.value)}><option value="d">Dias</option><option value="w">Semanas</option><option value="m">Meses</option><option value="y">Anos</option></Select></Field>
      </ToolGrid>
      {v.unit === "d" && <div className="mt-3 max-w-xs"><Toggle checked={v.business} onChange={(b) => set("business", b)} label="Apenas dias úteis" /></div>}
      <ErrorText>{invalid && "Informe data e quantidade."}</ErrorText>
      {result && (
        <ResultPanel>
          <BigNumber value={result.toLocaleDateString("pt-BR")} accent sub={fmtBR(result)} />
          <Actions copy={result.toLocaleDateString("pt-BR")} onClear={reset} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

export function ContagemRegressiva({ meta }: ToolProps) {
  const saved = (() => { try { return localStorage.getItem("nexo:countdown") ?? ""; } catch { return ""; } })();
  const defaultTarget = `${new Date().getFullYear() + 1}-01-01T00:00`;
  const [target, setTarget] = useState(saved || defaultTarget);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { try { localStorage.setItem("nexo:countdown", target); } catch { /* noop */ } }, [target]);
  const t = new Date(target).getTime();
  const invalid = Number.isNaN(t);
  const diff = Math.max(0, t - now);
  const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
  return (
    <ToolShell meta={meta} examples={[{ label: "Réveillon", onClick: () => setTarget(defaultTarget) }, { label: "Natal", onClick: () => setTarget(`${new Date().getFullYear()}-12-25T00:00`) }]}>
      <Field label="Data e hora do evento" className="max-w-sm"><Input type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)} /></Field>
      <ErrorText>{invalid && "Informe uma data válida."}</ErrorText>
      {!invalid && (
        <ResultPanel title={diff === 0 ? "Chegou!" : "Faltam"}>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[[d, "dias"], [h, "horas"], [m, "min"], [s, "seg"]].map(([val, lab]) => (
              <div key={lab as string} className="border border-line p-3 text-center sm:p-5">
                <div className="font-display text-3xl font-bold tabular sm:text-5xl">{String(val).padStart(2, "0")}</div>
                <div className="eyebrow mt-1">{lab}</div>
              </div>
            ))}
          </div>
          <Actions copy={`Faltam ${d} dias, ${h}h ${m}min para ${new Date(target).toLocaleString("pt-BR")}`} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

export function DiaDaSemana({ meta }: ToolProps) {
  const [date, setDate] = useState("2000-01-01");
  const d = parseDate(date);
  let info: [string, string][] = [];
  if (d) {
    const start = new Date(d.getFullYear(), 0, 1);
    const doy = Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((tmp.getTime() - yStart.getTime()) / 86400000 + 1) / 7);
    const leap = (d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || d.getFullYear() % 400 === 0;
    info = [["Dia do ano", `${doy} de ${leap ? 366 : 365}`], ["Semana ISO", `${week}`], ["Trimestre", `${Math.floor(d.getMonth() / 3) + 1}º`], ["Ano bissexto", leap ? "Sim" : "Não"], ["Dias até o fim do ano", `${(leap ? 366 : 365) - doy}`]];
  }
  return (
    <ToolShell meta={meta} examples={[{ label: "01/01/2000", onClick: () => setDate("2000-01-01") }, { label: "Natal de 2030", onClick: () => setDate("2030-12-25") }, { label: "Hoje", onClick: () => setDate(todayISO()) }]}>
      <Field label="Data" className="max-w-xs"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <ErrorText>{!d && "Informe uma data válida."}</ErrorText>
      {d && (
        <ResultPanel>
          <BigNumber value={d.toLocaleDateString("pt-BR", { weekday: "long" })} accent sub={fmtBR(d)} className="capitalize" />
          <KV rows={info} />
          <Actions copy={fmtBR(d)} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}
