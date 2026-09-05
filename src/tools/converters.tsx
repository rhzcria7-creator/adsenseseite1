import { useCallback, useMemo, useState } from "react";
import { FormulaTool, TextTool, type FieldDef, type FormulaResult } from "./ToolShell";
import { fmtNum, parseNum } from "@/lib/utils";
import { Field, Input, Select, Stat } from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/feedback";

const num = (v: string) => parseNum(v);

/* ---------- Generic unit converter ---------- */
function UnitConverter({ units, defaultFrom, defaultTo }: { units: { key: string; label: string; f: number }[]; defaultFrom: string; defaultTo: string }) {
  const [val, setVal] = useState("1");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const n = num(val);
  const base = Number.isFinite(n) ? n * units.find((u) => u.key === from)!.f : NaN;
  const out = base / units.find((u) => u.key === to)!.f;
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Valor"><Input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} /></Field>
        <Field label="De"><Select value={from} onChange={(e) => setFrom(e.target.value)}>{units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}</Select></Field>
        <Field label="Para"><Select value={to} onChange={(e) => setTo(e.target.value)}>{units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}</Select></Field>
      </div>
      <div className="mt-6 flex items-center justify-between"><span className="eyebrow">Resultado</span><CopyButton text={Number.isFinite(out) ? fmtNum(out, 6) : ""} /></div>
      <div className="mt-3 rounded-xl border border-line bg-bg-2 px-5 py-4 font-mono text-2xl font-semibold text-fg">{Number.isFinite(out) ? fmtNum(out, 6) : "—"} <span className="text-base font-normal text-fg-3">{units.find((u) => u.key === to)!.label}</span></div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {units.filter((u) => u.key !== from).map((u) => <Stat key={u.key} label={u.label} value={Number.isFinite(base) ? fmtNum(base / u.f, 4) : "—"} />)}
      </div>
    </div>
  );
}

export const Comprimento = () => <UnitConverter defaultFrom="m" defaultTo="km" units={[{ key: "mm", label: "Milímetro", f: 0.001 }, { key: "cm", label: "Centímetro", f: 0.01 }, { key: "m", label: "Metro", f: 1 }, { key: "km", label: "Quilômetro", f: 1000 }, { key: "in", label: "Polegada", f: 0.0254 }, { key: "ft", label: "Pé", f: 0.3048 }, { key: "yd", label: "Jarda", f: 0.9144 }, { key: "mi", label: "Milha", f: 1609.344 }]} />;
export const Peso = () => <UnitConverter defaultFrom="kg" defaultTo="lb" units={[{ key: "mg", label: "Miligrama", f: 0.000001 }, { key: "g", label: "Grama", f: 0.001 }, { key: "kg", label: "Quilograma", f: 1 }, { key: "t", label: "Tonelada", f: 1000 }, { key: "oz", label: "Onça", f: 0.0283495 }, { key: "lb", label: "Libra", f: 0.453592 }, { key: "@", label: "Arroba", f: 14.688 }]} />;
export const Velocidade = () => <UnitConverter defaultFrom="kmh" defaultTo="ms" units={[{ key: "ms", label: "m/s", f: 1 }, { key: "kmh", label: "km/h", f: 1 / 3.6 }, { key: "mph", label: "mph", f: 0.44704 }, { key: "kn", label: "Nó", f: 0.514444 }, { key: "fts", label: "pé/s", f: 0.3048 }]} />;
export const Area = () => <UnitConverter defaultFrom="m2" defaultTo="ha" units={[{ key: "cm2", label: "cm²", f: 0.0001 }, { key: "m2", label: "m²", f: 1 }, { key: "km2", label: "km²", f: 1e6 }, { key: "ha", label: "Hectare", f: 10000 }, { key: "ac", label: "Acre", f: 4046.86 }, { key: "alq", label: "Alqueire paulista", f: 24200 }, { key: "ft2", label: "pé²", f: 0.092903 }]} />;
export const Volume = () => <UnitConverter defaultFrom="l" defaultTo="ml" units={[{ key: "ml", label: "Mililitro", f: 0.001 }, { key: "l", label: "Litro", f: 1 }, { key: "m3", label: "m³", f: 1000 }, { key: "gal", label: "Galão (EUA)", f: 3.78541 }, { key: "cup", label: "Xícara (240 ml)", f: 0.24 }, { key: "tbsp", label: "Colher de sopa", f: 0.015 }, { key: "tsp", label: "Colher de chá", f: 0.005 }, { key: "floz", label: "Onça fluida", f: 0.0295735 }]} />;
export const Dados = () => <UnitConverter defaultFrom="gb" defaultTo="mb" units={[{ key: "bit", label: "Bit", f: 1 / 8 }, { key: "b", label: "Byte", f: 1 }, { key: "kb", label: "KB (10³)", f: 1e3 }, { key: "mb", label: "MB (10⁶)", f: 1e6 }, { key: "gb", label: "GB (10⁹)", f: 1e9 }, { key: "tb", label: "TB (10¹²)", f: 1e12 }, { key: "kib", label: "KiB (2¹⁰)", f: 1024 }, { key: "mib", label: "MiB (2²⁰)", f: 1048576 }, { key: "gib", label: "GiB (2³⁰)", f: 1073741824 }, { key: "tib", label: "TiB (2⁴⁰)", f: 1099511627776 }]} />;

