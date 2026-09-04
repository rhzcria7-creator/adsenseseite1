import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";
import { formatNumber, parseNum, formatCurrency } from "@/lib/utils";
import { Field, Input, Segmented, Select, Textarea, Button } from "@/components/ui/primitives";
import { Actions, BigNumber, ErrorText, KV, OutputArea, ResultPanel, ToolGrid, ToolShell } from "./ToolShell";
import type { ToolProps } from "./calculators";

const num = (n: number, d = 4) => formatNumber(n, d);

/* --------------------------- Generic unit converter ----------------------- */

type Unit = { id: string; label: string; factor: number };
const UNITS: Record<string, { units: Unit[]; def: [string, string] }> = {
  comprimento: { def: ["km", "mi"], units: [{ id: "mm", label: "Milímetro (mm)", factor: 0.001 }, { id: "cm", label: "Centímetro (cm)", factor: 0.01 }, { id: "m", label: "Metro (m)", factor: 1 }, { id: "km", label: "Quilômetro (km)", factor: 1000 }, { id: "in", label: "Polegada (in)", factor: 0.0254 }, { id: "ft", label: "Pé (ft)", factor: 0.3048 }, { id: "yd", label: "Jarda (yd)", factor: 0.9144 }, { id: "mi", label: "Milha (mi)", factor: 1609.344 }, { id: "nmi", label: "Milha náutica", factor: 1852 }] },
  peso: { def: ["lb", "kg"], units: [{ id: "mg", label: "Miligrama (mg)", factor: 1e-6 }, { id: "g", label: "Grama (g)", factor: 0.001 }, { id: "kg", label: "Quilograma (kg)", factor: 1 }, { id: "t", label: "Tonelada (t)", factor: 1000 }, { id: "oz", label: "Onça (oz)", factor: 0.028349523125 }, { id: "lb", label: "Libra (lb)", factor: 0.45359237 }, { id: "@", label: "Arroba (15 kg)", factor: 15 }] },
  velocidade: { def: ["kmh", "mph"], units: [{ id: "ms", label: "Metro por segundo (m/s)", factor: 1 }, { id: "kmh", label: "km/h", factor: 1 / 3.6 }, { id: "mph", label: "Milha por hora (mph)", factor: 0.44704 }, { id: "kn", label: "Nó (kn)", factor: 0.514444 }, { id: "fts", label: "Pé por segundo (ft/s)", factor: 0.3048 }] },
  area: { def: ["ha", "m2"], units: [{ id: "cm2", label: "cm²", factor: 0.0001 }, { id: "m2", label: "m²", factor: 1 }, { id: "km2", label: "km²", factor: 1e6 }, { id: "ha", label: "Hectare (ha)", factor: 10000 }, { id: "ac", label: "Acre", factor: 4046.8564224 }, { id: "alqsp", label: "Alqueire paulista", factor: 24200 }, { id: "alqmg", label: "Alqueire mineiro", factor: 48400 }, { id: "ft2", label: "Pé quadrado (ft²)", factor: 0.09290304 }] },
  volume: { def: ["gal", "l"], units: [{ id: "ml", label: "Mililitro (ml)", factor: 0.001 }, { id: "l", label: "Litro (l)", factor: 1 }, { id: "m3", label: "Metro cúbico (m³)", factor: 1000 }, { id: "gal", label: "Galão americano", factor: 3.785411784 }, { id: "galuk", label: "Galão imperial", factor: 4.54609 }, { id: "floz", label: "Onça líquida (fl oz)", factor: 0.0295735 }, { id: "cup", label: "Xícara (240 ml)", factor: 0.24 }, { id: "tbsp", label: "Colher de sopa (15 ml)", factor: 0.015 }, { id: "tsp", label: "Colher de chá (5 ml)", factor: 0.005 }] },
  tempo: { def: ["s", "d"], units: [{ id: "ms", label: "Milissegundo", factor: 0.001 }, { id: "s", label: "Segundo", factor: 1 }, { id: "min", label: "Minuto", factor: 60 }, { id: "h", label: "Hora", factor: 3600 }, { id: "d", label: "Dia", factor: 86400 }, { id: "w", label: "Semana", factor: 604800 }, { id: "mo", label: "Mês (30,44 d)", factor: 2629800 }, { id: "y", label: "Ano (365,25 d)", factor: 31557600 }] },
  "dados-digitais": { def: ["tb", "gib"], units: [{ id: "bit", label: "Bit", factor: 1 / 8 }, { id: "b", label: "Byte", factor: 1 }, { id: "kb", label: "Kilobyte (KB, 10³)", factor: 1e3 }, { id: "mb", label: "Megabyte (MB, 10⁶)", factor: 1e6 }, { id: "gb", label: "Gigabyte (GB, 10⁹)", factor: 1e9 }, { id: "tb", label: "Terabyte (TB, 10¹²)", factor: 1e12 }, { id: "kib", label: "Kibibyte (KiB, 2¹⁰)", factor: 1024 }, { id: "mib", label: "Mebibyte (MiB, 2²⁰)", factor: 1048576 }, { id: "gib", label: "Gibibyte (GiB, 2³⁰)", factor: 1073741824 }, { id: "tib", label: "Tebibyte (TiB, 2⁴⁰)", factor: 1099511627776 }, { id: "mbps", label: "Megabit (Mb)", factor: 125000 }] },
};

