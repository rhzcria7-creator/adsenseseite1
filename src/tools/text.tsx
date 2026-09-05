import { useMemo, useState } from "react";
import { TextTool } from "./ToolShell";
import { Button, Field, Input, Stat, Textarea } from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/feedback";
import { fmtNum, slugify } from "@/lib/utils";
import { Eraser } from "lucide-react";

export const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
export const sentences = (s: string) => (s.trim() ? s.split(/[.!?]+(?:\s|$)/).filter((x) => x.trim()).length : 0);
export const paragraphs = (s: string) => (s.trim() ? s.split(/\n\s*\n/).filter((x) => x.trim()).length : 0);

const readMin = (w: number, wpm = 200) => {
  const m = w / wpm;
  return m < 1 ? `${Math.max(1, Math.round(m * 60))} s` : `${Math.floor(m)} min ${Math.round((m % 1) * 60)} s`;
};

/* ---------- Word counter ---------- */
export function ContadorPalavras() {
  const [t, setT] = useState("");
  const w = words(t);
  const stats = [
    { l: "Palavras", v: fmtNum(w, 0) }, { l: "Caracteres", v: fmtNum(t.length, 0) }, { l: "Sem espaços", v: fmtNum(t.replace(/\s/g, "").length, 0) }, { l: "Frases", v: fmtNum(sentences(t), 0) },
    { l: "Parágrafos", v: fmtNum(paragraphs(t), 0) }, { l: "Leitura (200 ppm)", v: readMin(w) }, { l: "Fala (130 ppm)", v: readMin(w, 130) }, { l: "Média/frase", v: sentences(t) ? fmtNum(w / sentences(t), 1) + " pal." : "—" },
  ];
  const top = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of t.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []) if (x.length > 3) m.set(x, (m.get(x) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [t]);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between"><span className="eyebrow">Texto</span><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => setT("")} disabled={!t}><Eraser size={14} /> Limpar</Button><CopyButton text={t} disabled={!t} /></div></div>
      <Textarea value={t} onChange={(e) => setT(e.target.value)} placeholder="Cole ou digite seu texto…" className="min-h-[220px]" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map((s) => <Stat key={s.l} label={s.l} value={s.v} />)}</div>
      {top.length > 0 && (
        <div className="mt-5">
          <div className="eyebrow mb-2">Palavras mais frequentes</div>
          <div className="flex flex-wrap gap-2">{top.map(([w, n]) => <span key={w} className="rounded-lg border border-line bg-bg-2 px-2.5 py-1 text-sm"><span className="font-medium text-fg">{w}</span> <span className="font-mono text-xs text-fg-3">×{n}</span></span>)}</div>
        </div>
      )}
    </div>
  );
}

