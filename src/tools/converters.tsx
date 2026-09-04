import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { ResultBox, Stat } from "@/components/ui/feedback";
import { useLocalStorage } from "@/lib/store";
import { formatNumber, parseNum } from "@/lib/utils";
import { EmptyResult, fmt, TextTool, ToolActions, type ToolProps } from "./ToolShell";

/* ------------------------------ Unit converter ----------------------------- */
type Unit = { k: string; n: string; f: number };
const UNITS: Record<string, { base: string; units: Unit[] }> = {
  comprimento: { base: "m", units: [{ k: "mm", n: "Milímetro", f: 0.001 }, { k: "cm", n: "Centímetro", f: 0.01 }, { k: "m", n: "Metro", f: 1 }, { k: "km", n: "Quilômetro", f: 1000 }, { k: "in", n: "Polegada", f: 0.0254 }, { k: "ft", n: "Pé", f: 0.3048 }, { k: "yd", n: "Jarda", f: 0.9144 }, { k: "mi", n: "Milha", f: 1609.344 }, { k: "nmi", n: "Milha náutica", f: 1852 }] },
  peso: { base: "kg", units: [{ k: "mg", n: "Miligrama", f: 1e-6 }, { k: "g", n: "Grama", f: 0.001 }, { k: "kg", n: "Quilograma", f: 1 }, { k: "t", n: "Tonelada", f: 1000 }, { k: "oz", n: "Onça", f: 0.028349523 }, { k: "lb", n: "Libra", f: 0.45359237 }, { k: "@", n: "Arroba", f: 15 }, { k: "st", n: "Stone", f: 6.35029 }] },
  velocidade: { base: "m/s", units: [{ k: "m/s", n: "Metro por segundo", f: 1 }, { k: "km/h", n: "Quilômetro por hora", f: 1 / 3.6 }, { k: "mph", n: "Milha por hora", f: 0.44704 }, { k: "kn", n: "Nó", f: 0.514444 }, { k: "ft/s", n: "Pé por segundo", f: 0.3048 }] },
  area: { base: "m²", units: [{ k: "cm²", n: "Centímetro²", f: 0.0001 }, { k: "m²", n: "Metro²", f: 1 }, { k: "km²", n: "Quilômetro²", f: 1e6 }, { k: "ha", n: "Hectare", f: 10000 }, { k: "ac", n: "Acre", f: 4046.856 }, { k: "ft²", n: "Pé²", f: 0.09290304 }, { k: "alq-sp", n: "Alqueire paulista", f: 24200 }, { k: "alq-mg", n: "Alqueire mineiro", f: 48400 }] },
  volume: { base: "L", units: [{ k: "ml", n: "Mililitro", f: 0.001 }, { k: "L", n: "Litro", f: 1 }, { k: "m³", n: "Metro cúbico", f: 1000 }, { k: "gal", n: "Galão (US)", f: 3.785411784 }, { k: "gal-uk", n: "Galão (UK)", f: 4.54609 }, { k: "cup", n: "Xícara (240 ml)", f: 0.24 }, { k: "tbsp", n: "Colher de sopa", f: 0.015 }, { k: "tsp", n: "Colher de chá", f: 0.005 }, { k: "fl-oz", n: "Onça fluida", f: 0.0295735 }] },
  energia: { base: "J", units: [{ k: "J", n: "Joule", f: 1 }, { k: "kJ", n: "Quilojoule", f: 1000 }, { k: "cal", n: "Caloria", f: 4.184 }, { k: "kcal", n: "Quilocaloria", f: 4184 }, { k: "Wh", n: "Watt-hora", f: 3600 }, { k: "kWh", n: "Quilowatt-hora", f: 3.6e6 }, { k: "BTU", n: "BTU", f: 1055.06 }] },
  pressao: { base: "Pa", units: [{ k: "Pa", n: "Pascal", f: 1 }, { k: "kPa", n: "Quilopascal", f: 1000 }, { k: "bar", n: "Bar", f: 100000 }, { k: "psi", n: "PSI", f: 6894.757 }, { k: "atm", n: "Atmosfera", f: 101325 }, { k: "mmHg", n: "mmHg", f: 133.322 }] },
  tempo: { base: "s", units: [{ k: "ms", n: "Milissegundo", f: 0.001 }, { k: "s", n: "Segundo", f: 1 }, { k: "min", n: "Minuto", f: 60 }, { k: "h", n: "Hora", f: 3600 }, { k: "d", n: "Dia", f: 86400 }, { k: "sem", n: "Semana", f: 604800 }, { k: "mês", n: "Mês (30,44 d)", f: 2629800 }, { k: "ano", n: "Ano (365,25 d)", f: 31557600 }] },
  "dados-digitais": { base: "B", units: [{ k: "bit", n: "Bit", f: 0.125 }, { k: "B", n: "Byte", f: 1 }, { k: "KB", n: "Kilobyte (10³)", f: 1e3 }, { k: "MB", n: "Megabyte (10⁶)", f: 1e6 }, { k: "GB", n: "Gigabyte (10⁹)", f: 1e9 }, { k: "TB", n: "Terabyte (10¹²)", f: 1e12 }, { k: "KiB", n: "Kibibyte (2¹⁰)", f: 1024 }, { k: "MiB", n: "Mebibyte (2²⁰)", f: 1048576 }, { k: "GiB", n: "Gibibyte (2³⁰)", f: 1073741824 }, { k: "TiB", n: "Tebibyte (2⁴⁰)", f: 1099511627776 }, { k: "Mbps", n: "Megabit/s", f: 125000 }] },
};
const DEFAULTS: Record<string, [string, string]> = { comprimento: ["km", "mi"], peso: ["kg", "lb"], velocidade: ["km/h", "mph"], area: ["ha", "m²"], volume: ["L", "gal"], energia: ["kWh", "kcal"], pressao: ["psi", "bar"], tempo: ["h", "min"], "dados-digitais": ["GB", "MB"] };

