import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Input, Select } from "@/components/ui/primitives";
import { ResultBox, Stat } from "@/components/ui/feedback";
import { useLocalStorage } from "@/lib/store";
import { formatDate, parseNum } from "@/lib/utils";
import { EmptyResult, fmt, money, pct, shuffle, ToolActions, type FormulaConfig } from "./ToolShell";

const bad = (...xs: number[]) => xs.some((x) => !Number.isFinite(x));
const pmt = (pv: number, i: number, n: number) => (i === 0 ? pv / n : (pv * i) / (1 - Math.pow(1 + i, -n)));
const toDate = (s: string) => { const d = new Date(s + "T00:00:00"); return Number.isNaN(d.getTime()) ? null : d; };
const DAY = 86400000;
const today = () => new Date().toISOString().slice(0, 10);
const WD = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
function ymd(a: Date, b: Date) {
  let y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
  if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}
function businessDays(a: Date, b: Date) { let c = 0; const d = new Date(a); while (d < b) { const w = d.getDay(); if (w !== 0 && w !== 6) c++; d.setDate(d.getDate() + 1); } return c; }

export const CALC_CONFIGS: Record<string, FormulaConfig> = {
  porcentagem: {
    fields: [{ key: "mode", label: "O que você quer calcular?", type: "select", default: "of", options: [{ value: "of", label: "Quanto é X% de Y" }, { value: "is", label: "X é que porcentagem de Y" }, { value: "var", label: "Variação de X para Y" }] }, { key: "a", label: "Valor X", placeholder: "15" }, { key: "b", label: "Valor Y", placeholder: "240" }],
    compute: (v, n) => {
      if (bad(n.a, n.b)) return null;
      if (v.mode === "of") return { rows: [{ label: `${fmt(n.a)}% de ${fmt(n.b)}`, value: fmt((n.a * n.b) / 100), big: true }], formula: `${fmt(n.b)} × ${fmt(n.a)} ÷ 100` };
      if (v.mode === "is") return n.b === 0 ? { error: "Y não pode ser zero." } : { rows: [{ label: `${fmt(n.a)} é`, value: pct((n.a / n.b) * 100), hint: `de ${fmt(n.b)}`, big: true }], formula: `${fmt(n.a)} ÷ ${fmt(n.b)} × 100` };
      if (n.a === 0) return { error: "O valor inicial não pode ser zero." };
      const d = ((n.b - n.a) / Math.abs(n.a)) * 100;
      return { rows: [{ label: "Variação", value: `${d >= 0 ? "+" : ""}${pct(d)}`, hint: d >= 0 ? "aumento" : "redução", big: true }, { label: "Diferença absoluta", value: fmt(n.b - n.a) }], formula: `(${fmt(n.b)} − ${fmt(n.a)}) ÷ ${fmt(n.a)} × 100` };
    },
  },
  desconto: {
    fields: [{ key: "p", label: "Preço original", placeholder: "199,90", suffix: "R$" }, { key: "d", label: "Desconto", placeholder: "30", suffix: "%" }, { key: "d2", label: "Segundo desconto (opcional)", placeholder: "10", suffix: "%" }],
    compute: (_v, n) => { if (bad(n.p, n.d)) return null; const p1 = n.p * (1 - n.d / 100); const p2 = Number.isFinite(n.d2) ? p1 * (1 - n.d2 / 100) : p1; const eff = (1 - p2 / n.p) * 100; return { rows: [{ label: "Preço final", value: money(p2), big: true }, { label: "Você economiza", value: money(n.p - p2), hint: `desconto efetivo de ${pct(eff)}` }], formula: `${money(n.p)} × (1 − ${fmt(n.d)}%)${Number.isFinite(n.d2) ? ` × (1 − ${fmt(n.d2)}%)` : ""}` }; },
  },
  "aumento-percentual": {
    fields: [{ key: "v", label: "Valor atual", placeholder: "3000", suffix: "R$" }, { key: "p", label: "Aumento", placeholder: "8", suffix: "%" }],
    compute: (_v, n) => bad(n.v, n.p) ? null : { rows: [{ label: "Novo valor", value: money(n.v * (1 + n.p / 100)), big: true }, { label: "Acréscimo", value: money(n.v * n.p / 100) }], formula: `${money(n.v)} × (1 + ${fmt(n.p)}%)` },
  },
  "variacao-percentual": {
    fields: [{ key: "a", label: "Valor inicial", placeholder: "1200" }, { key: "b", label: "Valor final", placeholder: "1500" }],
    compute: (_v, n) => { if (bad(n.a, n.b)) return null; if (n.a === 0) return { error: "O valor inicial não pode ser zero." }; const d = ((n.b - n.a) / Math.abs(n.a)) * 100; const dp = (Math.abs(n.b - n.a) / ((n.a + n.b) / 2)) * 100; return { rows: [{ label: "Variação percentual", value: `${d >= 0 ? "+" : ""}${pct(d)}`, big: true, hint: d >= 0 ? "alta" : "queda" }, { label: "Diferença absoluta", value: fmt(n.b - n.a) }, { label: "Diferença percentual (média)", value: pct(dp) }], formula: `(${fmt(n.b)} − ${fmt(n.a)}) ÷ |${fmt(n.a)}| × 100` }; },
  },
  "juros-simples": {
    fields: [{ key: "c", label: "Capital", placeholder: "1000", suffix: "R$" }, { key: "i", label: "Taxa por período", placeholder: "2", suffix: "%" }, { key: "t", label: "Períodos", placeholder: "6" }],
    compute: (_v, n) => bad(n.c, n.i, n.t) ? null : { rows: [{ label: "Juros", value: money(n.c * (n.i / 100) * n.t), big: true }, { label: "Montante", value: money(n.c * (1 + (n.i / 100) * n.t)) }], formula: `J = ${money(n.c)} × ${fmt(n.i)}% × ${fmt(n.t)}` },
  },
  "juros-compostos": {
    fields: [{ key: "c", label: "Capital inicial", placeholder: "10000", suffix: "R$" }, { key: "a", label: "Aporte mensal", placeholder: "500", suffix: "R$", default: "0" }, { key: "i", label: "Taxa de juros", placeholder: "0,8", suffix: "%" }, { key: "iu", label: "Unidade da taxa", type: "select", default: "m", options: [{ value: "m", label: "ao mês" }, { value: "a", label: "ao ano" }] }, { key: "t", label: "Prazo", placeholder: "120" }, { key: "tu", label: "Unidade do prazo", type: "select", default: "m", options: [{ value: "m", label: "meses" }, { value: "a", label: "anos" }] }],
    compute: (v, n) => {
      if (bad(n.c, n.i, n.t)) return null;
      const a = Number.isFinite(n.a) ? n.a : 0;
      const im = v.iu === "a" ? Math.pow(1 + n.i / 100, 1 / 12) - 1 : n.i / 100;
      const months = v.tu === "a" ? Math.round(n.t * 12) : Math.round(n.t);
      if (months <= 0 || months > 1200) return { error: "Informe um prazo entre 1 e 1200 meses." };
      let bal = n.c; const table: string[][] = [["Mês", "Aporte acumulado", "Juros acumulados", "Saldo"]]; let inv = n.c;
      for (let m = 1; m <= months; m++) { bal = bal * (1 + im) + a; inv += a; if (m % (months > 120 ? 12 : months > 36 ? 6 : 1) === 0 || m === months) table.push([String(m), money(inv), money(bal - inv), money(bal)]); }
      return { rows: [{ label: "Montante final", value: money(bal), big: true }, { label: "Total investido", value: money(inv) }, { label: "Total em juros", value: money(bal - inv), hint: `${pct(((bal - inv) / inv) * 100, 1)} de ganho` }, { label: "Taxa mensal equivalente", value: pct(im * 100, 4) }], formula: "M = C × (1+i)^t + A × [((1+i)^t − 1) ÷ i]", table };
    },
  },
  "regra-de-tres": {
    fields: [{ key: "tipo", label: "Tipo", type: "select", default: "d", options: [{ value: "d", label: "Diretamente proporcional" }, { value: "i", label: "Inversamente proporcional" }] }, { key: "a", label: "A", placeholder: "3" }, { key: "b", label: "B (está para A)", placeholder: "45" }, { key: "c", label: "C", placeholder: "7" }],
    compute: (v, n) => { if (bad(n.a, n.b, n.c)) return null; if (n.a === 0 || (v.tipo === "i" && n.c === 0)) return { error: "Divisão por zero." }; const x = v.tipo === "d" ? (n.b * n.c) / n.a : (n.a * n.b) / n.c; return { rows: [{ label: "X (está para C)", value: fmt(x, 4), big: true }], formula: v.tipo === "d" ? `X = ${fmt(n.b)} × ${fmt(n.c)} ÷ ${fmt(n.a)}` : `X = ${fmt(n.a)} × ${fmt(n.b)} ÷ ${fmt(n.c)}` }; },
  },
  imc: {
    fields: [{ key: "p", label: "Peso", placeholder: "70", suffix: "kg" }, { key: "h", label: "Altura", placeholder: "175", suffix: "cm" }],
    compute: (_v, n) => { if (bad(n.p, n.h) || n.h <= 0) return null; const h = n.h > 3 ? n.h / 100 : n.h; const imc = n.p / (h * h); const cls = imc < 18.5 ? "Abaixo do peso" : imc < 25 ? "Peso normal" : imc < 30 ? "Sobrepeso" : imc < 35 ? "Obesidade grau I" : imc < 40 ? "Obesidade grau II" : "Obesidade grau III"; return { rows: [{ label: "IMC", value: fmt(imc, 1), hint: cls, big: true }, { label: "Faixa de peso saudável", value: `${fmt(18.5 * h * h, 1)} – ${fmt(24.9 * h * h, 1)} kg` }], formula: `${fmt(n.p)} ÷ ${fmt(h)}²`, note: "Classificação da OMS para adultos. Não substitui avaliação profissional." }; },
  },
  tmb: {
    fields: [{ key: "s", label: "Sexo", type: "select", default: "m", options: [{ value: "m", label: "Masculino" }, { value: "f", label: "Feminino" }] }, { key: "i", label: "Idade", placeholder: "30", suffix: "anos" }, { key: "p", label: "Peso", placeholder: "80", suffix: "kg" }, { key: "h", label: "Altura", placeholder: "180", suffix: "cm" }, { key: "a", label: "Nível de atividade", type: "select", default: "1.55", options: [{ value: "1.2", label: "Sedentário" }, { value: "1.375", label: "Leve (1–3×/semana)" }, { value: "1.55", label: "Moderado (3–5×/semana)" }, { value: "1.725", label: "Intenso (6–7×/semana)" }, { value: "1.9", label: "Muito intenso" }] }],
    compute: (v, n) => { if (bad(n.i, n.p, n.h)) return null; const tmb = 10 * n.p + 6.25 * n.h - 5 * n.i + (v.s === "m" ? 5 : -161); const tdee = tmb * parseFloat(v.a); return { rows: [{ label: "TMB (repouso)", value: `${fmt(tmb, 0)} kcal`, big: true }, { label: "Gasto diário estimado", value: `${fmt(tdee, 0)} kcal` }, { label: "Déficit leve (−400)", value: `${fmt(tdee - 400, 0)} kcal` }, { label: "Superávit leve (+300)", value: `${fmt(tdee + 300, 0)} kcal` }], formula: "Mifflin-St Jeor × fator de atividade" }; },
  },
  "agua-diaria": {
    fields: [{ key: "p", label: "Peso", placeholder: "70", suffix: "kg" }, { key: "e", label: "Exercício por dia", placeholder: "30", suffix: "min", default: "0" }, { key: "c", label: "Clima", type: "select", default: "n", options: [{ value: "n", label: "Ameno" }, { value: "q", label: "Quente" }] }],
    compute: (v, n) => { if (bad(n.p)) return null; const e = Number.isFinite(n.e) ? n.e : 0; const ml = n.p * 35 + e * 12 + (v.c === "q" ? 500 : 0); return { rows: [{ label: "Meta diária", value: `${fmt(ml / 1000, 2)} L`, big: true }, { label: "Copos de 250 ml", value: fmt(ml / 250, 0) }], formula: "35 ml/kg + 12 ml/min de exercício (+500 ml em clima quente)" }; },
  },
  "dividir-conta": {
    fields: [{ key: "t", label: "Total da conta", placeholder: "380", suffix: "R$" }, { key: "p", label: "Pessoas", placeholder: "4" }, { key: "s", label: "Taxa de serviço", placeholder: "10", suffix: "%", default: "10" }],
    compute: (_v, n) => { if (bad(n.t, n.p) || n.p <= 0) return null; const s = Number.isFinite(n.s) ? n.s : 0; const tot = n.t * (1 + s / 100); return { rows: [{ label: "Por pessoa", value: money(tot / n.p), big: true }, { label: "Total com serviço", value: money(tot) }, { label: "Serviço", value: money(tot - n.t) }] }; },
  },
  gorjeta: {
    fields: [{ key: "t", label: "Valor da conta", placeholder: "86" }, { key: "g", label: "Gorjeta", placeholder: "18", suffix: "%", default: "15" }, { key: "p", label: "Pessoas", placeholder: "2", default: "1" }],
    compute: (_v, n) => { if (bad(n.t, n.g)) return null; const p = Number.isFinite(n.p) && n.p > 0 ? n.p : 1; const tip = n.t * n.g / 100; return { rows: [{ label: "Gorjeta", value: fmt(tip), big: true }, { label: "Total", value: fmt(n.t + tip) }, { label: "Por pessoa", value: fmt((n.t + tip) / p) }] }; },
  },
  "margem-de-lucro": {
    fields: [{ key: "c", label: "Custo", placeholder: "60", suffix: "R$" }, { key: "p", label: "Preço de venda", placeholder: "100", suffix: "R$" }, { key: "m", label: "ou margem desejada", placeholder: "40", suffix: "%" }],
    compute: (_v, n) => { if (bad(n.c)) return null; if (Number.isFinite(n.p) && n.p > 0) { const l = n.p - n.c; return { rows: [{ label: "Margem", value: pct((l / n.p) * 100), big: true }, { label: "Lucro por unidade", value: money(l) }, { label: "Markup equivalente", value: pct((l / n.c) * 100) }], formula: "(preço − custo) ÷ preço" }; } if (Number.isFinite(n.m)) { if (n.m >= 100) return { error: "Margem deve ser menor que 100%." }; const p = n.c / (1 - n.m / 100); return { rows: [{ label: "Preço necessário", value: money(p), big: true }, { label: "Lucro por unidade", value: money(p - n.c) }], formula: "custo ÷ (1 − margem)" }; } return null; },
  },
  markup: {
    fields: [{ key: "c", label: "Custo", placeholder: "50", suffix: "R$" }, { key: "k", label: "Markup", placeholder: "80", suffix: "%" }],
    compute: (_v, n) => bad(n.c, n.k) ? null : { rows: [{ label: "Preço de venda", value: money(n.c * (1 + n.k / 100)), big: true }, { label: "Margem sobre o preço", value: pct((n.k / (100 + n.k)) * 100) }], formula: "custo × (1 + markup)" },
  },
  "ponto-de-equilibrio": {
    fields: [{ key: "f", label: "Custos fixos mensais", placeholder: "8000", suffix: "R$" }, { key: "p", label: "Preço unitário", placeholder: "50", suffix: "R$" }, { key: "v", label: "Custo variável unitário", placeholder: "30", suffix: "R$" }],
    compute: (_v, n) => { if (bad(n.f, n.p, n.v)) return null; const mc = n.p - n.v; if (mc <= 0) return { error: "Margem de contribuição negativa: o preço precisa superar o custo variável." }; const q = n.f / mc; return { rows: [{ label: "Unidades para equilíbrio", value: fmt(Math.ceil(q), 0), big: true }, { label: "Faturamento de equilíbrio", value: money(q * n.p) }, { label: "Margem de contribuição", value: `${money(mc)} (${pct((mc / n.p) * 100)})` }], formula: "fixos ÷ (preço − variável)" }; },
  },
  parcelamento: {
    fields: [{ key: "v", label: "Valor da compra", placeholder: "2400", suffix: "R$" }, { key: "n", label: "Parcelas", placeholder: "12" }, { key: "i", label: "Juros ao mês", placeholder: "2,5", suffix: "%" }],
    compute: (_v, n) => { if (bad(n.v, n.n, n.i) || n.n <= 0) return null; const p = pmt(n.v, n.i / 100, n.n); return { rows: [{ label: "Parcela", value: money(p), big: true }, { label: "Total pago", value: money(p * n.n) }, { label: "Juros totais", value: `${money(p * n.n - n.v)} (${pct(((p * n.n) / n.v - 1) * 100, 1)})` }], formula: "PMT = PV × i ÷ (1 − (1+i)^−n)" }; },
  },
  "financiamento-price": {
    fields: [{ key: "v", label: "Valor financiado", placeholder: "300000", suffix: "R$" }, { key: "i", label: "Taxa anual", placeholder: "10", suffix: "%" }, { key: "n", label: "Prazo", placeholder: "360", suffix: "meses" }],
    compute: (_v, n) => {
      if (bad(n.v, n.i, n.n) || n.n <= 0) return null;
      const im = Math.pow(1 + n.i / 100, 1 / 12) - 1; const p = pmt(n.v, im, n.n); const amort = n.v / n.n;
      let sac = 0, bal = n.v; const table: string[][] = [["Mês", "Price", "SAC", "Saldo (SAC)"]];
      for (let m = 1; m <= n.n; m++) { const parc = amort + bal * im; sac += parc; bal -= amort; if (m <= 12 || m % 60 === 0 || m === n.n) table.push([String(m), money(p), money(parc), money(Math.max(0, bal))]); }
      return { rows: [{ label: "Parcela Price (fixa)", value: money(p), big: true }, { label: "1ª parcela SAC", value: money(amort + n.v * im), hint: `última ≈ ${money(amort * (1 + im))}` }, { label: "Total Price", value: money(p * n.n) }, { label: "Total SAC", value: money(sac), hint: `economia de ${money(p * n.n - sac)}` }], formula: `taxa mensal equivalente ${pct(im * 100, 3)}`, table, note: "Simulação sem seguros, taxas administrativas e correção monetária." };
    },
  },
  roi: {
    fields: [{ key: "i", label: "Investimento", placeholder: "5000", suffix: "R$" }, { key: "r", label: "Retorno obtido", placeholder: "12000", suffix: "R$" }],
    compute: (_v, n) => bad(n.i, n.r) || n.i === 0 ? null : { rows: [{ label: "ROI", value: pct(((n.r - n.i) / n.i) * 100), big: true }, { label: "Lucro líquido", value: money(n.r - n.i) }, { label: "Múltiplo", value: `${fmt(n.r / n.i, 2)}×` }], formula: "(retorno − investimento) ÷ investimento" },
  },
  cagr: {
    fields: [{ key: "a", label: "Valor inicial", placeholder: "100000" }, { key: "b", label: "Valor final", placeholder: "250000" }, { key: "t", label: "Anos", placeholder: "4" }],
    compute: (_v, n) => bad(n.a, n.b, n.t) || n.a <= 0 || n.t <= 0 ? null : { rows: [{ label: "CAGR", value: pct((Math.pow(n.b / n.a, 1 / n.t) - 1) * 100), big: true }, { label: "Crescimento total", value: pct((n.b / n.a - 1) * 100) }], formula: "(final ÷ inicial)^(1/anos) − 1" },
  },
  inflacao: {
    fields: [{ key: "v", label: "Valor", placeholder: "1000", suffix: "R$" }, { key: "i", label: "Inflação média anual", placeholder: "5", suffix: "%" }, { key: "t", label: "Anos", placeholder: "10" }],
    compute: (_v, n) => { if (bad(n.v, n.i, n.t)) return null; const f = Math.pow(1 + n.i / 100, n.t); return { rows: [{ label: "Valor corrigido", value: money(n.v * f), big: true, hint: "quanto o valor passado equivale hoje" }, { label: "Poder de compra futuro", value: money(n.v / f), hint: "quanto o valor de hoje valerá" }, { label: "Inflação acumulada", value: pct((f - 1) * 100) }], formula: "valor × (1 + i)^anos" }; },
  },
  "independencia-financeira": {
    fields: [{ key: "g", label: "Gasto mensal desejado", placeholder: "6000", suffix: "R$" }, { key: "w", label: "Taxa de retirada anual", placeholder: "4", suffix: "%", default: "4" }, { key: "p", label: "Patrimônio atual", placeholder: "50000", suffix: "R$", default: "0" }, { key: "a", label: "Aporte mensal", placeholder: "3000", suffix: "R$" }, { key: "r", label: "Rendimento real mensal", placeholder: "0,5", suffix: "%", default: "0.5" }],
    compute: (_v, n) => { if (bad(n.g, n.w, n.a, n.r)) return null; const alvo = (n.g * 12) / (n.w / 100); const p0 = Number.isFinite(n.p) ? n.p : 0; const i = n.r / 100; let bal = p0, m = 0; while (bal < alvo && m < 1200) { bal = bal * (1 + i) + n.a; m++; } return { rows: [{ label: "Patrimônio necessário", value: money(alvo), big: true }, { label: "Tempo estimado", value: m >= 1200 ? "> 100 anos" : `${Math.floor(m / 12)} anos e ${m % 12} meses` }, { label: "Renda passiva mensal no alvo", value: money(n.g) }], formula: "alvo = gasto anual ÷ taxa de retirada", note: "Rendimento real = acima da inflação. Simulação simplificada, sem impostos." }; },
  },
  "valor-hora-freelancer": {
    fields: [{ key: "r", label: "Renda líquida mensal desejada", placeholder: "10000", suffix: "R$" }, { key: "c", label: "Custos mensais (software, contador…)", placeholder: "1200", suffix: "R$", default: "0" }, { key: "t", label: "Impostos", placeholder: "15", suffix: "%", default: "15" }, { key: "h", label: "Horas faturáveis por semana", placeholder: "25" }, { key: "f", label: "Semanas de férias por ano", placeholder: "4", default: "4" }],
    compute: (_v, n) => { if (bad(n.r, n.h) || n.h <= 0) return null; const c = Number.isFinite(n.c) ? n.c : 0, t = Number.isFinite(n.t) ? n.t : 0, f = Number.isFinite(n.f) ? n.f : 0; const anual = ((n.r + c) * 12) / (1 - t / 100); const horas = n.h * (52 - f); return { rows: [{ label: "Valor mínimo da hora", value: money(anual / horas), big: true }, { label: "Faturamento anual necessário", value: money(anual) }, { label: "Horas faturáveis por ano", value: fmt(horas, 0) }, { label: "Valor do dia (8 h)", value: money((anual / horas) * 8) }] }; },
  },
  "conversor-salario-hora": {
    fields: [{ key: "s", label: "Salário mensal", placeholder: "4400", suffix: "R$" }, { key: "h", label: "Horas mensais", placeholder: "220", default: "220" }],
    compute: (_v, n) => bad(n.s, n.h) || n.h <= 0 ? null : { rows: [{ label: "Por hora", value: money(n.s / n.h), big: true }, { label: "Por dia (8 h)", value: money((n.s / n.h) * 8) }, { label: "Por semana", value: money(n.s * 12 / 52) }, { label: "Por ano (12 salários)", value: money(n.s * 12) }] },
  },
  "hora-extra": {
    fields: [{ key: "s", label: "Salário mensal", placeholder: "3300", suffix: "R$" }, { key: "h", label: "Horas extras", placeholder: "10" }, { key: "a", label: "Adicional", type: "select", default: "50", options: [{ value: "50", label: "50% (dias úteis)" }, { value: "100", label: "100% (domingos/feriados)" }] }, { key: "j", label: "Horas mensais", placeholder: "220", default: "220" }],
    compute: (v, n) => { if (bad(n.s, n.h)) return null; const j = Number.isFinite(n.j) ? n.j : 220; const vh = n.s / j; const he = vh * (1 + parseFloat(v.a) / 100); return { rows: [{ label: "Total de horas extras", value: money(he * n.h), big: true }, { label: "Valor da hora normal", value: money(vh) }, { label: "Valor da hora extra", value: money(he) }] }; },
  },
  "decimo-terceiro": {
    fields: [{ key: "s", label: "Salário bruto", placeholder: "3000", suffix: "R$" }, { key: "m", label: "Meses trabalhados no ano", placeholder: "12", default: "12" }],
    compute: (_v, n) => bad(n.s, n.m) ? null : { rows: [{ label: "13º bruto", value: money((n.s / 12) * Math.min(12, n.m)), big: true }, { label: "1ª parcela (até 30/11)", value: money(((n.s / 12) * Math.min(12, n.m)) / 2) }], formula: "salário ÷ 12 × meses", note: "Valor bruto — INSS e IRRF incidem na segunda parcela." },
  },
  ferias: {
    fields: [{ key: "s", label: "Salário bruto", placeholder: "3000", suffix: "R$" }, { key: "d", label: "Dias de férias", placeholder: "30", default: "30" }, { key: "v", label: "Vender 10 dias (abono)?", type: "select", default: "n", options: [{ value: "n", label: "Não" }, { value: "s", label: "Sim" }] }],
    compute: (v, n) => { if (bad(n.s, n.d)) return null; const dias = v.v === "s" ? Math.min(n.d, 20) : n.d; const f = (n.s / 30) * dias; const terco = f / 3; const abono = v.v === "s" ? (n.s / 30) * 10 * (4 / 3) : 0; return { rows: [{ label: "Total bruto", value: money(f + terco + abono), big: true }, { label: "Férias", value: money(f) }, { label: "1/3 constitucional", value: money(terco) }, ...(abono ? [{ label: "Abono pecuniário", value: money(abono) }] : [])], note: "Valores brutos, sem descontos de INSS/IRRF." }; },
  },
  "calculadora-de-horas": {
    fields: [{ key: "e", label: "Entrada", placeholder: "08:00", type: "text" }, { key: "s", label: "Saída", placeholder: "17:30", type: "text" }, { key: "i", label: "Intervalo", placeholder: "60", suffix: "min", default: "60" }],
    compute: (v, n) => { const p = (s: string) => { const m = s.match(/^(\d{1,2})[:h](\d{2})$/); return m ? +m[1] * 60 + +m[2] : NaN; }; const a = p(v.e), b = p(v.s); if (bad(a, b)) return null; let d = b - a; if (d < 0) d += 1440; d -= Number.isFinite(n.i) ? n.i : 0; if (d < 0) return { error: "O intervalo é maior que a jornada." }; return { rows: [{ label: "Horas trabalhadas", value: `${Math.floor(d / 60)}h${String(d % 60).padStart(2, "0")}`, big: true }, { label: "Em decimal", value: fmt(d / 60, 2) + " h" }, { label: "Em minutos", value: fmt(d, 0) }] }; },
  },
  "alcool-ou-gasolina": {
    fields: [{ key: "e", label: "Preço do etanol", placeholder: "3,89", suffix: "R$/L" }, { key: "g", label: "Preço da gasolina", placeholder: "5,79", suffix: "R$/L" }, { key: "ce", label: "Consumo com etanol (opcional)", placeholder: "8,5", suffix: "km/L" }, { key: "cg", label: "Consumo com gasolina (opcional)", placeholder: "12", suffix: "km/L" }],
    compute: (_v, n) => { if (bad(n.e, n.g) || n.g <= 0) return null; const ratio = n.e / n.g; const real = Number.isFinite(n.ce) && Number.isFinite(n.cg) && n.ce > 0 && n.cg > 0; const ce = real ? n.e / n.ce : NaN, cg = real ? n.g / n.cg : NaN; const win = real ? (ce < cg ? "Etanol" : "Gasolina") : ratio <= 0.7 ? "Etanol" : "Gasolina"; return { rows: [{ label: "Compensa abastecer com", value: win, big: true }, { label: "Relação etanol/gasolina", value: pct(ratio * 100, 1), hint: real ? "usando o consumo real" : "regra dos 70%" }, ...(real ? [{ label: "Custo/km etanol", value: money(ce) }, { label: "Custo/km gasolina", value: money(cg) }] : [])] }; },
  },
  "consumo-combustivel": {
    fields: [{ key: "km", label: "Quilômetros rodados", placeholder: "420", suffix: "km" }, { key: "l", label: "Litros abastecidos", placeholder: "35", suffix: "L" }, { key: "p", label: "Preço do litro", placeholder: "5,80", suffix: "R$" }, { key: "d", label: "Distância da viagem (opcional)", placeholder: "600", suffix: "km" }],
    compute: (_v, n) => { if (bad(n.km, n.l) || n.l <= 0) return null; const c = n.km / n.l; const rows = [{ label: "Consumo", value: `${fmt(c, 2)} km/L`, big: true }]; if (Number.isFinite(n.p)) rows.push({ label: "Custo por km", value: money(n.p / c), big: false }); if (Number.isFinite(n.p) && Number.isFinite(n.d)) rows.push({ label: "Custo da viagem", value: money((n.d / c) * n.p), big: false }, { label: "Litros necessários", value: `${fmt(n.d / c, 1)} L`, big: false }); return { rows }; },
  },
  "custo-por-km": {
    fields: [{ key: "f", label: "Custos fixos anuais (IPVA, seguro, manutenção, depreciação)", placeholder: "12000", suffix: "R$" }, { key: "k", label: "Km rodados por ano", placeholder: "15000", suffix: "km" }, { key: "c", label: "Consumo", placeholder: "12", suffix: "km/L" }, { key: "p", label: "Preço do combustível", placeholder: "5,80", suffix: "R$/L" }],
    compute: (_v, n) => { if (bad(n.f, n.k, n.c, n.p) || n.k <= 0 || n.c <= 0) return null; const fix = n.f / n.k, comb = n.p / n.c; return { rows: [{ label: "Custo total por km", value: money(fix + comb), big: true }, { label: "Só combustível", value: money(comb) }, { label: "Só custos fixos", value: money(fix) }, { label: "Custo mensal total", value: money(((fix + comb) * n.k) / 12) }] }; },
  },
  /* -------------------------------- Datas -------------------------------- */
  "calculadora-de-idade": {
    fields: [{ key: "n", label: "Data de nascimento", type: "date" }, { key: "r", label: "Data de referência", type: "date", default: today() }],
    compute: (v) => { const a = toDate(v.n), b = toDate(v.r); if (!a || !b) return null; if (b < a) return { error: "A data de referência é anterior ao nascimento." }; const { y, m, d } = ymd(a, b); const days = Math.floor((+b - +a) / DAY); const next = new Date(b.getFullYear(), a.getMonth(), a.getDate()); if (next < b) next.setFullYear(next.getFullYear() + 1); return { rows: [{ label: "Idade", value: `${y} anos`, hint: `${m} meses e ${d} dias`, big: true }, { label: "Dias vividos", value: fmt(days, 0) }, { label: "Próximo aniversário", value: `em ${Math.round((+next - +b) / DAY)} dias`, hint: `${WD[next.getDay()]}, ${formatDate(next.toISOString())}` }, { label: "Nasceu em", value: WD[a.getDay()] }] }; },
  },
  "diferenca-entre-datas": {
    fields: [{ key: "a", label: "Data inicial", type: "date" }, { key: "b", label: "Data final", type: "date", default: today() }, { key: "inc", label: "Incluir o último dia?", type: "select", default: "n", options: [{ value: "n", label: "Não" }, { value: "s", label: "Sim" }] }],
    compute: (v) => { const a = toDate(v.a), b = toDate(v.b); if (!a || !b) return null; const [s, e] = a <= b ? [a, b] : [b, a]; const days = Math.round((+e - +s) / DAY) + (v.inc === "s" ? 1 : 0); const { y, m, d } = ymd(s, e); return { rows: [{ label: "Dias", value: fmt(days, 0), big: true }, { label: "Semanas", value: `${Math.floor(days / 7)} sem e ${days % 7} d` }, { label: "Anos, meses e dias", value: `${y}a ${m}m ${d}d` }, { label: "Dias úteis (seg–sex)", value: fmt(businessDays(s, e) + (v.inc === "s" && e.getDay() % 6 !== 0 ? 1 : 0), 0) }, { label: "Horas", value: fmt(days * 24, 0) }] }; },
  },
  "somar-dias": {
    fields: [{ key: "d", label: "Data base", type: "date", default: today() }, { key: "op", label: "Operação", type: "select", default: "+", options: [{ value: "+", label: "Somar" }, { value: "-", label: "Subtrair" }] }, { key: "n", label: "Quantidade", placeholder: "45" }, { key: "u", label: "Unidade", type: "select", default: "d", options: [{ value: "d", label: "dias" }, { value: "w", label: "semanas" }, { value: "m", label: "meses" }, { value: "y", label: "anos" }] }],
    compute: (v, n) => { const d = toDate(v.d); if (!d || bad(n.n)) return null; const k = (v.op === "-" ? -1 : 1) * n.n; const r = new Date(d); if (v.u === "d") r.setDate(r.getDate() + k); if (v.u === "w") r.setDate(r.getDate() + k * 7); if (v.u === "m") r.setMonth(r.getMonth() + k); if (v.u === "y") r.setFullYear(r.getFullYear() + k); return { rows: [{ label: "Resultado", value: formatDate(r.toISOString(), { day: "2-digit", month: "long", year: "numeric" }), hint: WD[r.getDay()], big: true }, { label: "Diferença em dias", value: fmt(Math.round((+r - +d) / DAY), 0) }] }; },
  },
  "dias-uteis": {
    fields: [{ key: "mode", label: "Modo", type: "select", default: "c", options: [{ value: "c", label: "Contar dias úteis entre datas" }, { value: "s", label: "Somar dias úteis a uma data" }] }, { key: "a", label: "Data inicial", type: "date", default: today() }, { key: "b", label: "Data final (modo contar)", type: "date" }, { key: "n", label: "Dias úteis a somar (modo somar)", placeholder: "10" }],
    compute: (v, n) => { const a = toDate(v.a); if (!a) return null; if (v.mode === "c") { const b = toDate(v.b); if (!b) return null; const [s, e] = a <= b ? [a, b] : [b, a]; const bd = businessDays(s, e); const tot = Math.round((+e - +s) / DAY); return { rows: [{ label: "Dias úteis", value: fmt(bd, 0), big: true }, { label: "Dias corridos", value: fmt(tot, 0) }, { label: "Fins de semana", value: fmt(tot - bd, 0) }], note: "Feriados não são descontados automaticamente." }; } if (bad(n.n)) return null; const r = new Date(a); let c = 0; while (c < n.n) { r.setDate(r.getDate() + 1); if (r.getDay() % 6 !== 0) c++; } return { rows: [{ label: "Data resultante", value: formatDate(r.toISOString(), { day: "2-digit", month: "long", year: "numeric" }), hint: WD[r.getDay()], big: true }] }; },
  },
  "dia-da-semana": {
    fields: [{ key: "d", label: "Data", type: "date" }],
    compute: (v) => { const d = toDate(v.d); if (!d) return null; const start = new Date(d.getFullYear(), 0, 1); const doy = Math.floor((+d - +start) / DAY) + 1; const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dayNum = tmp.getUTCDay() || 7; tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum); const week = Math.ceil(((+tmp - +Date.UTC(tmp.getUTCFullYear(), 0, 1)) / DAY + 1) / 7); const leap = (d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || d.getFullYear() % 400 === 0; return { rows: [{ label: "Dia da semana", value: WD[d.getDay()], big: true }, { label: "Semana ISO", value: String(week) }, { label: "Dia do ano", value: `${doy} de ${leap ? 366 : 365}` }, { label: "Trimestre", value: `${Math.floor(d.getMonth() / 3) + 1}º` }] }; },
  },
  "calculadora-de-gestacao": {
    fields: [{ key: "dum", label: "Primeiro dia da última menstruação", type: "date" }, { key: "c", label: "Duração do ciclo", placeholder: "28", suffix: "dias", default: "28" }],
    compute: (v, n) => { const d = toDate(v.dum); if (!d) return null; const adj = (Number.isFinite(n.c) ? n.c : 28) - 28; const dpp = new Date(d); dpp.setDate(dpp.getDate() + 280 + adj); const now = new Date(); const days = Math.floor((+now - +d) / DAY) - adj; const w = Math.floor(days / 7); const tri = w < 13 ? "1º" : w < 27 ? "2º" : "3º"; return { rows: [{ label: "Data provável do parto", value: formatDate(dpp.toISOString(), { day: "2-digit", month: "long", year: "numeric" }), big: true }, { label: "Idade gestacional hoje", value: days >= 0 && days <= 300 ? `${w} semanas e ${days % 7} dias` : "—", hint: days >= 0 && days <= 300 ? `${tri} trimestre` : undefined }, { label: "Dias até o parto", value: fmt(Math.round((+dpp - +now) / DAY), 0) }], formula: "Regra de Naegele: DUM + 280 dias (ajustada pelo ciclo)", note: "Estimativa. O ultrassom pode redefinir a data." }; },
  },
};

