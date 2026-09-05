import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { TextTool } from "./ToolShell";
import { Button, Field, Input, Range, Select, Stat, Textarea } from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/feedback";
import { fmtNum } from "@/lib/utils";
import { sentences, words } from "./text";

/* ---------- Tokens ---------- */
const MODELS = [
  { n: "GPT-4o", inp: 2.5, out: 10 }, { n: "GPT-4o mini", inp: 0.15, out: 0.6 }, { n: "Claude Sonnet", inp: 3, out: 15 }, { n: "Claude Haiku", inp: 0.8, out: 4 }, { n: "Gemini 1.5 Pro", inp: 1.25, out: 5 }, { n: "Gemini Flash", inp: 0.075, out: 0.3 },
];
export function Tokens() {
  const [t, setT] = useState("");
  const [outTokens, setOutTokens] = useState(500);
  const tokens = useMemo(() => {
    if (!t) return 0;
    const ptRatio = /[ãõçáéíóúâêô]/i.test(t) ? 3.3 : 4;
    return Math.ceil(t.length / ptRatio);
  }, [t]);
  return (
    <div>
      <Field label="Prompt ou texto"><Textarea value={t} onChange={(e) => setT(e.target.value)} className="min-h-[180px]" placeholder="Cole o prompt para estimar tokens e custo…" /></Field>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Tokens (estimado)" value={fmtNum(tokens, 0)} /><Stat label="Caracteres" value={fmtNum(t.length, 0)} /><Stat label="Palavras" value={fmtNum(words(t), 0)} /><Stat label="Chars/token" value={t ? fmtNum(t.length / Math.max(1, tokens), 1) : "—"} /></div>
      <div className="mt-5"><Range label="Tokens de saída esperados" min={50} max={4000} step={50} value={outTokens} onChange={setOutTokens} /></div>
      <div className="mt-5 overflow-hidden rounded-xl border border-line"><table className="w-full text-sm"><thead className="bg-bg-2 text-left text-xs uppercase tracking-wider text-fg-3"><tr><th className="px-4 py-2">Modelo</th><th className="px-4 py-2">Custo por chamada</th><th className="px-4 py-2">1.000 chamadas</th></tr></thead><tbody>{MODELS.map((m) => { const c = (tokens * m.inp + outTokens * m.out) / 1e6; return <tr key={m.n} className="border-t border-line"><td className="px-4 py-2 font-medium text-fg">{m.n}</td><td className="px-4 py-2 font-mono">US$ {c.toFixed(5)}</td><td className="px-4 py-2 font-mono">US$ {(c * 1000).toFixed(2)}</td></tr>; })}</tbody></table></div>
      <p className="mt-3 text-xs text-fg-3">Preços de referência por milhão de tokens (entrada/saída) e podem mudar. Estimativa heurística de tokenização.</p>
    </div>
  );
}

/* ---------- Extractive summarizer ---------- */
const STOP = new Set("a o e é de da do das dos em um uma uns umas para por com sem sob sobre que se não mais como mas ou ao aos à às na no nas nos pelo pela pelos pelas seu sua seus suas este esta isto esse essa isso aquele aquela aquilo eu tu ele ela nós vós eles elas me te lhe nos vos lhes meu minha teu tua já também muito pouco bem mal onde quando porque então assim até entre depois antes ser estar ter haver foi era são está estão tem têm há the of and to in is it that for on with as this be are was".split(" "));
export function summarize(text: string, ratio: number) {
  const sents = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter((s) => s.length > 20) ?? [];
  if (sents.length <= 2) return sents.join(" ");
  const freq = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[\p{L}]+/gu) ?? []) if (!STOP.has(w) && w.length > 2) freq.set(w, (freq.get(w) ?? 0) + 1);
  const max = Math.max(...freq.values(), 1);
  const scored = sents.map((s, i) => {
    const ws = s.toLowerCase().match(/[\p{L}]+/gu) ?? [];
    const score = ws.reduce((a, w) => a + (freq.get(w) ?? 0) / max, 0) / Math.sqrt(ws.length || 1);
    return { s, i, score: score + (i === 0 ? 0.3 : 0) };
  });
  const k = Math.max(1, Math.round(sents.length * ratio));
  return scored.sort((a, b) => b.score - a.score).slice(0, k).sort((a, b) => a.i - b.i).map((x) => x.s).join(" ");
}
export const Resumidor = () => (
  <TextTool placeholder="Cole um texto longo (artigo, notícia, documento)…" outputLabel="Resumo" filename="resumo.txt" options={[{ key: "r", label: "Tamanho do resumo", type: "select", default: "0.3", options: [{ value: "0.15", label: "Muito curto (15%)" }, { value: "0.3", label: "Curto (30%)" }, { value: "0.5", label: "Médio (50%)" }] }, { key: "b", label: "Formato", type: "select", default: "p", options: [{ value: "p", label: "Parágrafo" }, { value: "b", label: "Bullets" }] }]}
    transform={(s, o) => { const r = summarize(s, Number(o.r)); return o.b === "b" ? (r.match(/[^.!?]+[.!?]+/g) ?? [r]).map((x) => `• ${x.trim()}`).join("\n") : r; }}
    stats={(i, o) => [{ label: "Original", value: `${words(i)} pal.` }, { label: "Resumo", value: `${words(o)} pal.` }, { label: "Redução", value: i ? `${fmtNum((1 - words(o) / Math.max(1, words(i))) * 100, 0)}%` : "—" }, { label: "Frases", value: String(sentences(o)) }]}
  />
);