export function UnitConverter({ meta }: ToolProps) {
  const set = UNITS[meta.slug] ?? UNITS.comprimento;
  const [from, setFrom] = useState(DEFAULTS[meta.slug]?.[0] ?? set.units[0].k);
  const [to, setTo] = useState(DEFAULTS[meta.slug]?.[1] ?? set.units[1].k);
  const [val, setVal] = useState("1");
  const n = parseNum(val);
  const uf = set.units.find((u) => u.k === from)!, ut = set.units.find((u) => u.k === to)!;
  const out = Number.isFinite(n) ? (n * uf.f) / ut.f : NaN;
  const all = Number.isFinite(n) ? set.units.filter((u) => u.k !== from).map((u) => [u.n, formatNumber((n * uf.f) / u.f, 6)] as const) : [];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Valor"><Input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} className="text-lg h-12" /></Field>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <Field label="De"><Select value={from} onChange={(e) => setFrom(e.target.value)}>{set.units.map((u) => <option key={u.k} value={u.k}>{u.n}</option>)}</Select></Field>
          <Button size="icon" variant="outline" className="mb-0.5" onClick={() => { setFrom(to); setTo(from); }} aria-label="Inverter"><ArrowLeftRight className="h-4 w-4" /></Button>
          <Field label="Para"><Select value={to} onChange={(e) => setTo(e.target.value)}>{set.units.map((u) => <option key={u.k} value={u.k}>{u.n}</option>)}</Select></Field>
        </div>
        <ToolActions onClear={() => setVal("")} copyText={Number.isFinite(out) ? `${val} ${from} = ${formatNumber(out, 6)} ${to}` : undefined} />
      </div>
      {Number.isFinite(out) ? (
        <ResultBox copyText={formatNumber(out, 6)} footer={`1 ${uf.n} = ${formatNumber(uf.f / ut.f, 8)} ${ut.n}`}>
          <Stat label={`${formatNumber(n, 6)} ${uf.n} em ${ut.n}`} value={`${formatNumber(out, 6)} ${ut.k}`} big />
          <div className="mt-5 grid gap-x-6 gap-y-1.5 border-t pt-4 text-sm sm:grid-cols-2">{all.map(([name, v]) => <div key={name} className="flex justify-between gap-3"><span className="text-fg-3">{name}</span><span className="tabular-nums">{v}</span></div>)}</div>
        </ResultBox>
      ) : <EmptyResult />}
    </div>
  );
}

