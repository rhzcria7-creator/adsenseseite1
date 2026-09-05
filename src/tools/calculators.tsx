import { useCallback, useEffect, useState } from "react";
import { FormulaTool, type FieldDef, type FormulaResult } from "./ToolShell";
import { fmtBRL, fmtNum, fmtPct, parseNum } from "@/lib/utils";

const num = (v: string) => parseNum(v);
const need = (...vals: number[]) => vals.every((v) => Number.isFinite(v));
const empty = null;

/* ---------- Porcentagem ---------- */
export function Porcentagem() {
  const fields: FieldDef[] = [
    { key: "p", label: "Porcentagem (%)", type: "number", placeholder: "15", suffix: "%" },
    { key: "v", label: "Valor", type: "number", placeholder: "240" },
    { key: "a", label: "Valor A (é quanto % de B?)", type: "number", placeholder: "30" },
    { key: "b", label: "Valor B", type: "number", placeholder: "120" },
    { key: "de", label: "Variação: de", type: "number", placeholder: "80" },
    { key: "para", label: "Variação: para", type: "number", placeholder: "100" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const rows = [];
    const p = num(v.p), val = num(v.v), a = num(v.a), b = num(v.b), de = num(v.de), para = num(v.para);
    if (need(p, val)) rows.push({ label: `${fmtNum(p)}% de ${fmtNum(val)}`, value: fmtNum((p / 100) * val, 4) });
    if (need(a, b) && b !== 0) rows.push({ label: `${fmtNum(a)} é quanto % de ${fmtNum(b)}`, value: fmtPct((a / b) * 100, 4) });
    if (need(de, para) && de !== 0) {
      const d = ((para - de) / Math.abs(de)) * 100;
      rows.push({ label: `Variação de ${fmtNum(de)} para ${fmtNum(para)}`, value: `${d >= 0 ? "+" : ""}${fmtPct(d)}`, hint: d >= 0 ? "aumento" : "redução" });
    }
    return rows.length ? { rows } : empty;
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Desconto ---------- */
export function Desconto() {
  const fields: FieldDef[] = [
    { key: "preco", label: "Preço original", type: "number", prefix: "R$", placeholder: "199,90" },
    { key: "d1", label: "Desconto", type: "number", suffix: "%", placeholder: "25" },
    { key: "d2", label: "Segundo desconto (opcional)", type: "number", suffix: "%", placeholder: "10" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const p = num(v.preco), d1 = num(v.d1), d2 = num(v.d2);
    if (!need(p, d1)) return empty;
    let final = p * (1 - d1 / 100);
    if (Number.isFinite(d2)) final *= 1 - d2 / 100;
    const total = (1 - final / p) * 100;
    return {
      rows: [
        { label: "Preço final", value: fmtBRL(final) },
        { label: "Você economiza", value: fmtBRL(p - final) },
        { label: "Desconto total efetivo", value: fmtPct(total) },
      ],
      note: Number.isFinite(d2) ? `Descontos sucessivos são multiplicativos: ${fmtNum(d1)}% + ${fmtNum(d2)}% = ${fmtPct(total)} de desconto real.` : undefined,
    };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Juros simples ---------- */
export function JurosSimples() {
  const fields: FieldDef[] = [
    { key: "c", label: "Capital", type: "number", prefix: "R$", placeholder: "1000" },
    { key: "i", label: "Taxa por período", type: "number", suffix: "%", placeholder: "2" },
    { key: "t", label: "Períodos", type: "number", placeholder: "12" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const c = num(v.c), i = num(v.i) / 100, t = num(v.t);
    if (!need(c, i, t)) return empty;
    const j = c * i * t;
    const comp = c * Math.pow(1 + i, t) - c;
    return { rows: [{ label: "Juros", value: fmtBRL(j) }, { label: "Montante", value: fmtBRL(c + j) }, { label: "Se fossem compostos", value: fmtBRL(c + comp), hint: `+${fmtBRL(comp - j)} de diferença` }], note: "J = C × i × t" };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Juros compostos ---------- */
export function JurosCompostos() {
  const fields: FieldDef[] = [
    { key: "c", label: "Valor inicial", type: "number", prefix: "R$", placeholder: "5000" },
    { key: "a", label: "Aporte mensal", type: "number", prefix: "R$", placeholder: "500" },
    { key: "i", label: "Taxa de juros", type: "number", suffix: "%", placeholder: "0,9" },
    { key: "per", label: "Período da taxa", type: "select", default: "m", options: [{ value: "m", label: "ao mês" }, { value: "a", label: "ao ano" }] },
    { key: "t", label: "Prazo", type: "number", placeholder: "10" },
    { key: "tu", label: "Unidade do prazo", type: "select", default: "a", options: [{ value: "a", label: "anos" }, { value: "m", label: "meses" }] },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const c = num(v.c) || 0, a = num(v.a) || 0, iRaw = num(v.i), t = num(v.t);
    if (!need(iRaw, t) || (c === 0 && a === 0)) return empty;
    const im = v.per === "a" ? Math.pow(1 + iRaw / 100, 1 / 12) - 1 : iRaw / 100;
    const months = v.tu === "a" ? Math.round(t * 12) : Math.round(t);
    let bal = c;
    const yearly: { y: number; bal: number; invested: number }[] = [];
    for (let m = 1; m <= months; m++) {
      bal = bal * (1 + im) + a;
      if (m % 12 === 0 || m === months) yearly.push({ y: m / 12, bal, invested: c + a * m });
    }
    const invested = c + a * months;
    return {
      rows: [
        { label: "Montante final", value: fmtBRL(bal) },
        { label: "Total investido", value: fmtBRL(invested) },
        { label: "Juros acumulados", value: fmtBRL(bal - invested), hint: `${fmtPct(((bal - invested) / invested) * 100, 1)} sobre o investido` },
      ],
      note: `Taxa mensal equivalente: ${fmtPct(im * 100, 4)}. Cálculo com ${months} meses e aportes ao final de cada mês.`,
      extra: (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-bg-2 text-left text-xs uppercase tracking-wider text-fg-3"><tr><th className="px-4 py-2">Período</th><th className="px-4 py-2">Investido</th><th className="px-4 py-2">Saldo</th><th className="px-4 py-2">Juros</th></tr></thead>
            <tbody>
              {yearly.slice(0, 40).map((r) => (
                <tr key={r.y} className="border-t border-line font-mono text-[13px]"><td className="px-4 py-2">{Number.isInteger(r.y) ? `Ano ${r.y}` : `${Math.round(r.y * 12)} meses`}</td><td className="px-4 py-2">{fmtBRL(r.invested)}</td><td className="px-4 py-2 font-semibold text-fg">{fmtBRL(r.bal)}</td><td className="px-4 py-2 text-ok">{fmtBRL(r.bal - r.invested)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Regra de três ---------- */
export function RegraDeTres() {
  const fields: FieldDef[] = [
    { key: "a", label: "A", type: "number", placeholder: "3", half: true },
    { key: "b", label: "está para B", type: "number", placeholder: "27", half: true },
    { key: "c", label: "assim como C", type: "number", placeholder: "5", half: true },
    { key: "tipo", label: "Tipo", type: "select", default: "d", options: [{ value: "d", label: "Direta (aumenta junto)" }, { value: "i", label: "Inversa (uma aumenta, outra diminui)" }], half: true },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const a = num(v.a), b = num(v.b), c = num(v.c);
    if (!need(a, b, c) || a === 0 || c === 0) return empty;
    const x = v.tipo === "d" ? (b * c) / a : (a * b) / c;
    return { rows: [{ label: "X", value: fmtNum(x, 4) }], note: v.tipo === "d" ? `X = (B × C) ÷ A = (${fmtNum(b)} × ${fmtNum(c)}) ÷ ${fmtNum(a)}` : `X = (A × B) ÷ C = (${fmtNum(a)} × ${fmtNum(b)}) ÷ ${fmtNum(c)}` };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- IMC ---------- */
export function IMC() {
  const fields: FieldDef[] = [
    { key: "p", label: "Peso", type: "number", suffix: "kg", placeholder: "70" },
    { key: "h", label: "Altura", type: "number", suffix: "cm", placeholder: "175" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const p = num(v.p), h = num(v.h) / 100;
    if (!need(p, h) || h <= 0) return empty;
    const imc = p / (h * h);
    const cls = imc < 18.5 ? "Abaixo do peso" : imc < 25 ? "Peso normal" : imc < 30 ? "Sobrepeso" : imc < 35 ? "Obesidade grau I" : imc < 40 ? "Obesidade grau II" : "Obesidade grau III";
    return { rows: [{ label: "IMC", value: fmtNum(imc, 1), hint: cls }, { label: "Faixa de peso saudável", value: `${fmtNum(18.5 * h * h, 1)} – ${fmtNum(24.9 * h * h, 1)} kg` }], note: "Classificação da OMS para adultos. Não substitui avaliação profissional." };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function Agua() {
  const fields: FieldDef[] = [
    { key: "p", label: "Peso", type: "number", suffix: "kg", placeholder: "70" },
    { key: "n", label: "Atividade física", type: "select", default: "1", options: [{ value: "0", label: "Sedentário" }, { value: "1", label: "Moderada (2–3×/semana)" }, { value: "2", label: "Intensa (diária)" }] },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const p = num(v.p);
    if (!need(p)) return empty;
    const ml = p * (35 + Number(v.n) * 5);
    return { rows: [{ label: "Água por dia", value: `${fmtNum(ml / 1000, 2)} L` }, { label: "Copos de 250 ml", value: fmtNum(ml / 250, 0) }], note: "Estimativa de 35–45 ml por kg. Ajuste em dias quentes ou com exercício intenso." };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Média ponderada ---------- */
export function MediaPonderada() {
  const fields: FieldDef[] = Array.from({ length: 5 }).flatMap((_, i) => [
    { key: `n${i}`, label: `Nota ${i + 1}`, type: "number", placeholder: i === 0 ? "7" : "", half: true } as FieldDef,
    { key: `p${i}`, label: `Peso ${i + 1}`, type: "number", placeholder: "1", half: true } as FieldDef,
  ]);
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    let sum = 0, w = 0, count = 0;
    for (let i = 0; i < 5; i++) {
      const n = num(v[`n${i}`]);
      if (!Number.isFinite(n)) continue;
      const p = Number.isFinite(num(v[`p${i}`])) ? num(v[`p${i}`]) : 1;
      sum += n * p; w += p; count++;
    }
    if (!count || w === 0) return empty;
    return { rows: [{ label: "Média ponderada", value: fmtNum(sum / w, 2) }, { label: "Notas consideradas", value: String(count) }, { label: "Soma dos pesos", value: fmtNum(w) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Margem / Markup ---------- */
export function Margem() {
  const fields: FieldDef[] = [
    { key: "c", label: "Custo", type: "number", prefix: "R$", placeholder: "60" },
    { key: "v", label: "Preço de venda", type: "number", prefix: "R$", placeholder: "100" },
    { key: "m", label: "Ou: margem desejada", type: "number", suffix: "%", placeholder: "40", hint: "Preenche o preço necessário" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const c = num(v.c), p = num(v.v), m = num(v.m);
    if (!need(c)) return empty;
    const rows = [];
    if (need(p) && p > 0) rows.push({ label: "Margem bruta", value: fmtPct(((p - c) / p) * 100) }, { label: "Lucro", value: fmtBRL(p - c) }, { label: "Markup", value: fmtPct(((p - c) / c) * 100) });
    if (need(m) && m < 100) rows.push({ label: `Preço para margem de ${fmtNum(m)}%`, value: fmtBRL(c / (1 - m / 100)) });
    return rows.length ? { rows } : empty;
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function Markup() {
  const fields: FieldDef[] = [
    { key: "c", label: "Custo", type: "number", prefix: "R$", placeholder: "60" },
    { key: "k", label: "Markup", type: "number", suffix: "%", placeholder: "80" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const c = num(v.c), k = num(v.k);
    if (!need(c, k)) return empty;
    const p = c * (1 + k / 100);
    return { rows: [{ label: "Preço de venda", value: fmtBRL(p) }, { label: "Lucro", value: fmtBRL(p - c) }, { label: "Margem equivalente", value: fmtPct(((p - c) / p) * 100) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Financiamento (Price) ---------- */
export function Financiamento() {
  const fields: FieldDef[] = [
    { key: "v", label: "Valor financiado", type: "number", prefix: "R$", placeholder: "30000" },
    { key: "i", label: "Taxa mensal", type: "number", suffix: "%", placeholder: "1,5" },
    { key: "n", label: "Parcelas", type: "number", placeholder: "48" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const pv = num(v.v), i = num(v.i) / 100, n = num(v.n);
    if (!need(pv, i, n) || n <= 0) return empty;
    const pmt = i === 0 ? pv / n : (pv * i) / (1 - Math.pow(1 + i, -n));
    const total = pmt * n;
    return { rows: [{ label: "Parcela mensal", value: fmtBRL(pmt) }, { label: "Total pago", value: fmtBRL(total) }, { label: "Total de juros", value: fmtBRL(total - pv), hint: `${fmtPct(((total - pv) / pv) * 100, 1)} do valor` }, { label: "Taxa anual equivalente", value: fmtPct((Math.pow(1 + i, 12) - 1) * 100) }], note: "Sistema Price (parcelas fixas). Não inclui IOF, seguros e tarifas." };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function ROI() {
  const fields: FieldDef[] = [
    { key: "inv", label: "Investimento", type: "number", prefix: "R$", placeholder: "2000" },
    { key: "ret", label: "Retorno obtido", type: "number", prefix: "R$", placeholder: "5000" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const a = num(v.inv), b = num(v.ret);
    if (!need(a, b) || a === 0) return empty;
    return { rows: [{ label: "ROI", value: fmtPct(((b - a) / a) * 100) }, { label: "Lucro líquido", value: fmtBRL(b - a) }, { label: "Múltiplo", value: `${fmtNum(b / a, 2)}×` }], note: "ROI = (retorno − investimento) ÷ investimento × 100" };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function AumentoPercentual() {
  const fields: FieldDef[] = [
    { key: "v", label: "Valor", type: "number", placeholder: "1500" },
    { key: "p", label: "Percentual", type: "number", suffix: "%", placeholder: "8" },
    { key: "r", label: "Valor final (para descobrir o original)", type: "number", placeholder: "1620" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const val = num(v.v), p = num(v.p), r = num(v.r);
    if (!need(p)) return empty;
    const rows = [];
    if (need(val)) rows.push({ label: `Com aumento de ${fmtNum(p)}%`, value: fmtNum(val * (1 + p / 100), 2) }, { label: `Com redução de ${fmtNum(p)}%`, value: fmtNum(val * (1 - p / 100), 2) });
    if (need(r)) rows.push({ label: `Original antes de +${fmtNum(p)}%`, value: fmtNum(r / (1 + p / 100), 2) }, { label: `Original antes de −${fmtNum(p)}%`, value: fmtNum(r / (1 - p / 100), 2) });
    return rows.length ? { rows } : empty;
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function DivisaoConta() {
  const fields: FieldDef[] = [
    { key: "t", label: "Total da conta", type: "number", prefix: "R$", placeholder: "240" },
    { key: "g", label: "Taxa de serviço", type: "number", suffix: "%", default: "10" },
    { key: "n", label: "Pessoas", type: "number", default: "4" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const t = num(v.t), g = num(v.g) || 0, n = num(v.n);
    if (!need(t, n) || n <= 0) return empty;
    const total = t * (1 + g / 100);
    return { rows: [{ label: "Por pessoa", value: fmtBRL(total / n) }, { label: "Total com serviço", value: fmtBRL(total) }, { label: "Valor da gorjeta", value: fmtBRL(total - t) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function MetaEconomia() {
  const fields: FieldDef[] = [
    { key: "m", label: "Meta", type: "number", prefix: "R$", placeholder: "20000" },
    { key: "a", label: "Já tenho", type: "number", prefix: "R$", placeholder: "2000" },
    { key: "n", label: "Prazo em meses", type: "number", placeholder: "24" },
    { key: "i", label: "Rendimento mensal (opcional)", type: "number", suffix: "%", placeholder: "0,8" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const m = num(v.m), a = num(v.a) || 0, n = num(v.n), i = (num(v.i) || 0) / 100;
    if (!need(m, n) || n <= 0) return empty;
    const fvA = a * Math.pow(1 + i, n);
    const rest = m - fvA;
    const pmt = i === 0 ? rest / n : (rest * i) / (Math.pow(1 + i, n) - 1);
    return { rows: [{ label: "Guardar por mês", value: fmtBRL(Math.max(0, pmt)) }, { label: "Total de aportes", value: fmtBRL(Math.max(0, pmt) * n) }, { label: "Rendimento estimado", value: fmtBRL(Math.max(0, m - a - Math.max(0, pmt) * n)) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function Combustivel() {
  const fields: FieldDef[] = [
    { key: "km", label: "Distância percorrida", type: "number", suffix: "km", placeholder: "420" },
    { key: "l", label: "Litros abastecidos", type: "number", suffix: "L", placeholder: "35" },
    { key: "p", label: "Preço por litro", type: "number", prefix: "R$", placeholder: "5,89" },
    { key: "v", label: "Distância da viagem (opcional)", type: "number", suffix: "km", placeholder: "1200" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const km = num(v.km), l = num(v.l), p = num(v.p), trip = num(v.v);
    if (!need(km, l) || l <= 0) return empty;
    const kml = km / l;
    const rows = [{ label: "Consumo", value: `${fmtNum(kml, 2)} km/L` }];
    if (need(p)) rows.push({ label: "Custo por km", value: fmtBRL(p / kml) });
    if (need(p, trip)) rows.push({ label: "Custo da viagem", value: fmtBRL((trip / kml) * p) }, { label: "Litros necessários", value: `${fmtNum(trip / kml, 1)} L` });
    return { rows };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function EtanolGasolina() {
  const fields: FieldDef[] = [
    { key: "e", label: "Preço do etanol", type: "number", prefix: "R$", placeholder: "3,99" },
    { key: "g", label: "Preço da gasolina", type: "number", prefix: "R$", placeholder: "5,89" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const e = num(v.e), g = num(v.g);
    if (!need(e, g) || g <= 0) return empty;
    const r = e / g;
    return { rows: [{ label: "Compensa abastecer com", value: r < 0.7 ? "Etanol" : "Gasolina" }, { label: "Relação etanol/gasolina", value: fmtPct(r * 100, 1), hint: "abaixo de 70% → etanol" }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function Horas() {
  const fields: FieldDef[] = [
    { key: "a", label: "Hora inicial", type: "time", default: "08:00", half: true },
    { key: "b", label: "Hora final", type: "time", default: "17:30", half: true },
    { key: "pausa", label: "Pausa (minutos)", type: "number", default: "60", half: true },
    { key: "dias", label: "Dias trabalhados", type: "number", default: "22", half: true },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    if (!v.a || !v.b) return empty;
    const [ah, am] = v.a.split(":").map(Number), [bh, bm] = v.b.split(":").map(Number);
    let mins = bh * 60 + bm - (ah * 60 + am);
    if (mins < 0) mins += 24 * 60;
    mins -= num(v.pausa) || 0;
    const d = num(v.dias) || 1;
    const f = (m: number) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, "0")}min`;
    return { rows: [{ label: "Horas no dia", value: f(mins) }, { label: `Em ${d} dias`, value: f(mins * d) }, { label: "Decimal (dia)", value: fmtNum(mins / 60, 2) + " h" }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function ValorHora() {
  const fields: FieldDef[] = [
    { key: "renda", label: "Renda mensal desejada", type: "number", prefix: "R$", placeholder: "8000" },
    { key: "custos", label: "Custos fixos mensais", type: "number", prefix: "R$", placeholder: "1500" },
    { key: "h", label: "Horas faturáveis por semana", type: "number", placeholder: "25" },
    { key: "ferias", label: "Semanas de férias/ano", type: "number", default: "4" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const r = num(v.renda), c = num(v.custos) || 0, h = num(v.h), f = num(v.ferias) || 0;
    if (!need(r, h) || h <= 0) return empty;
    const hoursYear = h * (52 - f);
    const valor = ((r + c) * 12) / hoursYear;
    return { rows: [{ label: "Valor-hora mínimo", value: fmtBRL(valor) }, { label: "Sugerido (+20% margem)", value: fmtBRL(valor * 1.2) }, { label: "Horas faturáveis/ano", value: fmtNum(hoursYear, 0) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ================= DATAS ================= */
const DAY = 86400000;
const parseDate = (s: string) => (s ? new Date(s + "T00:00:00") : null);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const weekday = (d: Date) => new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(d);
const longDate = (d: Date) => new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(d);

function diffYMD(a: Date, b: Date) {
  let y = b.getFullYear() - a.getFullYear();
  let m = b.getMonth() - a.getMonth();
  let d = b.getDate() - a.getDate();
  if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}
function businessDays(a: Date, b: Date) {
  let c = 0;
  const cur = new Date(a);
  while (cur <= b) {
    const w = cur.getDay();
    if (w !== 0 && w !== 6) c++;
    cur.setDate(cur.getDate() + 1);
  }
  return c;
}

export function Idade() {
  const fields: FieldDef[] = [
    { key: "n", label: "Data de nascimento", type: "date" },
    { key: "r", label: "Calcular em", type: "date", default: iso(new Date()) },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const a = parseDate(v.n), b = parseDate(v.r);
    if (!a || !b || b < a) return a && b ? { rows: [], error: "A data de referência deve ser posterior ao nascimento." } : empty;
    const { y, m, d } = diffYMD(a, b);
    const days = Math.floor((b.getTime() - a.getTime()) / DAY);
    const next = new Date(b.getFullYear(), a.getMonth(), a.getDate());
    if (next < b) next.setFullYear(next.getFullYear() + 1);
    const toNext = Math.round((next.getTime() - b.getTime()) / DAY);
    return { rows: [{ label: "Idade", value: `${y} anos, ${m} meses e ${d} dias` }, { label: "Total de dias", value: fmtNum(days, 0) }, { label: "Semanas vividas", value: fmtNum(Math.floor(days / 7), 0) }, { label: "Próximo aniversário", value: toNext === 0 ? "Hoje! 🎉" : `em ${toNext} dias`, hint: weekday(next) }, { label: "Nasceu em", value: weekday(a) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function DiferencaDatas() {
  const fields: FieldDef[] = [
    { key: "a", label: "Data inicial", type: "date", default: iso(new Date()) },
    { key: "b", label: "Data final", type: "date" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const a = parseDate(v.a), b = parseDate(v.b);
    if (!a || !b) return empty;
    const [s, e] = a <= b ? [a, b] : [b, a];
    const days = Math.round((e.getTime() - s.getTime()) / DAY);
    const { y, m, d } = diffYMD(s, e);
    return { rows: [{ label: "Diferença", value: `${days} dias` }, { label: "Em anos/meses/dias", value: `${y}a ${m}m ${d}d` }, { label: "Semanas", value: `${Math.floor(days / 7)} sem. e ${days % 7} d` }, { label: "Dias úteis (aprox.)", value: String(businessDays(s, e)), hint: "sem feriados" }, { label: "Horas", value: fmtNum(days * 24, 0) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function SomarDias() {
  const fields: FieldDef[] = [
    { key: "a", label: "Data base", type: "date", default: iso(new Date()) },
    { key: "n", label: "Quantidade", type: "number", placeholder: "30" },
    { key: "u", label: "Unidade", type: "select", default: "d", options: [{ value: "d", label: "dias" }, { value: "w", label: "semanas" }, { value: "m", label: "meses" }, { value: "y", label: "anos" }] },
    { key: "op", label: "Operação", type: "select", default: "+", options: [{ value: "+", label: "Somar" }, { value: "-", label: "Subtrair" }] },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const a = parseDate(v.a), n = num(v.n);
    if (!a || !need(n)) return empty;
    const k = v.op === "-" ? -n : n;
    const r = new Date(a);
    if (v.u === "d") r.setDate(r.getDate() + k);
    if (v.u === "w") r.setDate(r.getDate() + k * 7);
    if (v.u === "m") r.setMonth(r.getMonth() + k);
    if (v.u === "y") r.setFullYear(r.getFullYear() + k);
    return { rows: [{ label: "Data resultante", value: longDate(r), hint: weekday(r) }, { label: "Formato ISO", value: iso(r) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function DiaSemana() {
  const fields: FieldDef[] = [{ key: "a", label: "Data", type: "date" }];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const a = parseDate(v.a);
    if (!a) return empty;
    const start = new Date(a.getFullYear(), 0, 1);
    const doy = Math.floor((a.getTime() - start.getTime()) / DAY) + 1;
    const week = Math.ceil((doy + start.getDay()) / 7);
    return { rows: [{ label: "Dia da semana", value: weekday(a) }, { label: "Dia do ano", value: `${doy}º` }, { label: "Semana do ano", value: `${week}ª` }, { label: "Ano bissexto?", value: (a.getFullYear() % 4 === 0 && a.getFullYear() % 100 !== 0) || a.getFullYear() % 400 === 0 ? "Sim" : "Não" }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function Contagem() {
  const [target, setTarget] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const fields: FieldDef[] = [
    { key: "d", label: "Data do evento", type: "date", half: true },
    { key: "t", label: "Hora", type: "time", default: "00:00", half: true },
    { key: "n", label: "Nome do evento (opcional)", type: "text", placeholder: "Lançamento" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    if (!v.d) return empty;
    const key = `${v.d}T${v.t || "00:00"}:00`;
    if (key !== target) setTimeout(() => setTarget(key), 0);
    const t = new Date(key).getTime();
    let diff = t - now;
    const past = diff < 0;
    diff = Math.abs(diff);
    const d = Math.floor(diff / DAY), h = Math.floor((diff % DAY) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    return { rows: [{ label: past ? `${v.n || "Evento"} aconteceu há` : `Faltam para ${v.n || "o evento"}`, value: `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` }, { label: "Total em horas", value: fmtNum(diff / 3600000, 0) }, { label: "Total em semanas", value: fmtNum(diff / (DAY * 7), 1) }] };
  }, [now, target]);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function DiasUteis() {
  const fields: FieldDef[] = [
    { key: "a", label: "Data inicial", type: "date", default: iso(new Date()) },
    { key: "b", label: "Data final", type: "date" },
    { key: "f", label: "Feriados no período (em dias úteis)", type: "number", default: "0" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const a = parseDate(v.a), b = parseDate(v.b);
    if (!a || !b) return empty;
    const [s, e] = a <= b ? [a, b] : [b, a];
    const bd = businessDays(s, e) - (num(v.f) || 0);
    const total = Math.round((e.getTime() - s.getTime()) / DAY) + 1;
    return { rows: [{ label: "Dias úteis", value: String(Math.max(0, bd)) }, { label: "Dias corridos", value: String(total) }, { label: "Fins de semana", value: String(total - businessDays(s, e)) }], note: "Conta inclusiva (início e fim). Sábados e domingos são excluídos." };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}
