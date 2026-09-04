import { useMemo, useState } from "react";
import { formatNumber, slugify } from "@/lib/utils";
import { Button, Field, Input, Segmented, Select, Textarea, Toggle } from "@/components/ui/primitives";
import { Actions, Bar, BigNumber, KV, OutputArea, ResultPanel, ToolGrid, ToolShell } from "./ToolShell";
import type { ToolProps } from "./calculators";

export const STOPWORDS = new Set("a o e é de da do das dos em um uma uns umas para por com sem sob sobre que se não na no nas nos ao aos à às as os ou mas mais menos como quando onde qual quais quem cujo cuja isso isto aquilo este esta esse essa ele ela eles elas eu tu você vocês nós seu sua seus suas meu minha teu tua nosso nossa dele dela deles delas lhe lhes me te nos vos foi era ser está estão são tem têm há já também muito muita muitos muitas pouco pouca todo toda todos todas outro outra outros outras mesmo mesma até então porque pois assim ainda depois antes entre contra desde durante the and of to in is it for on with as at by an be this that from or are".split(" "));

const SAMPLE = "A inteligência artificial deixou de ser promessa e passou a ser rotina. Ferramentas que antes exigiam equipes inteiras hoje cabem em uma aba do navegador. Mas a pergunta que importa não é o que a tecnologia pode fazer, e sim o que vale a pena fazer com ela. Escolher bem é a nova habilidade essencial.";

export function tokenize(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, " ").split(/\s+/).filter((w) => w.length > 1);
}
export function sentences(text: string) {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9"“])/).map((s) => s.trim()).filter(Boolean);
}
export function syllables(word: string) {
  const m = word.toLowerCase().match(/[aeiouáéíóúâêôãõàü]+/g);
  return m ? m.length : 1;
}

function TextInput({ value, onChange, rows = 8, label = "Texto" }: { value: string; onChange: (v: string) => void; rows?: number; label?: string }) {
  return <Field label={label}><Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder="Cole ou digite seu texto aqui…" /></Field>;
}