export function Temperatura() {
  const [v, setV] = useState("100"); const [u, setU] = useState<"C" | "F" | "K">("C");
  const n = parseNum(v); const c = u === "C" ? n : u === "F" ? ((n - 32) * 5) / 9 : n - 273.15;
  const ok = Number.isFinite(c);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4"><div className="grid grid-cols-[1fr_140px] gap-3"><Field label="Temperatura"><Input inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)} className="h-12 text-lg" /></Field><Field label="Escala"><Select value={u} onChange={(e) => setU(e.target.value as "C")}><option value="C">Celsius</option><option value="F">Fahrenheit</option><option value="K">Kelvin</option></Select></Field></div><ToolActions onClear={() => setV("")} /></div>
      {ok ? <ResultBox footer="°F = °C × 9/5 + 32 · K = °C + 273,15"><div className="grid grid-cols-3 gap-4"><Stat label="Celsius" value={`${fmt(c, 2)} °C`} /><Stat label="Fahrenheit" value={`${fmt((c * 9) / 5 + 32, 2)} °F`} /><Stat label="Kelvin" value={`${fmt(c + 273.15, 2)} K`} /></div></ResultBox> : <EmptyResult />}
    </div>
  );
}

export function BaseNumerica() {
  const [v, setV] = useState("255"); const [b, setB] = useState(10);
  const n = v.trim() ? parseInt(v.replace(/^0[bxo]/i, ""), b) : NaN;
  const ok = Number.isFinite(n) && n >= 0;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4"><div className="grid grid-cols-[1fr_160px] gap-3"><Field label="Número"><Input value={v} onChange={(e) => setV(e.target.value)} className="h-12 font-mono text-lg" /></Field><Field label="Base de entrada"><Select value={b} onChange={(e) => setB(+e.target.value)}><option value={2}>Binário (2)</option><option value={8}>Octal (8)</option><option value={10}>Decimal (10)</option><option value={16}>Hexadecimal (16)</option></Select></Field></div><ToolActions onClear={() => setV("")} /></div>
      {ok ? <ResultBox><div className="grid gap-4 font-mono sm:grid-cols-2">{[["Decimal", n.toString(10)], ["Binário", n.toString(2)], ["Octal", n.toString(8)], ["Hexadecimal", n.toString(16).toUpperCase()]].map(([l, x]) => <Stat key={l} label={l} value={<span className="break-all text-lg">{x}</span>} />)}</div></ResultBox> : <EmptyResult text="Digite um número inteiro válido na base escolhida." />}
    </div>
  );
}