/* ------------------------------ Custom tools ------------------------------- */
export function MediaPonderada() {
  const [rows, setRows] = useState([{ v: "", p: "1" }, { v: "", p: "1" }, { v: "", p: "1" }]);
  const res = useMemo(() => { let s = 0, w = 0; rows.forEach((r) => { const v = parseNum(r.v), p = parseNum(r.p); if (Number.isFinite(v) && Number.isFinite(p)) { s += v * p; w += p; } }); return w > 0 ? { media: s / w, pesos: w, soma: s } : null; }, [rows]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-fg-3"><span>Valor / nota</span><span>Peso</span><span className="w-9" /></div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input inputMode="decimal" placeholder={`Nota ${i + 1}`} value={r.v} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} />
            <Input inputMode="decimal" placeholder="Peso" value={r.p} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, p: e.target.value } : x)))} />
            <Button size="icon" variant="ghost" onClick={() => setRows(rows.filter((_, j) => j !== i))} disabled={rows.length <= 2} aria-label="Remover"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setRows([...rows, { v: "", p: "1" }])}><Plus className="h-4 w-4" />Adicionar linha</Button><ToolActions onClear={() => setRows([{ v: "", p: "1" }, { v: "", p: "1" }, { v: "", p: "1" }])} /></div>
      </div>
      {res ? <ResultBox copyText={`Média ponderada: ${fmt(res.media, 3)}`} footer="Σ(valor × peso) ÷ Σ(pesos)"><div className="grid gap-5 sm:grid-cols-2"><Stat label="Média ponderada" value={fmt(res.media, 3)} big /><Stat label="Soma dos pesos" value={fmt(res.pesos)} /><Stat label="Soma ponderada" value={fmt(res.soma)} /></div></ResultBox> : <EmptyResult />}
    </div>
  );
}

