import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, RefreshCw } from "lucide-react";
import { Button, Field, Input, Select, Segmented, Textarea } from "@/components/ui/primitives";
import { CopyButton, ResultBox, Stat } from "@/components/ui/feedback";
import { slugify } from "@/lib/utils";
import { EmptyResult, fmt, pickSeeded, rnd, shuffle, TemplateTool, ToolActions } from "./ToolShell";
import { hslToRgb, parseColor, rgbToHsl, toHex } from "./converters";

/* --------------------------------- Senha ---------------------------------- */
const WORDS = "casa tempo vida mundo pedra rio vento fogo terra luz sombra ponte mesa livro porta chave nuvem chuva sol lua mar campo folha raiz fruto semente barco trem carro roda vidro ferro ouro prata cobre sal mel pao leite cafe agua pao vinho uva figo noz milho arroz feijao trigo lobo urso gato cao peixe ave coruja aguia tigre leao zebra girafa cavalo bateria correto grampo norte sul leste oeste azul verde roxo cinza preto branco".split(" ");
export function GeradorDeSenha() {
  const [mode, setMode] = useState<"pwd" | "phrase">("pwd");
  const [len, setLen] = useState(20); const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true, ambiguous: false });
  const [nWords, setNWords] = useState(4); const [sep, setSep] = useState("-"); const [pw, setPw] = useState("");
  const gen = () => {
    if (mode === "phrase") { setPw(Array.from({ length: nWords }, () => WORDS[rnd(WORDS.length)]).join(sep) + (sep === "-" ? "" : "") + String(rnd(90) + 10)); return; }
    let pool = ""; if (opts.lower) pool += "abcdefghijklmnopqrstuvwxyz"; if (opts.upper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; if (opts.digits) pool += "0123456789"; if (opts.symbols) pool += "!@#$%&*()-_=+[]{};:,.<>?";
    if (!opts.ambiguous) pool = pool.replace(/[Il1O0o]/g, ""); if (!pool) { setPw(""); return; }
    setPw(Array.from({ length: len }, () => pool[rnd(pool.length)]).join(""));
  };
  useEffect(() => { gen(); }, [mode, len, opts, nWords, sep]); // eslint-disable-line react-hooks/exhaustive-deps
  const bits = useMemo(() => { if (!pw) return 0; if (mode === "phrase") return Math.round(nWords * Math.log2(WORDS.length) + 6.5); let pool = 0; if (/[a-z]/.test(pw)) pool += 26; if (/[A-Z]/.test(pw)) pool += 26; if (/\d/.test(pw)) pool += 10; if (/[^a-zA-Z0-9]/.test(pw)) pool += 24; return Math.round(pw.length * Math.log2(pool || 1)); }, [pw, mode, nWords]);
  const strength = bits < 40 ? ["Fraca", "bg-danger", 25] : bits < 60 ? ["Razoável", "bg-warn", 50] : bits < 90 ? ["Forte", "bg-ok", 75] : ["Muito forte", "bg-ok", 100];
  const crackTime = (() => { const guesses = Math.pow(2, bits) / 2; const sec = guesses / 1e10; if (sec < 60) return "segundos"; if (sec < 3600) return `${fmt(sec / 60, 0)} minutos`; if (sec < 86400) return `${fmt(sec / 3600, 0)} horas`; if (sec < 3.15e7) return `${fmt(sec / 86400, 0)} dias`; const y = sec / 3.15e7; return y > 1e12 ? "mais de um trilhão de anos" : y > 1e6 ? `${fmt(y / 1e6, 0)} milhões de anos` : `${fmt(y, 0)} anos`; })();
  return (
    <div className="space-y-6">
      <Segmented value={mode} onChange={setMode} options={[{ value: "pwd", label: "Senha aleatória" }, { value: "phrase", label: "Frase-senha" }]} />
      <div className="rounded-2xl border bg-surface-2/60 p-4">
        <div className="flex items-center gap-2"><output className="min-h-[44px] flex-1 break-all rounded-xl border bg-surface px-4 py-2.5 font-mono text-lg leading-7" aria-live="polite">{pw || "—"}</output><Button size="icon" variant="outline" onClick={gen} aria-label="Gerar nova"><RefreshCw className="h-4 w-4" /></Button><CopyButton text={pw} size="md" variant="primary" /></div>
        <div className="mt-3 flex items-center gap-3 text-xs text-fg-3"><span className="h-1.5 flex-1 rounded-full bg-line"><span className={`block h-full rounded-full ${strength[1]} transition-all`} style={{ width: `${strength[2]}%` }} /></span><span className="font-medium text-fg-2">{strength[0]}</span><span>· {bits} bits · quebra em ~{crackTime}</span></div>
      </div>
      {mode === "pwd" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={`Tamanho: ${len} caracteres`}><input type="range" min={8} max={64} value={len} onChange={(e) => setLen(+e.target.value)} className="w-full accent-[var(--brand)]" /></Field>
          <div className="grid grid-cols-2 gap-2 text-sm">{([["upper", "Maiúsculas (A-Z)"], ["lower", "Minúsculas (a-z)"], ["digits", "Números (0-9)"], ["symbols", "Símbolos (!@#)"], ["ambiguous", "Permitir ambíguos (Il1O0)"]] as const).map(([k, l]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} />{l}</label>)}</div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2"><Field label={`Palavras: ${nWords}`}><input type="range" min={3} max={8} value={nWords} onChange={(e) => setNWords(+e.target.value)} className="w-full accent-[var(--brand)]" /></Field><Field label="Separador"><Select value={sep} onChange={(e) => setSep(e.target.value)}><option value="-">hífen</option><option value=".">ponto</option><option value="_">underscore</option><option value=" ">espaço</option></Select></Field></div>
      )}
      <p className="text-xs text-fg-3">Gerada com crypto.getRandomValues no seu navegador. Nada é enviado. Tempo de quebra estimado a 10 bilhões de tentativas/segundo (offline).</p>
    </div>
  );
}