/* ---------------------------------- Cores ---------------------------------- */
export function parseColor(s: string): [number, number, number] | null {
  s = s.trim().toLowerCase();
  let m = s.match(/^#?([0-9a-f]{3})$/); if (m) return [...m[1]].map((c) => parseInt(c + c, 16)) as [number, number, number];
  m = s.match(/^#?([0-9a-f]{6})$/); if (m) return [0, 2, 4].map((i) => parseInt(m![1].slice(i, i + 2), 16)) as [number, number, number];
  m = s.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/); if (m) return [+m[1], +m[2], +m[3]];
  m = s.match(/hsla?\((\d+)[,\s]+(\d+)%[,\s]+(\d+)%/); if (m) return hslToRgb(+m[1], +m[2], +m[3]);
  return null;
}
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100; const k = (n: number) => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
export const toHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
export function luminance(r: number, g: number, b: number) { const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
export const contrast = (a: [number, number, number], b: [number, number, number]) => { const l1 = luminance(...a), l2 = luminance(...b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

export function Cores() {
  const [v, setV] = useState("#1d4ed8");
  const rgb = parseColor(v);
  const hsl = rgb ? rgbToHsl(...rgb) : null;
  const cw = rgb ? contrast(rgb, [255, 255, 255]) : 0, cb = rgb ? contrast(rgb, [0, 0, 0]) : 0;
  const hex = rgb ? toHex(...rgb) : "";
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex gap-3"><input type="color" value={hex || "#000000"} onChange={(e) => setV(e.target.value)} className="h-12 w-14 cursor-pointer rounded-xl border bg-surface p-1" aria-label="Seletor de cor" /><Field label="Cor (HEX, RGB ou HSL)" className="flex-1"><Input value={v} onChange={(e) => setV(e.target.value)} className="font-mono" placeholder="#1d4ed8 ou rgb(29,78,216)" /></Field></div>
        <ToolActions onClear={() => setV("")} copyText={rgb ? `${hex}\nrgb(${rgb.join(", ")})\nhsl(${hsl![0]}, ${hsl![1]}%, ${hsl![2]}%)` : undefined} />
      </div>
      {rgb && hsl ? (
        <ResultBox>
          <div className="mb-4 h-20 rounded-xl border" style={{ background: hex }} />
          <div className="grid gap-4 font-mono text-sm sm:grid-cols-3">
            <Stat label="HEX" value={<span className="text-base">{hex}</span>} /><Stat label="RGB" value={<span className="text-base">{rgb.join(", ")}</span>} /><Stat label="HSL" value={<span className="text-base">{hsl[0]}°, {hsl[1]}%, {hsl[2]}%</span>} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
            <div className="rounded-lg p-3" style={{ background: hex, color: "#fff" }}>Texto branco · {fmt(cw, 2)}:1 {cw >= 4.5 ? "✓ AA" : cw >= 3 ? "△ AA grande" : "✗"}</div>
            <div className="rounded-lg p-3" style={{ background: hex, color: "#000" }}>Texto preto · {fmt(cb, 2)}:1 {cb >= 4.5 ? "✓ AA" : cb >= 3 ? "△ AA grande" : "✗"}</div>
          </div>
        </ResultBox>
      ) : <EmptyResult text="Digite uma cor válida." />}
    </div>
  );
}

export function TimestampUnix() {
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [dt, setDt] = useState(new Date().toISOString().slice(0, 16));
  const n = parseNum(ts); const ms = n > 1e11 ? n : n * 1000;
  const d = Number.isFinite(ms) ? new Date(ms) : null;
  const d2 = new Date(dt);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Timestamp Unix (segundos ou ms)"><Input value={ts} onChange={(e) => setTs(e.target.value)} className="font-mono" /></Field>
        {d && !Number.isNaN(d.getTime()) && <ResultBox title="Data" copyText={d.toISOString()}><Stat label="Local" value={d.toLocaleString("pt-BR")} /><p className="mt-2 font-mono text-xs text-fg-3">UTC: {d.toUTCString()}<br />ISO: {d.toISOString()}</p></ResultBox>}
        <Button size="sm" variant="outline" onClick={() => setTs(String(Math.floor(Date.now() / 1000)))}>Agora</Button>
      </div>
      <div className="space-y-4">
        <Field label="Data e hora → timestamp"><Input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} /></Field>
        {!Number.isNaN(d2.getTime()) && <ResultBox title="Timestamp" copyText={String(Math.floor(d2.getTime() / 1000))}><div className="grid grid-cols-2 gap-4"><Stat label="Segundos" value={<span className="font-mono">{Math.floor(d2.getTime() / 1000)}</span>} /><Stat label="Milissegundos" value={<span className="font-mono">{d2.getTime()}</span>} /></div></ResultBox>}
      </div>
    </div>
  );
}

/* --------------------------- Text-based converters ------------------------- */
const utf8b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64utf8 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, "")), (c) => c.charCodeAt(0)));

