import { useMemo, useState } from "react";
import { Field, Input, Textarea } from "@/components/ui/primitives";
import { ResultBox, Stat } from "@/components/ui/feedback";
import { normalize, readingTime, slugify } from "@/lib/utils";
import { fmt, TextTool, ToolActions } from "./ToolShell";

const STOP = new Set("a o e é de da do das dos em um uma uns umas para com por que se não no na nos nas ao aos à às mais como mas ou seu sua seus suas ele ela eles elas isso isto este esta esse essa são foi ser tem ter há já também muito pode sobre entre até quando onde qual quais".split(" "));
export const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
export const sentences = (s: string) => s.split(/(?<=[.!?…])\s+|\n+/).map((x) => x.trim()).filter((x) => x.length > 1);
const graphemes = (s: string) => [...s];

export function ContadorDePalavras() {
  const [t, setT] = useState("");
  const st = useMemo(() => {
    const w = words(t); const chars = graphemes(t).length; const noSp = graphemes(t.replace(/\s/g, "")).length;
    const par = t.split(/\n\s*\n/).filter((p) => p.trim()).length; const sen = sentences(t).length;
    const freq = new Map<string, number>(); w.forEach((x) => { const k = normalize(x).replace(/[^\p{L}\p{N}]/gu, ""); if (k.length > 2 && !STOP.has(k)) freq.set(k, (freq.get(k) ?? 0) + 1); });
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const avg = w.length ? w.reduce((a, x) => a + graphemes(x).length, 0) / w.length : 0;
    return { w: w.length, chars, noSp, par, sen, top, avg, read: readingTime(t), speak: Math.max(1, Math.round(w.length / 130)), unique: freq.size };
  }, [t]);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4"><Textarea rows={14} placeholder="Cole ou digite o texto aqui…" value={t} onChange={(e) => setT(e.target.value)} /><ToolActions onClear={() => setT("")} copyText={t || undefined} /></div>
      <div className="space-y-4">
        <ResultBox title="Contagem"><div className="grid grid-cols-2 gap-4"><Stat label="Palavras" value={fmt(st.w, 0)} big /><Stat label="Caracteres" value={fmt(st.chars, 0)} hint={`${fmt(st.noSp, 0)} sem espaços`} /><Stat label="Frases" value={fmt(st.sen, 0)} /><Stat label="Parágrafos" value={fmt(st.par, 0)} /><Stat label="Leitura" value={`${st.read} min`} hint="200 ppm" /><Stat label="Fala" value={`${st.speak} min`} hint="130 ppm" /></div></ResultBox>
        {st.top.length > 0 && <ResultBox title="Palavras mais frequentes"><ul className="space-y-1.5">{st.top.map(([k, v]) => <li key={k} className="flex items-center gap-3 text-sm"><span className="w-28 truncate">{k}</span><span className="h-1.5 flex-1 rounded-full bg-line"><span className="block h-full rounded-full bg-brand" style={{ width: `${(v / st.top[0][1]) * 100}%` }} /></span><span className="w-14 text-right tabular-nums text-fg-3">{v} ({fmt((v / st.w) * 100, 1)}%)</span></li>)}</ul></ResultBox>}
      </div>
    </div>
  );
}

const LIMITS = [["X / Twitter", 280], ["Bio Instagram", 150], ["Legenda Instagram", 2200], ["LinkedIn post", 3000], ["Meta title", 60], ["Meta description", 160], ["SMS", 160], ["Título YouTube", 100]] as const;
export function ContadorDeCaracteres() {
  const [t, setT] = useState("");
  const n = graphemes(t).length;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4"><Textarea rows={12} placeholder="Digite ou cole o texto…" value={t} onChange={(e) => setT(e.target.value)} /><ToolActions onClear={() => setT("")} copyText={t || undefined} /></div>
      <ResultBox title="Caracteres">
        <div className="grid grid-cols-2 gap-4"><Stat label="Total" value={fmt(n, 0)} big /><Stat label="Sem espaços" value={fmt(graphemes(t.replace(/\s/g, "")).length, 0)} /><Stat label="Palavras" value={fmt(words(t).length, 0)} /><Stat label="Linhas" value={fmt(t ? t.split("\n").length : 0, 0)} /></div>
        <ul className="mt-5 space-y-2 border-t pt-4">{LIMITS.map(([name, lim]) => { const p = Math.min(100, (n / lim) * 100); const over = n > lim; return <li key={name} className="text-sm"><div className="flex justify-between"><span className="text-fg-2">{name}</span><span className={`tabular-nums ${over ? "text-danger" : "text-fg-3"}`}>{over ? `+${n - lim}` : `${lim - n} restantes`}</span></div><div className="mt-1 h-1 rounded-full bg-line"><div className={`h-full rounded-full ${over ? "bg-danger" : p > 85 ? "bg-warn" : "bg-brand"}`} style={{ width: `${p}%` }} /></div></li>; })}</ul>
      </ResultBox>
    </div>
  );
}

