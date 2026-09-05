import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, RefreshCw, Dices } from "lucide-react";
import { Button, Field, Input, Range, Select, Stat, Switch, Tabs, Textarea } from "@/components/ui/primitives";
import { CopyButton, useToast } from "@/components/ui/feedback";
import { Pop } from "@/components/ui/motion";
import { fmtNum } from "@/lib/utils";
import { hexToRgb, hslToHex, rgbToHsl } from "./converters";

const rand = (n: number) => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
};

/* ---------- Password ---------- */
const WORDS = "casa tempo vida dia mundo forma pessoa ano parte lugar grupo fato caso ponto mao lado noite trabalho olho ideia pedra livro amigo terra agua fogo vento luz sombra rio mar sol lua estrela flor arvore folha raiz fruto ponte porta chave campo cidade rua praca torre navio trem carro avião roda ferro ouro prata vidro papel tinta cor som voz canto dança jogo bola rede peixe ave gato cão lobo urso leão tigre".split(" ");
export function Senha() {
  const [mode, setMode] = useState<"pwd" | "phrase">("pwd");
  const [len, setLen] = useState(20);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true, ambiguous: false });
  const [wordsN, setWordsN] = useState(5);
  const [sep, setSep] = useState("-");
  const [tick, setTick] = useState(0);
  const { toast } = useToast();

  const result = useMemo(() => {
    void tick;
    if (mode === "phrase") {
      const w = Array.from({ length: wordsN }, () => WORDS[rand(WORDS.length)]);
      const pass = w.map((x, i) => (i === rand(wordsN) ? x[0].toUpperCase() + x.slice(1) : x)).join(sep) + rand(100);
      return { pass, entropy: wordsN * Math.log2(WORDS.length) + Math.log2(100) };
    }
    let pool = "";
    if (opts.lower) pool += "abcdefghijklmnopqrstuvwxyz";
    if (opts.upper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (opts.digits) pool += "0123456789";
    if (opts.symbols) pool += "!@#$%&*()-_=+[]{};:,.<>?";
    if (!opts.ambiguous) pool = pool.replace(/[Il1O0o|]/g, "");
    if (!pool) return { pass: "", entropy: 0 };
    const pass = Array.from({ length: len }, () => pool[rand(pool.length)]).join("");
    return { pass, entropy: len * Math.log2(pool.length) };
  }, [mode, len, opts, wordsN, sep, tick]);

  const strength = result.entropy < 40 ? { l: "Fraca", c: "bg-danger", w: 25 } : result.entropy < 60 ? { l: "Razoável", c: "bg-warn", w: 50 } : result.entropy < 90 ? { l: "Forte", c: "bg-ok", w: 75 } : { l: "Excelente", c: "bg-ok", w: 100 };
  const years = Math.pow(2, result.entropy) / 1e10 / 31557600; // 10 bilhões tentativas/s

  return (
    <div>
      <Tabs value={mode} onChange={setMode} items={[{ value: "pwd", label: "Senha aleatória" }, { value: "phrase", label: "Frase-senha" }]} />
      <Pop k={result.pass} className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-bg-2 p-4">
        <code className="min-w-0 flex-1 break-all font-mono text-lg font-medium text-fg sm:text-xl">{result.pass || "—"}</code>
        <Button variant="ghost" size="icon" aria-label="Gerar novamente" onClick={() => setTick((t) => t + 1)}><RefreshCw size={16} /></Button>
        <CopyButton text={result.pass} size="icon" variant="primary" />
      </Pop>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs"><span className="font-medium text-fg-2">Força: {strength.l}</span><span className="font-mono text-fg-3">{fmtNum(result.entropy, 0)} bits · {years > 1e12 ? "> 1 trilhão de anos" : years > 1 ? `~${fmtNum(years, 0)} anos` : "menos de 1 ano"} p/ quebrar*</span></div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full transition-all duration-500 ${strength.c}`} style={{ width: `${strength.w}%` }} /></div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {mode === "pwd" ? (
          <>
            <Range label="Tamanho" min={6} max={64} value={len} onChange={setLen} />
            <div className="grid grid-cols-2 gap-3">
              <Switch checked={opts.upper} onChange={(v) => setOpts({ ...opts, upper: v })} label="A–Z" />
              <Switch checked={opts.lower} onChange={(v) => setOpts({ ...opts, lower: v })} label="a–z" />
              <Switch checked={opts.digits} onChange={(v) => setOpts({ ...opts, digits: v })} label="0–9" />
              <Switch checked={opts.symbols} onChange={(v) => setOpts({ ...opts, symbols: v })} label="!@#$" />
              <Switch checked={opts.ambiguous} onChange={(v) => setOpts({ ...opts, ambiguous: v })} label="Permitir ambíguos (l, 1, O, 0)" />
            </div>
          </>
        ) : (
          <>
            <Range label="Palavras" min={3} max={10} value={wordsN} onChange={setWordsN} />
            <Field label="Separador"><Select value={sep} onChange={(e) => setSep(e.target.value)}><option value="-">hífen</option><option value=".">ponto</option><option value="_">underscore</option><option value=" ">espaço</option></Select></Field>
          </>
        )}
      </div>
      <div className="mt-5 flex gap-2">
        <Button onClick={() => setTick((t) => t + 1)}><RefreshCw size={15} /> Gerar nova</Button>
        <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(result.pass); setTick((t) => t + 1); toast({ title: "Senha copiada — nova gerada", description: "A anterior está na área de transferência.", tone: "success" }); }}>Copiar e gerar outra</Button>
      </div>
      <p className="mt-4 text-xs text-fg-3">*Estimativa para 10 bilhões de tentativas por segundo (ataque offline). Senhas geradas localmente via crypto.getRandomValues.</p>
    </div>
  );
}