export const Base64 = () => <TextTool mono options={[{ key: "mode", label: "Modo", type: "select", default: "enc", options: [{ value: "enc", label: "Codificar" }, { value: "dec", label: "Decodificar" }] }]} transform={(s, o) => (!s ? "" : o.mode === "enc" ? utf8b64(s) : b64utf8(s))} />;
export const UrlEncode = () => <TextTool mono options={[{ key: "mode", label: "Modo", type: "select", default: "enc", options: [{ value: "enc", label: "Codificar" }, { value: "dec", label: "Decodificar" }] }, { key: "full", label: "Codificar tudo (encodeURIComponent)", type: "checkbox", default: true }]} transform={(s, o) => (!s ? "" : o.mode === "enc" ? (o.full ? encodeURIComponent(s) : encodeURI(s)) : decodeURIComponent(s))} />;
export const HtmlEntities = () => <TextTool mono options={[{ key: "mode", label: "Modo", type: "select", default: "enc", options: [{ value: "enc", label: "Escapar" }, { value: "dec", label: "Desescapar" }] }]} transform={(s, o) => { if (!s) return ""; if (o.mode === "enc") return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!); const t = document.createElement("textarea"); t.innerHTML = s; return t.value; }} />;
export const JsonFormatter = () => <TextTool mono rows={12} placeholder='{"nome":"Ana","tags":["a","b"]}' options={[{ key: "mode", label: "Ação", type: "select", default: "pretty", options: [{ value: "pretty", label: "Formatar (2 espaços)" }, { value: "pretty4", label: "Formatar (4 espaços)" }, { value: "min", label: "Minificar" }, { value: "sort", label: "Formatar + ordenar chaves" }] }]} transform={(s, o) => { if (!s.trim()) return ""; try { const sortKeys = (x: unknown): unknown => Array.isArray(x) ? x.map(sortKeys) : x && typeof x === "object" ? Object.fromEntries(Object.keys(x as object).sort().map((k) => [k, sortKeys((x as Record<string, unknown>)[k])])) : x; const j = JSON.parse(s); return o.mode === "min" ? JSON.stringify(j) : JSON.stringify(o.mode === "sort" ? sortKeys(j) : j, null, o.mode === "pretty4" ? 4 : 2); } catch (e) { const m = String((e as Error).message).match(/position (\d+)/); const pos = m ? +m[1] : -1; const line = pos >= 0 ? s.slice(0, pos).split("\n").length : "?"; return `✗ JSON inválido: ${(e as Error).message}${pos >= 0 ? `\n→ linha ${line}` : ""}`; } }} stats={(i, o) => [{ label: "Tamanho", value: `${i.length} → ${o.startsWith("✗") ? "—" : o.length} caracteres` }, { label: "Status", value: o.startsWith("✗") ? "inválido" : o ? "válido" : "—" }]} />;

function parseCsv(text: string) {
  const sep = [",", ";", "\t"].map((s) => [s, (text.split("\n")[0].match(new RegExp(s === "\t" ? "\t" : `\\${s}`, "g")) || []).length] as const).sort((a, b) => b[1] - a[1])[0][0];
  const rows: string[][] = []; let row: string[] = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === sep) { row.push(cur); cur = ""; } else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; } else if (c !== "\r") cur += c; }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}
export const CsvParaJson = () => <TextTool mono rows={12} placeholder={"nome;idade\nAna;30\nBruno;25"} options={[{ key: "mode", label: "Direção", type: "select", default: "c2j", options: [{ value: "c2j", label: "CSV → JSON" }, { value: "j2c", label: "JSON → CSV" }] }]} transform={(s, o) => { if (!s.trim()) return ""; if (o.mode === "c2j") { const [h, ...rows] = parseCsv(s); return JSON.stringify(rows.map((r) => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] ?? "").trim()]))), null, 2); } const arr = JSON.parse(s); if (!Array.isArray(arr)) throw new Error("Esperado um array de objetos"); const keys = [...new Set(arr.flatMap((x: object) => Object.keys(x)))]; const esc = (v: unknown) => { const t = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; }; return [keys.join(","), ...arr.map((x: Record<string, unknown>) => keys.map((k) => esc(x[k])).join(","))].join("\n"); }} />;