export function Temperatura() {
  const fields: FieldDef[] = [
    { key: "v", label: "Valor", type: "number", placeholder: "100", half: true },
    { key: "u", label: "Unidade", type: "select", default: "c", options: [{ value: "c", label: "Celsius (°C)" }, { value: "f", label: "Fahrenheit (°F)" }, { value: "k", label: "Kelvin (K)" }], half: true },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const n = num(v.v);
    if (!Number.isFinite(n)) return null;
    const c = v.u === "c" ? n : v.u === "f" ? ((n - 32) * 5) / 9 : n - 273.15;
    return { rows: [{ label: "Celsius", value: `${fmtNum(c, 2)} °C` }, { label: "Fahrenheit", value: `${fmtNum((c * 9) / 5 + 32, 2)} °F` }, { label: "Kelvin", value: `${fmtNum(c + 273.15, 2)} K` }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function TempoDownload() {
  const fields: FieldDef[] = [
    { key: "s", label: "Tamanho do arquivo", type: "number", placeholder: "4,7", half: true },
    { key: "su", label: "Unidade", type: "select", default: "gb", options: [{ value: "mb", label: "MB" }, { value: "gb", label: "GB" }, { value: "tb", label: "TB" }], half: true },
    { key: "v", label: "Velocidade da conexão", type: "number", placeholder: "100", half: true },
    { key: "vu", label: "Unidade", type: "select", default: "mbps", options: [{ value: "kbps", label: "Kbps" }, { value: "mbps", label: "Mbps" }, { value: "gbps", label: "Gbps" }], half: true },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const s = num(v.s), sp = num(v.v);
    if (!Number.isFinite(s) || !Number.isFinite(sp) || sp <= 0) return null;
    const bits = s * { mb: 8e6, gb: 8e9, tb: 8e12 }[v.su as "mb"]!;
    const bps = sp * { kbps: 1e3, mbps: 1e6, gbps: 1e9 }[v.vu as "mbps"]!;
    const sec = bits / bps;
    const f = (x: number) => (x < 60 ? `${fmtNum(x, 0)} s` : x < 3600 ? `${Math.floor(x / 60)} min ${fmtNum(x % 60, 0)} s` : `${Math.floor(x / 3600)} h ${Math.floor((x % 3600) / 60)} min`);
    return { rows: [{ label: "Tempo estimado", value: f(sec) }, { label: "Na metade da velocidade", value: f(sec * 2) }, { label: "Velocidade real", value: `${fmtNum(bps / 8e6, 1)} MB/s` }], note: "Velocidades de internet são medidas em bits (Mbps); arquivos em bytes (MB). 1 byte = 8 bits." };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function BaseNumerica() {
  const [val, setVal] = useState("255");
  const [base, setBase] = useState("10");
  const n = useMemo(() => {
    const clean = val.trim().replace(/^0[xbo]/i, "");
    if (!clean) return NaN;
    const b = Number(base);
    const valid = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[0-9a-f]+$/i }[b as 2]!;
    return valid.test(clean) ? parseInt(clean, b) : NaN;
  }, [val, base]);
  const ok = Number.isFinite(n);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Número" error={!ok && val ? "Valor inválido para a base escolhida" : undefined}><Input value={val} onChange={(e) => setVal(e.target.value)} className="font-mono" /></Field>
        <Field label="Base de entrada"><Select value={base} onChange={(e) => setBase(e.target.value)}><option value="2">Binário (2)</option><option value="8">Octal (8)</option><option value="10">Decimal (10)</option><option value="16">Hexadecimal (16)</option></Select></Field>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[{ l: "Binário", v: ok ? n.toString(2) : "—" }, { l: "Octal", v: ok ? n.toString(8) : "—" }, { l: "Decimal", v: ok ? n.toString(10) : "—" }, { l: "Hexadecimal", v: ok ? n.toString(16).toUpperCase() : "—" }].map((r) => (
          <div key={r.l} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg-2 px-4 py-3"><div className="min-w-0"><div className="text-xs text-fg-3">{r.l}</div><div className="truncate font-mono text-lg font-semibold">{r.v}</div></div><CopyButton text={r.v} size="icon" variant="ghost" /></div>
        ))}
      </div>
    </div>
  );
}

const ROMAN: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
export function Romanos() {
  const fields: FieldDef[] = [{ key: "v", label: "Número arábico (1–3999) ou romano", type: "text", placeholder: "2026 ou MMXXVI" }];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const s = v.v.trim().toUpperCase();
    if (!s) return null;
    if (/^\d+$/.test(s)) {
      let n = Number(s);
      if (n < 1 || n > 3999) return { rows: [], error: "Informe um número entre 1 e 3999." };
      let out = "";
      for (const [val, sym] of ROMAN) while (n >= val) { out += sym; n -= val; }
      return { rows: [{ label: "Romano", value: out }] };
    }
    if (!/^[MDCLXVI]+$/.test(s)) return { rows: [], error: "Use apenas dígitos ou letras romanas (I, V, X, L, C, D, M)." };
    const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < s.length; i++) {
      const cur = map[s[i]], next = map[s[i + 1]] ?? 0;
      total += cur < next ? -cur : cur;
    }
    return { rows: [{ label: "Arábico", value: String(total) }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Colors ---------- */
export function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}
export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
export function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

export function Cores() {
  const [hex, setHex] = useState("#2f5bff");
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const rows = rgb && hsl ? [{ l: "HEX", v: hex.toLowerCase() }, { l: "RGB", v: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }, { l: "HSL", v: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }, { l: "CSS var", v: `--color: ${hex.toLowerCase()};` }] : [];
  const lum = rgb ? (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255 : 0;
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <Field label="Seletor"><input type="color" value={rgb ? hex : "#000000"} onChange={(e) => setHex(e.target.value)} className="h-[46px] w-20 cursor-pointer rounded-xl border border-line bg-bg p-1" /></Field>
        <Field label="HEX" error={!rgb ? "HEX inválido" : undefined}><Input value={hex} onChange={(e) => setHex(e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value)} className="font-mono" /></Field>
      </div>
      {rgb && (
        <div className="mt-6 grid gap-4 md:grid-cols-[200px_1fr]">
          <div className="flex h-40 items-end rounded-xl border border-line p-3 text-sm font-semibold" style={{ background: hex, color: lum > 0.55 ? "#0b0d12" : "#fff" }}>{lum > 0.55 ? "Texto escuro" : "Texto claro"}</div>
          <div className="grid gap-2">
            {rows.map((r) => (
              <div key={r.l} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg-2 px-4 py-2.5"><div><div className="text-xs text-fg-3">{r.l}</div><div className="font-mono text-[15px] font-medium">{r.v}</div></div><CopyButton text={r.v} size="icon" variant="ghost" /></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PxRem() {
  const fields: FieldDef[] = [
    { key: "v", label: "Valor", type: "number", placeholder: "24", half: true },
    { key: "u", label: "Unidade", type: "select", default: "px", options: [{ value: "px", label: "px → rem" }, { value: "rem", label: "rem → px" }], half: true },
    { key: "b", label: "Base (font-size raiz)", type: "number", default: "16", suffix: "px" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const n = num(v.v), b = num(v.b) || 16;
    if (!Number.isFinite(n)) return null;
    return v.u === "px" ? { rows: [{ label: "rem", value: `${fmtNum(n / b, 4)}rem` }, { label: "em (mesma base)", value: `${fmtNum(n / b, 4)}em` }] } : { rows: [{ label: "px", value: `${fmtNum(n * b, 2)}px` }] };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

export function Timestamp() {
  const fields: FieldDef[] = [
    { key: "ts", label: "Timestamp Unix (segundos ou ms)", type: "text", placeholder: String(Math.floor(Date.now() / 1000)) },
    { key: "d", label: "Ou: data e hora", type: "text", placeholder: "2026-03-09 14:30" },
  ];
  const compute = useCallback((v: Record<string, string>): FormulaResult | null => {
    const now = Date.now();
    let d: Date | null = null;
    if (v.ts.trim()) {
      const n = Number(v.ts.trim());
      if (!Number.isFinite(n)) return { rows: [], error: "Timestamp inválido." };
      d = new Date(n > 1e11 ? n : n * 1000);
    } else if (v.d.trim()) {
      d = new Date(v.d.trim().replace(" ", "T"));
      if (isNaN(d.getTime())) return { rows: [], error: "Data inválida. Use AAAA-MM-DD HH:MM." };
    }
    if (!d) d = new Date(now);
    return { rows: [{ label: "Unix (segundos)", value: String(Math.floor(d.getTime() / 1000)) }, { label: "Unix (ms)", value: String(d.getTime()) }, { label: "Local", value: d.toLocaleString("pt-BR") }, { label: "UTC / ISO 8601", value: d.toISOString() }], note: !v.ts && !v.d ? "Mostrando o momento atual. Preencha um dos campos para converter." : undefined };
  }, []);
  return <FormulaTool fields={fields} compute={compute} />;
}

/* ---------- Encoders (TextTool-based) ---------- */
const utf8ToB64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64ToUtf8 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0)));

export const Base64 = () => <TextTool mono placeholder="Texto para codificar ou Base64 para decodificar…" options={[{ key: "mode", label: "Modo", type: "select", default: "enc", options: [{ value: "enc", label: "Codificar" }, { value: "dec", label: "Decodificar" }] }]} transform={(s, o) => (!s ? "" : o.mode === "enc" ? utf8ToB64(s) : b64ToUtf8(s))} />;
export const UrlEncode = () => <TextTool mono placeholder="Texto ou URL…" options={[{ key: "mode", label: "Modo", type: "select", default: "enc", options: [{ value: "enc", label: "Codificar (encodeURIComponent)" }, { value: "enc2", label: "Codificar URL inteira (encodeURI)" }, { value: "dec", label: "Decodificar" }] }]} transform={(s, o) => (!s ? "" : o.mode === "enc" ? encodeURIComponent(s) : o.mode === "enc2" ? encodeURI(s) : decodeURIComponent(s.replace(/\+/g, " ")))} />;
export const JsonFormat = () => (
  <TextTool mono placeholder='{"nome":"Nexo","tags":["ia","tools"]}' filename="formatado.json" options={[{ key: "mode", label: "Ação", type: "select", default: "2", options: [{ value: "2", label: "Formatar (2 espaços)" }, { value: "4", label: "Formatar (4 espaços)" }, { value: "min", label: "Minificar" }, { value: "keys", label: "Ordenar chaves + formatar" }] }]}
    transform={(s, o) => {
      if (!s.trim()) return "";
      try {
        let obj = JSON.parse(s);
        if (o.mode === "keys") obj = sortKeys(obj);
        return o.mode === "min" ? JSON.stringify(obj) : JSON.stringify(obj, null, Number(o.mode === "keys" ? 2 : o.mode));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "JSON inválido";
        const m = /position (\d+)/.exec(msg);
        if (m) {
          const pos = Number(m[1]);
          const line = s.slice(0, pos).split("\n").length;
          return `✗ JSON inválido na linha ${line} (posição ${pos}):\n${msg}`;
        }
        return `✗ ${msg}`;
      }
    }}
    stats={(i, o) => [{ label: "Válido", value: o.startsWith("✗") || !o ? (o ? "Não" : "—") : "Sim" }, { label: "Entrada", value: `${i.length} chars` }, { label: "Saída", value: `${o.length} chars` }, { label: "Diferença", value: `${o.length - i.length}` }]}
  />
);
function sortKeys(x: unknown): unknown {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x && typeof x === "object") return Object.fromEntries(Object.keys(x as object).sort().map((k) => [k, sortKeys((x as Record<string, unknown>)[k])]));
  return x;
}
export const TextoBinario = () => (
  <TextTool mono options={[{ key: "mode", label: "Modo", type: "select", default: "enc", options: [{ value: "enc", label: "Texto → Binário" }, { value: "dec", label: "Binário → Texto" }] }]}
    transform={(s, o) => {
      if (!s) return "";
      if (o.mode === "enc") return Array.from(new TextEncoder().encode(s)).map((b) => b.toString(2).padStart(8, "0")).join(" ");
      const bytes = s.trim().split(/\s+/).map((b) => parseInt(b, 2));
      if (bytes.some((b) => !Number.isFinite(b))) throw new Error("Binário inválido — use grupos de 8 bits separados por espaço.");
      return new TextDecoder().decode(Uint8Array.from(bytes));
    }}
  />
);