/* ---------- QR Code ---------- */
export function QR() {
  const [type, setType] = useState<"text" | "wifi" | "email" | "tel">("text");
  const [text, setText] = useState("https://nexo-ia.vercel.app");
  const [wifi, setWifi] = useState({ ssid: "", pass: "", enc: "WPA" });
  const [email, setEmail] = useState({ to: "", subject: "" });
  const [tel, setTel] = useState("");
  const [size, setSize] = useState(280);
  const [ecl, setEcl] = useState<"L" | "M" | "Q" | "H">("M");
  const [dark, setDark] = useState("#0b0d12");
  const ref = useRef<HTMLCanvasElement>(null);
  const [err, setErr] = useState("");

  const payload = type === "text" ? text : type === "wifi" ? `WIFI:T:${wifi.enc};S:${wifi.ssid};P:${wifi.pass};;` : type === "email" ? `mailto:${email.to}${email.subject ? `?subject=${encodeURIComponent(email.subject)}` : ""}` : `tel:${tel}`;

  useEffect(() => {
    const id = setTimeout(() => {
      if (!ref.current) return;
      QRCode.toCanvas(ref.current, payload || " ", { width: size, margin: 2, errorCorrectionLevel: ecl, color: { dark, light: "#ffffff" } })
        .then(() => setErr(""))
        .catch((e: Error) => setErr(e.message));
    }, 120);
    return () => clearTimeout(id);
  }, [payload, size, ecl, dark]);

  const download = () => {
    const a = document.createElement("a");
    a.href = ref.current!.toDataURL("image/png");
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
      <div>
        <Tabs value={type} onChange={setType} items={[{ value: "text", label: "Link / Texto" }, { value: "wifi", label: "Wi-Fi" }, { value: "email", label: "E-mail" }, { value: "tel", label: "Telefone" }]} />
        <div className="mt-5 grid gap-4">
          {type === "text" && <Field label="Conteúdo"><Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[100px]" /></Field>}
          {type === "wifi" && (<><Field label="Nome da rede (SSID)"><Input value={wifi.ssid} onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })} /></Field><Field label="Senha"><Input value={wifi.pass} onChange={(e) => setWifi({ ...wifi, pass: e.target.value })} /></Field><Field label="Segurança"><Select value={wifi.enc} onChange={(e) => setWifi({ ...wifi, enc: e.target.value })}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Aberta</option></Select></Field></>)}
          {type === "email" && (<><Field label="E-mail de destino"><Input type="email" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} /></Field><Field label="Assunto (opcional)"><Input value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} /></Field></>)}
          {type === "tel" && <Field label="Telefone"><Input inputMode="tel" placeholder="+55 11 99999-9999" value={tel} onChange={(e) => setTel(e.target.value)} /></Field>}
          <div className="grid gap-4 sm:grid-cols-3">
            <Range label="Tamanho" min={160} max={640} step={20} value={size} onChange={setSize} display={`${size}px`} />
            <Field label="Correção de erro"><Select value={ecl} onChange={(e) => setEcl(e.target.value as "M")}><option value="L">L (7%)</option><option value="M">M (15%)</option><option value="Q">Q (25%)</option><option value="H">H (30%)</option></Select></Field>
            <Field label="Cor"><input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="h-[46px] w-full cursor-pointer rounded-xl border border-line bg-bg p-1" /></Field>
          </div>
        </div>
        {err && <p className="mt-3 text-sm text-danger">{err}</p>}
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl border border-line bg-white p-3 shadow-sm"><canvas ref={ref} className="max-w-full" style={{ width: Math.min(size, 280), height: Math.min(size, 280) }} /></div>
        <div className="flex gap-2"><Button onClick={download}><Download size={15} /> Baixar PNG</Button><CopyButton text={payload} size="md" label="Copiar conteúdo" /></div>
        <p className="max-w-[280px] text-center text-xs text-fg-3">{payload.length} caracteres. Teste com a câmera do celular antes de imprimir.</p>
      </div>
    </div>
  );
}