const SMALL = new Set(["de", "da", "do", "das", "dos", "e", "em", "a", "o", "as", "os", "para", "com", "por", "um", "uma", "no", "na", "ou"]);
export const MaiusculasMinusculas = () => <TextTool options={[{ key: "mode", label: "Formato", type: "select", default: "title", options: [{ value: "upper", label: "MAIÚSCULAS" }, { value: "lower", label: "minúsculas" }, { value: "title", label: "Título (Cada Palavra)" }, { value: "sentence", label: "Frase (primeira letra)" }, { value: "camel", label: "camelCase" }, { value: "pascal", label: "PascalCase" }, { value: "snake", label: "snake_case" }, { value: "kebab", label: "kebab-case" }, { value: "const", label: "CONSTANT_CASE" }, { value: "alt", label: "aLtErNaDo" }, { value: "invert", label: "iNVERTER caixa" }] }]} transform={(s, o) => {
  const w = words(s.replace(/[_-]+/g, " ")); const norm = (x: string) => slugify(x).replace(/-/g, " ").split(" ").filter(Boolean);
  switch (o.mode) {
    case "upper": return s.toUpperCase(); case "lower": return s.toLowerCase();
    case "title": return s.toLowerCase().replace(/\p{L}[\p{L}']*/gu, (m, i) => (i > 0 && SMALL.has(m) ? m : m[0].toUpperCase() + m.slice(1)));
    case "sentence": return s.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toUpperCase());
    case "camel": return norm(w.join(" ")).map((x, i) => (i ? x[0].toUpperCase() + x.slice(1) : x)).join("");
    case "pascal": return norm(w.join(" ")).map((x) => x[0].toUpperCase() + x.slice(1)).join("");
    case "snake": return norm(w.join(" ")).join("_"); case "kebab": return norm(w.join(" ")).join("-"); case "const": return norm(w.join(" ")).join("_").toUpperCase();
    case "alt": return [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("");
    case "invert": return [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
    default: return s;
  }
}} />;

export const LimparTexto = () => <TextTool options={[{ key: "spaces", label: "Espaços duplos", type: "checkbox", default: true }, { key: "trim", label: "Espaços nas pontas das linhas", type: "checkbox", default: true }, { key: "blank", label: "Linhas em branco extras", type: "checkbox", default: true }, { key: "join", label: "Juntar quebras de linha (PDF)", type: "checkbox" }, { key: "html", label: "Remover HTML", type: "checkbox" }, { key: "accents", label: "Remover acentos", type: "checkbox" }, { key: "invisible", label: "Caracteres invisíveis", type: "checkbox", default: true }, { key: "punct", label: "Remover pontuação", type: "checkbox" }, { key: "numbers", label: "Remover números", type: "checkbox" }, { key: "emoji", label: "Remover emojis", type: "checkbox" }]} transform={(s, o) => {
  let t = s;
  if (o.html) t = t.replace(/<[^>]+>/g, " ");
  if (o.invisible) t = t.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "").replace(/\u00A0/g, " ");
  if (o.join) t = t.replace(/(?<![.!?:])\n(?!\n)/g, " ");
  if (o.emoji) t = t.replace(/\p{Extended_Pictographic}/gu, "");
  if (o.accents) t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (o.punct) t = t.replace(/[.,;:!?"'()[\]{}«»“”‘’…—–-]/g, "");
  if (o.numbers) t = t.replace(/\d+/g, "");
  if (o.spaces) t = t.replace(/[ \t]{2,}/g, " ");
  if (o.trim) t = t.split("\n").map((l) => l.trim()).join("\n");
  if (o.blank) t = t.replace(/\n{3,}/g, "\n\n").trim();
  return t;
}} stats={(i, o) => [{ label: "Antes", value: `${i.length} caracteres` }, { label: "Depois", value: `${o.length} caracteres` }]} />;

export const RemoverDuplicatas = () => <TextTool placeholder={"linha 1\nlinha 2\nlinha 1"} options={[{ key: "ci", label: "Ignorar maiúsculas/minúsculas", type: "checkbox" }, { key: "trim", label: "Ignorar espaços nas pontas", type: "checkbox", default: true }, { key: "empty", label: "Remover linhas vazias", type: "checkbox", default: true }]} transform={(s, o) => { const seen = new Set<string>(); return s.split("\n").filter((l) => { const k0 = o.trim ? l.trim() : l; if (o.empty && !k0) return false; const k = o.ci ? k0.toLowerCase() : k0; if (seen.has(k)) return false; seen.add(k); return true; }).join("\n"); }} stats={(i, o) => [{ label: "Linhas", value: `${i.split("\n").length} → ${o ? o.split("\n").length : 0}` }, { label: "Removidas", value: String(i.split("\n").length - (o ? o.split("\n").length : 0)) }]} />;

export const InverterTexto = () => <TextTool options={[{ key: "mode", label: "Inverter", type: "select", default: "chars", options: [{ value: "chars", label: "Caracteres" }, { value: "words", label: "Palavras" }, { value: "lines", label: "Linhas" }, { value: "eachword", label: "Letras de cada palavra" }] }, { key: "pal", label: "Verificar palíndromo", type: "checkbox" }]} transform={(s, o) => { let r = s; if (o.mode === "chars") r = graphemes(s).reverse().join(""); if (o.mode === "words") r = s.split("\n").map((l) => l.split(/\s+/).reverse().join(" ")).join("\n"); if (o.mode === "lines") r = s.split("\n").reverse().join("\n"); if (o.mode === "eachword") r = s.split("\n").map((l) => l.split(" ").map((w) => graphemes(w).reverse().join("")).join(" ")).join("\n"); if (o.pal && s) { const c = normalize(s).replace(/[^a-z0-9]/g, ""); r += `\n\n${c && c === [...c].reverse().join("") ? "✓ É um palíndromo" : "✗ Não é palíndromo"}`; } return r; }} />;

export const GeradorDeSlug = () => <TextTool rows={4} placeholder="Guia Completo de SEO em 2026" options={[{ key: "sep", label: "Separador", type: "select", default: "-", options: [{ value: "-", label: "hífen (-)" }, { value: "_", label: "underscore (_)" }] }, { key: "max", label: "Máximo de caracteres", type: "text", default: "80" }]} transform={(s, o) => s.split("\n").map((l) => { let x = slugify(l); if (o.sep === "_") x = x.replace(/-/g, "_"); const m = parseInt(String(o.max)); return Number.isFinite(m) && m > 0 ? x.slice(0, m).replace(/[-_]$/, "") : x; }).join("\n")} mono />;

const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
const PT = "o projeto começou com uma ideia simples e cresceu com o tempo cada etapa trouxe novas perguntas sobre design texto e leitura a equipe testou versões diferentes até encontrar um ritmo que funcionasse para todos os leitores nenhuma decisão foi tomada sem observar como as pessoas realmente usavam a página os resultados mostraram que clareza importa mais do que ornamento e que espaço em branco é parte do conteúdo".split(" ");
export function LoremIpsum() {
  const [n, setN] = useState("3"); const [unit, setUnit] = useState("p"); const [lang, setLang] = useState("la"); const [seed, setSeed] = useState(1);
  const out = useMemo(() => {
    const src = lang === "la" ? LOREM : PT; let s = seed * 7919; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const word = () => src[Math.floor(r() * src.length)];
    const sent = () => { const len = 8 + Math.floor(r() * 10); const w = Array.from({ length: len }, word); return w[0][0].toUpperCase() + w.join(" ").slice(1) + "."; };
    const para = () => Array.from({ length: 4 + Math.floor(r() * 3) }, sent).join(" ");
    const k = Math.max(1, Math.min(200, parseInt(n) || 1));
    if (unit === "w") return Array.from({ length: k }, word).join(" ");
    if (unit === "s") return Array.from({ length: k }, sent).join(" ");
    return Array.from({ length: k }, para).join("\n\n");
  }, [n, unit, lang, seed]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4"><Field label="Quantidade"><Input value={n} onChange={(e) => setN(e.target.value)} /></Field><Field label="Unidade"><select className="h-10 w-full rounded-xl border bg-surface px-3 text-sm" value={unit} onChange={(e) => setUnit(e.target.value)}><option value="p">Parágrafos</option><option value="s">Frases</option><option value="w">Palavras</option></select></Field><Field label="Idioma"><select className="h-10 w-full rounded-xl border bg-surface px-3 text-sm" value={lang} onChange={(e) => setLang(e.target.value)}><option value="la">Lorem ipsum</option><option value="pt">Português</option></select></Field><div className="flex items-end"><button className="h-10 w-full rounded-xl border bg-surface text-sm hover:bg-surface-2" onClick={() => setSeed((x) => x + 1)}>Gerar outro</button></div></div>
      <Textarea rows={12} readOnly value={out} className="bg-surface-2/60" />
      <ToolActions copyText={out} downloadName="lorem.txt" />
    </div>
  );
}

export const ExtrairEmailsUrls = () => <TextTool options={[{ key: "what", label: "Extrair", type: "select", default: "email", options: [{ value: "email", label: "E-mails" }, { value: "url", label: "URLs" }, { value: "phone", label: "Telefones (BR)" }, { value: "hashtag", label: "Hashtags" }, { value: "mention", label: "Menções (@)" }, { value: "number", label: "Números" }] }, { key: "sep", label: "Separador de saída", type: "select", default: "\n", options: [{ value: "\n", label: "Uma por linha" }, { value: ", ", label: "Vírgula" }, { value: "; ", label: "Ponto e vírgula" }] }]} transform={(s, o) => { const re: Record<string, RegExp> = { email: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, url: /https?:\/\/[^\s<>"')\]]+/g, phone: /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/g, hashtag: /#[\p{L}\p{N}_]+/gu, mention: /@[\w.]+/g, number: /-?\d+(?:[.,]\d+)?/g }; return [...new Set(s.match(re[String(o.what)]) ?? [])].join(String(o.sep)); }} stats={(_i, o) => [{ label: "Encontrados", value: String(o ? o.split(/\n|, |; /).length : 0) }]} mono />;

export const OrdenarLinhas = () => <TextTool options={[{ key: "mode", label: "Ordem", type: "select", default: "az", options: [{ value: "az", label: "A → Z" }, { value: "za", label: "Z → A" }, { value: "nat", label: "Natural (1, 2, 10)" }, { value: "num", label: "Numérica" }, { value: "len", label: "Por tamanho" }, { value: "rev", label: "Inverter ordem" }, { value: "shuf", label: "Aleatória" }] }, { key: "ci", label: "Ignorar maiúsculas", type: "checkbox", default: true }, { key: "uniq", label: "Remover duplicadas", type: "checkbox" }]} transform={(s, o) => { let l = s.split("\n").filter((x) => x.trim()); if (o.uniq) l = [...new Set(l)]; const col = new Intl.Collator("pt-BR", { sensitivity: o.ci ? "base" : "variant", numeric: o.mode === "nat" }); switch (o.mode) { case "az": case "nat": l.sort(col.compare); break; case "za": l.sort((a, b) => col.compare(b, a)); break; case "num": l.sort((a, b) => (parseFloat(a.replace(",", ".")) || 0) - (parseFloat(b.replace(",", ".")) || 0)); break; case "len": l.sort((a, b) => a.length - b.length); break; case "rev": l.reverse(); break; case "shuf": for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } } return l.join("\n"); }} />;

export function FrequenciaDePalavras() {
  const [t, setT] = useState(""); const [stop, setStop] = useState(true); const [min, setMin] = useState("3");
  const rows = useMemo(() => { const w = words(t); const f = new Map<string, number>(); w.forEach((x) => { const k = normalize(x).replace(/[^\p{L}\p{N}]/gu, ""); if (k.length >= (parseInt(min) || 1) && (!stop || !STOP.has(k))) f.set(k, (f.get(k) ?? 0) + 1); }); return { list: [...f.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40), total: w.length }; }, [t, stop, min]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4"><Textarea rows={14} placeholder="Cole o texto…" value={t} onChange={(e) => setT(e.target.value)} /><div className="flex flex-wrap items-center gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={stop} onChange={(e) => setStop(e.target.checked)} className="h-4 w-4" />Ignorar stop words</label><label className="flex items-center gap-2">Mín. letras <Input className="h-8 w-16" value={min} onChange={(e) => setMin(e.target.value)} /></label></div><ToolActions onClear={() => setT("")} copyText={rows.list.map(([k, v]) => `${k}\t${v}`).join("\n") || undefined} /></div>
      {rows.list.length ? <ResultBox title={`Top ${rows.list.length} de ${rows.total} palavras`}><ul className="max-h-[420px] space-y-1.5 overflow-auto pr-1">{rows.list.map(([k, v]) => <li key={k} className="flex items-center gap-3 text-sm"><span className="w-32 truncate">{k}</span><span className="h-1.5 flex-1 rounded-full bg-line"><span className="block h-full rounded-full bg-brand" style={{ width: `${(v / rows.list[0][1]) * 100}%` }} /></span><span className="w-20 text-right tabular-nums text-fg-3">{v} · {fmt((v / rows.total) * 100, 1)}%</span></li>)}</ul></ResultBox> : <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed text-sm text-fg-3">Cole um texto para analisar.</div>}
    </div>
  );
}

export function summarize(text: string, ratio: number) {
  const sents = sentences(text); if (sents.length <= 2) return text;
  const f = new Map<string, number>(); sents.forEach((s) => words(s).forEach((w) => { const k = normalize(w).replace(/[^\p{L}]/gu, ""); if (k.length > 3 && !STOP.has(k)) f.set(k, (f.get(k) ?? 0) + 1); }));
  const scored = sents.map((s, i) => { const ws = words(s); const score = ws.reduce((a, w) => a + (f.get(normalize(w).replace(/[^\p{L}]/gu, "")) ?? 0), 0) / Math.max(6, ws.length) + (i === 0 ? 1 : 0) + (i === sents.length - 1 ? 0.3 : 0); return { s, i, score }; });
  const k = Math.max(1, Math.round(sents.length * ratio));
  return scored.sort((a, b) => b.score - a.score).slice(0, k).sort((a, b) => a.i - b.i).map((x) => x.s).join(" ");
}
export const ResumidorDeTexto = () => <TextTool rows={12} outputLabel="Resumo" options={[{ key: "ratio", label: "Tamanho do resumo", type: "select", default: "0.3", options: [{ value: "0.15", label: "Curto (~15%)" }, { value: "0.3", label: "Médio (~30%)" }, { value: "0.5", label: "Longo (~50%)" }] }, { key: "bullets", label: "Em tópicos", type: "checkbox" }]} transform={(s, o) => { if (!s.trim()) return ""; const r = summarize(s, parseFloat(String(o.ratio))); return o.bullets ? sentences(r).map((x) => `• ${x}`).join("\n") : r; }} stats={(i, o) => [{ label: "Palavras", value: `${words(i).length} → ${words(o).length}` }, { label: "Redução", value: `${fmt((1 - words(o).length / Math.max(1, words(i).length)) * 100, 0)}%` }]} />;

export function TempoDeLeitura() {
  const [t, setT] = useState(""); const [wpm, setWpm] = useState("200"); const [spm, setSpm] = useState("130");
  const w = words(t).length; const r = w / Math.max(1, parseInt(wpm) || 200), s = w / Math.max(1, parseInt(spm) || 130);
  const f = (m: number) => (m < 1 ? `${Math.max(1, Math.round(m * 60))} s` : `${Math.floor(m)} min ${Math.round((m % 1) * 60)} s`);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4"><Textarea rows={12} placeholder="Cole o artigo, roteiro ou discurso…" value={t} onChange={(e) => setT(e.target.value)} /><div className="grid grid-cols-2 gap-3"><Field label="Leitura (palavras/min)"><Input value={wpm} onChange={(e) => setWpm(e.target.value)} /></Field><Field label="Fala (palavras/min)"><Input value={spm} onChange={(e) => setSpm(e.target.value)} /></Field></div><ToolActions onClear={() => setT("")} /></div>
      <ResultBox title="Tempo estimado"><div className="grid gap-5"><Stat label="Leitura silenciosa" value={w ? f(r) : "—"} big /><Stat label="Leitura em voz alta" value={w ? f(s) : "—"} /><Stat label="Palavras" value={fmt(w, 0)} /></div></ResultBox>
    </div>
  );
}

export function ComparadorDeTextos() {
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [byWord, setByWord] = useState(false);
  const diff = useMemo(() => {
    const split = (s: string) => (byWord ? s.split(/(\s+)/).filter((x) => x.trim()) : s.split("\n"));
    const A = split(a), B = split(b); const n = A.length, m = B.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out: { t: "=" | "-" | "+"; v: string }[] = []; let i = 0, j = 0;
    while (i < n && j < m) { if (A[i] === B[j]) { out.push({ t: "=", v: A[i] }); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: "-", v: A[i++] }); else out.push({ t: "+", v: B[j++] }); }
    while (i < n) out.push({ t: "-", v: A[i++] }); while (j < m) out.push({ t: "+", v: B[j++] });
    return out;
  }, [a, b, byWord]);
  const add = diff.filter((d) => d.t === "+").length, rem = diff.filter((d) => d.t === "-").length;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2"><Field label="Texto original"><Textarea rows={10} value={a} onChange={(e) => setA(e.target.value)} className="font-mono text-[13px]" /></Field><Field label="Texto modificado"><Textarea rows={10} value={b} onChange={(e) => setB(e.target.value)} className="font-mono text-[13px]" /></Field></div>
      <div className="flex flex-wrap items-center gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={byWord} onChange={(e) => setByWord(e.target.checked)} className="h-4 w-4" />Comparar por palavra</label><span className="text-ok">+{add} adicionadas</span><span className="text-danger">−{rem} removidas</span><ToolActions onClear={() => { setA(""); setB(""); }} /></div>
      {(a || b) && <div className={`rounded-xl border bg-surface p-4 font-mono text-[13px] leading-6 ${byWord ? "flex flex-wrap gap-x-1.5" : ""}`}>{diff.map((d, i) => <span key={i} className={`${byWord ? "" : "block"} ${d.t === "+" ? "bg-ok/15 text-ok" : d.t === "-" ? "bg-danger/10 text-danger line-through" : "text-fg-2"} rounded px-1`}>{byWord ? d.v : `${d.t === "=" ? " " : d.t} ${d.v || " "}`}</span>)}</div>}
    </div>
  );
}

export function LocalizarSubstituir() {
  const [t, setT] = useState(""); const [find, setFind] = useState(""); const [rep, setRep] = useState(""); const [re, setRe] = useState(false); const [cs, setCs] = useState(false);
  const { out, count, err } = useMemo(() => { if (!find) return { out: t, count: 0, err: "" }; try { const rx = new RegExp(re ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), `g${cs ? "" : "i"}`); const count = (t.match(rx) ?? []).length; return { out: t.replace(rx, rep), count, err: "" }; } catch (e) { return { out: t, count: 0, err: (e as Error).message }; } }, [t, find, rep, re, cs]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Localizar" error={err || undefined}><Input value={find} onChange={(e) => setFind(e.target.value)} className="font-mono" /></Field><Field label="Substituir por" hint={re ? "Use $1, $2 para grupos" : undefined}><Input value={rep} onChange={(e) => setRep(e.target.value)} className="font-mono" /></Field></div>
      <div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={re} onChange={(e) => setRe(e.target.checked)} />Expressão regular</label><label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={cs} onChange={(e) => setCs(e.target.checked)} />Diferenciar maiúsculas</label><span className="text-fg-3">{count} ocorrência(s)</span></div>
      <div className="grid gap-4 lg:grid-cols-2"><Field label="Texto"><Textarea rows={10} value={t} onChange={(e) => setT(e.target.value)} /></Field><Field label="Resultado"><Textarea rows={10} readOnly value={out} className="bg-surface-2/60" /></Field></div>
      <ToolActions onClear={() => setT("")} copyText={out} downloadName="resultado.txt" />
    </div>
  );
}
