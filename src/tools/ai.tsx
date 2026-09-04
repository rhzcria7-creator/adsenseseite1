import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { Button, Field, Input, Segmented, Select, Textarea, Toggle } from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/feedback";
import { Actions, Bar, BigNumber, ErrorText, KV, OutputArea, ResultPanel, ToolGrid, ToolShell } from "./ToolShell";
import type { ToolProps } from "./calculators";
import { STOPWORDS, sentences, syllables, tokenize } from "./text";

const num = (n: number, d = 1) => formatNumber(n, d);
const rand = (n: number) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
const pickR = <T,>(arr: T[]) => arr[rand(arr.length)];

/* ------------------------- Gerador de prompt de imagem -------------------- */
const IMG = {
  style: ["photograph", "editorial photography", "cinematic still", "flat vector illustration", "3D render", "watercolor painting", "oil painting", "isometric illustration", "line art", "pixel art", "risograph print", "architectural visualization"],
  light: ["natural window light", "golden hour sunlight", "soft studio lighting", "dramatic rim light", "neon lights at night", "overcast diffuse light", "volumetric light rays", "candlelight"],
  camera: ["85mm portrait lens, shallow depth of field", "35mm wide angle", "50mm, f/1.8", "macro lens, extreme detail", "drone aerial view", "tilt-shift miniature", "fisheye lens"],
  comp: ["centered composition", "rule of thirds", "symmetrical composition", "close-up", "wide establishing shot", "low angle", "top-down flat lay", "negative space"],
  mood: ["calm and minimal", "energetic and vibrant", "moody and atmospheric", "warm and nostalgic", "clean and corporate", "playful and colorful", "dark and mysterious"],
  quality: ["highly detailed", "8k", "sharp focus", "film grain", "photorealistic", "award-winning", "trending on artstation", "masterpiece"],
  ar: ["1:1", "4:5", "16:9", "9:16", "3:2", "21:9"],
};
export function GeradorDePromptDeImagem({ meta }: ToolProps) {
  const [f, setF] = useState({ subject: "uma mulher lendo em um café movimentado", style: IMG.style[1], light: IMG.light[0], camera: IMG.camera[0], comp: IMG.comp[1], mood: IMG.mood[0], ar: "4:5", platform: "midjourney", negative: "blurry, text, watermark, extra fingers, deformed" });
  const [q, setQ] = useState<string[]>(["highly detailed", "sharp focus"]);
  const u = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const { pushPrompt } = useStore();
  const prompt = useMemo(() => {
    const parts = [f.subject.trim(), f.style, f.light, f.camera, f.comp, `${f.mood} mood`, ...q].filter(Boolean);
    let p = parts.join(", ");
    if (f.platform === "midjourney") p += ` --ar ${f.ar} --style raw`;
    else if (f.platform === "sd") p += `\n\nNegative prompt: ${f.negative}`;
    else p += `. Aspect ratio ${f.ar}.`;
    return p;
  }, [f, q]);
  const Sel = (k: keyof typeof f, label: string, opts: string[]) => <Field label={label}><Select value={f[k]} onChange={(e) => u(k, e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</Select></Field>;
  return (
    <ToolShell meta={meta} examples={[{ label: "Retrato editorial", onClick: () => setF((p) => ({ ...p, subject: "retrato de um chef em sua cozinha", style: "editorial photography", light: "natural window light", camera: IMG.camera[0] })) }, { label: "Ilustração flat", onClick: () => setF((p) => ({ ...p, subject: "time trabalhando em um escritório com plantas", style: "flat vector illustration", light: "soft studio lighting", camera: IMG.camera[1], mood: "playful and colorful" })) }, { label: "Aleatório", onClick: () => setF((p) => ({ ...p, style: pickR(IMG.style), light: pickR(IMG.light), camera: pickR(IMG.camera), comp: pickR(IMG.comp), mood: pickR(IMG.mood) })) }]}>
      <Field label="Sujeito e ação (pode ser em português — traduza depois se quiser)"><Textarea value={f.subject} onChange={(e) => u("subject", e.target.value)} rows={2} /></Field>
      <ToolGrid cols={3} className="mt-4">
        {Sel("style", "Estilo", IMG.style)}{Sel("light", "Iluminação", IMG.light)}{Sel("camera", "Câmera / lente", IMG.camera)}{Sel("comp", "Composição", IMG.comp)}{Sel("mood", "Atmosfera", IMG.mood)}
        <Field label="Plataforma"><Select value={f.platform} onChange={(e) => u("platform", e.target.value)}><option value="midjourney">Midjourney</option><option value="dalle">DALL·E / Firefly</option><option value="sd">Stable Diffusion</option></Select></Field>
      </ToolGrid>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div><div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">Qualidade</div><div className="flex flex-wrap gap-1.5">{IMG.quality.map((x) => <button key={x} onClick={() => setQ((p) => (p.includes(x) ? p.filter((y) => y !== x) : [...p, x]))} className={`border px-2 py-1 text-xs ${q.includes(x) ? "border-fg bg-fg text-bg" : "border-line hover:border-strong"}`}>{x}</button>)}</div></div>
        <Field label="Proporção"><Segmented value={f.ar} onChange={(v) => u("ar", v)} options={IMG.ar.map((a) => ({ value: a, label: a }))} /></Field>
      </div>
      {f.platform === "sd" && <Field label="Prompt negativo" className="mt-4"><Input value={f.negative} onChange={(e) => u("negative", e.target.value)} /></Field>}
      <ResultPanel title="Prompt gerado">
        <OutputArea value={prompt} rows={5} />
        <Actions copy={prompt} extra={<Button size="sm" variant="ghost" onClick={() => pushPrompt(`Imagem: ${f.subject.slice(0, 40)}`, prompt)}>Salvar no histórico</Button>} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ----------------------------- Melhorar prompt ---------------------------- */
const CHECKS: { key: string; label: string; test: (p: string) => boolean; fix: string }[] = [
  { key: "role", label: "Papel definido", test: (p) => /voc[êe] é|aja como|atue como|you are|act as|como um\(a\)?|especialista/i.test(p), fix: "Você é um especialista no assunto." },
  { key: "goal", label: "Objetivo claro (verbo de ação)", test: (p) => /\b(escreva|crie|liste|resuma|explique|analise|compare|gere|traduza|revise|planeje|write|create|list|summarize|explain)\b/i.test(p), fix: "Objetivo: [descreva o entregável com um verbo: escrever, resumir, comparar…]." },
  { key: "context", label: "Contexto fornecido", test: (p) => p.length > 180 || /contexto|situa[çc][ãa]o|cen[áa]rio|background|estamos|minha empresa|meu/i.test(p), fix: "Contexto: [o que o modelo precisa saber e não tem como saber]." },
  { key: "audience", label: "Público-alvo", test: (p) => /p[úu]blico|para (iniciantes|profissionais|crian[çc]as|clientes|executivos|devs|estudantes)|audi[êe]ncia|leitor/i.test(p), fix: "Público: [para quem é a resposta]." },
  { key: "format", label: "Formato de saída", test: (p) => /formato|lista|tabela|json|markdown|t[óo]picos|par[áa]grafos|passo a passo|e-?mail|bullet/i.test(p), fix: "Formato: [lista, tabela, parágrafos, JSON…]." },
  { key: "tone", label: "Tom", test: (p) => /\btom\b|formal|informal|did[áa]tico|direto|amig[áa]vel|profissional|tone/i.test(p), fix: "Tom: [direto, didático, formal…]." },
  { key: "constraints", label: "Restrições e critérios", test: (p) => /m[áa]ximo|no m[íi]nimo|at[ée] \d+|n[ãa]o use|evite|sem |limite|palavras|caracteres|regras?:/i.test(p), fix: "Restrições: [tamanho máximo, o que evitar, critérios de qualidade]." },
  { key: "example", label: "Exemplo do resultado", test: (p) => /exemplo|por exemplo|ex\.:|como este|modelo:|e\.g\./i.test(p), fix: "Exemplo do resultado esperado: [cole um exemplo curto]." },
];
export function MelhorarPrompt({ meta }: ToolProps) {
  const [p, setP] = useState("me fala sobre marketing de conteúdo");
  const results = CHECKS.map((c) => ({ ...c, ok: c.test(p) }));
  const score = Math.round((results.filter((r) => r.ok).length / CHECKS.length) * 100);
  const improved = useMemo(() => {
    const missing = results.filter((r) => !r.ok);
    const lines: string[] = [];
    if (!results[0].ok) lines.push(CHECKS[0].fix);
    lines.push("", "Tarefa original:", p.trim(), "");
    missing.filter((m) => m.key !== "role").forEach((m) => lines.push(m.fix));
    lines.push("", "Antes de responder, faça até 2 perguntas se algo essencial estiver faltando.");
    return lines.join("\n").trim();
  }, [p, results]);
  const { pushPrompt } = useStore();
  return (
    <ToolShell meta={meta} examples={[{ label: "Prompt vago", onClick: () => setP("me fala sobre marketing de conteúdo") }, { label: "Prompt razoável", onClick: () => setP("Você é um estrategista de conteúdo. Explique marketing de conteúdo para um fundador de startup em 5 tópicos com exemplos. Tom direto, máximo 300 palavras.") }]}>
      <Field label="Seu prompt"><Textarea value={p} onChange={(e) => setP(e.target.value)} rows={6} /></Field>
      <ResultPanel title="Análise">
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div><BigNumber label="Pontuação" value={`${score}/100`} accent /><Bar value={score} className="mt-3" tone={score < 40 ? "red" : score < 70 ? "amber" : "mint"} /></div>
          <ul className="grid gap-1.5 sm:grid-cols-2">{results.map((r) => <li key={r.key} className={`flex items-center gap-2 border px-3 py-2 text-sm ${r.ok ? "border-mint/50" : "border-line"}`}><span className={`h-2 w-2 shrink-0 ${r.ok ? "bg-mint" : "bg-[var(--line)]"}`} />{r.label}</li>)}</ul>
        </div>
        <div className="mt-6"><div className="eyebrow mb-2">Versão reestruturada</div><OutputArea value={improved} rows={10} mono={false} /></div>
        <Actions copy={improved} onClear={() => setP("")} extra={<Button size="sm" variant="ghost" onClick={() => pushPrompt("Prompt melhorado", improved)}>Salvar no histórico</Button>} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Estimador de tokens ------------------------- */
export function estimateTokens(text: string) {
  if (!text.trim()) return 0;
  const chars = text.length;
  const nonAscii = (text.match(/[^\x00-\x7F]/g) ?? []).length;
  const digits = (text.match(/\d/g) ?? []).length;
  const punct = (text.match(/[^\w\s]/g) ?? []).length;
  const ratio = nonAscii / chars > 0.02 ? 3.3 : 4;
  return Math.round(chars / ratio + digits * 0.3 + punct * 0.2);
}
const CONTEXTS = [["GPT-4o / 4.1", 128000], ["Claude Sonnet", 200000], ["Gemini 2.5 Pro", 1000000], ["Llama 3.x", 128000], ["GPT-3.5 (legado)", 16000]] as const;
export function EstimadorDeTokens({ meta }: ToolProps) {
  const [text, setText] = useState("");
  const tokens = estimateTokens(text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <ToolShell meta={meta} examples={[{ label: "Texto de exemplo", onClick: () => setText("Modelos de linguagem processam texto em tokens, não em palavras. Em português, uma palavra costuma gerar 1,3 a 1,6 tokens, dependendo de acentos e sufixos. Por isso o custo de uma mesma tarefa em português é cerca de 30% maior que em inglês.") }]}>
      <Field label="Texto"><Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Cole seu prompt ou documento…" /></Field>
      <ResultPanel>
        <div className="grid grid-cols-3 gap-6">
          <BigNumber label="Tokens (estimado)" value={num(tokens, 0)} accent sub="±10%" />
          <BigNumber label="Palavras" value={num(words, 0)} />
          <BigNumber label="Tokens por palavra" value={words ? num(tokens / words, 2) : "—"} />
        </div>
        <div className="mt-6 space-y-3">{CONTEXTS.map(([m, ctx]) => <div key={m}><div className="mb-1 flex justify-between text-xs"><span className="font-medium">{m}</span><span className="font-mono text-muted">{num((tokens / ctx) * 100, 2)}% de {num(ctx / 1000, 0)}k</span></div><Bar value={tokens} max={ctx} tone="fg" /></div>)}</div>
        <Actions copy={`${tokens} tokens (estimado)`} onClear={() => setText("")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* --------------------------- Custo de API de IA --------------------------- */
const PRICES: { name: string; in: number; out: number }[] = [
  { name: "Modelo premium (referência)", in: 2.5, out: 10 },
  { name: "Modelo intermediário (referência)", in: 0.4, out: 1.6 },
  { name: "Modelo econômico (referência)", in: 0.1, out: 0.4 },
  { name: "Modelo aberto hospedado (referência)", in: 0.2, out: 0.6 },
];
export function CustoDeApiIa({ meta }: ToolProps) {
  const [model, setModel] = useState(0);
  const [pin, setPin] = useState(String(PRICES[0].in));
  const [pout, setPout] = useState(String(PRICES[0].out));
  const [tin, setTin] = useState("1500");
  const [tout, setTout] = useState("500");
  const [calls, setCalls] = useState("10000");
  const [cache, setCache] = useState("0");
  const [usd, setUsd] = useState("5.10");
  const n = (s: string) => Number(s.replace(",", ".")) || 0;
  const cacheDiscount = 1 - (n(cache) / 100) * 0.5;
  const perCall = (n(tin) / 1e6) * n(pin) * cacheDiscount + (n(tout) / 1e6) * n(pout);
  const monthly = perCall * n(calls);
  const invalid = n(pin) < 0 || n(pout) < 0;
  return (
    <ToolShell meta={meta} examples={[{ label: "Chatbot de suporte", onClick: () => { setTin("2000"); setTout("300"); setCalls("50000"); } }, { label: "Resumo de documentos", onClick: () => { setTin("8000"); setTout("600"); setCalls("2000"); } }]}>
      <Field label="Tabela de preço (edite livremente)"><Select value={model} onChange={(e) => { const i = Number(e.target.value); setModel(i); setPin(String(PRICES[i].in)); setPout(String(PRICES[i].out)); }}>{PRICES.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</Select></Field>
      <ToolGrid cols={4} className="mt-4">
        <Field label="US$ por 1M tokens (entrada)"><Input inputMode="decimal" value={pin} onChange={(e) => setPin(e.target.value)} /></Field>
        <Field label="US$ por 1M tokens (saída)"><Input inputMode="decimal" value={pout} onChange={(e) => setPout(e.target.value)} /></Field>
        <Field label="Tokens de entrada / chamada"><Input inputMode="numeric" value={tin} onChange={(e) => setTin(e.target.value)} /></Field>
        <Field label="Tokens de saída / chamada"><Input inputMode="numeric" value={tout} onChange={(e) => setTout(e.target.value)} /></Field>
        <Field label="Chamadas por mês"><Input inputMode="numeric" value={calls} onChange={(e) => setCalls(e.target.value)} /></Field>
        <Field label="% de entrada em cache" hint="Cache costuma custar 50%"><Input inputMode="numeric" suffix="%" value={cache} onChange={(e) => setCache(e.target.value)} /></Field>
        <Field label="Câmbio USD → BRL"><Input inputMode="decimal" value={usd} onChange={(e) => setUsd(e.target.value)} /></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Preços não podem ser negativos."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="Custo mensal" value={`US$ ${num(monthly, 2)}`} accent sub={`≈ R$ ${num(monthly * n(usd), 2)}`} />
            <BigNumber label="Por chamada" value={`US$ ${monthly && n(calls) ? (perCall).toFixed(5) : "0"}`} sub={`R$ ${(perCall * n(usd)).toFixed(4)}`} />
            <BigNumber label="Por 1.000 chamadas" value={`US$ ${num(perCall * 1000, 2)}`} />
          </div>
          <KV rows={[["Tokens de entrada / mês", num(n(tin) * n(calls), 0)], ["Tokens de saída / mês", num(n(tout) * n(calls), 0)], ["Participação da saída no custo", `${num(((n(tout) / 1e6) * n(pout) / Math.max(perCall, 1e-12)) * 100, 0)}%`], ["Custo anual", `US$ ${num(monthly * 12, 2)}`]]} />
          <Actions copy={`Custo mensal estimado: US$ ${num(monthly, 2)} (${n(calls)} chamadas, ${tin} in / ${tout} out tokens)`} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ---------------------------- Gerador de persona -------------------------- */
const P = {
  names: ["Ana Paula", "Bruno", "Camila", "Diego", "Fernanda", "Gustavo", "Helena", "Igor", "Juliana", "Lucas", "Mariana", "Rafael"],
  jobs: ["gerente de marketing", "dono(a) de pequena empresa", "desenvolvedor(a) pleno", "designer freelancer", "coordenador(a) de RH", "analista financeiro(a)", "professor(a)", "consultor(a) autônomo(a)", "gerente de produto", "vendedor(a) B2B"],
  goals: ["ganhar tempo em tarefas repetitivas", "aumentar receita sem contratar", "parecer mais profissional", "aprender rápido sem curso longo", "tomar decisões com dados", "reduzir custos fixos", "crescer na carreira"],
  pains: ["falta de tempo", "excesso de ferramentas desconectadas", "medo de errar em público", "orçamento apertado", "dificuldade de priorizar", "informação demais e pouca clareza", "resultados que não aparecem"],
  channels: ["LinkedIn", "YouTube", "newsletters", "podcasts", "Instagram", "grupos de WhatsApp", "busca no Google", "comunidades no Discord"],
  objections: ["'não tenho tempo para aprender outra coisa'", "'já tentei algo parecido e não funcionou'", "'é caro para o que entrega'", "'meu caso é diferente'", "'preciso convencer meu chefe'"],
  triggers: ["uma meta trimestral apertada", "uma promoção recente", "um concorrente que saiu na frente", "um erro que custou caro", "uma recomendação de colega"],
};
export function GeradorDePersona({ meta }: ToolProps) {
  const [niche, setNiche] = useState("app de finanças pessoais");
  const [age, setAge] = useState("25-34");
  const [seed, setSeed] = useState(0);
  const { pushPrompt } = useStore();
  const persona = useMemo(() => ({ name: pickR(P.names), age: age === "18-24" ? 18 + rand(7) : age === "25-34" ? 25 + rand(10) : age === "35-44" ? 35 + rand(10) : 45 + rand(15), job: pickR(P.jobs), goals: [pickR(P.goals), pickR(P.goals)], pains: [pickR(P.pains), pickR(P.pains), pickR(P.pains)], channels: [pickR(P.channels), pickR(P.channels), pickR(P.channels)], objection: pickR(P.objections), trigger: pickR(P.triggers) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [niche, age, seed]);
  const uniq = (a: string[]) => [...new Set(a)];
  const doc = `PERSONA — ${persona.name}, ${persona.age} anos\nProduto/nicho: ${niche}\nOcupação: ${persona.job}\n\nObjetivos:\n${uniq(persona.goals).map((g) => `- ${g}`).join("\n")}\n\nDores:\n${uniq(persona.pains).map((g) => `- ${g}`).join("\n")}\n\nOnde busca informação: ${uniq(persona.channels).join(", ")}\nGatilho de compra: ${persona.trigger}\nPrincipal objeção: ${persona.objection}\n\nComo falar com ${persona.name.split(" ")[0]}: direto, com exemplos concretos, mostrando resultado em menos de uma semana.`;
  const asPrompt = `Considere a persona abaixo como o público-alvo de tudo que você escrever nesta conversa.\n\n${doc}`;
  return (
    <ToolShell meta={meta}>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Field label="Produto ou nicho"><Input value={niche} onChange={(e) => setNiche(e.target.value)} /></Field>
        <Field label="Faixa etária"><Segmented value={age} onChange={setAge} options={["18-24", "25-34", "35-44", "45+"].map((a) => ({ value: a, label: a }))} /></Field>
        <Button onClick={() => setSeed((s) => s + 1)}><RefreshCw className="h-3.5 w-3.5" /> Nova persona</Button>
      </div>
      <ResultPanel>
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div className="border border-strong p-5">
            <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center bg-fg font-display text-2xl font-bold text-bg">{persona.name[0]}</div><div><div className="font-display text-xl font-bold">{persona.name}, {persona.age}</div><div className="text-sm text-muted">{persona.job}</div></div></div>
            <KV rows={[["Objetivos", uniq(persona.goals).join("; ")], ["Dores", uniq(persona.pains).join("; ")], ["Canais", uniq(persona.channels).join(", ")], ["Gatilho", persona.trigger], ["Objeção", persona.objection]]} />
          </div>
          <OutputArea value={doc} rows={16} mono={false} />
        </div>
        <Actions copy={doc} extra={<><CopyButton text={asPrompt} label="Copiar como prompt" /><Button size="sm" variant="ghost" onClick={() => pushPrompt(`Persona: ${persona.name}`, asPrompt)}>Salvar no histórico</Button></>} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Roteiro de vídeo ---------------------------- */
export function RoteiroDeVideo({ meta }: ToolProps) {
  const [tema, setTema] = useState("erros ao começar a investir");
  const [dur, setDur] = useState("60");
  const [fmt, setFmt] = useState<"short" | "long">("short");
  const [seed, setSeed] = useState(0);
  const d = Math.max(15, Number(dur) || 60);
  const blocks = useMemo(() => {
    const hooks = [`Você está cometendo este erro com ${tema} e nem percebe.`, `Ninguém te contou isso sobre ${tema}.`, `Eu perdi tempo com ${tema} até descobrir isto.`, `3 coisas sobre ${tema} que mudam tudo.`, `Se você quer ${tema} funcionando, para tudo e ouve isso.`];
    const parts = fmt === "short" ? [["Gancho", 0.08, pickR(hooks)], ["Contexto", 0.15, `Em uma frase: por que ${tema} importa para quem está assistindo.`], ["Ponto 1", 0.22, "Primeiro erro/ideia + exemplo concreto de 1 frase."], ["Ponto 2", 0.22, "Segundo ponto, com contraste ('a maioria faz X, o certo é Y')."], ["Ponto 3", 0.21, "Terceiro ponto, o mais surpreendente. Guarde o melhor para o fim."], ["CTA", 0.12, "Uma ação só: 'salva para não esquecer' ou 'comenta qual você já fez'."]] : [["Cold open", 0.05, pickR(hooks)], ["Promessa", 0.07, `O que a pessoa vai saber fazer ao final do vídeo sobre ${tema}.`], ["Seção 1", 0.2, "Contexto e o erro mais comum. Termine abrindo curiosidade para a próxima seção."], ["Seção 2", 0.22, "Método/passo a passo com exemplo na tela."], ["Seção 3", 0.22, "Caso real ou demonstração. Números e antes/depois."], ["Recap", 0.1, "Três frases que resumem os pontos."], ["CTA", 0.14, "Próximo vídeo relacionado + pedido único."]];
    return parts.map(([name, p, text]) => ({ name: name as string, secs: Math.round(d * (p as number)), words: Math.round(d * (p as number) * 2.3), text: text as string }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema, d, fmt, seed]);
  const out = blocks.map((b) => `[${b.name} · ${b.secs}s · ~${b.words} palavras]\n${b.text}`).join("\n\n");
  return (
    <ToolShell meta={meta}>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto_auto] sm:items-end">
        <Field label="Tema"><Input value={tema} onChange={(e) => setTema(e.target.value)} /></Field>
        <Field label="Duração"><Input inputMode="numeric" suffix="s" value={dur} onChange={(e) => setDur(e.target.value)} /></Field>
        <Field label="Formato"><Segmented value={fmt} onChange={(v) => { setFmt(v); setDur(v === "short" ? "60" : "600"); }} options={[{ value: "short", label: "Curto" }, { value: "long", label: "Longo" }]} /></Field>
        <Button onClick={() => setSeed((s) => s + 1)}><RefreshCw className="h-3.5 w-3.5" /> Outro gancho</Button>
      </div>
      <ResultPanel title={`Estrutura · ${d}s · ~${Math.round(d * 2.3)} palavras faladas`}>
        <div className="flex h-3 w-full overflow-hidden border border-line">{blocks.map((b, i) => <div key={b.name} title={b.name} className={i % 2 ? "bg-fg" : "bg-accent"} style={{ width: `${(b.secs / d) * 100}%` }} />)}</div>
        <ol className="mt-4 divide-y divide-[var(--line)] border-y border-line">{blocks.map((b) => <li key={b.name} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]"><div><div className="font-medium">{b.name}</div><div className="font-mono text-xs text-muted">{b.secs}s · ~{b.words} palavras</div></div><p className="text-sm text-muted">{b.text}</p></li>)}</ol>
        <Actions copy={out} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ----------------------------- Post LinkedIn ------------------------------ */
export function PostLinkedin({ meta }: ToolProps) {
  const [tema, setTema] = useState("fui demitido e recomecei como freelancer");
  const [licao, setLicao] = useState("planeje o caixa antes de precisar dele");
  const [fmt, setFmt] = useState<"historia" | "lista" | "contrarian" | "bastidores">("historia");
  const post = useMemo(() => {
    const L = licao.trim() || "a lição principal";
    const T = tema.trim() || "o tema";
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    if (fmt === "historia") return `${cap(T)}.\n\nNão foi bonito. Mas foi o melhor que me aconteceu.\n\nNa época, eu achava que tinha tudo sob controle.\nTinha um plano. Tinha rotina. Tinha certeza.\n\nAí a certeza acabou.\n\nO que veio depois me ensinou mais do que os cinco anos anteriores:\n\n→ ${cap(L)}.\n→ Ninguém vem te salvar — e isso é libertador.\n→ O medo diminui quando você faz a conta.\n\nHoje, olho para trás e vejo que o pior dia foi o primeiro de uma fase melhor.\n\nSe você está passando por algo parecido: ${L}.\n\nE você, qual foi a virada que parecia o fim?\n\n#carreira #recomeço #aprendizado`;
    if (fmt === "lista") return `${cap(T)}: 5 coisas que eu faria diferente.\n\n1. ${cap(L)}.\n2. Falar com 10 pessoas antes de decidir sozinho.\n3. Escrever o plano B no mesmo dia do plano A.\n4. Medir semanalmente, não mensalmente.\n5. Pedir ajuda antes de precisar.\n\nSe eu tivesse feito só a primeira, já teria mudado tudo.\n\nQual dessas você já aprendeu na prática?\n\n#carreira #lições #produtividade`;
    if (fmt === "contrarian") return `Opinião impopular sobre ${T}:\n\nA maioria dos conselhos está errada.\n\nDizem para "seguir a paixão", "networking", "se reinventar".\n\nO que funcionou de verdade foi mais simples e menos glamouroso:\n\n${cap(L)}.\n\nSó isso. Sem frase de efeito.\n\nO resto é consequência.\n\nDiscorda? Me conta nos comentários.\n\n#carreira #opinião #trabalho`;
    return `Bastidores de ${T}.\n\nO que ninguém posta:\n\n• As 3 semanas sem resposta.\n• A planilha que não fechava.\n• A conversa difícil que adiei.\n\nO que salvou: ${L}.\n\nCompartilho porque, quando eu estava no meio disso, só via os posts de vitória.\n\nSe você está no meio do processo: continua. Faz a conta. ${cap(L)}.\n\n#bastidores #carreira #realidade`;
  }, [tema, licao, fmt]);
  return (
    <ToolShell meta={meta}>
      <ToolGrid>
        <Field label="Tema / história em uma frase"><Input value={tema} onChange={(e) => setTema(e.target.value)} /></Field>
        <Field label="Lição principal"><Input value={licao} onChange={(e) => setLicao(e.target.value)} /></Field>
      </ToolGrid>
      <div className="mt-4"><Segmented value={fmt} onChange={setFmt} options={[{ value: "historia", label: "História" }, { value: "lista", label: "Lista" }, { value: "contrarian", label: "Contrarian" }, { value: "bastidores", label: "Bastidores" }]} /></div>
      <ResultPanel title={`Post · ${post.length} caracteres`}>
        <div className="grid gap-6 md:grid-cols-2">
          <OutputArea value={post} rows={18} mono={false} />
          <div className="border border-line p-4"><div className="mb-3 flex items-center gap-3"><div className="h-10 w-10 bg-fg" /><div><div className="text-sm font-semibold">Seu nome</div><div className="text-xs text-muted">Seu cargo · 1h</div></div></div><pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{post}</pre></div>
        </div>
        <Bar value={post.length} max={3000} className="mt-4" tone={post.length > 1800 ? "amber" : "fg"} />
        <Actions copy={post} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ------------------------- Analisador de legibilidade --------------------- */
export function AnalisadorDeLegibilidade({ meta }: ToolProps) {
  const [text, setText] = useState("");
  const r = useMemo(() => {
    const sents = sentences(text);
    const words = tokenize(text);
    const syl = words.reduce((a, w) => a + syllables(w), 0);
    const W = words.length, S = Math.max(1, sents.length);
    const flesch = W ? 248.835 - 1.015 * (W / S) - 84.6 * (syl / W) : 0;
    const long = sents.filter((s) => tokenize(s).length > 25).length;
    const complex = words.filter((w) => syllables(w) >= 4).length;
    const level = flesch >= 75 ? "Muito fácil" : flesch >= 50 ? "Fácil" : flesch >= 25 ? "Difícil" : "Muito difícil";
    return { flesch: Math.max(0, Math.min(100, flesch)), W, S: sents.length, avgS: W / S, avgSyl: W ? syl / W : 0, long, complex, level };
  }, [text]);
  return (
    <ToolShell meta={meta} examples={[{ label: "Texto simples", onClick: () => setText("Ler é fácil quando as frases são curtas. Cada ideia tem seu lugar. O leitor não se perde. Ele segue em frente.") }, { label: "Texto complexo", onClick: () => setText("A implementação de metodologias organizacionais fundamentadas em paradigmas de governança contemporâneos pressupõe, invariavelmente, a internalização de competências multidisciplinares cuja operacionalização demanda reconfigurações estruturais significativas.") }]}>
      <Field label="Texto"><Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} /></Field>
      {text.trim() && (
        <ResultPanel>
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div><BigNumber label="Índice Flesch (pt-BR)" value={num(r.flesch, 0)} accent sub={r.level} /><Bar value={r.flesch} className="mt-3" tone={r.flesch < 25 ? "red" : r.flesch < 50 ? "amber" : "mint"} /></div>
            <KV rows={[["Palavras por frase", `${num(r.avgS, 1)} ${r.avgS > 20 ? "(longo)" : ""}`], ["Sílabas por palavra", num(r.avgSyl, 2)], ["Frases com +25 palavras", `${r.long} de ${r.S}`], ["Palavras com 4+ sílabas", `${r.complex} (${num((r.complex / Math.max(1, r.W)) * 100, 0)}%)`]]} />
          </div>
          <div className="mt-4 border-l-2 border-accent pl-4 text-sm text-muted">{r.avgS > 20 ? "Quebre frases longas em duas. " : ""}{r.complex / Math.max(1, r.W) > 0.15 ? "Troque palavras longas por sinônimos curtos. " : ""}{r.flesch >= 60 ? "Boa legibilidade para web." : "Para web, mire 60 ou mais."}</div>
          <Actions copy={`Flesch ${num(r.flesch, 0)} (${r.level}) · ${num(r.avgS, 1)} palavras/frase`} onClear={() => setText("")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ------------------------------ Detector de tom --------------------------- */
const LEX = {
  formal: "prezado cordialmente atenciosamente solicito informamos conforme mediante referente outrossim salientamos encaminhamos vossa senhoria agradecemos".split(" "),
  informal: "oi olá valeu beleza cara galera tipo né tá pra kkk haha show massa top demais mano".split(" "),
  positive: "ótimo excelente parabéns sucesso feliz obrigado incrível adorei perfeito conquista melhor maravilhoso".split(" "),
  negative: "problema erro infelizmente falha atraso ruim péssimo reclamação cancelar prejuízo impossível nunca".split(" "),
  urgent: "urgente imediatamente hoje agora prazo último vence rápido já atenção importante crítico".split(" "),
  confident: "garantimos certamente sem dúvida comprovado sabemos definitivamente claramente".split(" "),
};
export function DetectorDeTom({ meta }: ToolProps) {
  const [text, setText] = useState("");
  const [showTips, setShowTips] = useState(true);
  const r = useMemo(() => {
    const toks = tokenize(text);
    const n = Math.max(1, toks.length);
    const count = (list: string[]) => toks.filter((t) => list.includes(t)).length;
    const emojis = (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;
    const excl = (text.match(/!/g) ?? []).length;
    const formal = count(LEX.formal), informal = count(LEX.informal) + emojis;
    const pos = count(LEX.positive), neg = count(LEX.negative);
    const urg = count(LEX.urgent) + excl;
    const conf = count(LEX.confident);
    const sc = (v: number, k = 8) => Math.min(100, Math.round((v / n) * 100 * k));
    return { formality: formal + informal ? Math.round((formal / (formal + informal)) * 100) : 50, sentiment: pos + neg ? Math.round((pos / (pos + neg)) * 100) : 50, urgency: sc(urg), confidence: sc(conf, 10), stop: toks.filter((t) => STOPWORDS.has(t)).length / n };
  }, [text]);
  return (
    <ToolShell meta={meta} examples={[{ label: "E-mail de cobrança", onClick: () => setText("Prezado cliente, informamos que a fatura referente ao mês anterior vence hoje. Solicitamos o pagamento imediato para evitar juros. Atenciosamente, Financeiro.") }, { label: "Mensagem informal", onClick: () => setText("Oi galera! Valeu demais pelo feedback, ficou incrível 🙌 Amanhã a gente lança a nova versão, tá?") }]}>
      <Field label="Texto"><Textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} /></Field>
      <div className="mt-3 max-w-xs"><Toggle checked={showTips} onChange={setShowTips} label="Mostrar sugestões" /></div>
      {text.trim() && (
        <ResultPanel>
          <div className="grid gap-5 sm:grid-cols-2">
            {[["Formalidade", r.formality, "informal", "formal"], ["Sentimento", r.sentiment, "negativo", "positivo"], ["Urgência", r.urgency, "baixa", "alta"], ["Confiança", r.confidence, "neutra", "assertiva"]].map(([l, v, a, b]) => <div key={l as string}><div className="mb-1 flex items-center justify-between text-xs"><span className="font-medium">{l as string}</span><span className="font-mono text-muted">{v as number}</span></div><Bar value={v as number} tone="fg" /><div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-subtle"><span>{a as string}</span><span>{b as string}</span></div></div>)}
          </div>
          {showTips && <ul className="mt-5 space-y-1 border-l-2 border-accent pl-4 text-sm text-muted">{r.urgency > 40 && <li>Urgência alta: confira se o prazo é real; excesso de '!' reduz credibilidade.</li>}{r.formality < 30 && <li>Tom bem informal: adequado para redes; evite em comunicação com clientes novos.</li>}{r.formality > 80 && <li>Muito formal: considere frases mais curtas e diretas.</li>}{r.sentiment < 35 && <li>Predomínio negativo: termine com um próximo passo positivo.</li>}{r.confidence > 50 && <li>Assertividade alta: sustente afirmações com dados.</li>}{r.urgency <= 40 && r.formality >= 30 && r.formality <= 80 && r.sentiment >= 35 && <li>Tom equilibrado. Nada a ajustar por heurística.</li>}</ul>}
          <Actions copy={`Formalidade ${r.formality} · Sentimento ${r.sentiment} · Urgência ${r.urgency} · Confiança ${r.confidence}`} onClear={() => setText("")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}