export function ContagemRegressiva() {
  const [target, setTarget] = useLocalStorage("countdown", { date: "", time: "00:00", name: "" });
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const t = target.date ? new Date(`${target.date}T${target.time || "00:00"}:00`).getTime() : NaN;
  const diff = Number.isFinite(t) ? t - now : NaN;
  const abs = Math.abs(diff);
  const parts = [["dias", Math.floor(abs / DAY)], ["horas", Math.floor((abs % DAY) / 3600000)], ["min", Math.floor((abs % 3600000) / 60000)], ["seg", Math.floor((abs % 60000) / 1000)]] as const;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Nome do evento"><Input placeholder="Férias, lançamento, prova…" value={target.name} onChange={(e) => setTarget({ ...target, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4"><Field label="Data"><Input type="date" value={target.date} onChange={(e) => setTarget({ ...target, date: e.target.value })} /></Field><Field label="Hora"><Input type="time" value={target.time} onChange={(e) => setTarget({ ...target, time: e.target.value })} /></Field></div>
        <ToolActions onClear={() => setTarget({ date: "", time: "00:00", name: "" })} />
      </div>
      {Number.isFinite(diff) ? (
        <ResultBox title={diff >= 0 ? `Faltam para ${target.name || "o evento"}` : `Desde ${target.name || "o evento"}`}>
          <div className="grid grid-cols-4 gap-2">{parts.map(([l, v]) => <div key={l} className="rounded-xl border bg-surface p-3 text-center"><p className="text-2xl font-semibold tabular-nums sm:text-3xl">{String(v).padStart(2, "0")}</p><p className="text-[11px] uppercase tracking-wide text-fg-3">{l}</p></div>)}</div>
        </ResultBox>
      ) : <EmptyResult text="Escolha a data do evento." />}
    </div>
  );
}