/* ---------- Title generator ---------- */
const TITLE_FORMULAS = [
  (t: string, n: number) => `${n} maneiras de ${t} (que realmente funcionam)`,
  (t: string) => `Como ${t}: guia completo para iniciantes`,
  (t: string) => `O que ninguém te conta sobre ${t}`,
  (t: string, n: number) => `${n} erros que você comete ao ${t}`,
  (t: string) => `${cap(t)}: o guia definitivo`,
  (t: string) => `Por que ${t} é mais fácil do que você pensa`,
  (t: string) => `Eu tentei ${t} por 30 dias. Isto é o que aprendi`,
  (t: string, n: number) => `${n} ferramentas para ${t} em 2026`,
  (t: string) => `${cap(t)} passo a passo (sem enrolação)`,
  (t: string) => `A verdade sobre ${t}`,
  (t: string) => `Antes de ${t}, leia isto`,
  (t: string, n: number) => `${cap(t)}: ${n} dicas de quem já fez`,
  (t: string) => `Pare de ${t} do jeito errado`,
  (t: string) => `${cap(t)} para quem tem pouco tempo`,
  (t: string) => `O método simples para ${t}`,
  (t: string) => `Vale a pena ${t}? Análise honesta`,
];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export function Titulos() {
  const [t, setT] = useState("");
  const [tick, setTick] = useState(0);
  const list = useMemo(() => { void tick; const topic = t.trim().toLowerCase() || "aprender programação"; return TITLE_FORMULAS.map((f) => f(topic, [3, 5, 7, 9, 10, 12][Math.floor(Math.random() * 6)])); }, [t, tick]);
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row"><Input placeholder="Tema (ex.: economizar dinheiro, usar IA no trabalho)" value={t} onChange={(e) => setT(e.target.value)} /><Button onClick={() => setTick((x) => x + 1)}><RefreshCw size={15} /> Variar</Button><CopyButton text={list.join("\n")} size="md" label="Copiar todos" /></div>
      <ul className="mt-5 grid gap-2">{list.map((x, i) => <li key={i} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg-2 px-4 py-2.5 text-[15px]"><span className="text-fg">{x}</span><span className="flex shrink-0 items-center gap-2"><span className={`font-mono text-[11px] ${x.length > 60 ? "text-warn" : "text-fg-3"}`}>{x.length}</span><CopyButton text={x} size="icon" variant="ghost" /></span></li>)}</ul>
      <p className="mt-3 text-xs text-fg-3">Títulos com mais de 60 caracteres podem ser cortados no Google (marcados em laranja).</p>
    </div>
  );
}

/* ---------- Hashtags ---------- */
const HASH_POOL: Record<string, string[]> = {
  geral: ["dicas", "brasil", "inspiracao", "aprenda", "conteudo", "criador", "novidade", "tendencia"],
  tecnologia: ["tecnologia", "tech", "inovacao", "programacao", "dev", "startup", "ia", "inteligenciaartificial", "software", "digital"],
  marketing: ["marketingdigital", "marketing", "vendas", "empreendedorismo", "negocios", "branding", "socialmedia", "conteudo", "copywriting", "trafegopago"],
  fitness: ["fitness", "treino", "saude", "academia", "vidasaudavel", "bemestar", "nutricao", "foco"],
  financas: ["financas", "investimentos", "dinheiro", "educacaofinanceira", "renda", "economia", "liberdadefinanceira"],
  design: ["design", "ui", "ux", "designgrafico", "criatividade", "arte", "branding", "tipografia"],
  educacao: ["educacao", "estudos", "aprendizado", "concursos", "enem", "vestibular", "professores"],
};
export function Hashtags() {
  const [kw, setKw] = useState("");
  const [niche, setNiche] = useState("tecnologia");
  const [n, setN] = useState(15);
  const tags = useMemo(() => {
    const base = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[,\s]+/).filter(Boolean).map((k) => k.replace(/[^a-z0-9]/g, ""));
    const derived = base.flatMap((k) => [k, `${k}brasil`, `${k}dicas`, `dicasde${k}`]);
    const all = [...new Set([...derived, ...HASH_POOL[niche], ...HASH_POOL.geral])].filter(Boolean);
    return all.slice(0, n).map((x) => `#${x}`);
  }, [kw, niche, n]);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Palavras-chave" className="sm:col-span-2"><Input placeholder="ex.: react, front-end" value={kw} onChange={(e) => setKw(e.target.value)} /></Field><Field label="Nicho"><Select value={niche} onChange={(e) => setNiche(e.target.value)}>{Object.keys(HASH_POOL).filter((k) => k !== "geral").map((k) => <option key={k} value={k}>{cap(k)}</option>)}</Select></Field></div>
      <div className="mt-4"><Range label="Quantidade" min={5} max={30} value={n} onChange={setN} /></div>
      <div className="mt-5 flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-sm text-accent">{t}</span>)}</div>
      <div className="mt-4 flex items-center gap-3"><CopyButton text={tags.join(" ")} size="md" variant="primary" label="Copiar hashtags" /><span className="text-xs text-fg-3">{tags.join(" ").length} caracteres</span></div>
    </div>
  );
}