/* --------------------------- Contador de palavras ------------------------- */
export function ContadorDePalavras({ meta }: ToolProps) {
  const [text, setText] = useState(SAMPLE);
  const s = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = Array.from(text).length;
    const noSpaces = Array.from(text.replace(/\s/g, "")).length;
    const sents = text.trim() ? sentences(text).length : 0;
    const paras = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const freq = new Map<string, number>();
    tokenize(text).filter((w) => !STOPWORDS.has(w)).forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { words, chars, noSpaces, sents, paras, top, avgWord: words ? noSpaces / words : 0, avgSent: sents ? words / sents : 0 };
  }, [text]);
  return (
    <ToolShell meta={meta} examples={[{ label: "Texto de exemplo", onClick: () => setText(SAMPLE) }]}>
      <TextInput value={text} onChange={setText} />
      <ResultPanel title="Estatísticas">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <BigNumber label="Palavras" value={formatNumber(s.words, 0)} accent />
          <BigNumber label="Caracteres" value={formatNumber(s.chars, 0)} sub={`${formatNumber(s.noSpaces, 0)} sem espaços`} />
          <BigNumber label="Frases" value={formatNumber(s.sents, 0)} />
          <BigNumber label="Parágrafos" value={formatNumber(s.paras, 0)} />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <KV rows={[["Tempo de leitura", `${Math.max(1, Math.ceil(s.words / 200))} min`], ["Tempo de fala", `${Math.max(1, Math.ceil(s.words / 130))} min`], ["Média de letras por palavra", formatNumber(s.avgWord, 1)], ["Média de palavras por frase", formatNumber(s.avgSent, 1)]]} />
          <div>
            <div className="eyebrow mb-2">Palavras mais frequentes</div>
            <ul className="space-y-1.5">{s.top.map(([w, c]) => <li key={w} className="flex items-center gap-3 text-sm"><span className="w-28 truncate font-medium">{w}</span><Bar value={c} max={s.top[0]?.[1] ?? 1} className="flex-1" tone="fg" /><span className="w-6 text-right font-mono text-xs text-muted">{c}</span></li>)}</ul>
          </div>
        </div>
        <Actions copy={`${s.words} palavras, ${s.chars} caracteres, ${s.sents} frases, ${s.paras} parágrafos`} onClear={() => setText("")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* -------------------------- Contador de caracteres ------------------------ */
const LIMITS = [["Título SEO", 60], ["Meta description", 160], ["X / Twitter", 280], ["Bio do Instagram", 150], ["Legenda do Instagram", 2200], ["Post do LinkedIn", 3000], ["SMS", 160], ["Título do YouTube", 100]] as const;
export function ContadorDeCaracteres({ meta }: ToolProps) {
  const [text, setText] = useState("");
  const chars = Array.from(text).length;
  const noSpaces = Array.from(text.replace(/\s/g, "")).length;
  const lines = text ? text.split("\n").length : 0;
  return (
    <ToolShell meta={meta} examples={[{ label: "Exemplo de meta description", onClick: () => setText("Ferramentas online gratuitas, calculadoras, conversores e central de prompts de IA. Tudo direto no navegador, sem cadastro.") }]}>
      <TextInput value={text} onChange={setText} rows={6} />
      <ResultPanel>
        <div className="grid grid-cols-3 gap-6">
          <BigNumber label="Caracteres" value={formatNumber(chars, 0)} accent />
          <BigNumber label="Sem espaços" value={formatNumber(noSpaces, 0)} />
          <BigNumber label="Linhas" value={formatNumber(lines, 0)} />
        </div>
        <div className="mt-6 space-y-3">
          {LIMITS.map(([name, max]) => {
            const left = max - chars;
            return (
              <div key={name}>
                <div className="mb-1 flex items-center justify-between text-xs"><span className="font-medium">{name}</span><span className={`font-mono ${left < 0 ? "text-red-600" : "text-muted"}`}>{chars}/{max} {left < 0 ? `(${Math.abs(left)} a mais)` : ""}</span></div>
                <Bar value={chars} max={max} tone={left < 0 ? "red" : chars / max > 0.85 ? "amber" : "fg"} />
              </div>
            );
          })}
        </div>
        <Actions copy={`${chars} caracteres (${noSpaces} sem espaços)`} onClear={() => setText("")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Maiúsculas/minúsculas ----------------------- */
const CASES: Record<string, (s: string) => string> = {
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
  title: (s) => s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (m) => m.toUpperCase()),
  sentence: (s) => s.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toUpperCase()),
  camel: (s) => slugify(s).split("-").map((w, i) => (i ? w[0]?.toUpperCase() + w.slice(1) : w)).join(""),
  pascal: (s) => slugify(s).split("-").map((w) => (w[0]?.toUpperCase() ?? "") + w.slice(1)).join(""),
  snake: (s) => slugify(s).replace(/-/g, "_"),
  kebab: (s) => slugify(s),
  alternate: (s) => Array.from(s).map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(""),
  invert: (s) => Array.from(s).map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(""),
};
const CASE_LABELS: Record<string, string> = { upper: "MAIÚSCULAS", lower: "minúsculas", title: "Título Em Cada Palavra", sentence: "Frase normal", camel: "camelCase", pascal: "PascalCase", snake: "snake_case", kebab: "kebab-case", alternate: "aLtErNaDo", invert: "iNVERTER cAIXA" };
export function MaiusculasMinusculas({ meta }: ToolProps) {
  const [text, setText] = useState("olá mundo da inteligência artificial");
  const [mode, setMode] = useState("title");
  const out = CASES[mode](text);
  return (
    <ToolShell meta={meta}>
      <TextInput value={text} onChange={setText} rows={4} />
      <div className="mt-4 flex flex-wrap gap-1.5">{Object.keys(CASES).map((k) => <button key={k} onClick={() => setMode(k)} className={`border px-2.5 py-1.5 text-xs transition-colors ${mode === k ? "border-fg bg-fg text-bg" : "border-line hover:border-strong"}`}>{CASE_LABELS[k]}</button>)}</div>
      <ResultPanel><OutputArea value={out} rows={4} mono={["camel", "pascal", "snake", "kebab"].includes(mode)} /><Actions copy={out} onClear={() => setText("")} extra={<Button size="sm" variant="ghost" onClick={() => setText(out)}>Usar como entrada</Button>} /></ResultPanel>
    </ToolShell>
  );
}

/* ------------------------------- Limpar texto ----------------------------- */
export function LimparTexto({ meta }: ToolProps) {
  const [text, setText] = useState("Texto   colado  de um PDF\ncom quebras\nde linha estranhas.\n\n\n\nE   espaços    duplicados. <b>HTML</b> também.");
  const [o, setO] = useState({ spaces: true, blank: true, breaks: false, trim: true, accents: false, numbers: false, punct: false, html: true });
  const out = useMemo(() => {
    let t = text;
    if (o.html) t = t.replace(/<[^>]*>/g, "");
    if (o.breaks) t = t.replace(/\n+/g, " ");
    if (o.blank) t = t.replace(/\n\s*\n+/g, "\n\n");
    if (o.spaces) t = t.replace(/[ \t]{2,}/g, " ");
    if (o.accents) t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (o.numbers) t = t.replace(/\d+/g, "");
    if (o.punct) t = t.replace(/[.,;:!?"'()[\]{}«»“”‘’—–-]/g, "");
    if (o.trim) t = t.split("\n").map((l) => l.trim()).join("\n").trim();
    return t;
  }, [text, o]);
  const T = (k: keyof typeof o, label: string) => <Toggle checked={o[k]} onChange={(v) => setO((p) => ({ ...p, [k]: v }))} label={label} />;
  return (
    <ToolShell meta={meta}>
      <ToolGrid>
        <TextInput value={text} onChange={setText} rows={9} label="Original" />
        <Field label="Resultado"><OutputArea value={out} rows={9} mono={false} /></Field>
      </ToolGrid>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{T("spaces", "Espaços duplicados")}{T("blank", "Linhas em branco extras")}{T("breaks", "Todas as quebras de linha")}{T("trim", "Espaços nas pontas")}{T("html", "Remover HTML")}{T("accents", "Remover acentos")}{T("numbers", "Remover números")}{T("punct", "Remover pontuação")}</div>
      <Actions copy={out} onClear={() => setText("")} />
      <p className="mt-3 font-mono text-xs text-subtle">{text.length} → {out.length} caracteres</p>
    </ToolShell>
  );
}

/* ------------------------------ Inverter texto ---------------------------- */
export function InverterTexto({ meta }: ToolProps) {
  const [text, setText] = useState("A grama é amarga");
  const [mode, setMode] = useState<"chars" | "words" | "lines">("chars");
  const out = mode === "chars" ? Array.from(text).reverse().join("") : mode === "words" ? text.split(/\s+/).reverse().join(" ") : text.split("\n").reverse().join("\n");
  const norm = text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const palindrome = norm.length > 1 && norm === Array.from(norm).reverse().join("");
  return (
    <ToolShell meta={meta} examples={[{ label: "Palíndromo", onClick: () => setText("A grama é amarga") }, { label: "Frase", onClick: () => setText("um dois três quatro") }]}>
      <TextInput value={text} onChange={setText} rows={4} />
      <div className="mt-4"><Segmented value={mode} onChange={setMode} options={[{ value: "chars", label: "Caracteres" }, { value: "words", label: "Palavras" }, { value: "lines", label: "Linhas" }]} /></div>
      <ResultPanel>
        <OutputArea value={out} rows={4} mono={false} />
        {palindrome && <p className="mt-3 text-sm text-mint">✓ Este texto é um palíndromo.</p>}
        <Actions copy={out} onClear={() => setText("")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ------------------------------ Gerador de slug --------------------------- */
export function GeradorDeSlug({ meta }: ToolProps) {
  const [text, setText] = useState("Guia Completo de IA em 2026: o que muda para você");
  const [stop, setStop] = useState(false);
  const [sep, setSep] = useState("-");
  const [max, setMax] = useState("");
  let slug = slugify(text);
  if (stop) slug = slug.split("-").filter((w) => !STOPWORDS.has(w)).join("-");
  if (max && Number(max) > 0) slug = slug.slice(0, Number(max)).replace(/-+$/, "");
  slug = slug.replace(/-/g, sep);
  return (
    <ToolShell meta={meta}>
      <TextInput value={text} onChange={setText} rows={3} label="Título" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Toggle checked={stop} onChange={setStop} label="Remover stopwords (de, o, a…)" />
        <Field label="Separador"><Select value={sep} onChange={(e) => setSep(e.target.value)}><option value="-">hífen (-)</option><option value="_">underline (_)</option></Select></Field>
        <Field label="Tamanho máximo"><Input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="sem limite" /></Field>
      </div>
      <ResultPanel>
        <BigNumber value={<span className="break-all font-mono text-xl sm:text-2xl">{slug || "—"}</span>} accent sub={`${slug.length} caracteres · ${slug ? slug.split(/[-_]/).length : 0} palavras`} />
        <Actions copy={slug} onClear={() => setText("")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ------------------------------- Lorem ipsum ------------------------------ */
const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");
const PT = "o design editorial organiza informação densa com hierarquia clara e ritmo visual consistente cada decisão de tipografia espaço e cor comunica antes mesmo da leitura do texto interfaces que respeitam esses princípios parecem mais confiáveis e são mais fáceis de usar em qualquer dispositivo a boa composição não chama atenção para si ela desaparece e deixa o conteúdo falar".split(" ");
export function LoremIpsum({ meta }: ToolProps) {
  const [n, setN] = useState("3");
  const [unit, setUnit] = useState<"p" | "s" | "w">("p");
  const [lang, setLang] = useState<"la" | "pt">("la");
  const [start, setStart] = useState(true);
  const [seed, setSeed] = useState(1);
  const out = useMemo(() => {
    const bank = lang === "la" ? LOREM : PT;
    let s = seed * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const sentence = () => { const len = 8 + Math.floor(rnd() * 10); const ws = Array.from({ length: len }, () => bank[Math.floor(rnd() * bank.length)]); return ws.join(" ").replace(/^\w/u, (c) => c.toUpperCase()).replace(/^./u, (c) => c.toUpperCase()) + "."; };
    const para = () => Array.from({ length: 4 + Math.floor(rnd() * 3) }, sentence).join(" ");
    const count = Math.max(1, Math.min(100, Number(n) || 1));
    let res = unit === "p" ? Array.from({ length: count }, para).join("\n\n") : unit === "s" ? Array.from({ length: count }, sentence).join(" ") : Array.from({ length: count }, () => bank[Math.floor(rnd() * bank.length)]).join(" ");
    if (start && lang === "la" && unit !== "w") res = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + res.replace(/^[^.]*\.\s*/, "");
    return res;
  }, [n, unit, lang, start, seed]);
  return (
    <ToolShell meta={meta}>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Quantidade"><Input inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} /></Field>
        <Field label="Unidade"><Select value={unit} onChange={(e) => setUnit(e.target.value as "p")}><option value="p">Parágrafos</option><option value="s">Frases</option><option value="w">Palavras</option></Select></Field>
        <Field label="Idioma"><Select value={lang} onChange={(e) => setLang(e.target.value as "la")}><option value="la">Latim clássico</option><option value="pt">Português</option></Select></Field>
        <div className="pt-6"><Toggle checked={start} onChange={setStart} label="Começar com 'Lorem ipsum'" /></div>
      </div>
      <ResultPanel><OutputArea value={out} rows={10} mono={false} /><Actions copy={out} extra={<Button size="sm" variant="ghost" onClick={() => setSeed((x) => x + 1)}>Gerar outro</Button>} /></ResultPanel>
    </ToolShell>
  );
}

/* --------------------------- Extrair e-mails/URLs ------------------------- */
export function ExtrairEmailsUrls({ meta }: ToolProps) {
  const [text, setText] = useState("Fale com ana@empresa.com ou joao.silva@exemplo.com.br. Site: https://nexo.app e www.exemplo.org/blog. Tel (11) 99999-1234 · 21 3333-4444. #ia #tecnologia @nexo");
  const [type, setType] = useState<"email" | "url" | "phone" | "hashtag" | "mention">("email");
  const RE = { email: /[\w.+-]+@[\w-]+\.[\w.-]+/g, url: /(?:https?:\/\/|www\.)[^\s<>"')]+/g, phone: /(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g, hashtag: /#[\p{L}\p{N}_]+/gu, mention: /@[\w.]+/g };
  const found = [...new Set((text.match(RE[type]) ?? []).map((s) => s.trim()))].sort();
  return (
    <ToolShell meta={meta}>
      <TextInput value={text} onChange={setText} rows={6} />
      <div className="mt-4"><Segmented value={type} onChange={setType} options={[{ value: "email", label: "E-mails" }, { value: "url", label: "URLs" }, { value: "phone", label: "Telefones" }, { value: "hashtag", label: "Hashtags" }, { value: "mention", label: "Menções" }]} /></div>
      <ResultPanel title={`${found.length} encontrado(s)`}>
        <OutputArea value={found.join("\n")} rows={6} />
        <Actions copy={found.join("\n")} onClear={() => setText("")} extra={<Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(found.join(", "))}>Copiar como CSV</Button>} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ------------------------------ Ordenar linhas ---------------------------- */
export function OrdenarLinhas({ meta }: ToolProps) {
  const [text, setText] = useState("banana\nabacaxi\nManga\nuva\nbanana\n\nlaranja\n10\n9\n2");
  const [mode, setMode] = useState("az");
  const [dedupe, setDedupe] = useState(true);
  const [empty, setEmpty] = useState(true);
  const [ci, setCi] = useState(true);
  const out = useMemo(() => {
    let lines = text.split("\n");
    if (empty) lines = lines.filter((l) => l.trim());
    if (dedupe) { const seen = new Set<string>(); lines = lines.filter((l) => { const k = ci ? l.toLowerCase() : l; if (seen.has(k)) return false; seen.add(k); return true; }); }
    const cmp = (a: string, b: string) => a.localeCompare(b, "pt-BR", { sensitivity: ci ? "base" : "variant", numeric: true });
    if (mode === "az") lines.sort(cmp);
    else if (mode === "za") lines.sort((a, b) => cmp(b, a));
    else if (mode === "num") lines.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
    else if (mode === "len") lines.sort((a, b) => a.length - b.length);
    else if (mode === "rev") lines.reverse();
    else if (mode === "shuf") { for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j], lines[i]]; } }
    return lines.join("\n");
  }, [text, mode, dedupe, empty, ci]);
  return (
    <ToolShell meta={meta}>
      <ToolGrid>
        <TextInput value={text} onChange={setText} rows={9} label="Linhas" />
        <Field label="Resultado"><OutputArea value={out} rows={9} mono={false} /></Field>
      </ToolGrid>
      <div className="mt-4 grid gap-3 lg:grid-cols-[auto_1fr]">
        <Field label="Ordenação"><Select value={mode} onChange={(e) => setMode(e.target.value)}><option value="az">A → Z</option><option value="za">Z → A</option><option value="num">Numérica</option><option value="len">Por tamanho</option><option value="rev">Inverter ordem</option><option value="shuf">Embaralhar</option><option value="none">Manter</option></Select></Field>
        <div className="grid gap-2 sm:grid-cols-3 lg:pt-6"><Toggle checked={dedupe} onChange={setDedupe} label="Remover duplicadas" /><Toggle checked={empty} onChange={setEmpty} label="Remover vazias" /><Toggle checked={ci} onChange={setCi} label="Ignorar maiúsculas" /></div>
      </div>
      <Actions copy={out} onClear={() => setText("")} />
      <p className="mt-3 font-mono text-xs text-subtle">{text.split("\n").length} → {out ? out.split("\n").length : 0} linhas</p>
    </ToolShell>
  );
}

/* --------------------------- Frequência de palavras ----------------------- */
export function FrequenciaDePalavras({ meta }: ToolProps) {
  const [text, setText] = useState(SAMPLE + " " + SAMPLE.replace("inteligência artificial", "IA"));
  const [ignore, setIgnore] = useState(true);
  const [ngram, setNgram] = useState<"1" | "2" | "3">("1");
  const data = useMemo(() => {
    const toks = tokenize(text).filter((w) => !ignore || !STOPWORDS.has(w));
    const n = Number(ngram);
    const grams: string[] = [];
    for (let i = 0; i + n <= toks.length; i++) grams.push(toks.slice(i, i + n).join(" "));
    const freq = new Map<string, number>();
    grams.forEach((g) => freq.set(g, (freq.get(g) ?? 0) + 1));
    const total = tokenize(text).length;
    return { rows: [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30), total, unique: freq.size };
  }, [text, ignore, ngram]);
  return (
    <ToolShell meta={meta}>
      <TextInput value={text} onChange={setText} rows={7} />
      <div className="mt-4 flex flex-wrap items-center gap-3"><Segmented value={ngram} onChange={setNgram} options={[{ value: "1", label: "Palavras" }, { value: "2", label: "Bigramas" }, { value: "3", label: "Trigramas" }]} /><div className="w-56"><Toggle checked={ignore} onChange={setIgnore} label="Ignorar stopwords" /></div></div>
      <ResultPanel title={`${data.unique} termos únicos · ${data.total} palavras`}>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-strong text-left text-xs uppercase tracking-wider text-muted"><th className="py-2 pr-3 font-medium">#</th><th className="py-2 pr-3 font-medium">Termo</th><th className="py-2 pr-3 font-medium">Ocorrências</th><th className="py-2 font-medium">Densidade</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{data.rows.map(([w, c], i) => <tr key={w}><td className="py-1.5 pr-3 font-mono text-xs text-subtle">{i + 1}</td><td className="py-1.5 pr-3 font-medium">{w}</td><td className="py-1.5 pr-3 tabular">{c}</td><td className="py-1.5"><div className="flex items-center gap-2"><Bar value={c} max={data.rows[0]?.[1] ?? 1} className="w-24" tone="fg" /><span className="font-mono text-xs text-muted">{formatNumber((c / Math.max(1, data.total)) * 100, 1)}%</span></div></td></tr>)}</tbody></table></div>
        <Actions copy={data.rows.map(([w, c]) => `${w}\t${c}`).join("\n")} onClear={() => setText("")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Resumidor de texto -------------------------- */
export function ResumidorDeTexto({ meta }: ToolProps) {
  const [text, setText] = useState("");
  const [n, setN] = useState("3");
  const result = useMemo(() => {
    const sents = sentences(text);
    if (sents.length < 2) return { summary: sents.join(" "), picked: sents.length, total: sents.length };
    const freq = new Map<string, number>();
    tokenize(text).filter((w) => !STOPWORDS.has(w)).forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
    const scored = sents.map((s, i) => ({ i, s, score: tokenize(s).reduce((a, w) => a + (freq.get(w) ?? 0), 0) / Math.max(1, tokenize(s).length) ** 0.5 }));
    const k = Math.max(1, Math.min(sents.length, Number(n) || 3));
    const chosen = [...scored].sort((a, b) => b.score - a.score).slice(0, k).sort((a, b) => a.i - b.i);
    return { summary: chosen.map((c) => c.s).join(" "), picked: k, total: sents.length };
  }, [text, n]);
  return (
    <ToolShell meta={meta} examples={[{ label: "Carregar texto de exemplo", onClick: () => setText(SAMPLE + " Ferramentas simples resolvem problemas específicos com clareza. Plataformas complexas prometem tudo e entregam atrito. A escolha certa depende do problema, não da moda. Um bom critério é perguntar quanto tempo leva para obter o primeiro resultado útil. Se a resposta for mais de um minuto, algo está errado.") }]}>
      <TextInput value={text} onChange={setText} rows={9} />
      <div className="mt-4 max-w-xs"><Field label="Frases no resumo"><Input inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} /></Field></div>
      {text.trim() && (
        <ResultPanel title={`Resumo · ${result.picked} de ${result.total} frases`}>
          <p className="border-l-2 border-accent pl-4 text-[15px] leading-relaxed">{result.summary}</p>
          <p className="mt-3 font-mono text-xs text-subtle">Redução: {formatNumber((1 - result.summary.length / Math.max(1, text.length)) * 100, 0)}%</p>
          <Actions copy={result.summary} onClear={() => setText("")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ---------------------------- Tempo de leitura ---------------------------- */
export function TempoDeLeitura({ meta }: ToolProps) {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState("200");
  const [images, setImages] = useState("0");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const w = Number(wpm) || 200;
  const img = Number(images) || 0;
  const imgSec = img > 0 ? Array.from({ length: img }, (_, i) => Math.max(3, 12 - i)).reduce((a, b) => a + b, 0) : 0;
  const fmt = (sec: number) => `${Math.floor(sec / 60)} min ${Math.round(sec % 60)} s`;
  const read = (words / w) * 60 + imgSec;
  return (
    <ToolShell meta={meta}>
      <TextInput value={text} onChange={setText} rows={8} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 max-w-md">
        <Field label="Velocidade de leitura" hint="200–250 ppm é a média"><Input inputMode="numeric" suffix="ppm" value={wpm} onChange={(e) => setWpm(e.target.value)} /></Field>
        <Field label="Imagens" hint="12 s para a primeira, decrescendo"><Input inputMode="numeric" value={images} onChange={(e) => setImages(e.target.value)} /></Field>
      </div>
      <ResultPanel>
        <div className="grid gap-6 sm:grid-cols-3">
          <BigNumber label="Leitura silenciosa" value={fmt(read)} accent sub={`${words} palavras a ${w} ppm`} />
          <BigNumber label="Leitura em voz alta" value={fmt((words / 130) * 60)} sub="130 ppm" />
          <BigNumber label="Apresentação" value={fmt((words / 110) * 60)} sub="110 ppm" />
        </div>
        <Actions copy={`${Math.max(1, Math.ceil(read / 60))} min de leitura`} onClear={() => setText("")} />
      </ResultPanel>
    </ToolShell>
  );
}