/* --------------------------------- QR Code -------------------------------- */
export function QrCode() {
  const [type, setType] = useState<"url" | "text" | "wifi" | "email" | "tel" | "vcard">("url");
  const [f, setF] = useState<Record<string, string>>({ url: "https://", text: "", ssid: "", pass: "", sec: "WPA", email: "", subject: "", tel: "", name: "", org: "", phone: "", mail: "" });
  const [size, setSize] = useState(320); const [ecl, setEcl] = useState<"L" | "M" | "Q" | "H">("M"); const [dark, setDark] = useState("#111110"); const [light, setLight] = useState("#ffffff");
  const [png, setPng] = useState(""); const [svg, setSvg] = useState("");
  const data = useMemo(() => {
    switch (type) { case "url": return f.url.length > 8 ? f.url : ""; case "text": return f.text; case "wifi": return f.ssid ? `WIFI:T:${f.sec};S:${f.ssid};P:${f.pass};;` : ""; case "email": return f.email ? `mailto:${f.email}${f.subject ? `?subject=${encodeURIComponent(f.subject)}` : ""}` : ""; case "tel": return f.tel ? `tel:${f.tel}` : ""; case "vcard": return f.name ? `BEGIN:VCARD\nVERSION:3.0\nFN:${f.name}\nORG:${f.org}\nTEL:${f.phone}\nEMAIL:${f.mail}\nEND:VCARD` : ""; }
  }, [type, f]);
  useEffect(() => { if (!data) { setPng(""); setSvg(""); return; } QRCode.toDataURL(data, { width: size, margin: 2, errorCorrectionLevel: ecl, color: { dark, light } }).then(setPng).catch(() => setPng("")); QRCode.toString(data, { type: "svg", margin: 2, errorCorrectionLevel: ecl, color: { dark, light } }).then(setSvg).catch(() => setSvg("")); }, [data, size, ecl, dark, light]);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const dl = (href: string, name: string) => { const a = document.createElement("a"); a.href = href; a.download = name; a.click(); };
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <Segmented value={type} onChange={setType} options={[{ value: "url", label: "Link" }, { value: "text", label: "Texto" }, { value: "wifi", label: "Wi-Fi" }, { value: "email", label: "E-mail" }, { value: "tel", label: "Telefone" }, { value: "vcard", label: "Contato" }]} />
        {type === "url" && <Field label="URL"><Input value={f.url} onChange={set("url")} /></Field>}
        {type === "text" && <Field label="Texto"><Textarea rows={4} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></Field>}
        {type === "wifi" && <div className="grid gap-3 sm:grid-cols-3"><Field label="Nome da rede (SSID)"><Input value={f.ssid} onChange={set("ssid")} /></Field><Field label="Senha"><Input value={f.pass} onChange={set("pass")} /></Field><Field label="Segurança"><Select value={f.sec} onChange={set("sec")}><option>WPA</option><option>WEP</option><option value="nopass">Aberta</option></Select></Field></div>}
        {type === "email" && <div className="grid gap-3 sm:grid-cols-2"><Field label="E-mail"><Input value={f.email} onChange={set("email")} /></Field><Field label="Assunto"><Input value={f.subject} onChange={set("subject")} /></Field></div>}
        {type === "tel" && <Field label="Telefone"><Input value={f.tel} onChange={set("tel")} placeholder="+5511999999999" /></Field>}
        {type === "vcard" && <div className="grid gap-3 sm:grid-cols-2"><Field label="Nome"><Input value={f.name} onChange={set("name")} /></Field><Field label="Empresa"><Input value={f.org} onChange={set("org")} /></Field><Field label="Telefone"><Input value={f.phone} onChange={set("phone")} /></Field><Field label="E-mail"><Input value={f.mail} onChange={set("mail")} /></Field></div>}
        <div className="grid gap-3 sm:grid-cols-4"><Field label="Tamanho"><Select value={size} onChange={(e) => setSize(+e.target.value)}>{[256, 320, 512, 1024].map((s) => <option key={s} value={s}>{s}px</option>)}</Select></Field><Field label="Correção"><Select value={ecl} onChange={(e) => setEcl(e.target.value as "M")}><option value="L">L (7%)</option><option value="M">M (15%)</option><option value="Q">Q (25%)</option><option value="H">H (30%)</option></Select></Field><Field label="Cor"><input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="h-10 w-full rounded-xl border bg-surface p-1" /></Field><Field label="Fundo"><input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="h-10 w-full rounded-xl border bg-surface p-1" /></Field></div>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-surface-2/60 p-6">
        {png ? <><img src={png} alt="QR Code gerado" className="w-full max-w-[280px] rounded-xl border bg-white" /><div className="mt-4 flex flex-wrap justify-center gap-2"><Button size="sm" onClick={() => dl(png, "qrcode.png")}><Download className="h-4 w-4" />PNG</Button><Button size="sm" variant="outline" onClick={() => dl("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg), "qrcode.svg")}><Download className="h-4 w-4" />SVG</Button><CopyButton text={data} label="Copiar conteúdo" /></div><p className="mt-3 max-w-xs break-all text-center font-mono text-[11px] text-fg-3">{data.slice(0, 120)}{data.length > 120 ? "…" : ""}</p></> : <EmptyResult text="Preencha os dados para gerar o QR Code." />}
      </div>
    </div>
  );
}

/* ----------------------------------- IDs ---------------------------------- */
const uuid4 = () => (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = rnd(16); return (c === "x" ? r : (r & 0x3) | 0x8).toString(16); }));
const nano = (n = 21) => { const a = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"; return Array.from({ length: n }, () => a[rnd(64)]).join(""); };
const ulid = () => { const E = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; let t = Date.now(), s = ""; for (let i = 0; i < 10; i++) { s = E[t % 32] + s; t = Math.floor(t / 32); } return s + Array.from({ length: 16 }, () => E[rnd(32)]).join(""); };
export function Uuid() {
  const [kind, setKind] = useState<"uuid" | "nano" | "ulid">("uuid"); const [n, setN] = useState(5); const [upper, setUpper] = useState(false); const [list, setList] = useState<string[]>([]);
  const gen = () => setList(Array.from({ length: Math.min(500, Math.max(1, n)) }, () => (kind === "uuid" ? uuid4() : kind === "nano" ? nano() : ulid())));
  useEffect(() => { gen(); }, [kind, n]); // eslint-disable-line react-hooks/exhaustive-deps
  const out = list.map((x) => (upper ? x.toUpperCase() : x)).join("\n");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3"><Segmented value={kind} onChange={setKind} options={[{ value: "uuid", label: "UUID v4" }, { value: "nano", label: "NanoID" }, { value: "ulid", label: "ULID" }]} /><Field label="Quantidade"><Input type="number" min={1} max={500} value={n} onChange={(e) => setN(+e.target.value)} className="w-24" /></Field><label className="flex h-10 items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={upper} onChange={(e) => setUpper(e.target.checked)} />Maiúsculas</label><Button variant="outline" onClick={gen}><RefreshCw className="h-4 w-4" />Gerar</Button></div>
      <Textarea rows={Math.min(14, Math.max(4, n + 1))} readOnly value={out} className="bg-surface-2/60 font-mono text-[13px]" />
      <ToolActions copyText={out} downloadName={`${kind}s.txt`} />
    </div>
  );
}