/* ---------- Bio ---------- */
export function Bio() {
  const [f, setF] = useState({ oque: "", quem: "", dif: "", cta: "" });
  const [tick, setTick] = useState(0);
  const bios = useMemo(() => {
    void tick;
    const o = f.oque || "Designer de produto", q = f.quem || "startups", d = f.dif || "foco em simplicidade", c = f.cta || "Fale comigo ↓";
    return [
      `${o} para ${q}. ${cap(d)}.\n${c}`,
      `Ajudo ${q} com ${o.toLowerCase()} — ${d}.\n📩 ${c}`,
      `${o} | ${cap(d)}\nTrabalho com ${q}.\n${c}`,
      `✦ ${o}\n✦ ${cap(d)}\n✦ Para ${q}\n${c}`,
      `${cap(d)} é o meu jeito de fazer ${o.toLowerCase()} para ${q}.\n${c}`,
    ];
  }, [f, tick]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="O que você faz"><Input placeholder="Designer de produto" value={f.oque} onChange={set("oque")} /></Field><Field label="Para quem"><Input placeholder="startups em estágio inicial" value={f.quem} onChange={set("quem")} /></Field><Field label="Diferencial"><Input placeholder="foco em simplicidade e métricas" value={f.dif} onChange={set("dif")} /></Field><Field label="Chamada (CTA)"><Input placeholder="Portfólio no link ↓" value={f.cta} onChange={set("cta")} /></Field></div>
      <div className="mt-4"><Button variant="secondary" onClick={() => setTick((t) => t + 1)}><RefreshCw size={15} /> Embaralhar</Button></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">{bios.map((b, i) => <div key={i} className="flex gap-3 rounded-xl border border-line bg-bg-2 p-4"><pre className="flex-1 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-fg">{b}</pre><div className="flex flex-col items-end gap-2"><CopyButton text={b} size="icon" variant="ghost" /><span className={`font-mono text-[11px] ${b.length > 150 ? "text-warn" : "text-fg-3"}`}>{b.length}</span></div></div>)}</div>
    </div>
  );
}