export function UnitConverter({ meta }: ToolProps) {
  const set = UNITS[meta.slug];
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(set.def[0]);
  const [to, setTo] = useState(set.def[1]);
  const n = parseNum(value);
  const invalid = Number.isNaN(n);
  const fU = set.units.find((u) => u.id === from)!;
  const tU = set.units.find((u) => u.id === to)!;
  const result = (n * fU.factor) / tU.factor;
  const table = set.units.filter((u) => u.id !== from).map((u) => [u.label, num((n * fU.factor) / u.factor, 6)] as [string, string]);
  return (
    <ToolShell meta={meta} examples={[{ label: `1 ${fU.label.split(" (")[0]}`, onClick: () => setValue("1") }, { label: `100 ${fU.label.split(" (")[0]}`, onClick: () => setValue("100") }]}>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto_1fr]">
        <Field label="Valor"><Input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
        <Field label="De"><Select value={from} onChange={(e) => setFrom(e.target.value)}>{set.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</Select></Field>
        <button onClick={() => { setFrom(to); setTo(from); }} aria-label="Inverter unidades" className="mb-0.5 hidden h-9 w-9 items-center justify-center border border-line transition-colors hover:border-strong sm:flex"><ArrowLeftRight className="h-4 w-4" /></button>
        <Field label="Para"><Select value={to} onChange={(e) => setTo(e.target.value)}>{set.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</Select></Field>
      </div>
      <ErrorText>{invalid && "Informe um número válido."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <BigNumber value={num(result, 6)} accent sub={`${num(n, 6)} ${fU.label} = ${num(result, 6)} ${tU.label}`} />
          <details className="mt-5 group">
            <summary className="cursor-pointer text-xs font-medium underline underline-offset-2">Ver todas as conversões</summary>
            <div className="mt-3"><KV rows={table} /></div>
          </details>
          <Actions copy={`${num(n, 6)} ${fU.label} = ${num(result, 6)} ${tU.label}`} onClear={() => setValue("")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ------------------------------ Temperatura ------------------------------- */
export function Temperatura({ meta }: ToolProps) {
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<"c" | "f" | "k">("c");
  const n = parseNum(value);
  const invalid = Number.isNaN(n);
  const c = from === "c" ? n : from === "f" ? ((n - 32) * 5) / 9 : n - 273.15;
  const f = (c * 9) / 5 + 32;
  const k = c + 273.15;
  return (
    <ToolShell meta={meta} examples={[{ label: "100 °C", onClick: () => { setValue("100"); setFrom("c"); } }, { label: "98,6 °F", onClick: () => { setValue("98.6"); setFrom("f"); } }, { label: "0 K", onClick: () => { setValue("0"); setFrom("k"); } }]}>
      <ToolGrid>
        <Field label="Temperatura"><Input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
        <Field label="Escala de origem"><Segmented value={from} onChange={setFrom} options={[{ value: "c", label: "°C" }, { value: "f", label: "°F" }, { value: "k", label: "K" }]} /></Field>
      </ToolGrid>
      <ErrorText>{invalid && "Informe um número."}{!invalid && k < 0 && "Abaixo do zero absoluto."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-3">
            <BigNumber label="Celsius" value={`${num(c, 2)} °C`} accent={from !== "c"} />
            <BigNumber label="Fahrenheit" value={`${num(f, 2)} °F`} accent={from !== "f"} />
            <BigNumber label="Kelvin" value={`${num(k, 2)} K`} accent={from !== "k"} />
          </div>
          <Actions copy={`${num(c, 2)} °C = ${num(f, 2)} °F = ${num(k, 2)} K`} onClear={() => setValue("")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ------------------------------ Base numérica ----------------------------- */
export function BaseNumerica({ meta }: ToolProps) {
  const [value, setValue] = useState("255");
  const [base, setBase] = useState("10");
  const clean = value.trim().replace(/^0x/i, "").replace(/^0b/i, "").replace(/^0o/i, "");
  const n = clean ? parseInt(clean, Number(base)) : NaN;
  const valid = !Number.isNaN(n) && new RegExp(`^-?[0-9a-f]+$`, "i").test(clean) && Math.abs(n) <= Number.MAX_SAFE_INTEGER;
  const bits = valid ? Math.abs(n).toString(2) : "";
  return (
    <ToolShell meta={meta} examples={[{ label: "255 decimal", onClick: () => { setValue("255"); setBase("10"); } }, { label: "FF hexadecimal", onClick: () => { setValue("FF"); setBase("16"); } }, { label: "101010 binário", onClick: () => { setValue("101010"); setBase("2"); } }]}>
      <ToolGrid>
        <Field label="Número"><Input value={value} onChange={(e) => setValue(e.target.value)} className="font-mono" spellCheck={false} /></Field>
        <Field label="Base de origem"><Select value={base} onChange={(e) => setBase(e.target.value)}><option value="2">Binário (2)</option><option value="8">Octal (8)</option><option value="10">Decimal (10)</option><option value="16">Hexadecimal (16)</option></Select></Field>
      </ToolGrid>
      <ErrorText>{!valid && value && "Número inválido para a base escolhida."}</ErrorText>
      {valid && (
        <ResultPanel>
          <KV rows={[["Decimal", <span className="font-mono">{n.toString(10)}</span>], ["Binário", <span className="font-mono break-all">{n.toString(2)}</span>], ["Octal", <span className="font-mono">{n.toString(8)}</span>], ["Hexadecimal", <span className="font-mono uppercase">{n.toString(16)}</span>]]} />
          <div className="mt-4">
            <div className="eyebrow mb-2">Bits ({bits.length})</div>
            <div className="flex flex-wrap gap-1">{bits.padStart(Math.ceil(bits.length / 8) * 8, "0").split("").map((b, i) => <span key={i} className={`flex h-7 w-6 items-center justify-center border font-mono text-xs ${b === "1" ? "border-fg bg-fg text-bg" : "border-line text-subtle"} ${i % 8 === 7 ? "mr-2" : ""}`}>{b}</span>)}</div>
          </div>
          <Actions copy={`dec ${n} · bin ${n.toString(2)} · oct ${n.toString(8)} · hex ${n.toString(16).toUpperCase()}`} onClear={() => setValue("")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ---------------------------------- Cores --------------------------------- */
export function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
}
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
export function luminance(r: number, g: number, b: number) {
  const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: [number, number, number], b: [number, number, number]) {
  const l1 = luminance(...a), l2 = luminance(...b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function parseColor(input: string): [number, number, number] | null {
  const s = input.trim().toLowerCase();
  const hex = hexToRgb(s);
  if (hex) return hex;
  const rgb = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
  const hsl = s.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
  if (hsl) return hslToRgb(+hsl[1], +hsl[2], +hsl[3]).map(Math.round) as [number, number, number];
  return null;
}

export function Cores({ meta }: ToolProps) {
  const [input, setInput] = useState("#e4572e");
  const rgb = parseColor(input);
  const hex = rgb ? rgbToHex(...rgb) : "";
  const hsl = rgb ? rgbToHsl(...rgb) : null;
  const cw = rgb ? contrast(rgb, [255, 255, 255]) : 0;
  const cb = rgb ? contrast(rgb, [0, 0, 0]) : 0;
  const shades = hsl ? [90, 75, 60, 45, 30, 15].map((l) => rgbToHex(...hslToRgb(hsl[0], hsl[1], l))) : [];
  const grade = (c: number) => (c >= 7 ? "AAA" : c >= 4.5 ? "AA" : c >= 3 ? "AA grande" : "Reprovado");
  return (
    <ToolShell meta={meta} examples={[{ label: "#e4572e", onClick: () => setInput("#e4572e") }, { label: "rgb(31, 94, 255)", onClick: () => setInput("rgb(31, 94, 255)") }, { label: "hsl(160, 75%, 37%)", onClick: () => setInput("hsl(160, 75%, 37%)") }]}>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <Field label="Cor (HEX, RGB ou HSL)"><Input value={input} onChange={(e) => setInput(e.target.value)} className="font-mono" spellCheck={false} /></Field>
        <input type="color" aria-label="Seletor de cor" value={hex || "#000000"} onChange={(e) => setInput(e.target.value)} className="h-10 w-14 cursor-pointer border border-line bg-transparent p-0.5" />
      </div>
      <ErrorText>{!rgb && "Formato não reconhecido. Use #hex, rgb() ou hsl()."}</ErrorText>
      {rgb && hsl && (
        <ResultPanel>
          <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
            <div className="aspect-square border border-line" style={{ background: hex }} />
            <KV rows={[["HEX", <span className="font-mono">{hex}</span>], ["RGB", <span className="font-mono">rgb({rgb.join(", ")})</span>], ["HSL", <span className="font-mono">hsl({hsl[0]}, {hsl[1]}%, {hsl[2]}%)</span>], ["Contraste com branco", `${num(cw, 2)}:1 · ${grade(cw)}`], ["Contraste com preto", `${num(cb, 2)}:1 · ${grade(cb)}`]]} />
          </div>
          <div className="mt-5">
            <div className="eyebrow mb-2">Variações de luminosidade</div>
            <div className="grid grid-cols-6 gap-1">{shades.map((s) => <button key={s} onClick={() => setInput(s)} title={s} className="aspect-[4/3] border border-line transition-transform hover:scale-105" style={{ background: s }} />)}</div>
          </div>
          <Actions copy={`${hex} · rgb(${rgb.join(", ")}) · hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`} onClear={() => setInput("")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ------------------------------ Timestamp Unix ---------------------------- */
export function TimestampUnix({ meta }: ToolProps) {
  const [mode, setMode] = useState<"toDate" | "toTs">("toDate");
  const [ts, setTs] = useState("1700000000");
  const [dt, setDt] = useState(new Date().toISOString().slice(0, 16));
  const nowTs = Math.floor(Date.now() / 1000);
  let date: Date | null = null;
  if (mode === "toDate") {
    const n = Number(ts.trim());
    if (Number.isFinite(n) && ts.trim()) date = new Date(ts.trim().length >= 13 ? n : n * 1000);
  } else {
    const d = new Date(dt);
    if (!Number.isNaN(d.getTime())) date = d;
  }
  const valid = !!date && !Number.isNaN(date.getTime());
  return (
    <ToolShell meta={meta} examples={[{ label: "1700000000", onClick: () => { setMode("toDate"); setTs("1700000000"); } }, { label: "Agora", onClick: () => { setMode("toDate"); setTs(String(nowTs)); } }, { label: "Ano 2038", onClick: () => { setMode("toDate"); setTs("2147483647"); } }]}>
      <Segmented value={mode} onChange={setMode} options={[{ value: "toDate", label: "Timestamp → Data" }, { value: "toTs", label: "Data → Timestamp" }]} />
      <div className="mt-5 max-w-sm">
        {mode === "toDate" ? <Field label="Timestamp (segundos ou ms)"><Input inputMode="numeric" value={ts} onChange={(e) => setTs(e.target.value)} className="font-mono" /></Field> : <Field label="Data e hora (local)"><Input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} /></Field>}
      </div>
      <p className="mt-2 font-mono text-xs text-subtle">agora: {nowTs}</p>
      <ErrorText>{!valid && "Valor inválido."}</ErrorText>
      {valid && date && (
        <ResultPanel>
          <BigNumber value={mode === "toDate" ? date.toLocaleString("pt-BR") : String(Math.floor(date.getTime() / 1000))} accent />
          <KV rows={[["Segundos", <span className="font-mono">{Math.floor(date.getTime() / 1000)}</span>], ["Milissegundos", <span className="font-mono">{date.getTime()}</span>], ["ISO 8601 (UTC)", <span className="font-mono text-xs">{date.toISOString()}</span>], ["Local", date.toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "long" })], ["Relativo", `${num((date.getTime() - Date.now()) / 86400000, 1)} dias a partir de agora`]]} />
          <Actions copy={mode === "toDate" ? date.toISOString() : String(Math.floor(date.getTime() / 1000))} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* --------------------------------- Base64 --------------------------------- */
function b64encode(s: string) { return btoa(String.fromCharCode(...new TextEncoder().encode(s))); }
function b64decode(s: string) { return new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, "")), (c) => c.charCodeAt(0))); }
export function Base64({ meta }: ToolProps) {
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const [input, setInput] = useState("Olá, mundo!");
  let out = "", err = "";
  try { out = mode === "enc" ? b64encode(input) : b64decode(input); } catch { err = "Base64 inválido."; }
  return (
    <ToolShell meta={meta} examples={[{ label: "Codificar 'Olá'", onClick: () => { setMode("enc"); setInput("Olá"); } }, { label: "Decodificar SGVsbG8=", onClick: () => { setMode("dec"); setInput("SGVsbG8="); } }]}>
      <Segmented value={mode} onChange={setMode} options={[{ value: "enc", label: "Codificar" }, { value: "dec", label: "Decodificar" }]} />
      <ToolGrid className="mt-5">
        <Field label="Entrada"><Textarea value={input} onChange={(e) => setInput(e.target.value)} className="font-mono text-[13px]" spellCheck={false} /></Field>
        <Field label="Saída"><OutputArea value={err ? "" : out} rows={5} /></Field>
      </ToolGrid>
      <ErrorText>{err}</ErrorText>
      <Actions copy={out} onClear={() => setInput("")} extra={<Button variant="ghost" size="sm" onClick={() => { setInput(out); setMode(mode === "enc" ? "dec" : "enc"); }}><ArrowLeftRight className="h-3.5 w-3.5" /> Inverter</Button>} />
      <p className="mt-3 font-mono text-xs text-subtle">{input.length} caracteres → {out.length} caracteres</p>
    </ToolShell>
  );
}

/* -------------------------------- URL encode ------------------------------ */
export function UrlEncode({ meta }: ToolProps) {
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const [full, setFull] = useState(false);
  const [input, setInput] = useState("https://exemplo.com/busca?q=ação & reação");
  let out = "", err = "";
  try { out = mode === "enc" ? (full ? encodeURI(input) : encodeURIComponent(input)) : decodeURIComponent(input.replace(/\+/g, " ")); } catch { err = "Sequência inválida."; }
  return (
    <ToolShell meta={meta}>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={mode} onChange={setMode} options={[{ value: "enc", label: "Codificar" }, { value: "dec", label: "Decodificar" }]} />
        {mode === "enc" && <Segmented value={full ? "url" : "comp"} onChange={(v) => setFull(v === "url")} options={[{ value: "comp", label: "Componente" }, { value: "url", label: "URL completa" }]} />}
      </div>
      <ToolGrid className="mt-5">
        <Field label="Entrada"><Textarea value={input} onChange={(e) => setInput(e.target.value)} className="font-mono text-[13px]" spellCheck={false} /></Field>
        <Field label="Saída"><OutputArea value={err ? "" : out} rows={5} /></Field>
      </ToolGrid>
      <ErrorText>{err}</ErrorText>
      <Actions copy={out} onClear={() => setInput("")} />
    </ToolShell>
  );
}

/* ------------------------------ JSON formatter ---------------------------- */
export function JsonFormatter({ meta }: ToolProps) {
  const [input, setInput] = useState('{"nome":"Nexo","ferramentas":72,"tags":["ia","tecnologia"],"ativo":true}');
  const [indent, setIndent] = useState("2");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [stats, setStats] = useState<[string, string][]>([]);
  const run = (mode: "pretty" | "min") => {
    try {
      const parsed = JSON.parse(input);
      const res = mode === "pretty" ? JSON.stringify(parsed, null, indent === "tab" ? "\t" : Number(indent)) : JSON.stringify(parsed);
      setOut(res);
      setErr("");
      const count = (o: unknown): number => (o && typeof o === "object" ? Object.values(o as object).reduce<number>((a, v) => a + count(v), Object.keys(o as object).length) : 0);
      setStats([["Tipo raiz", Array.isArray(parsed) ? `array (${parsed.length})` : typeof parsed], ["Chaves (total)", String(count(parsed))], ["Tamanho", `${new Blob([res]).size} bytes`]]);
    } catch (e) {
      const m = (e as Error).message.match(/position (\d+)/);
      const pos = m ? Number(m[1]) : -1;
      const line = pos >= 0 ? input.slice(0, pos).split("\n").length : undefined;
      setErr(`JSON inválido${line ? ` (linha ${line})` : ""}: ${(e as Error).message}`);
      setOut("");
      setStats([]);
    }
  };
  return (
    <ToolShell meta={meta} examples={[{ label: "Exemplo válido", onClick: () => setInput('{"a":1,"b":[1,2,{"c":null}],"d":"texto"}') }, { label: "Exemplo com erro", onClick: () => setInput('{"a":1,"b":[1,2,}') }]}>
      <ToolGrid>
        <Field label="JSON de entrada"><Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" spellCheck={false} /></Field>
        <Field label="Saída"><OutputArea value={out} rows={10} /></Field>
      </ToolGrid>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => run("pretty")}>Formatar</Button>
        <Button size="sm" variant="secondary" onClick={() => run("min")}>Minificar</Button>
        <Select value={indent} onChange={(e) => setIndent(e.target.value)} className="h-8 w-28 text-xs"><option value="2">2 espaços</option><option value="4">4 espaços</option><option value="tab">Tab</option></Select>
      </div>
      <ErrorText>{err}</ErrorText>
      {stats.length > 0 && <div className="mt-4"><KV rows={stats} /></div>}
      <Actions copy={out} onClear={() => { setInput(""); setOut(""); setErr(""); setStats([]); }} />
    </ToolShell>
  );
}

/* ---------------------------------- Moeda --------------------------------- */
const CURR = ["USD", "EUR", "GBP", "BRL", "ARS", "JPY", "CAD", "AUD", "CHF", "CNY"];
export function Moeda({ meta }: ToolProps) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BRL");
  const [rate, setRate] = useState("5.10");
  const [tourism, setTourism] = useState("");
  const a = parseNum(amount), r = parseNum(rate), t = parseNum(tourism);
  const invalid = Number.isNaN(a) || Number.isNaN(r) || r <= 0;
  const result = a * r;
  const spread = !Number.isNaN(t) && t > 0 ? ((t - r) / r) * 100 : NaN;
  const table = useMemo(() => [1, 5, 10, 50, 100, 500, 1000].map((v) => [`${v} ${from}`, formatCurrency(v * r, to)] as [string, string]), [from, to, r]);
  return (
    <ToolShell meta={meta} examples={[{ label: "US$ 100 a R$ 5,10", onClick: () => { setAmount("100"); setFrom("USD"); setTo("BRL"); setRate("5.10"); } }, { label: "€ 250 a R$ 5,60", onClick: () => { setAmount("250"); setFrom("EUR"); setTo("BRL"); setRate("5.60"); } }]}>
      <ToolGrid cols={4}>
        <Field label="Valor"><Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="De"><Select value={from} onChange={(e) => setFrom(e.target.value)}>{CURR.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Para"><Select value={to} onChange={(e) => setTo(e.target.value)}>{CURR.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label={`Cotação (1 ${from} em ${to})`}><Input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
      </ToolGrid>
      <div className="mt-3 max-w-xs"><Field label="Cotação turismo (opcional)" hint="Para calcular o spread"><Input inputMode="decimal" value={tourism} onChange={(e) => setTourism(e.target.value)} placeholder="5.35" /></Field></div>
      <ErrorText>{invalid && "Informe valor e cotação válidos."}</ErrorText>
      {!invalid && (
        <ResultPanel>
          <BigNumber value={formatCurrency(result, to)} accent sub={`${formatCurrency(a, from)} × ${num(r, 4)}`} />
          {!Number.isNaN(spread) && <p className="mt-2 text-sm text-muted">Spread da cotação turismo: <strong className="text-fg">{num(spread, 2)}%</strong> — você pagaria {formatCurrency(a * t, to)}.</p>}
          <details className="mt-5"><summary className="cursor-pointer text-xs font-medium underline underline-offset-2">Tabela de referência</summary><div className="mt-3"><KV rows={table} /></div></details>
          <Actions copy={`${formatCurrency(a, from)} = ${formatCurrency(result, to)} (cotação ${num(r, 4)})`} onClear={() => setAmount("")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}