/* ---------- Character counter with limits ---------- */
const LIMITS = [{ n: "Título SEO", max: 60 }, { n: "Meta description", max: 155 }, { n: "X / Twitter", max: 280 }, { n: "Instagram legenda", max: 2200 }, { n: "Instagram bio", max: 150 }, { n: "LinkedIn post", max: 3000 }, { n: "YouTube título", max: 100 }, { n: "SMS", max: 160 }];
export function ContadorCaracteres() {
  const [t, setT] = useState("");
  return (
    <div>
      <div className="mb-2 flex items-center justify-between"><span className="eyebrow">Texto</span><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => setT("")} disabled={!t}><Eraser size={14} /> Limpar</Button><CopyButton text={t} disabled={!t} /></div></div>
      <Textarea value={t} onChange={(e) => setT(e.target.value)} placeholder="Digite para ver os limites…" className="min-h-[160px]" />
      <div className="mt-4 grid grid-cols-3 gap-3"><Stat label="Caracteres" value={fmtNum(t.length, 0)} /><Stat label="Sem espaços" value={fmtNum(t.replace(/\s/g, "").length, 0)} /><Stat label="Palavras" value={fmtNum(words(t), 0)} /></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {LIMITS.map((l) => {
          const p = Math.min(100, (t.length / l.max) * 100);
          const over = t.length > l.max;
          return (
            <div key={l.n} className="rounded-xl border border-line bg-bg-2 px-4 py-3">
              <div className="flex items-center justify-between text-sm"><span className="font-medium text-fg">{l.n}</span><span className={over ? "font-mono text-danger" : "font-mono text-fg-2"}>{t.length}/{l.max}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full transition-all ${over ? "bg-danger" : p > 85 ? "bg-warn" : "bg-ok"}`} style={{ width: `${p}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Case converter ---------- */
const title = (s: string) => s.toLowerCase().replace(/(^|\s|[-("])(\p{L})/gu, (m) => m.toUpperCase());
const sentence = (s: string) => s.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toUpperCase());
const wordsOf = (s: string) => (s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[A-Za-z0-9]+/g) ?? []).map((w) => w.toLowerCase());
export const MaiusculasMinusculas = () => (
  <TextTool options={[{ key: "m", label: "Formato", type: "select", default: "upper", options: [{ value: "upper", label: "MAIÚSCULAS" }, { value: "lower", label: "minúsculas" }, { value: "title", label: "Title Case" }, { value: "sentence", label: "Sentence case" }, { value: "toggle", label: "iNVERTER cASO" }, { value: "camel", label: "camelCase" }, { value: "pascal", label: "PascalCase" }, { value: "snake", label: "snake_case" }, { value: "kebab", label: "kebab-case" }, { value: "const", label: "CONSTANT_CASE" }] }]}
    transform={(s, o) => {
      const w = wordsOf(s);
      switch (o.m) {
        case "upper": return s.toUpperCase();
        case "lower": return s.toLowerCase();
        case "title": return title(s);
        case "sentence": return sentence(s);
        case "toggle": return [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
        case "camel": return w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1) : x)).join("");
        case "pascal": return w.map((x) => x[0].toUpperCase() + x.slice(1)).join("");
        case "snake": return w.join("_");
        case "kebab": return w.join("-");
        case "const": return w.join("_").toUpperCase();
        default: return s;
      }
    }}
  />
);

export const RemoverAcentos = () => <TextTool options={[{ key: "sp", label: "Remover também caracteres especiais", type: "toggle", default: "0" }]} transform={(s, o) => { const t = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); return o.sp === "1" ? t.replace(/[^\w\s.,;:!?()-]/g, "") : t; }} />;
export const LimparEspacos = () => <TextTool options={[{ key: "lines", label: "Remover linhas vazias", type: "toggle", default: "1" }, { key: "trim", label: "Aparar início/fim das linhas", type: "toggle", default: "1" }]} transform={(s, o) => { let t = s.replace(/[ \t]+/g, " "); if (o.trim === "1") t = t.split("\n").map((l) => l.trim()).join("\n"); if (o.lines === "1") t = t.replace(/\n{2,}/g, "\n"); else t = t.replace(/\n{3,}/g, "\n\n"); return t.trim(); }} stats={(i, o) => [{ label: "Antes", value: `${i.length} chars` }, { label: "Depois", value: `${o.length} chars` }, { label: "Removidos", value: `${i.length - o.length}` }, { label: "Linhas", value: `${o ? o.split("\n").length : 0}` }]} />;
export const InverterTexto = () => <TextTool options={[{ key: "m", label: "Inverter", type: "select", default: "chars", options: [{ value: "chars", label: "Caracteres" }, { value: "words", label: "Palavras" }, { value: "lines", label: "Linhas" }] }]} transform={(s, o) => (o.m === "chars" ? [...s].reverse().join("") : o.m === "words" ? s.split(/(\s+)/).reverse().join("") : s.split("\n").reverse().join("\n"))} />;
export const RemoverDuplicadas = () => <TextTool placeholder={"linha 1\nlinha 2\nlinha 1"} options={[{ key: "ci", label: "Ignorar maiúsculas/minúsculas", type: "toggle", default: "0" }, { key: "sort", label: "Ordenar resultado", type: "toggle", default: "0" }]} transform={(s, o) => { const seen = new Set<string>(); const out: string[] = []; for (const l of s.split("\n")) { const k = o.ci === "1" ? l.trim().toLowerCase() : l.trim(); if (!seen.has(k)) { seen.add(k); out.push(l); } } return (o.sort === "1" ? out.sort((a, b) => a.localeCompare(b, "pt-BR")) : out).join("\n"); }} stats={(i, o) => { const a = i ? i.split("\n").length : 0, b = o ? o.split("\n").length : 0; return [{ label: "Linhas originais", value: String(a) }, { label: "Únicas", value: String(b) }, { label: "Removidas", value: String(a - b) }]; }} />;
export const OrdenarLinhas = () => <TextTool options={[{ key: "m", label: "Ordem", type: "select", default: "az", options: [{ value: "az", label: "A → Z" }, { value: "za", label: "Z → A" }, { value: "num", label: "Numérica crescente" }, { value: "numd", label: "Numérica decrescente" }, { value: "len", label: "Por tamanho" }, { value: "rand", label: "Aleatória" }] }]} transform={(s, o) => { const l = s.split("\n").filter((x) => x.trim()); const c = (a: string, b: string) => a.localeCompare(b, "pt-BR", { numeric: true }); switch (o.m) { case "az": return l.sort(c).join("\n"); case "za": return l.sort((a, b) => c(b, a)).join("\n"); case "num": return l.sort((a, b) => parseFloat(a) - parseFloat(b)).join("\n"); case "numd": return l.sort((a, b) => parseFloat(b) - parseFloat(a)).join("\n"); case "len": return l.sort((a, b) => a.length - b.length).join("\n"); default: return l.sort(() => Math.random() - 0.5).join("\n"); } }} />;
export const GeradorSlug = () => <TextTool placeholder={"Como Criar um Site com React em 2026\nOutro Título"} options={[{ key: "sep", label: "Separador", type: "select", default: "-", options: [{ value: "-", label: "hífen (-)" }, { value: "_", label: "underscore (_)" }] }]} transform={(s, o) => s.split("\n").map((l) => (o.sep === "_" ? slugify(l).replace(/-/g, "_") : slugify(l))).join("\n")} mono />;

export function FrequenciaPalavras() {
  const [t, setT] = useState("");
  const [min, setMin] = useState("3");
  const data = useMemo(() => {
    const m = new Map<string, number>();
    const all = t.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
    for (const x of all) if (x.length >= (Number(min) || 1)) m.set(x, (m.get(x) ?? 0) + 1);
    const total = all.length;
    return { total, unique: m.size, rows: [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([w, n]) => ({ w, n, p: total ? (n / total) * 100 : 0 })) };
  }, [t, min]);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]"><Field label="Texto"><Textarea value={t} onChange={(e) => setT(e.target.value)} className="min-h-[180px]" placeholder="Cole o texto para análise…" /></Field><Field label="Tamanho mínimo"><Input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} /></Field></div>
      <div className="mt-4 grid grid-cols-3 gap-3"><Stat label="Palavras" value={String(data.total)} /><Stat label="Únicas" value={String(data.unique)} /><Stat label="Riqueza lexical" value={data.total ? fmtNum((data.unique / data.total) * 100, 0) + "%" : "—"} /></div>
      {data.rows.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-xl border border-line"><table className="w-full text-sm"><thead className="bg-bg-2 text-left text-xs uppercase tracking-wider text-fg-3"><tr><th className="px-4 py-2">Palavra</th><th className="px-4 py-2">Ocorrências</th><th className="px-4 py-2">Densidade</th></tr></thead><tbody>{data.rows.map((r) => <tr key={r.w} className="border-t border-line"><td className="px-4 py-2 font-medium text-fg">{r.w}</td><td className="px-4 py-2 font-mono">{r.n}</td><td className="px-4 py-2"><div className="flex items-center gap-2"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent" style={{ width: `${Math.min(100, r.p * 10)}%` }} /></div><span className="font-mono text-xs text-fg-2">{fmtNum(r.p, 1)}%</span></div></td></tr>)}</tbody></table></div>
      )}
    </div>
  );
}