export function GeradorDeNumerosAleatorios() {
  const [min, setMin] = useState("1"); const [max, setMax] = useState("100"); const [n, setN] = useState("5"); const [uniq, setUniq] = useState(true); const [dec, setDec] = useState("0"); const [out, setOut] = useState<string[]>([]);
  const gen = () => { const a = parseFloat(min.replace(",", ".")), b = parseFloat(max.replace(",", ".")), k = Math.max(1, Math.min(1000, parseInt(n) || 1)), d = Math.max(0, Math.min(6, parseInt(dec) || 0)); if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return; if (d === 0 && uniq) { const pool = Array.from({ length: Math.min(b - a + 1, 100000) }, (_, i) => a + i); setOut(shuffle(pool).slice(0, k).map(String)); return; } const arr = new Uint32Array(k); crypto.getRandomValues(arr); setOut([...arr].map((x) => (a + (x / 4294967295) * (b - a)).toFixed(d))); };
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4"><Field label="Mínimo"><Input value={min} onChange={(e) => setMin(e.target.value)} /></Field><Field label="Máximo"><Input value={max} onChange={(e) => setMax(e.target.value)} /></Field><Field label="Quantidade"><Input value={n} onChange={(e) => setN(e.target.value)} /></Field><Field label="Casas decimais"><Input value={dec} onChange={(e) => setDec(e.target.value)} /></Field></div>
      <div className="flex flex-wrap items-center gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={uniq} onChange={(e) => setUniq(e.target.checked)} />Sem repetição (inteiros)</label><Button onClick={gen}>Gerar</Button><ToolActions onClear={() => setOut([])} copyText={out.join(", ") || undefined} /></div>
      {out.length ? <ResultBox copyText={out.join(", ")}><div className="flex flex-wrap gap-2">{out.map((x, i) => <span key={i} className="rounded-lg border bg-surface px-3 py-1.5 font-mono text-base tabular-nums">{x}</span>)}</div>{out.length > 1 && <p className="mt-3 text-xs text-fg-3">Soma: {fmt(out.reduce((a, x) => a + parseFloat(x), 0))} · Média: {fmt(out.reduce((a, x) => a + parseFloat(x), 0) / out.length)}</p>}</ResultBox> : <EmptyResult text="Clique em “Gerar”." />}
    </div>
  );
}

/* -------------------------------- Criativos -------------------------------- */
const ANGLES = ["{n} erros comuns em {t} (e como evitar)", "Guia para iniciantes em {t}", "O que ninguém conta sobre {t}", "{t}: antes e depois", "Checklist definitivo de {t}", "Como eu usaria {t} se começasse hoje", "{t} em 5 minutos por dia", "Mitos e verdades sobre {t}", "Ferramentas gratuitas para {t}", "{t} para {p}: por onde começar", "Bastidores: como fazemos {t}", "Comparativo: {t} tradicional × com IA", "Perguntas que todo mundo faz sobre {t}", "Um dia aplicando {t}", "A regra 80/20 de {t}", "{t}: o que mudou em 2026", "Estudo de caso: {t} na prática", "Tendências de {t} para observar", "O custo real de ignorar {t}", "Passo a passo: {t} do zero"];
const FORMATS = ["carrossel", "vídeo curto", "artigo", "thread", "live", "newsletter", "infográfico", "podcast"];
export const GeradorDeIdeias = () => <TemplateTool cta="Gerar ideias" fields={[{ key: "t", label: "Tema", placeholder: "produtividade com IA" }, { key: "p", label: "Público", placeholder: "pequenos empresários", default: "iniciantes" }, { key: "q", label: "Quantidade", type: "select", default: "10", options: [{ value: "10", label: "10 ideias" }, { value: "20", label: "20 ideias" }] }]} build={(v) => { if (!v.t) return "Informe um tema."; const seed = v.__seed; const list = shuffle(ANGLES).slice(0, parseInt(v.q)); return list.map((a, i) => `${i + 1}. ${a.replace(/\{t\}/g, v.t).replace("{p}", v.p || "iniciantes").replace("{n}", String(3 + ((i + parseInt(seed)) % 7)))}  — formato: ${pickSeeded(FORMATS, seed + i)}`).join("\n"); }} />;