export function Sorteador() {
  const [mode, setMode] = useState<"n" | "l">("n");
  const [min, setMin] = useState("1"); const [max, setMax] = useState("60"); const [qtd, setQtd] = useState("6");
  const [list, setList] = useState(""); const [res, setRes] = useState<string[]>([]);
  const run = () => {
    if (mode === "n") { const a = parseNum(min), b = parseNum(max), q = Math.max(1, Math.floor(parseNum(qtd))); if (bad(a, b) || b < a) return; const pool = Array.from({ length: Math.min(b - a + 1, 100000) }, (_, i) => String(a + i)); setRes(shuffle(pool).slice(0, q)); }
    else { const items = list.split(/\n|,/).map((s) => s.trim()).filter(Boolean); if (!items.length) return; setRes(shuffle(items).slice(0, Math.max(1, Math.floor(parseNum(qtd)) || 1))); }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Select value={mode} onChange={(e) => setMode(e.target.value as "n" | "l")}><option value="n">Números em um intervalo</option><option value="l">Nomes de uma lista</option></Select>
        {mode === "n" ? <div className="grid grid-cols-3 gap-3"><Field label="De"><Input value={min} onChange={(e) => setMin(e.target.value)} /></Field><Field label="Até"><Input value={max} onChange={(e) => setMax(e.target.value)} /></Field><Field label="Quantos"><Input value={qtd} onChange={(e) => setQtd(e.target.value)} /></Field></div>
          : <><Field label="Participantes (um por linha ou separados por vírgula)"><textarea className="min-h-[120px] w-full rounded-xl border bg-surface p-3 text-sm" value={list} onChange={(e) => setList(e.target.value)} placeholder={"Ana\nBruno\nCarla"} /></Field><Field label="Quantos sortear"><Input value={qtd} onChange={(e) => setQtd(e.target.value)} className="max-w-[120px]" /></Field></>}
        <div className="flex gap-2"><Button onClick={run}>Sortear</Button><ToolActions onClear={() => setRes([])} copyText={res.join(", ") || undefined} /></div>
      </div>
      {res.length ? <ResultBox copyText={res.join(", ")}><div className="flex flex-wrap gap-2">{res.map((r, i) => <span key={i} className="rounded-xl border bg-surface px-4 py-2 text-lg font-semibold tabular-nums">{r}</span>)}</div></ResultBox> : <EmptyResult text="Clique em “Sortear”." />}
    </div>
  );
}