/* ---------- UUID ---------- */
export function UUID() {
  const [n, setN] = useState(5);
  const [upper, setUpper] = useState(false);
  const [hyphen, setHyphen] = useState(true);
  const [tick, setTick] = useState(0);
  const list = useMemo(() => { void tick; return Array.from({ length: n }, () => { let u: string = crypto.randomUUID(); if (!hyphen) u = u.replace(/-/g, ""); return upper ? u.toUpperCase() : u; }); }, [n, upper, hyphen, tick]);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3"><Range label="Quantidade" min={1} max={100} value={n} onChange={setN} /><div className="flex items-end gap-4 pb-1"><Switch checked={hyphen} onChange={setHyphen} label="Hífens" /><Switch checked={upper} onChange={setUpper} label="Maiúsculas" /></div><div className="flex items-end gap-2"><Button onClick={() => setTick((t) => t + 1)}><RefreshCw size={15} /> Gerar</Button><CopyButton text={list.join("\n")} size="md" label="Copiar todos" /></div></div>
      <Textarea readOnly value={list.join("\n")} className="mt-5 min-h-[200px] bg-bg-2 font-mono text-sm" />
    </div>
  );
}

/* ---------- Hash ---------- */
export function Hash() {
  const [t, setT] = useState("");
  const [out, setOut] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!t) return setOut({});
      const data = new TextEncoder().encode(t);
      const algs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
      const res: Record<string, string> = {};
      for (const a of algs) {
        const buf = await crypto.subtle.digest(a, data);
        res[a] = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
      if (alive) setOut(res);
    })();
    return () => { alive = false; };
  }, [t]);
  return (
    <div>
      <Field label="Texto"><Textarea value={t} onChange={(e) => setT(e.target.value)} placeholder="Digite para calcular os hashes…" className="min-h-[120px]" /></Field>
      <div className="mt-5 grid gap-2">
        {["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((a) => (
          <div key={a} className="flex items-center gap-3 rounded-xl border border-line bg-bg-2 px-4 py-3"><div className="min-w-0 flex-1"><div className="text-xs font-medium text-fg-3">{a}</div><div className="break-all font-mono text-[13px] text-fg">{out[a] ?? "—"}</div></div><CopyButton text={out[a] ?? ""} size="icon" variant="ghost" /></div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Palette ---------- */
export function Paleta() {
  const [base, setBase] = useState("#2f5bff");
  const rgb = hexToRgb(base);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 225, s: 100, l: 59 };
  const mk = (dh: number, ds = 0, dl = 0) => hslToHex((hsl.h + dh + 360) % 360, Math.max(0, Math.min(100, hsl.s + ds)), Math.max(0, Math.min(100, hsl.l + dl)));
  const palettes = [
    { name: "Complementar", colors: [base, mk(180)] },
    { name: "Análoga", colors: [mk(-30), base, mk(30)] },
    { name: "Triádica", colors: [base, mk(120), mk(240)] },
    { name: "Tetrádica", colors: [base, mk(90), mk(180), mk(270)] },
    { name: "Monocromática", colors: [mk(0, 0, -30), mk(0, 0, -15), base, mk(0, 0, 15), mk(0, 0, 30)] },
    { name: "Tons (shades)", colors: [mk(0, 0, 40 - hsl.l + 40), mk(0, 0, 25 - hsl.l + 35), mk(0, 0, 10 - hsl.l + 30), base, mk(0, 0, -15), mk(0, 0, -28), mk(0, 0, -38)] },
  ];
  const { toast } = useToast();
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto]"><input type="color" value={rgb ? base : "#000"} onChange={(e) => setBase(e.target.value)} className="h-[46px] w-20 cursor-pointer rounded-xl border border-line bg-bg p-1" /><Input value={base} onChange={(e) => setBase(e.target.value)} className="font-mono" /><Button variant="secondary" onClick={() => setBase(hslToHex(rand(360), 55 + rand(35), 40 + rand(25)))}><Dices size={15} /> Aleatória</Button></div>
      <div className="mt-6 space-y-5">
        {palettes.map((p) => (
          <div key={p.name}>
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-fg">{p.name}</span><CopyButton text={p.colors.join(", ")} size="sm" variant="ghost" label="Copiar" /></div>
            <div className="flex h-16 overflow-hidden rounded-xl border border-line">
              {p.colors.map((c, i) => (
                <button key={i} onClick={async () => { await navigator.clipboard.writeText(c); toast({ title: `${c} copiado`, tone: "success" }); }} className="group relative flex-1 transition-[flex] hover:flex-[1.4]" style={{ background: c }} aria-label={`Copiar ${c}`}>
                  <span className="absolute inset-x-0 bottom-1 text-center font-mono text-[10px] text-white opacity-0 drop-shadow group-hover:opacity-100">{c}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Sorteador ---------- */
export function Sorteador() {
  const [mode, setMode] = useState<"names" | "numbers">("names");
  const [names, setNames] = useState("Ana\nBruno\nCarla\nDiego\nElisa");
  const [qty, setQty] = useState(1);
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const draw = () => {
    setSpinning(true);
    setTimeout(() => {
      if (mode === "names") {
        const pool = names.split("\n").map((s) => s.trim()).filter(Boolean);
        const out: string[] = [];
        while (out.length < Math.min(qty, pool.length)) { const i = rand(pool.length); out.push(pool.splice(i, 1)[0]); }
        setResult(out);
      } else {
        const a = Number(min), b = Number(max);
        const range = b - a + 1;
        const set = new Set<number>();
        while (set.size < Math.min(qty, range)) set.add(a + rand(range));
        setResult([...set].map(String));
      }
      setSpinning(false);
    }, 500);
  };
  return (
    <div>
      <Tabs value={mode} onChange={setMode} items={[{ value: "names", label: "Nomes" }, { value: "numbers", label: "Números" }]} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {mode === "names" ? <Field label="Um nome por linha" className="sm:col-span-2"><Textarea value={names} onChange={(e) => setNames(e.target.value)} className="min-h-[140px]" /></Field> : (<><Field label="De"><Input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} /></Field><Field label="Até"><Input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} /></Field></>)}
        <Range label="Quantidade sorteada" min={1} max={20} value={qty} onChange={setQty} />
        <div className="flex items-end"><Button size="lg" onClick={draw} disabled={spinning} className="w-full"><Dices size={17} className={spinning ? "animate-spin" : ""} /> {spinning ? "Sorteando…" : "Sortear"}</Button></div>
      </div>
      {result.length > 0 && (
        <Pop k={result.join()} className="mt-6 rounded-xl border border-line bg-bg-2 p-5 text-center">
          <div className="eyebrow mb-2">Resultado</div>
          <div className="flex flex-wrap justify-center gap-2">{result.map((r, i) => <span key={i} className="rounded-xl bg-fg px-4 py-2 text-lg font-semibold text-bg">{r}</span>)}</div>
          <div className="mt-3"><CopyButton text={result.join(", ")} /></div>
        </Pop>
      )}
    </div>
  );
}

export function NumeroAleatorio() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("10");
  const [n, setN] = useState(1);
  const [unique, setUnique] = useState(true);
  const [res, setRes] = useState<number[]>([]);
  const gen = () => {
    const a = Math.ceil(Number(min)), b = Math.floor(Number(max));
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return setRes([]);
    const range = b - a + 1;
    if (unique) { const s = new Set<number>(); while (s.size < Math.min(n, range)) s.add(a + rand(range)); setRes([...s]); }
    else setRes(Array.from({ length: n }, () => a + rand(range)));
  };
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-4"><Field label="Mínimo"><Input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} /></Field><Field label="Máximo"><Input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} /></Field><Range label="Quantidade" min={1} max={50} value={n} onChange={setN} /><div className="flex items-end pb-2"><Switch checked={unique} onChange={setUnique} label="Sem repetição" /></div></div>
      <div className="mt-5 flex gap-2"><Button onClick={gen}><Dices size={15} /> Gerar</Button><CopyButton text={res.join(", ")} size="md" disabled={!res.length} /></div>
      {res.length > 0 && <Pop k={res.join()} className="mt-5 flex flex-wrap gap-2">{res.map((r, i) => <span key={i} className="rounded-xl border border-line bg-bg-2 px-4 py-2 font-mono text-xl font-semibold">{r}</span>)}</Pop>}
    </div>
  );
}

export function NomeUsuario() {
  const [kw, setKw] = useState("");
  const [tick, setTick] = useState(0);
  const list = useMemo(() => {
    void tick;
    const base = (kw.trim() || "nexo").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    const pre = ["the", "real", "its", "hey", "iam", "o", "a", "mr", "dr", "sr"], suf = ["dev", "ai", "hq", "lab", "oficial", "br", "pro", "studio", "x", "io", "tech", "club"];
    const set = new Set<string>();
    let guard = 0;
    while (set.size < 12 && guard++ < 200) {
      const k = rand(6);
      const v = k === 0 ? `${pre[rand(pre.length)]}${base}` : k === 1 ? `${base}.${suf[rand(suf.length)]}` : k === 2 ? `${base}_${suf[rand(suf.length)]}` : k === 3 ? `${base}${10 + rand(90)}` : k === 4 ? `${base}${2020 + rand(7)}` : `${base.replace(/[aeiou]/g, "")}${suf[rand(suf.length)]}`;
      if (v.length >= 3) set.add(v);
    }
    return [...set];
  }, [kw, tick]);
  return (
    <div>
      <div className="flex gap-3"><Input placeholder="Palavra-chave, nome ou tema" value={kw} onChange={(e) => setKw(e.target.value)} /><Button onClick={() => setTick((t) => t + 1)}><RefreshCw size={15} /> Gerar</Button></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{list.map((u) => <div key={u} className="flex items-center justify-between rounded-xl border border-line bg-bg-2 px-4 py-2.5 font-mono text-sm"><span>@{u}</span><CopyButton text={u} size="icon" variant="ghost" /></div>)}</div>
      <div className="mt-4 grid grid-cols-3 gap-3"><Stat label="Sugestões" value={String(list.length)} /><Stat label="Base" value={kw.trim() || "nexo"} mono={false} /><Stat label="Dica" value="Verifique disponibilidade" mono={false} /></div>
    </div>
  );
}