const SUF = ["ly", "ify", "io", "hub", "lab", "base", "flow", "kit", "wise", "nest", "way", "zen", "verse", "mind", "sync"];
const PRE = ["Neo", "Meta", "Omni", "Alto", "Vera", "Nova", "Luma", "Kilo", "Ora", "Pro"];
export const NomesDeNegocio = () => <TemplateTool cta="Gerar nomes" fields={[{ key: "a", label: "Palavra-chave 1", placeholder: "nuvem" }, { key: "b", label: "Palavra-chave 2 (opcional)", placeholder: "dados" }, { key: "s", label: "Estilo", type: "select", default: "mix", options: [{ value: "mix", label: "Variado" }, { value: "tech", label: "Tech / startup" }, { value: "pt", label: "Português direto" }, { value: "inv", label: "Inventado" }] }]} build={(v) => { const a = slugify(v.a || "nexo").replace(/-/g, ""), b = slugify(v.b || "").replace(/-/g, ""); if (!a) return "Informe uma palavra-chave."; const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1); const out = new Set<string>(); const root = a.slice(0, 4), root2 = b ? b.slice(0, 4) : a.slice(-3); const cands = [cap(a) + cap(b), cap(b) + cap(a), cap(root) + root2, cap(a) + pickSeeded(SUF, v.__seed), cap(root) + pickSeeded(SUF, v.__seed, 1), pickSeeded(PRE, v.__seed) + a, cap(a.slice(0, 3)) + "a", cap(a) + "&" + cap(b), cap(root) + "ix", cap(a) + " Studio", cap(a) + " Co.", cap(root2) + cap(root), cap(a) + "up", "Go" + cap(a), cap(a) + " Digital", cap(root) + "o", cap(a).replace(/[aeiou]/g, "") + cap(b.slice(0, 2)), cap(a) + "ex"]; shuffle(cands).forEach((c) => { if (c && c.length > 2 && !/^&|&$/.test(c)) out.add(c); }); return [...out].slice(0, 15).map((n) => `${n}  →  ${slugify(n)}.com`).join("\n"); }} />;

export const NomeDeUsuario = () => <TemplateTool cta="Gerar usernames" fields={[{ key: "n", label: "Nome ou apelido", placeholder: "ana" }, { key: "i", label: "Interesse / profissão", placeholder: "design" }, { key: "s", label: "Estilo", type: "select", default: "clean", options: [{ value: "clean", label: "Limpo" }, { value: "gamer", label: "Gamer" }, { value: "pro", label: "Profissional" }] }]} build={(v) => { const n = slugify(v.n || "user").replace(/-/g, ""), i = slugify(v.i || "").replace(/-/g, ""); const yr = String(new Date().getFullYear()).slice(2); const nums = [String(rnd(90) + 10), yr, String(rnd(900) + 100)]; const base = [`${n}.${i}`, `${n}_${i}`, `${n}${i}`, `${i}.${n}`, `${n}.oficial`, `${n}${nums[0]}`, `${n}_${nums[1]}`, `real${n}`, `${n}.${i.slice(0, 3)}`, `${i}by${n}`, `${n}${i.replace(/[aeiou]/g, "")}`, `o${n}`, `${n}.br`, `${n}.${i}.${nums[2]}`, `hey${n}`]; const gamer = [`x${n}x`, `${n}_gg`, `${n}Zz`, `${n}${nums[2]}`, `dark${n}`, `${n}_plays`]; const pro = [`${n}.${i}`, `${n}.pro`, `${n}.works`, `${n}.dev`, `${n}.studio`]; const list = v.s === "gamer" ? [...gamer, ...base] : v.s === "pro" ? [...pro, ...base] : base; return [...new Set(list.map((x) => x.replace(/\.+$|^\.+|\.\./g, "")).filter((x) => x.length >= 3))].slice(0, 15).join("\n"); }} />;

/* ---------------------------------- Cores ---------------------------------- */
export function PaletaDeCores() {
  const [base, setBase] = useState("#1d4ed8"); const [mode, setMode] = useState<"tones" | "comp" | "analog" | "triad" | "split">("tones");
  const rgb = parseColor(base); const hsl = rgb ? rgbToHsl(...rgb) : [224, 76, 48];
  const pal = useMemo(() => { const [h, s, l] = hsl; const mk = (hh: number, ss = s, ll = l) => toHex(...hslToRgb(((hh % 360) + 360) % 360, Math.max(0, Math.min(100, ss)), Math.max(0, Math.min(100, ll)))); switch (mode) { case "tones": return [95, 85, 70, 55, 45, 35, 25, 15].map((ll) => mk(h, s, ll)); case "comp": return [mk(h), mk(h, s, l + 20), mk(h + 180), mk(h + 180, s, l + 20), mk(h, s * 0.3, 92)]; case "analog": return [mk(h - 40), mk(h - 20), mk(h), mk(h + 20), mk(h + 40)]; case "triad": return [mk(h), mk(h + 120), mk(h + 240), mk(h, s * 0.4, 90), mk(h, s, 20)]; case "split": return [mk(h), mk(h + 150), mk(h + 210), mk(h, s * 0.3, 92), mk(h, s, 22)]; } }, [hsl, mode]);
  const css = pal.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3"><div className="flex gap-2"><input type="color" value={rgb ? toHex(...rgb) : "#000"} onChange={(e) => setBase(e.target.value)} className="h-10 w-12 rounded-xl border bg-surface p-1" /><Field label="Cor base"><Input value={base} onChange={(e) => setBase(e.target.value)} className="w-36 font-mono" /></Field></div><Segmented value={mode} onChange={setMode} options={[{ value: "tones", label: "Tons" }, { value: "comp", label: "Complementar" }, { value: "analog", label: "Análoga" }, { value: "triad", label: "Tríade" }, { value: "split", label: "Split" }]} /></div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">{pal.map((c, i) => <button key={i} onClick={() => navigator.clipboard?.writeText(c)} className="group rounded-xl border p-1 text-left" title="Clique para copiar"><div className="h-16 rounded-lg" style={{ background: c }} /><p className="mt-1 px-1 font-mono text-[11px] text-fg-3 group-hover:text-fg">{c}</p></button>)}</div>
      <ResultBox title="CSS" copyText={`:root {\n${css}\n}`}><pre className="font-mono text-[13px] leading-6 text-fg-2">{`:root {\n${css}\n}`}</pre></ResultBox>
    </div>
  );
}