const ZONES = ["America/Sao_Paulo", "America/Manaus", "America/New_York", "America/Los_Angeles", "America/Mexico_City", "America/Buenos_Aires", "Europe/Lisbon", "Europe/London", "Europe/Madrid", "Europe/Berlin", "Europe/Paris", "Africa/Luanda", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney", "UTC"];
export function FusoHorario() {
  const [from, setFrom] = useState("America/Sao_Paulo"); const [time, setTime] = useState("14:00"); const [date, setDate] = useState(today());
  const [targets, setTargets] = useState(["Europe/Lisbon", "America/New_York", "Asia/Tokyo"]);
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNowTick(Date.now()), 30000); return () => clearInterval(id); }, []);
  const conv = (zone: string) => {
    try {
      const [h, m] = time.split(":").map(Number); const [Y, M, D] = date.split("-").map(Number);
      const guess = Date.UTC(Y, M - 1, D, h, m);
      const off = (z: string, ts: number) => { const p = new Intl.DateTimeFormat("en-US", { timeZone: z, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(new Date(ts)); const g = (t: string) => Number(p.find((x) => x.type === t)?.value); return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute")) - ts; };
      const utc = guess - off(from, guess);
      return new Intl.DateTimeFormat("pt-BR", { timeZone: zone, weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(utc));
    } catch { return "—"; }
  };
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Cidade de origem"><Select value={from} onChange={(e) => setFrom(e.target.value)}>{ZONES.map((z) => <option key={z} value={z}>{z.replace("_", " ")}</option>)}</Select></Field><Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field><Field label="Horário"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field></div>
      <div className="grid gap-3 sm:grid-cols-3">
        {targets.map((z, i) => (
          <div key={i} className="rounded-2xl border bg-surface-2/60 p-4">
            <Select className="h-9 mb-3" value={z} onChange={(e) => setTargets(targets.map((t, j) => (j === i ? e.target.value : t)))}>{ZONES.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}</Select>
            <p className="text-2xl font-semibold tabular-nums">{conv(z)}</p>
            <p className="mt-1 text-xs text-fg-3">agora: {new Intl.DateTimeFormat("pt-BR", { timeZone: z, hour: "2-digit", minute: "2-digit" }).format(new Date(nowTick))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