export function mdToHtml(md: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  const lines = md.split("\n"); const out: string[] = []; let list: "ul" | "ol" | null = null, code = false, para: string[] = [], table: string[][] = [];
  const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushL = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const flushT = () => { if (table.length) { const [h, ...b] = table; out.push(`<table><thead><tr>${h.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${b.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`); table = []; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (l.startsWith("```")) { flushP(); flushL(); flushT(); out.push(code ? "</code></pre>" : "<pre><code>"); code = !code; continue; }
    if (code) { out.push(esc(l)); continue; }
    if (/^\|.*\|$/.test(l)) { flushP(); flushL(); const cells = l.slice(1, -1).split("|").map((c) => c.trim()); if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) table.push(cells); continue; } else flushT();
    const h = l.match(/^(#{1,6})\s+(.*)/); if (h) { flushP(); flushL(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    const li = l.match(/^\s*[-*]\s+(.*)/); const oli = l.match(/^\s*\d+\.\s+(.*)/);
    if (li || oli) { flushP(); const t = li ? "ul" : "ol"; if (list !== t) { flushL(); out.push(`<${t}>`); list = t; } out.push(`<li>${inline((li ?? oli)![1])}</li>`); continue; } else flushL();
    if (l.startsWith("> ")) { flushP(); out.push(`<blockquote>${inline(l.slice(2))}</blockquote>`); continue; }
    if (/^(-{3,}|\*{3,})$/.test(l)) { flushP(); out.push("<hr>"); continue; }
    if (!l.trim()) { flushP(); continue; }
    para.push(l);
  }
  flushP(); flushL(); flushT();
  return out.join("\n");
}
export function MarkdownParaHtml() {
  const [md, setMd] = useState("## Título\n\nUm parágrafo com **negrito**, *itálico* e `código`.\n\n- item um\n- item dois\n\n| Coluna | Valor |\n|---|---|\n| A | 1 |");
  const html = useMemo(() => mdToHtml(md), [md]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Markdown"><Textarea rows={12} className="font-mono text-[13px]" value={md} onChange={(e) => setMd(e.target.value)} /></Field>
        <Field label="HTML"><Textarea rows={12} readOnly className="bg-surface-2/60 font-mono text-[13px]" value={html} /></Field>
      </div>
      <div><p className="mb-1.5 text-[13px] font-medium text-fg-2">Preview</p><div className="prose-nexo rounded-xl border bg-surface p-5" dangerouslySetInnerHTML={{ __html: html }} /></div>
      <ToolActions onClear={() => setMd("")} copyText={html} downloadName="conteudo.html" />
    </div>
  );
}

export const TextoParaBinario = () => <TextTool mono options={[{ key: "mode", label: "Conversão", type: "select", default: "bin", options: [{ value: "bin", label: "Texto → Binário" }, { value: "hex", label: "Texto → Hexadecimal" }, { value: "dec", label: "Texto → Decimal (códigos)" }, { value: "unbin", label: "Binário → Texto" }, { value: "unhex", label: "Hexadecimal → Texto" }] }]} transform={(s, o) => { if (!s) return ""; const bytes = new TextEncoder().encode(s); if (o.mode === "bin") return [...bytes].map((b) => b.toString(2).padStart(8, "0")).join(" "); if (o.mode === "hex") return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(" "); if (o.mode === "dec") return [...bytes].join(" "); const parts = s.trim().split(/\s+/); const arr = Uint8Array.from(parts.map((p) => parseInt(p, o.mode === "unbin" ? 2 : 16))); return new TextDecoder().decode(arr); }} />;

const ROM: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
export function toRoman(n: number) { let r = ""; for (const [v, s] of ROM) while (n >= v) { r += s; n -= v; } return r; }
export function fromRoman(s: string) { const m: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let t = 0; s = s.toUpperCase(); for (let i = 0; i < s.length; i++) { const a = m[s[i]], b = m[s[i + 1]]; if (!a) return NaN; t += b > a ? -a : a; } return toRoman(t) === s ? t : NaN; }
export function NumeroRomano() {
  const [v, setV] = useState("2026");
  const isNum = /^\d+$/.test(v.trim());
  const n = isNum ? parseInt(v) : fromRoman(v.trim());
  const ok = Number.isFinite(n) && n >= 1 && n <= 3999;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4"><Field label="Número arábico (1–3999) ou romano" hint="Ex.: 1990 ou MCMXC"><Input value={v} onChange={(e) => setV(e.target.value)} className="h-12 text-lg font-mono" /></Field><ToolActions onClear={() => setV("")} /></div>
      {ok ? <ResultBox copyText={isNum ? toRoman(n) : String(n)}><div className="grid grid-cols-2 gap-4"><Stat label="Arábico" value={String(n)} big /><Stat label="Romano" value={toRoman(n)} big /></div></ResultBox> : <EmptyResult text={v ? "Valor inválido ou fora do intervalo 1–3999." : "Digite um número."} />}
    </div>
  );
}

const U = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const D = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const C = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
function ext999(n: number): string { if (n === 0) return ""; if (n === 100) return "cem"; const c = Math.floor(n / 100), r = n % 100; const d = Math.floor(r / 10), u = r % 10; const parts = [C[c], r < 20 ? U[r] : [D[d], U[u]].filter(Boolean).join(" e ")].filter(Boolean); return parts.join(" e "); }
export function porExtenso(n: number): string {
  if (n === 0) return "zero"; if (n < 0) return "menos " + porExtenso(-n);
  const scales: [number, string, string][] = [[1e9, "bilhão", "bilhões"], [1e6, "milhão", "milhões"], [1e3, "mil", "mil"]];
  const parts: string[] = []; let rest = Math.floor(n);
  for (const [v, s, p] of scales) { const q = Math.floor(rest / v); if (q) { parts.push(v === 1e3 && q === 1 ? "mil" : `${ext999(q)} ${q === 1 ? s : p}`); rest %= v; } }
  if (rest) parts.push(ext999(rest));
  if (parts.length > 1 && rest && (rest < 100 || rest % 100 === 0)) return parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1];
  return parts.join(parts.length > 2 ? ", " : " e ");
}
export function NumeroPorExtenso() {
  const [v, setV] = useState("1250,50"); const [mode, setMode] = useState<"n" | "r">("r");
  const n = parseNum(v);
  const txt = useMemo(() => { if (!Number.isFinite(n) || Math.abs(n) >= 1e12) return ""; if (mode === "n") return porExtenso(Math.trunc(n)); const int = Math.trunc(Math.abs(n)), cents = Math.round((Math.abs(n) - int) * 100); const a = int ? `${porExtenso(int)} ${int === 1 ? "real" : "reais"}` : ""; const b = cents ? `${porExtenso(cents)} ${cents === 1 ? "centavo" : "centavos"}` : ""; return (n < 0 ? "menos " : "") + ([a, b].filter(Boolean).join(" e ") || "zero reais"); }, [n, mode]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4"><div className="grid grid-cols-[1fr_150px] gap-3"><Field label="Número"><Input inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)} className="h-12 text-lg" /></Field><Field label="Formato"><Select value={mode} onChange={(e) => setMode(e.target.value as "n")}><option value="r">Reais</option><option value="n">Número</option></Select></Field></div><ToolActions onClear={() => setV("")} copyText={txt || undefined} /></div>
      {txt ? <ResultBox copyText={txt}><p className="text-xl font-medium leading-8 first-letter:uppercase">{txt}</p></ResultBox> : <EmptyResult text="Digite um número até 999 bilhões." />}
    </div>
  );
}