export function GradienteCss() {
  const [type, setType] = useState<"linear" | "radial" | "conic">("linear"); const [angle, setAngle] = useState(135); const [stops, setStops] = useState([{ c: "#1d4ed8", p: 0 }, { c: "#7c3aed", p: 100 }]);
  const css = type === "linear" ? `linear-gradient(${angle}deg, ${stops.map((s) => `${s.c} ${s.p}%`).join(", ")})` : type === "radial" ? `radial-gradient(circle at center, ${stops.map((s) => `${s.c} ${s.p}%`).join(", ")})` : `conic-gradient(from ${angle}deg, ${stops.map((s) => `${s.c} ${s.p}%`).join(", ")})`;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Segmented value={type} onChange={setType} options={[{ value: "linear", label: "Linear" }, { value: "radial", label: "Radial" }, { value: "conic", label: "Cônico" }]} />
        {type !== "radial" && <Field label={`Ângulo: ${angle}°`}><input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-[var(--brand)]" /></Field>}
        {stops.map((s, i) => <div key={i} className="flex items-center gap-2"><input type="color" value={s.c} onChange={(e) => setStops(stops.map((x, j) => (j === i ? { ...x, c: e.target.value } : x)))} className="h-10 w-12 rounded-xl border bg-surface p-1" /><Input className="w-28 font-mono" value={s.c} onChange={(e) => setStops(stops.map((x, j) => (j === i ? { ...x, c: e.target.value } : x)))} /><input type="range" min={0} max={100} value={s.p} onChange={(e) => setStops(stops.map((x, j) => (j === i ? { ...x, p: +e.target.value } : x)))} className="flex-1 accent-[var(--brand)]" /><span className="w-10 text-right text-xs tabular-nums text-fg-3">{s.p}%</span>{stops.length > 2 && <Button size="icon" variant="ghost" onClick={() => setStops(stops.filter((_, j) => j !== i))} aria-label="Remover">×</Button>}</div>)}
        {stops.length < 5 && <Button size="sm" variant="outline" onClick={() => setStops([...stops, { c: "#f59e0b", p: 50 }])}>+ Adicionar cor</Button>}
      </div>
      <div className="space-y-4"><div className="h-48 rounded-2xl border" style={{ background: css }} /><ResultBox title="CSS" copyText={`background: ${css};`}><pre className="whitespace-pre-wrap break-all font-mono text-[13px] leading-6 text-fg-2">background: {css};</pre></ResultBox></div>
    </div>
  );
}