/* ---------- Readability ---------- */
const syllables = (w: string) => Math.max(1, (w.toLowerCase().match(/[aeiouáéíóúâêôãõ]+/g) ?? []).length);
export function Legibilidade() {
  const [t, setT] = useState("");
  const r = useMemo(() => {
    const ws = t.match(/[\p{L}]+/gu) ?? [];
    const W = ws.length, S = Math.max(1, sentences(t)), SY = ws.reduce((a, w) => a + syllables(w), 0);
    if (!W) return null;
    const flesch = 248.835 - 1.015 * (W / S) - 84.6 * (SY / W);
    const complex = ws.filter((w) => syllables(w) >= 4).length;
    const level = flesch >= 75 ? "Muito fácil (ensino fundamental)" : flesch >= 50 ? "Fácil (ensino médio)" : flesch >= 25 ? "Difícil (universitário)" : "Muito difícil (acadêmico)";
    const long = t.split(/[.!?]+/).filter((s) => words(s) > 30).length;
    return { flesch: Math.max(0, Math.min(100, flesch)), level, wps: W / S, spw: SY / W, complex, long, W, S };
  }, [t]);
  return (
    <div>
      <Field label="Texto"><Textarea value={t} onChange={(e) => setT(e.target.value)} className="min-h-[200px]" placeholder="Cole o texto para analisar a legibilidade…" /></Field>
      {r && (
        <div className="mt-5">
          <div className="rounded-xl border border-line bg-bg-2 p-5"><div className="flex items-end justify-between"><div><div className="text-xs font-medium text-fg-3">Índice Flesch (PT-BR)</div><div className="font-mono text-4xl font-semibold text-fg">{fmtNum(r.flesch, 0)}</div></div><div className="text-right text-sm font-medium text-fg">{r.level}</div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-danger via-warn to-ok transition-all" style={{ width: `${r.flesch}%` }} /></div></div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Palavras/frase" value={fmtNum(r.wps, 1)} hint={r.wps > 25 ? "reduza" : "bom"} /><Stat label="Sílabas/palavra" value={fmtNum(r.spw, 2)} /><Stat label="Palavras complexas" value={String(r.complex)} hint="4+ sílabas" /><Stat label="Frases longas" value={String(r.long)} hint="+30 palavras" /></div>
          <ul className="mt-4 space-y-1.5 text-sm text-fg-2">{r.wps > 20 && <li>• Quebre frases longas: mire em 15–20 palavras por frase.</li>}{r.complex / r.W > 0.15 && <li>• Muitas palavras longas: prefira sinônimos curtos quando possível.</li>}{r.flesch >= 50 && <li>• Boa legibilidade para público geral.</li>}</ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Tone rewriter (rule-based) ---------- */
const RULES: Record<string, [RegExp, string][]> = {
  formal: [[/\bvc\b/gi, "você"], [/\bpra\b/gi, "para"], [/\bpro\b/gi, "para o"], [/\btá\b/gi, "está"], [/\bnum\b/gi, "em um"], [/\bblz\b/gi, "tudo bem"], [/\bvaleu\b/gi, "obrigado"], [/\boi\b/gi, "olá"], [/\bcara\b/gi, "prezado"], [/!+/g, "."], [/\bmuito bom\b/gi, "excelente"], [/\ba gente\b/gi, "nós"], [/\bcoisa\b/gi, "item"], [/\bfazer\b/gi, "realizar"]],
  informal: [[/\bprezado\(a\)|prezado|prezada\b/gi, "oi"], [/\bsolicito\b/gi, "peço"], [/\bcordialmente\b/gi, "abraço"], [/\batenciosamente\b/gi, "abraços"], [/\brealizar\b/gi, "fazer"], [/\bexcelente\b/gi, "muito bom"], [/\bnós\b/gi, "a gente"], [/\bentretanto\b/gi, "mas"], [/\bportanto\b/gi, "então"], [/\bvocê\b/gi, "você"]],
  direto: [[/\bna verdade,?\s*/gi, ""], [/\bbasicamente,?\s*/gi, ""], [/\beu acho que\s*/gi, ""], [/\beu acredito que\s*/gi, ""], [/\bde certa forma,?\s*/gi, ""], [/\bcomo você sabe,?\s*/gi, ""], [/\bpor favor,?\s*/gi, ""], [/\bgostaria de\s+/gi, "quero "], [/\bseria possível\b/gi, "pode"], [/\bum pouco\s*/gi, ""], [/\bmuito\s+/gi, ""], [/\btalvez\s*/gi, ""]],
  entusiasmado: [[/\bbom\b/gi, "ótimo"], [/\blegal\b/gi, "incrível"], [/\bgostei\b/gi, "adorei"], [/\binteressante\b/gi, "fascinante"], [/\.\s*$/gm, "!"], [/\bobrigado\b/gi, "muito obrigado"]],
};
export const Tom = () => <TextTool placeholder="Cole o texto para ajustar o tom…" outputLabel="Texto ajustado" options={[{ key: "tom", label: "Tom desejado", type: "select", default: "formal", options: [{ value: "formal", label: "Mais formal" }, { value: "informal", label: "Mais informal" }, { value: "direto", label: "Mais direto" }, { value: "entusiasmado", label: "Mais entusiasmado" }] }]} transform={(s, o) => { let t = s; for (const [re, rep] of RULES[o.tom]) t = t.replace(re, rep); return t.replace(/\s{2,}/g, " ").replace(/\s+([.,;!?])/g, "$1").replace(/(^|[.!?]\s+)([a-záéíóú])/g, (_, p, c) => p + c.toUpperCase()); }} stats={(i, o) => [{ label: "Antes", value: `${words(i)} pal.` }, { label: "Depois", value: `${words(o)} pal.` }, { label: "Alterações", value: String(i.split(" ").filter((w, k) => w !== o.split(" ")[k]).length) }]} />;

/* ---------- Interview questions ---------- */
const Q: Record<string, string[]> = {
  comportamental: ["Conte sobre uma situação em que você discordou de um colega. Como resolveu?", "Descreva um projeto que falhou. O que aprendeu?", "Como você prioriza quando tudo é urgente?", "Dê um exemplo de feedback difícil que recebeu e o que fez com ele.", "Conte sobre uma vez em que teve que aprender algo rápido para entregar.", "Como você lida com ambiguidade em requisitos?", "Descreva uma decisão que tomou com dados incompletos."],
  dev: ["Explique a diferença entre processo e thread.", "Como você garante qualidade em código que escreve com IA?", "Descreva como faria o design de um sistema de URL encurtada.", "O que é idempotência e por que importa em APIs?", "Como debugaria um vazamento de memória em produção?", "Explique CAP theorem com um exemplo prático.", "Como estrutura testes: unitários, integração e e2e?"],
  dados: ["Como trataria dados faltantes em um dataset de vendas?", "Explique overfitting para um gerente não técnico.", "Como escolheria entre precisão e recall em um modelo de fraude?", "Descreva um pipeline de dados que você construiu.", "O que é data leakage e como evitá-lo?", "Como mediria o sucesso de um modelo em produção?"],
  produto: ["Como priorizaria o backlog com recursos limitados?", "Descreva como validaria uma ideia antes de construir.", "Conte sobre uma métrica que você mudou e por quê.", "Como lida com um stakeholder que quer uma feature sem evidência?", "Defina sucesso para um onboarding de app.", "Como decidiria descontinuar uma funcionalidade?"],
  marketing: ["Como estruturaria um teste A/B de landing page?", "Qual métrica você não usaria para medir marca e por quê?", "Descreva uma campanha que não deu certo e o aprendizado.", "Como distribuiria um orçamento entre canais sem histórico?", "Como usaria IA no fluxo de conteúdo sem perder qualidade?"],
  lideranca: ["Como dá feedback negativo a um alto performer?", "Conte sobre uma contratação errada e o que mudou depois.", "Como alinha um time em um objetivo impopular?", "Descreva como desenvolve pessoas na sua equipe.", "Como equilibra entrega de curto prazo e saúde do time?"],
};
export function Entrevista() {
  const [area, setArea] = useState("dev");
  const [nivel, setNivel] = useState("pleno");
  const [tick, setTick] = useState(0);
  const list = useMemo(() => { void tick; const pool = [...Q[area], ...Q.comportamental].sort(() => Math.random() - 0.5).slice(0, 8); const pref = nivel === "senior" ? "Como sênior, " : nivel === "junior" ? "" : ""; return pool.map((q) => (nivel === "senior" && !q.startsWith("Como") ? pref + q.charAt(0).toLowerCase() + q.slice(1) : q)); }, [area, nivel, tick]);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Área"><Select value={area} onChange={(e) => setArea(e.target.value)}><option value="dev">Desenvolvimento</option><option value="dados">Dados / IA</option><option value="produto">Produto</option><option value="marketing">Marketing</option><option value="lideranca">Liderança</option></Select></Field><Field label="Nível"><Select value={nivel} onChange={(e) => setNivel(e.target.value)}><option value="junior">Júnior</option><option value="pleno">Pleno</option><option value="senior">Sênior</option></Select></Field><div className="flex items-end gap-2"><Button onClick={() => setTick((t) => t + 1)}><RefreshCw size={15} /> Novas</Button><CopyButton text={list.map((q, i) => `${i + 1}. ${q}`).join("\n")} size="md" /></div></div>
      <ol className="mt-5 space-y-2">{list.map((q, i) => <li key={i} className="flex gap-3 rounded-xl border border-line bg-bg-2 px-4 py-3 text-[15px]"><span className="font-mono text-sm text-fg-3">{String(i + 1).padStart(2, "0")}</span><span className="text-fg">{q}</span></li>)}</ol>
    </div>
  );
}