export const ExtrairDados = () => <TextTool placeholder="Cole um texto com e-mails, links e telefones…" options={[{ key: "m", label: "Extrair", type: "select", default: "email", options: [{ value: "email", label: "E-mails" }, { value: "url", label: "URLs" }, { value: "tel", label: "Telefones" }, { value: "num", label: "Números" }, { value: "hash", label: "Hashtags e menções" }] }]} transform={(s, o) => { const re = { email: /[\w.+-]+@[\w-]+\.[\w.-]+/g, url: /https?:\/\/[^\s<>"')\]]+/g, tel: /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}/g, num: /-?\d+(?:[.,]\d+)?/g, hash: /[#@][\p{L}\p{N}_]+/gu }[o.m as "email"]!; return [...new Set(s.match(re) ?? [])].join("\n"); }} stats={(_, o) => [{ label: "Encontrados", value: String(o ? o.split("\n").length : 0) }]} />;

const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
export function LoremIpsum() {
  const [n, setN] = useState("3");
  const [mode, setMode] = useState<"p" | "s" | "w">("p");
  const [seed, setSeed] = useState(0);
  const out = useMemo(() => {
    const rnd = () => LOREM[Math.floor(Math.random() * LOREM.length)];
    const sent = () => { const len = 8 + Math.floor(Math.random() * 10); const w = Array.from({ length: len }, rnd); w[0] = w[0][0].toUpperCase() + w[0].slice(1); return w.join(" ") + "."; };
    const para = () => Array.from({ length: 4 + Math.floor(Math.random() * 4) }, sent).join(" ");
    const k = Math.max(1, Math.min(200, Number(n) || 1));
    void seed;
    if (mode === "w") return Array.from({ length: k }, rnd).join(" ");
    if (mode === "s") return Array.from({ length: k }, sent).join(" ");
    return Array.from({ length: k }, para).join("\n\n");
  }, [n, mode, seed]);
  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Quantidade" className="w-28"><Input inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} /></Field>
        <Field label="Tipo" className="w-44"><select value={mode} onChange={(e) => setMode(e.target.value as "p")} className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-[15px]"><option value="p">Parágrafos</option><option value="s">Frases</option><option value="w">Palavras</option></select></Field>
        <Button variant="secondary" onClick={() => setSeed((s) => s + 1)}>Gerar novamente</Button>
        <CopyButton text={out} size="md" variant="primary" />
      </div>
      <Textarea readOnly value={out} className="mt-4 min-h-[260px] bg-bg-2" />
      <div className="mt-3 text-xs text-fg-3">{words(out)} palavras · {out.length} caracteres</div>
    </div>
  );
}

export function CompararTextos() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const diff = useMemo(() => {
    const la = a.split("\n"), lb = b.split("\n");
    const setA = new Set(la), setB = new Set(lb);
    const rows: { t: "=" | "-" | "+"; l: string }[] = [];
    let i = 0, j = 0;
    while (i < la.length || j < lb.length) {
      if (i < la.length && j < lb.length && la[i] === lb[j]) { rows.push({ t: "=", l: la[i] }); i++; j++; }
      else if (i < la.length && !setB.has(la[i])) { rows.push({ t: "-", l: la[i] }); i++; }
      else if (j < lb.length && !setA.has(lb[j])) { rows.push({ t: "+", l: lb[j] }); j++; }
      else { if (i < la.length) { rows.push({ t: "-", l: la[i] }); i++; } if (j < lb.length) { rows.push({ t: "+", l: lb[j] }); j++; } }
    }
    return rows;
  }, [a, b]);
  const added = diff.filter((d) => d.t === "+").length, removed = diff.filter((d) => d.t === "-").length;
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2"><Field label="Texto original"><Textarea value={a} onChange={(e) => setA(e.target.value)} className="min-h-[180px] font-mono text-sm" /></Field><Field label="Texto modificado"><Textarea value={b} onChange={(e) => setB(e.target.value)} className="min-h-[180px] font-mono text-sm" /></Field></div>
      <div className="mt-4 grid grid-cols-3 gap-3"><Stat label="Linhas iguais" value={String(diff.filter((d) => d.t === "=").length)} /><Stat label="Adicionadas" value={`+${added}`} /><Stat label="Removidas" value={`−${removed}`} /></div>
      {(a || b) && (
        <pre className="mt-4 max-h-[400px] overflow-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-[13px] leading-relaxed">
          {diff.map((d, i) => <div key={i} className={d.t === "+" ? "bg-ok/10 text-ok" : d.t === "-" ? "bg-danger/10 text-danger" : "text-fg-2"}><span className="mr-3 select-none opacity-60">{d.t}</span>{d.l || " "}</div>)}
        </pre>
      )}
    </div>
  );
}