export function BoxShadowCss() {
  const [l, setL] = useState([{ x: 0, y: 10, b: 30, s: -10, o: 25 }, { x: 0, y: 2, b: 6, s: 0, o: 8 }]); const [color, setColor] = useState("#000000"); const [inset, setInset] = useState(false);
  const rgb = parseColor(color) ?? [0, 0, 0];
  const css = l.map((s) => `${inset ? "inset " : ""}${s.x}px ${s.y}px ${s.b}px ${s.s}px rgba(${rgb.join(", ")}, ${(s.o / 100).toFixed(2)})`).join(",\n  ");
  const upd = (i: number, k: string, v: number) => setL(l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center gap-3"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-12 rounded-xl border bg-surface p-1" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={inset} onChange={(e) => setInset(e.target.checked)} />Inset</label>{l.length < 3 && <Button size="sm" variant="outline" onClick={() => setL([...l, { x: 0, y: 1, b: 2, s: 0, o: 10 }])}>+ Camada</Button>}</div>
        {l.map((s, i) => <div key={i} className="rounded-xl border bg-surface-2/50 p-3"><div className="mb-2 flex items-center justify-between text-xs font-medium text-fg-3"><span>Camada {i + 1}</span>{l.length > 1 && <button onClick={() => setL(l.filter((_, j) => j !== i))} className="hover:text-fg">remover</button>}</div><div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">{([["x", "X", -50, 50], ["y", "Y", -50, 50], ["b", "Blur", 0, 100], ["s", "Spread", -50, 50], ["o", "Opacidade", 0, 100]] as const).map(([k, lab, min, max]) => <label key={k} className="text-[11px] text-fg-3">{lab}: {s[k]}<input type="range" min={min} max={max} value={s[k]} onChange={(e) => upd(i, k, +e.target.value)} className="w-full accent-[var(--brand)]" /></label>)}</div></div>)}
      </div>
      <div className="space-y-4"><div className="grid h-48 place-items-center rounded-2xl border bg-bg-2"><div className="h-24 w-40 rounded-2xl bg-surface" style={{ boxShadow: css.replace(/\n\s*/g, " ") }} /></div><ResultBox title="CSS" copyText={`box-shadow: ${css};`}><pre className="whitespace-pre-wrap font-mono text-[13px] leading-6 text-fg-2">box-shadow: {css};</pre></ResultBox></div>
    </div>
  );
}

/* ------------------------------ Marketing --------------------------------- */
const HASH: Record<string, string[]> = { marketing: ["marketingdigital", "dicasdemarketing", "empreendedorismo", "vendasonline", "negociosdigitais", "estrategiadigital", "socialmedia", "branding", "copywriting", "trafegopago"], tecnologia: ["tecnologia", "inovacao", "inteligenciaartificial", "ia", "programacao", "devlife", "tech", "startup", "futuro", "automacao"], fitness: ["fitness", "treino", "vidasaudavel", "academia", "saude", "bemestar", "dieta", "corrida", "musculacao", "foco"], moda: ["moda", "lookdodia", "estilo", "fashion", "tendencias", "ootd", "modafeminina", "modamasculina", "lookinspiracao", "acessorios"], comida: ["receitas", "comida", "gastronomia", "cozinha", "receitafacil", "foodporn", "culinaria", "docesesobremesas", "comidasaudavel", "chef"], viagem: ["viagem", "turismo", "viajar", "destinos", "mochilao", "trip", "ferias", "aventura", "natureza", "explorar"], design: ["design", "ui", "ux", "designgrafico", "tipografia", "identidadevisual", "criatividade", "inspiracao", "designer", "portfolio"], financas: ["financas", "investimentos", "educacaofinanceira", "dinheiro", "rendaextra", "bolsadevalores", "economia", "poupar", "liberdadefinanceira", "planejamento"], educacao: ["educacao", "estudos", "aprender", "concursos", "vestibular", "dicasdeestudo", "conhecimento", "leitura", "professor", "escola"], geral: ["dicas", "inspiracao", "motivacao", "brasil", "conteudo", "aprendizado", "novidade", "tendencia", "comunidade", "compartilhe"] };
export const GeradorDeHashtags = () => <TemplateTool cta="Gerar hashtags" fields={[{ key: "n", label: "Nicho", type: "select", default: "marketing", options: Object.keys(HASH).map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) })) }, { key: "k", label: "Palavras do seu post (separadas por vírgula)", placeholder: "produtividade, home office, rotina" }, { key: "q", label: "Quantidade", type: "select", default: "15", options: [{ value: "10", label: "10" }, { value: "15", label: "15" }, { value: "25", label: "25" }] }]} build={(v) => { const own = (v.k || "").split(",").map((x) => slugify(x).replace(/-/g, "")).filter(Boolean); const niche = shuffle(HASH[v.n] ?? HASH.geral); const gen = shuffle(HASH.geral); const derived = own.flatMap((o) => [o, `${o}dicas`, `${o}brasil`, `dicasde${o}`]); const all = [...new Set([...own, ...niche.slice(0, 8), ...derived.slice(0, 6), ...gen.slice(0, 4)])].slice(0, parseInt(v.q)); return `${all.map((h) => `#${h}`).join(" ")}\n\n— Populares: ${niche.slice(0, 4).map((h) => `#${h}`).join(" ")}\n— Nicho: ${derived.slice(0, 4).map((h) => `#${h}`).join(" ")}\n— Genéricas: ${gen.slice(0, 3).map((h) => `#${h}`).join(" ")}`; }} />;

const HEADLINES = ["{n} erros de {t} que custam caro (e como corrigir)", "Como {v} sem {d}: guia prático", "O guia definitivo de {t} para {p}", "{t}: o que funciona em 2026 (e o que não funciona mais)", "Por que a maioria falha em {t} — e como não ser um deles", "{n} maneiras comprovadas de {v}", "A verdade sobre {t} que ninguém conta para {p}", "Como {v} em 30 dias: passo a passo", "{t} explicado em 5 minutos", "Você está fazendo {t} errado? {n} sinais", "De zero a {t}: o método que usei", "{t} para {p}: comece hoje com isso", "O que aprendi com {n} anos de {t}", "Pare de {d}: faça isso em vez disso", "Checklist de {t}: {n} itens que você não pode esquecer", "{t} sem enrolação: só o que importa", "A pergunta que muda tudo em {t}", "Como {p} podem {v} (mesmo sem experiência)", "Antes de investir em {t}, leia isto", "{n} ferramentas gratuitas para {v}"];
export const GeradorDeTitulos = () => <TemplateTool cta="Gerar títulos" fields={[{ key: "t", label: "Tema", placeholder: "SEO" }, { key: "v", label: "Verbo + objetivo", placeholder: "aumentar o tráfego orgânico" }, { key: "p", label: "Público", placeholder: "pequenas empresas", default: "iniciantes" }, { key: "d", label: "Dor / obstáculo", placeholder: "gastar com anúncios", default: "perder tempo" }]} build={(v) => { if (!v.t) return "Informe um tema."; return shuffle(HEADLINES).slice(0, 12).map((h, i) => { const s = h.replace(/\{t\}/g, v.t).replace(/\{v\}/g, v.v || `dominar ${v.t}`).replace(/\{p\}/g, v.p || "iniciantes").replace(/\{d\}/g, v.d || "perder tempo").replace(/\{n\}/g, String([3, 5, 7, 9, 10, 12][(i + parseInt(v.__seed)) % 6])); const s2 = s.charAt(0).toUpperCase() + s.slice(1); return `${s2}  (${s2.length} caracteres${s2.length > 60 ? " — longo para SEO" : ""})`; }).join("\n"); }} />;

export const GeradorDeBio = () => <TemplateTool cta="Gerar bios" fields={[{ key: "n", label: "Nome", placeholder: "Ana Souza" }, { key: "p", label: "Profissão / o que faz", placeholder: "Designer de produto" }, { key: "q", label: "Para quem / resultado", placeholder: "ajudo startups a lançar mais rápido" }, { key: "c", label: "Chamada (link, contato)", placeholder: "↓ portfólio e contato", default: "↓ link" }, { key: "x", label: "Toque pessoal (opcional)", placeholder: "café, corrida e livros" }]} build={(v) => { if (!v.p) return "Informe a profissão."; const emoji = pickSeeded(["✦", "→", "◆", "•", "—"], v.__seed); const pro = [`${v.p}${v.q ? ` · ${v.q.charAt(0).toUpperCase() + v.q.slice(1)}` : ""}${v.c ? `\n${v.c}` : ""}`, `${v.n ? v.n + " · " : ""}${v.p}\n${v.q || ""}${v.x ? `\n${v.x}` : ""}\n${v.c || ""}`]; const criativo = [`${emoji} ${v.p}\n${emoji} ${v.q || "fazendo coisas que importam"}\n${v.x ? `${emoji} ${v.x}\n` : ""}${v.c || ""}`, `${v.p.toLowerCase()} que ${v.q ? v.q.replace(/^ajudo /, "ajuda ") : "não desiste fácil"}${v.x ? ` · ${v.x}` : ""}\n${v.c || ""}`]; const direto = [`${v.p}. ${v.q ? v.q.charAt(0).toUpperCase() + v.q.slice(1) + "." : ""} ${v.c || ""}`.trim(), `${v.q ? v.q.charAt(0).toUpperCase() + v.q.slice(1) : v.p}\n${v.p}${v.n ? ` · ${v.n}` : ""}`]; const all = [["Profissional", pro], ["Criativa", criativo], ["Direta", direto]] as const; return all.map(([k, arr]) => `— ${k} —\n${arr.map((b) => `${b.trim()}  (${[...b.trim()].length}/150)`).join("\n\n")}`).join("\n\n"); }} />;

export function GeradorDeMetaTags() {
  const [f, setF] = useState({ title: "", desc: "", url: "https://", img: "", site: "", type: "website" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const esc = (s: string) => s.replace(/"/g, "&quot;");
  const out = f.title ? [`<title>${f.title}</title>`, `<meta name="description" content="${esc(f.desc)}">`, `<link rel="canonical" href="${f.url}">`, ``, `<meta property="og:type" content="${f.type}">`, `<meta property="og:title" content="${esc(f.title)}">`, `<meta property="og:description" content="${esc(f.desc)}">`, `<meta property="og:url" content="${f.url}">`, f.img && `<meta property="og:image" content="${f.img}">`, f.site && `<meta property="og:site_name" content="${esc(f.site)}">`, ``, `<meta name="twitter:card" content="${f.img ? "summary_large_image" : "summary"}">`, `<meta name="twitter:title" content="${esc(f.title)}">`, `<meta name="twitter:description" content="${esc(f.desc)}">`, f.img && `<meta name="twitter:image" content="${f.img}">`].filter((x): x is string => typeof x === "string").join("\n") : "";
  const tl = [...f.title].length, dl = [...f.desc].length;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Título" hint={`${tl}/60 ${tl > 60 ? "— pode ser cortado no Google" : ""}`}><Input value={f.title} onChange={set("title")} /></Field>
        <Field label="Descrição" hint={`${dl}/160 ${dl > 160 ? "— longa" : dl > 0 && dl < 120 ? "— pode ser mais completa" : ""}`}><Textarea rows={3} value={f.desc} onChange={set("desc")} /></Field>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="URL canônica"><Input value={f.url} onChange={set("url")} /></Field><Field label="Imagem (og:image)"><Input value={f.img} onChange={set("img")} placeholder="https://…/capa.jpg" /></Field><Field label="Nome do site"><Input value={f.site} onChange={set("site")} /></Field><Field label="Tipo"><Select value={f.type} onChange={set("type")}><option value="website">website</option><option value="article">article</option><option value="product">product</option></Select></Field></div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border bg-surface p-4"><p className="mb-2 text-[11px] uppercase tracking-wide text-fg-3">Prévia no Google</p><p className="text-xs text-ok">{f.url}</p><p className="text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{f.title || "Título da página"}</p><p className="text-sm text-fg-2">{f.desc || "Descrição da página aparece aqui."}</p></div>
        {out ? <ResultBox title="HTML" copyText={out}><pre className="overflow-x-auto font-mono text-[12px] leading-5 text-fg-2">{out}</pre></ResultBox> : <EmptyResult text="Preencha título e descrição." />}
      </div>
    </div>
  );
}

export function GeradorDeUtm() {
  const [f, setF] = useState({ url: "https://", source: "", medium: "", campaign: "", term: "", content: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const out = useMemo(() => { if (!f.url || f.url.length < 9 || !f.source || !f.medium || !f.campaign) return ""; try { const u = new URL(f.url); (["source", "medium", "campaign", "term", "content"] as const).forEach((k) => { if (f[k]) u.searchParams.set(`utm_${k}`, slugify(f[k]).replace(/-/g, "_")); }); return u.toString(); } catch { return ""; } }, [f]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="URL de destino" className="sm:col-span-2"><Input value={f.url} onChange={set("url")} /></Field>
        <Field label="utm_source *" hint="google, instagram, newsletter"><Input value={f.source} onChange={set("source")} /></Field><Field label="utm_medium *" hint="cpc, social, email"><Input value={f.medium} onChange={set("medium")} /></Field>
        <Field label="utm_campaign *" hint="lancamento_marco"><Input value={f.campaign} onChange={set("campaign")} /></Field><Field label="utm_term" hint="palavra-chave (opcional)"><Input value={f.term} onChange={set("term")} /></Field>
        <Field label="utm_content" hint="variação do anúncio (opcional)" className="sm:col-span-2"><Input value={f.content} onChange={set("content")} /></Field>
      </div>
      {out ? <ResultBox title="URL rastreável" copyText={out}><p className="break-all font-mono text-sm leading-6">{out}</p><p className="mt-3 text-xs text-fg-3">Valores normalizados para minúsculas e sem acentos, como recomenda o Google Analytics.</p></ResultBox> : <EmptyResult text="Preencha URL, source, medium e campaign." />}
    </div>
  );
}

export function AssinaturaDeEmail() {
  const [f, setF] = useState({ name: "", role: "", company: "", phone: "", email: "", site: "", color: "#1d4ed8" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const html = f.name ? `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;line-height:1.5"><tr><td style="border-left:3px solid ${f.color};padding-left:12px"><strong style="font-size:16px">${f.name}</strong><br>${[f.role, f.company].filter(Boolean).join(" · ")}<br>${f.phone ? `<span>${f.phone}</span> · ` : ""}${f.email ? `<a href="mailto:${f.email}" style="color:${f.color};text-decoration:none">${f.email}</a>` : ""}${f.site ? `<br><a href="${f.site}" style="color:${f.color};text-decoration:none">${f.site.replace(/^https?:\/\//, "")}</a>` : ""}</td></tr></table>` : "";
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Nome"><Input value={f.name} onChange={set("name")} /></Field><Field label="Cargo"><Input value={f.role} onChange={set("role")} /></Field><Field label="Empresa"><Input value={f.company} onChange={set("company")} /></Field><Field label="Telefone"><Input value={f.phone} onChange={set("phone")} /></Field><Field label="E-mail"><Input value={f.email} onChange={set("email")} /></Field><Field label="Site"><Input value={f.site} onChange={set("site")} placeholder="https://" /></Field><Field label="Cor de destaque"><input type="color" value={f.color} onChange={set("color")} className="h-10 w-full rounded-xl border bg-surface p-1" /></Field></div>
      <div className="space-y-4">{html ? <><div className="rounded-2xl border bg-white p-5 text-black" dangerouslySetInnerHTML={{ __html: html }} /><ResultBox title="HTML" copyText={html}><pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-5 text-fg-3">{html}</pre></ResultBox><p className="text-xs text-fg-3">Dica: selecione a prévia acima e copie (Ctrl+C) para colar direto no Gmail/Outlook com formatação.</p></> : <EmptyResult text="Preencha ao menos o nome." />}</div>
    </div>
  );
}

/* ------------------------------- CPF / CNPJ -------------------------------- */
const cpfDv = (d: number[]) => { const c = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += d[i] * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; }; return [c(9), c(10)]; };
const cnpjDv = (d: number[]) => { const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], w2 = [6, ...w1]; const c = (w: number[]) => { const s = w.reduce((a, x, i) => a + x * d[i], 0) % 11; return s < 2 ? 0 : 11 - s; }; return [c(w1), c(w2)]; };
export function validaCpf(s: string) { const d = s.replace(/\D/g, "").split("").map(Number); if (d.length !== 11 || new Set(d).size === 1) return false; const [a, b] = cpfDv(d); return d[9] === a && d[10] === b; }
export function validaCnpj(s: string) { const d = s.replace(/\D/g, "").split("").map(Number); if (d.length !== 14 || new Set(d).size === 1) return false; const [a] = cnpjDv(d); d[12] = a; const [, b] = cnpjDv(d); return d[12] === a && d[13] === b; }
const fmtCpf = (d: number[]) => d.join("").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
const fmtCnpj = (d: number[]) => d.join("").replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
export function ValidadorDeCpfCnpj() {
  const [v, setV] = useState(""); const [gen, setGen] = useState<string[]>([]);
  const digits = v.replace(/\D/g, ""); const kind = digits.length === 11 ? "CPF" : digits.length === 14 ? "CNPJ" : null; const ok = kind === "CPF" ? validaCpf(digits) : kind === "CNPJ" ? validaCnpj(digits) : null;
  const genCpf = () => { const d = Array.from({ length: 9 }, () => rnd(10)); const [a, b] = cpfDv([...d, 0, 0]); return fmtCpf([...d, a, b]); };
  const genCnpj = () => { const d = [...Array.from({ length: 8 }, () => rnd(10)), 0, 0, 0, 1]; const [a] = cnpjDv([...d, 0, 0]); const [, b] = cnpjDv([...d, a, 0]); return fmtCnpj([...d, a, b]); };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4"><Field label="CPF ou CNPJ"><Input value={v} onChange={(e) => setV(e.target.value)} placeholder="000.000.000-00 ou 00.000.000/0000-00" className="h-12 font-mono text-lg" /></Field>
        {kind ? <div className={`rounded-xl border p-4 text-sm font-medium ${ok ? "border-ok/30 bg-ok/10 text-ok" : "border-danger/30 bg-danger/10 text-danger"}`}>{ok ? `✓ ${kind} válido (dígitos verificadores conferem)` : `✗ ${kind} inválido`}</div> : v && <p className="text-sm text-fg-3">Digite 11 dígitos (CPF) ou 14 (CNPJ).</p>}
        <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setGen([genCpf(), genCpf(), genCpf()])}>Gerar CPFs de teste</Button><Button variant="outline" size="sm" onClick={() => setGen([genCnpj(), genCnpj(), genCnpj()])}>Gerar CNPJs de teste</Button><ToolActions onClear={() => { setV(""); setGen([]); }} /></div></div>
      {gen.length ? <ResultBox title="Números válidos para teste" copyText={gen.join("\n")}><ul className="space-y-2 font-mono text-lg">{gen.map((g) => <li key={g}>{g}</li>)}</ul><p className="mt-3 text-xs text-fg-3">Gerados aleatoriamente — apenas para testes de software. Não correspondem a pessoas ou empresas reais.</p></ResultBox> : <div className="rounded-2xl border border-dashed p-6 text-sm text-fg-3"><Stat label="Como funciona" value={<span className="text-base font-normal">Os dois últimos dígitos são calculados a partir dos anteriores por módulo 11. A validação confere esse cálculo.</span>} /></div>}
    </div>
  );
}