export function Moeda() {
  const [rate, setRate] = useLocalStorage("fx", { from: "USD", to: "BRL", rate: "5,20" });
  const [amount, setAmount] = useState("100");
  const r = parseNum(rate.rate), a = parseNum(amount);
  const ok = Number.isFinite(r) && Number.isFinite(a) && r > 0;
  const CUR = ["USD", "EUR", "GBP", "BRL", "ARS", "JPY", "CAD", "AUD", "CHF", "CNY", "BTC"];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2"><Field label="De"><Select value={rate.from} onChange={(e) => setRate({ ...rate, from: e.target.value })}>{CUR.map((c) => <option key={c}>{c}</option>)}</Select></Field><Button size="icon" variant="outline" className="mb-0.5" onClick={() => setRate({ ...rate, from: rate.to, to: rate.from, rate: Number.isFinite(r) && r ? String(1 / r).slice(0, 8) : rate.rate })} aria-label="Inverter"><ArrowLeftRight className="h-4 w-4" /></Button><Field label="Para"><Select value={rate.to} onChange={(e) => setRate({ ...rate, to: e.target.value })}>{CUR.map((c) => <option key={c}>{c}</option>)}</Select></Field></div>
        <Field label={`Cotação: 1 ${rate.from} = ? ${rate.to}`} hint="Informe a cotação do dia (banco, corretora ou Banco Central). Fica salva no navegador."><Input inputMode="decimal" value={rate.rate} onChange={(e) => setRate({ ...rate, rate: e.target.value })} /></Field>
        <Field label={`Valor em ${rate.from}`}><Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg" /></Field>
        <ToolActions onClear={() => setAmount("")} />
      </div>
      {ok ? <ResultBox copyText={fmt(a * r)} footer={`1 ${rate.to} = ${fmt(1 / r, 6)} ${rate.from}`}><Stat label={`${fmt(a)} ${rate.from} em ${rate.to}`} value={`${fmt(a * r)} ${rate.to}`} big /><div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4 text-sm">{[1, 10, 100].map((m) => <div key={m}><p className="text-fg-3">{m} {rate.from}</p><p className="tabular-nums">{fmt(m * r)}</p></div>)}</div></ResultBox> : <EmptyResult text="Informe a cotação e o valor." />}
    </div>
  );
}
