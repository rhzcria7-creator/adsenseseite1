import QRCode from "qrcode";
import { Download, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { formatNumber, downloadText, slugify } from "@/lib/utils";
import { Button, Field, Input, Segmented, Select, Textarea, Toggle } from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/feedback";
import { Actions, Bar, ErrorText, KV, OutputArea, ResultPanel, ToolGrid, ToolShell } from "./ToolShell";
import type { ToolProps } from "./calculators";
import { contrast, hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from "./converters";

const rand = (n: number) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
const pickR = <T,>(arr: T[]) => arr[rand(arr.length)];

/* ------------------------------ Gerador de senha -------------------------- */
const WORDS = "casa tempo vida mundo dia ano forma parte lugar caso homem mulher ponto pessoa grupo água trabalho noite olho luz terra fogo vento mar rio pedra flor árvore sol lua estrela céu chuva neve ponte porta janela livro papel caneta mesa chave carro rua cidade campo ilha monte vale lago barco trem avião ferro ouro prata cobre vidro areia sal mel leite pão vinho café chá fruta uva maçã pera figo limão manga coco milho arroz feijão sopa bolo doce gelo verde azul roxo cinza preto branco rosa dourado leve forte rápido lento novo velho alto baixo largo curto claro escuro quente frio seco norte sul leste oeste".split(" ");
export function GeradorDeSenha({ meta }: ToolProps) {
  const [mode, setMode] = useState<"chars" | "phrase">("chars");
  const [len, setLen] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true, ambiguous: false });
  const [words, setWords] = useState(5);
  const [sep, setSep] = useState("-");
  const [pw, setPw] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const gen = useCallback(() => {
    let out = "";
    let alphabet = 0;
    if (mode === "chars") {
      let chars = "";
      if (opts.lower) chars += "abcdefghijklmnopqrstuvwxyz";
      if (opts.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (opts.digits) chars += "0123456789";
      if (opts.symbols) chars += "!@#$%&*()-_=+[]{};:,.<>?";
      if (opts.ambiguous) chars = chars.replace(/[Il1O0o]/g, "");
      if (!chars) return;
      alphabet = chars.length;
      out = Array.from({ length: len }, () => chars[rand(chars.length)]).join("");
    } else {
      alphabet = WORDS.length;
      out = Array.from({ length: words }, () => pickR(WORDS)).join(sep);
    }
    setPw(out);
    setHistory((h) => [out, ...h].slice(0, 5));
    return alphabet;
  }, [mode, len, opts, words, sep]);
  useEffect(() => { gen(); }, [gen]);
  const alphabetSize = mode === "chars" ? (opts.lower ? 26 : 0) + (opts.upper ? 26 : 0) + (opts.digits ? 10 : 0) + (opts.symbols ? 24 : 0) : WORDS.length;
  const entropy = mode === "chars" ? Math.log2(Math.max(2, alphabetSize)) * len : Math.log2(WORDS.length) * words;
  const strength = entropy < 40 ? ["Fraca", "red"] : entropy < 60 ? ["Razoável", "amber"] : entropy < 80 ? ["Forte", "mint"] : ["Excelente", "mint"];
  const T = (k: keyof typeof opts, label: string) => <Toggle checked={opts[k]} onChange={(v) => setOpts((p) => ({ ...p, [k]: v }))} label={label} />;
  return (
    <ToolShell meta={meta}>
      <Segmented value={mode} onChange={setMode} options={[{ value: "chars", label: "Caracteres aleatórios" }, { value: "phrase", label: "Frase-senha" }]} />
      <div className="mt-5 border border-strong bg-page p-4">
        <div className="flex items-center justify-between gap-3">
          <code className="min-w-0 flex-1 break-all font-mono text-lg sm:text-2xl" aria-live="polite">{pw}</code>
          <div className="flex shrink-0 gap-1.5">
            <Button size="sm" variant="secondary" onClick={gen} aria-label="Gerar nova"><RefreshCw className="h-3.5 w-3.5" /></Button>
            <CopyButton text={pw} label="Copiar" variant="primary" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3"><Bar value={Math.min(entropy, 128)} max={128} tone={strength[1] as "red"} className="flex-1" /><span className="font-mono text-xs text-muted">{formatNumber(entropy, 0)} bits · {strength[0]}</span></div>
      </div>
      {mode === "chars" ? (
        <div className="mt-5 grid gap-3">
          <Field label={`Comprimento: ${len}`}><input type="range" min={6} max={64} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" /></Field>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{T("lower", "a–z")}{T("upper", "A–Z")}{T("digits", "0–9")}{T("symbols", "!@#$")}{T("ambiguous", "Sem ambíguos (Il1O0)")}</div>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 max-w-md">
          <Field label={`Palavras: ${words}`}><input type="range" min={3} max={10} value={words} onChange={(e) => setWords(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" /></Field>
          <Field label="Separador"><Select value={sep} onChange={(e) => setSep(e.target.value)}><option value="-">hífen</option><option value=".">ponto</option><option value=" ">espaço</option><option value="_">underline</option></Select></Field>
        </div>
      )}
      {history.length > 1 && <div className="mt-5"><div className="eyebrow mb-2">Geradas nesta sessão</div><ul className="divide-y divide-[var(--line)] border-y border-line">{history.slice(1).map((h, i) => <li key={i} className="flex items-center justify-between gap-3 py-2"><code className="truncate font-mono text-xs text-muted">{h}</code><CopyButton text={h} label="" size="sm" variant="ghost" className="h-7 w-7 px-0" /></li>)}</ul></div>}
      <KV rows={[["Tempo para quebrar (10¹⁰ tentativas/s)", entropy > 100 ? "séculos" : entropy > 70 ? "milhares de anos" : entropy > 50 ? "anos" : entropy > 35 ? "horas a dias" : "segundos"], ["Tamanho do alfabeto", String(alphabetSize)]]} />
    </ToolShell>
  );
}

/* --------------------------------- QR Code -------------------------------- */
export function QrCode({ meta }: ToolProps) {
  const [type, setType] = useState<"text" | "url" | "wifi" | "email" | "phone">("url");
  const [f, setF] = useState({ text: "https://nexo.app", ssid: "", pass: "", enc: "WPA", email: "", subject: "", phone: "" });
  const [size, setSize] = useState("320");
  const [dark, setDark] = useState("#121211");
  const [light, setLight] = useState("#ffffff");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const content = type === "wifi" ? `WIFI:T:${f.enc};S:${f.ssid};P:${f.pass};;` : type === "email" ? `mailto:${f.email}${f.subject ? `?subject=${encodeURIComponent(f.subject)}` : ""}` : type === "phone" ? `tel:${f.phone}` : f.text;
  useEffect(() => {
    if (!content || content === "WIFI:T:WPA;S:;P:;;" || content === "mailto:" || content === "tel:") { setUrl(""); return; }
    QRCode.toDataURL(content, { width: Number(size), margin: 2, errorCorrectionLevel: "M", color: { dark, light } })
      .then((u) => { setUrl(u); setErr(""); })
      .catch(() => setErr("Conteúdo grande demais para um QR Code."));
  }, [content, size, dark, light]);
  const u = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <ToolShell meta={meta} examples={[{ label: "Link", onClick: () => { setType("url"); u("text", "https://nexo.app/ferramentas"); } }, { label: "Wi-Fi", onClick: () => { setType("wifi"); setF((p) => ({ ...p, ssid: "CasaDaMaria", pass: "minhasenha123" })); } }]}>
      <Segmented value={type} onChange={setType} options={[{ value: "url", label: "URL" }, { value: "text", label: "Texto" }, { value: "wifi", label: "Wi-Fi" }, { value: "email", label: "E-mail" }, { value: "phone", label: "Telefone" }]} />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          {(type === "url" || type === "text") && <Field label={type === "url" ? "Endereço" : "Texto"}><Textarea value={f.text} onChange={(e) => u("text", e.target.value)} rows={3} /></Field>}
          {type === "wifi" && <ToolGrid cols={3}><Field label="Nome da rede (SSID)"><Input value={f.ssid} onChange={(e) => u("ssid", e.target.value)} /></Field><Field label="Senha"><Input value={f.pass} onChange={(e) => u("pass", e.target.value)} /></Field><Field label="Segurança"><Select value={f.enc} onChange={(e) => u("enc", e.target.value)}><option>WPA</option><option>WEP</option><option value="nopass">Aberta</option></Select></Field></ToolGrid>}
          {type === "email" && <ToolGrid><Field label="E-mail"><Input type="email" value={f.email} onChange={(e) => u("email", e.target.value)} /></Field><Field label="Assunto (opcional)"><Input value={f.subject} onChange={(e) => u("subject", e.target.value)} /></Field></ToolGrid>}
          {type === "phone" && <Field label="Telefone" className="max-w-xs"><Input value={f.phone} onChange={(e) => u("phone", e.target.value)} placeholder="+5511999999999" /></Field>}
          <ToolGrid cols={3}>
            <Field label="Tamanho"><Select value={size} onChange={(e) => setSize(e.target.value)}><option value="256">256 px</option><option value="320">320 px</option><option value="512">512 px</option><option value="1024">1024 px</option></Select></Field>
            <Field label="Cor"><div className="flex gap-2"><input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="h-10 w-full border border-line p-0.5" aria-label="Cor dos módulos" /><input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="h-10 w-full border border-line p-0.5" aria-label="Cor de fundo" /></div></Field>
          </ToolGrid>
          <ErrorText>{err}{contrast(hexToRgb(dark) ?? [0, 0, 0], hexToRgb(light) ?? [255, 255, 255]) < 3 && "Contraste baixo: leitores podem falhar."}</ErrorText>
          <div className="border border-line bg-page p-3"><div className="eyebrow mb-1">Conteúdo codificado</div><code className="break-all font-mono text-xs text-muted">{content || "—"}</code></div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-[280px] w-[280px] items-center justify-center border border-line bg-white">{url ? <img src={url} alt="QR Code gerado" width={260} height={260} className="h-[260px] w-[260px]" /> : <span className="text-xs text-subtle">Preencha os campos</span>}</div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <a href={url || undefined} download={`qrcode-${slugify(type)}.png`} className={`inline-flex h-9 items-center gap-1.5 border border-strong bg-fg px-3 text-xs font-medium text-bg ${!url && "pointer-events-none opacity-40"}`}><Download className="h-3.5 w-3.5" /> Baixar PNG</a>
            <CopyButton text={content} label="Copiar conteúdo" />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}

/* ---------------------------------- UUID ---------------------------------- */
function uuidv4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export function Uuid({ meta }: ToolProps) {
  const [n, setN] = useState("5");
  const [upper, setUpper] = useState(false);
  const [hyph, setHyph] = useState(true);
  const [list, setList] = useState<string[]>(() => Array.from({ length: 5 }, uuidv4));
  const gen = () => setList(Array.from({ length: Math.max(1, Math.min(500, Number(n) || 1)) }, uuidv4));
  const out = list.map((u) => (hyph ? u : u.replace(/-/g, ""))).map((u) => (upper ? u.toUpperCase() : u)).join("\n");
  return (
    <ToolShell meta={meta}>
      <div className="grid gap-3 sm:grid-cols-[120px_1fr_1fr_auto] sm:items-end">
        <Field label="Quantidade"><Input inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} /></Field>
        <Toggle checked={upper} onChange={setUpper} label="Maiúsculas" />
        <Toggle checked={hyph} onChange={setHyph} label="Com hífens" />
        <Button onClick={gen}><RefreshCw className="h-3.5 w-3.5" /> Gerar</Button>
      </div>
      <ResultPanel title={`${list.length} UUID v4`}>
        <OutputArea value={out} rows={Math.min(12, list.length + 1)} />
        <Actions copy={out} extra={<Button size="sm" variant="ghost" onClick={() => downloadText("uuids.txt", out)}><Download className="h-3.5 w-3.5" /> Baixar .txt</Button>} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Gerador de ideias --------------------------- */
const FORMATS = ["um guia passo a passo sobre", "os 7 erros mais comuns em", "um comparativo honesto de", "um checklist prático para", "um estudo de caso real sobre", "um glossário essencial de", "uma série de 5 posts sobre", "um vídeo curto explicando", "um template pronto para", "uma calculadora ou ferramenta de", "um desafio de 30 dias de", "perguntas e respostas sobre", "um antes e depois em", "mitos e verdades sobre", "o que ninguém conta sobre"];
const ANGLES = ["para iniciantes absolutos", "para quem tem pouco tempo", "com orçamento zero", "para pequenos negócios", "com foco em resultados em 30 dias", "usando apenas ferramentas gratuitas", "do ponto de vista de quem já errou", "com números e exemplos reais", "para quem quer sair do básico", "adaptado ao mercado brasileiro"];
const PRODUCTS = ["e-book curto", "planilha inteligente", "template de Notion", "mini-curso por e-mail", "kit de prompts", "workshop ao vivo", "comunidade paga", "newsletter premium", "consultoria em pacote", "checklist em PDF"];
export function GeradorDeIdeias({ meta }: ToolProps) {
  const [tema, setTema] = useState("finanças pessoais");
  const [tipo, setTipo] = useState<"conteudo" | "produto" | "projeto">("conteudo");
  const [seed, setSeed] = useState(0);
  const { toggleFavorite, isFavorite } = useStore();
  const ideas = useMemo(() => {
    const t = tema.trim() || "seu tema";
    const set = new Set<string>();
    let guard = 0;
    while (set.size < 12 && guard++ < 200) {
      if (tipo === "conteudo") set.add(`${pickR(FORMATS)} ${t}, ${pickR(ANGLES)}`);
      else if (tipo === "produto") set.add(`${pickR(PRODUCTS)}: "${t} ${pickR(["sem complicação", "em 7 dias", "na prática", "do zero", "para ocupados", "descomplicado"])}" — ${pickR(ANGLES)}`);
      else set.add(`${pickR(["Construir", "Automatizar", "Documentar", "Lançar", "Testar", "Redesenhar"])} ${pickR(["um bot", "um dashboard", "uma API", "uma landing page", "um app mobile", "uma extensão de navegador", "um script"])} de ${t} ${pickR(ANGLES)}`);
    }
    return [...set].map((s) => s[0].toUpperCase() + s.slice(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema, tipo, seed]);
  return (
    <ToolShell meta={meta} examples={[{ label: "finanças pessoais", onClick: () => setTema("finanças pessoais") }, { label: "IA para advogados", onClick: () => setTema("IA para advogados") }, { label: "marketing para dentistas", onClick: () => setTema("marketing para dentistas") }]}>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Field label="Tema ou nicho"><Input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="ex.: produtividade para devs" /></Field>
        <Field label="Tipo"><Segmented value={tipo} onChange={setTipo} options={[{ value: "conteudo", label: "Conteúdo" }, { value: "produto", label: "Produto" }, { value: "projeto", label: "Projeto" }]} /></Field>
        <Button onClick={() => setSeed((s) => s + 1)}><RefreshCw className="h-3.5 w-3.5" /> Gerar</Button>
      </div>
      <ResultPanel title="12 ideias">
        <ol className="divide-y divide-[var(--line)] border-y border-line">{ideas.map((idea, i) => { const id = `idea-${slugify(idea).slice(0, 40)}`; const fav = isFavorite(`tool:${id}`); return <li key={idea} className="flex items-start gap-3 py-3"><span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span><span className="flex-1 text-sm">{idea}</span><button onClick={() => toggleFavorite({ kind: "tool", slug: id, title: idea, path: "/ferramentas/gerador-de-ideias" })} className={`text-xs ${fav ? "text-accent" : "text-subtle hover:text-fg"}`}>{fav ? "salvo" : "salvar"}</button></li>; })}</ol>
        <Actions copy={ideas.map((x, i) => `${i + 1}. ${x}`).join("\n")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Nomes de negócio ---------------------------- */
const PRE = ["nova", "neo", "ultra", "meta", "prime", "alta", "boa", "pro", "smart", "vira", "hiper", "mega"];
const SUF = ["ly", "zo", "ify", "lab", "hub", "box", "ar", "ia", "io", "co", "up", "mente", "eiro", "tech", "flow", "nest"];
const NOUNS = ["casa", "ponto", "rota", "onda", "sol", "raiz", "ponte", "farol", "trilha", "bússola", "norte", "atlas"];
export function NomesDeNegocio({ meta }: ToolProps) {
  const [kw, setKw] = useState("café");
  const [style, setStyle] = useState<"moderno" | "classico" | "divertido" | "tech">("moderno");
  const [seed, setSeed] = useState(0);
  const names = useMemo(() => {
    const base = slugify(kw).replace(/-/g, "") || "nexo";
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const root = base.slice(0, Math.max(3, Math.min(6, base.length)));
    const set = new Set<string>();
    let g = 0;
    while (set.size < 16 && g++ < 300) {
      if (style === "moderno") set.add(pickR([cap(root) + pickR(["ly", "io", "ar", "eo", "ia"]), cap(root.replace(/[aeiou]$/, "")) + pickR(["a", "o", "i"]), cap(base) + " " + cap(pickR(NOUNS)), cap(pickR(["one", "co", "no"])) + cap(base)]));
      else if (style === "classico") set.add(pickR([cap(base) + " & Cia", "Casa " + cap(base), cap(base) + " " + cap(pickR(["Original", "Premium", "Real", "Central", "do Brasil", "Artesanal"])), "Ateliê " + cap(base)]));
      else if (style === "divertido") set.add(pickR([cap(root) + cap(root.slice(0, 2)), cap(base) + pickR(["zinho", "zão", "ete", "uco"]), cap(pickR(["Super", "Mega", "Puro", "Tio", "Dona"])) + " " + cap(base), cap(base) + "!"]));
      else set.add(pickR([cap(root) + pickR(["Lab", "Hub", "Tech", "Flow", "OS", "Stack", "API"]), cap(pickR(PRE)) + cap(base), cap(base) + pickR(SUF).replace(/^./, (c) => c.toUpperCase()), root.toUpperCase() + "." + pickR(["ai", "io", "app"])]));
    }
    return [...set];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kw, style, seed]);
  return (
    <ToolShell meta={meta} examples={[{ label: "café", onClick: () => setKw("café") }, { label: "fitness", onClick: () => setKw("fitness") }, { label: "dados", onClick: () => setKw("dados") }]}>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Field label="Palavra-chave"><Input value={kw} onChange={(e) => setKw(e.target.value)} /></Field>
        <Field label="Estilo"><Segmented value={style} onChange={setStyle} options={[{ value: "moderno", label: "Moderno" }, { value: "classico", label: "Clássico" }, { value: "divertido", label: "Divertido" }, { value: "tech", label: "Tech" }]} /></Field>
        <Button onClick={() => setSeed((s) => s + 1)}><RefreshCw className="h-3.5 w-3.5" /> Gerar</Button>
      </div>
      <ResultPanel title="Sugestões">
        <div className="grid gap-px border border-line bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">{names.map((n) => <div key={n} className="group flex items-center justify-between gap-2 bg-page p-3"><span className="font-display text-lg font-semibold tracking-tight">{n}</span><CopyButton text={n} label="" size="sm" variant="ghost" className="h-7 w-7 px-0 opacity-0 group-hover:opacity-100" /></div>)}</div>
        <Actions copy={names.join("\n")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Paleta de cores ----------------------------- */
export function PaletaDeCores({ meta }: ToolProps) {
  const [base, setBase] = useState("#1f5eff");
  const [mode, setMode] = useState<"comp" | "ana" | "tri" | "mono" | "split">("ana");
  const rgb = hexToRgb(base);
  const hsl = rgb ? rgbToHsl(...rgb) : [220, 100, 56];
  const [h, s, l] = hsl;
  const mk = (hh: number, ss = s, ll = l) => rgbToHex(...hslToRgb(hh, ss, ll));
  const palette = mode === "comp" ? [mk(h), mk(h, s, 80), mk(h + 180), mk(h + 180, s, 80), mk(h, 10, 20)] : mode === "ana" ? [mk(h - 60), mk(h - 30), mk(h), mk(h + 30), mk(h + 60)] : mode === "tri" ? [mk(h), mk(h + 120), mk(h + 240), mk(h, 20, 92), mk(h, 15, 15)] : mode === "split" ? [mk(h), mk(h + 150), mk(h + 210), mk(h, 15, 90), mk(h, 20, 18)] : [mk(h, s, 92), mk(h, s, 75), mk(h, s, l), mk(h, s, 35), mk(h, s, 18)];
  const css = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
  return (
    <ToolShell meta={meta} examples={[{ label: "Azul sinal", onClick: () => setBase("#1f5eff") }, { label: "Terracota", onClick: () => setBase("#e4572e") }, { label: "Verde", onClick: () => setBase("#17a672") }]}>
      <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-10 w-14 border border-line p-0.5" aria-label="Cor base" />
        <Field label="Cor base"><Input value={base} onChange={(e) => setBase(e.target.value)} className="font-mono" /></Field>
        <Field label="Harmonia"><Segmented value={mode} onChange={setMode} options={[{ value: "ana", label: "Análoga" }, { value: "comp", label: "Complementar" }, { value: "tri", label: "Triádica" }, { value: "split", label: "Split" }, { value: "mono", label: "Mono" }]} /></Field>
      </div>
      <ErrorText>{!rgb && "HEX inválido."}</ErrorText>
      <ResultPanel>
        <div className="grid grid-cols-5 gap-px border border-line bg-[var(--line)]">{palette.map((c, i) => { const r = hexToRgb(c)!; const onWhite = contrast(r, [255, 255, 255]); return <button key={i} onClick={() => navigator.clipboard?.writeText(c)} className="group flex aspect-[3/4] flex-col justify-end p-2 text-left transition-transform hover:scale-[1.02]" style={{ background: c, color: onWhite > 3 ? "#fff" : "#000" }} title="Clique para copiar"><span className="font-mono text-[10px] sm:text-xs">{c}</span><span className="font-mono text-[9px] opacity-70">{formatNumber(onWhite, 1)}:1</span></button>; })}</div>
        <div className="mt-4"><OutputArea value={css} rows={7} /></div>
        <Actions copy={css} extra={<CopyButton text={palette.join(", ")} label="Copiar HEX" />} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Gerador de hashtags ------------------------- */
const HASH_BANK: Record<string, { big: string[]; mid: string[]; niche: string[] }> = {
  marketing: { big: ["marketing", "marketingdigital", "empreendedorismo", "negocios", "vendas"], mid: ["marketingdeconteudo", "estrategiadigital", "redessociais", "branding", "copywriting"], niche: ["marketingparapequenasempresas", "growthbr", "funildevendas", "trafegopago", "inboundmarketing"] },
  tecnologia: { big: ["tecnologia", "tech", "inovacao", "programacao", "ia"], mid: ["inteligenciaartificial", "desenvolvedor", "devbr", "startup", "software"], niche: ["frontendbr", "typescript", "reactjs", "machinelearningbr", "devlife"] },
  saude: { big: ["saude", "bemestar", "fitness", "vidasaudavel", "treino"], mid: ["alimentacaosaudavel", "qualidadedevida", "saudemental", "exercicio", "nutricao"], niche: ["treinoemcasa", "receitasfit", "mindfulnessbr", "corridaderua", "yogabrasil"] },
  design: { big: ["design", "ui", "ux", "criatividade", "arte"], mid: ["uidesign", "uxdesign", "designgrafico", "tipografia", "identidadevisual"], niche: ["designsystem", "figmabr", "designeditorial", "microinteracoes", "acessibilidadedigital"] },
  financas: { big: ["financas", "investimentos", "dinheiro", "economia", "rendaextra"], mid: ["educacaofinanceira", "financaspessoais", "investir", "liberdadefinanceira", "poupar"], niche: ["juroscompostos", "rendafixa", "reservadeemergencia", "planejamentofinanceiro", "orcamentofamiliar"] },
};
export function GeradorDeHashtags({ meta }: ToolProps) {
  const [kw, setKw] = useState("marketing digital");
  const [en, setEn] = useState(false);
  const [count, setCount] = useState("15");
  const result = useMemo(() => {
    const words = slugify(kw).split("-").filter((w) => w.length > 2);
    const key = Object.keys(HASH_BANK).find((k) => words.some((w) => w.includes(k) || k.includes(w))) ?? "marketing";
    const bank = HASH_BANK[key];
    const own = words.map((w) => w).concat(words.length > 1 ? [words.join("")] : []);
    const n = Math.max(3, Math.min(30, Number(count) || 15));
    const big = [...own, ...bank.big].slice(0, Math.ceil(n * 0.3));
    const mid = [...bank.mid, ...own.map((w) => w + "brasil")].slice(0, Math.ceil(n * 0.35));
    const niche = [...bank.niche, ...own.map((w) => w + "dicas"), ...own.map((w) => w + "2026")].slice(0, n - big.length - mid.length);
    const intl = en ? ["#" + key, "#" + (key === "tecnologia" ? "technology" : key === "saude" ? "health" : key === "financas" ? "finance" : key)] : [];
    return { big: big.map((h) => "#" + h), mid: mid.map((h) => "#" + h), niche: [...niche.map((h) => "#" + h), ...intl] };
  }, [kw, en, count]);
  const all = [...result.big, ...result.mid, ...result.niche].join(" ");
  return (
    <ToolShell meta={meta} examples={Object.keys(HASH_BANK).map((k) => ({ label: k, onClick: () => setKw(k) }))}>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px_1fr] sm:items-end">
        <Field label="Palavras-chave"><Input value={kw} onChange={(e) => setKw(e.target.value)} /></Field>
        <Field label="Quantidade"><Input inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} /></Field>
        <Toggle checked={en} onChange={setEn} label="Incluir inglês" />
      </div>
      <ResultPanel>
        <div className="grid gap-4 sm:grid-cols-3">
          {[["Alcance amplo", result.big], ["Médias", result.mid], ["Nicho", result.niche]].map(([t, list]) => <div key={t as string}><div className="eyebrow mb-2">{t as string}</div><div className="flex flex-wrap gap-1.5">{(list as string[]).map((h) => <span key={h} className="border border-line px-2 py-1 font-mono text-xs">{h}</span>)}</div></div>)}
        </div>
        <OutputArea value={all} rows={3} className="mt-4" />
        <Actions copy={all} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Gerador de títulos -------------------------- */
const TITLE_T = ["{n} {coisas} sobre {t} que ninguém te contou", "Como {v} {t} em {n} passos simples", "O guia definitivo de {t} para {p}", "{t}: o que funciona (e o que é perda de tempo)", "Por que {p} estão errando em {t} — e como corrigir", "{n} erros de {t} que custam caro", "Eu testei {t} por 30 dias. Eis o que aprendi", "A verdade sobre {t} que {p} precisam ouvir", "{t} sem complicação: um método em {n} minutos", "Antes e depois: como {t} mudou meus resultados", "{n} ferramentas de {t} que uso todo dia", "Pare de {vb} {t}. Faça isto", "O que {n} anos de {t} me ensinaram", "{t} para {p}: por onde começar", "Checklist de {t}: {n} itens essenciais"];
export function GeradorDeTitulos({ meta }: ToolProps) {
  const [t, setT] = useState("produtividade");
  const [p, setP] = useState("iniciantes");
  const [seed, setSeed] = useState(0);
  const titles = useMemo(() => {
    const fill = (tpl: string) => tpl.replace("{t}", t.trim() || "seu tema").replace("{p}", p.trim() || "iniciantes").replace(/\{n\}/g, String(pickR([3, 5, 7, 9, 10, 12]))).replace("{coisas}", pickR(["verdades", "lições", "segredos", "fatos", "dicas"])).replace("{v}", pickR(["dominar", "começar em", "melhorar", "aplicar", "organizar"])).replace("{vb}", pickR(["adiar", "complicar", "ignorar", "improvisar"]));
    return [...TITLE_T].sort(() => rand(2) - 0.5).slice(0, 12).map(fill).map((s) => s[0].toUpperCase() + s.slice(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, p, seed]);
  return (
    <ToolShell meta={meta}>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Tema"><Input value={t} onChange={(e) => setT(e.target.value)} /></Field>
        <Field label="Público"><Input value={p} onChange={(e) => setP(e.target.value)} /></Field>
        <Button onClick={() => setSeed((s) => s + 1)}><RefreshCw className="h-3.5 w-3.5" /> Gerar</Button>
      </div>
      <ResultPanel>
        <ul className="divide-y divide-[var(--line)] border-y border-line">{titles.map((x) => <li key={x} className="group flex items-center justify-between gap-3 py-3"><span className="font-display text-base font-medium sm:text-lg">{x}</span><span className="flex shrink-0 items-center gap-2"><span className={`font-mono text-[10px] ${x.length > 60 ? "text-amber" : "text-subtle"}`}>{x.length}</span><CopyButton text={x} label="" size="sm" variant="ghost" className="h-7 w-7 px-0" /></span></li>)}</ul>
        <Actions copy={titles.join("\n")} />
      </ResultPanel>
    </ToolShell>
  );
}

/* ------------------------------ Gerador de bio ---------------------------- */
export function GeradorDeBio({ meta }: ToolProps) {
  const [f, setF] = useState({ prof: "Designer de produto", ajudo: "marcas a vender com clareza", prova: "+50 projetos entregues", cta: "Portfólio abaixo", emoji: true, rede: "instagram" });
  const u = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const e = (s: string) => (f.emoji ? s : "");
  const bios = [
    `${f.prof} ${e("✦")}\nAjudo ${f.ajudo}\n${f.prova} ${e("📈")}\n${f.cta} ${e("↓")}`,
    `${f.prof} • ${f.ajudo.charAt(0).toUpperCase() + f.ajudo.slice(1)} • ${f.prova}\n${f.cta} ${e("👇")}`,
    `${e("→ ")}${f.prof}\n${e("→ ")}${f.prova}\n${e("→ ")}${f.cta}`,
    `${f.prof} que ajuda ${f.ajudo}. ${f.prova}. ${f.cta}.`,
  ];
  const limit = f.rede === "instagram" ? 150 : f.rede === "x" ? 160 : 220;
  return (
    <ToolShell meta={meta}>
      <ToolGrid>
        <Field label="Profissão / quem você é"><Input value={f.prof} onChange={(ev) => u("prof", ev.target.value)} /></Field>
        <Field label="Ajudo… (o que você faz)"><Input value={f.ajudo} onChange={(ev) => u("ajudo", ev.target.value)} /></Field>
        <Field label="Prova / diferencial"><Input value={f.prova} onChange={(ev) => u("prova", ev.target.value)} /></Field>
        <Field label="Chamada para ação"><Input value={f.cta} onChange={(ev) => u("cta", ev.target.value)} /></Field>
        <Field label="Rede"><Select value={f.rede} onChange={(ev) => u("rede", ev.target.value)}><option value="instagram">Instagram (150)</option><option value="x">X (160)</option><option value="linkedin">LinkedIn headline (220)</option></Select></Field>
        <div className="pt-6"><Toggle checked={f.emoji} onChange={(v) => u("emoji", v)} label="Usar emojis" /></div>
      </ToolGrid>
      <ResultPanel>
        <div className="grid gap-4 sm:grid-cols-2">{bios.map((b, i) => <div key={i} className="flex flex-col border border-line p-4"><pre className="flex-1 whitespace-pre-wrap font-sans text-sm leading-relaxed">{b}</pre><div className="mt-3 flex items-center justify-between"><span className={`font-mono text-[11px] ${b.length > limit ? "text-red-600" : "text-subtle"}`}>{b.length}/{limit}</span><CopyButton text={b} /></div></div>)}</div>
      </ResultPanel>
    </ToolShell>
  );
}

/* ---------------------------- Nome de usuário ----------------------------- */
export function NomeDeUsuario({ meta }: ToolProps) {
  const [name, setName] = useState("ana");
  const [interest, setInterest] = useState("design");
  const [numbers, setNumbers] = useState(true);
  const [seed, setSeed] = useState(0);
  const list = useMemo(() => {
    const n = slugify(name).replace(/-/g, "") || "user";
    const i = slugify(interest).replace(/-/g, "") || "web";
    const adj = ["real", "oficial", "cria", "studio", "lab", "dev", "ok", "hq", "pro", "br", "now", "plus"];
    const leet = (s: string) => s.replace(/a/g, "4").replace(/e/g, "3").replace(/o/g, "0");
    const set = new Set<string>();
    let g = 0;
    while (set.size < 16 && g++ < 300) {
      const c = [`${n}.${i}`, `${n}_${i}`, `${i}.${n}`, `${n}${pickR(adj)}`, `${n}.${pickR(adj)}`, `${pickR(["o", "a", "the", "eu", "sou"])}${n}`, `${n}${i.slice(0, 3)}`, `${n}${leet(i)}`, `${n}${n.slice(-1)}${i.slice(0, 2)}`];
      let pick = pickR(c);
      if (numbers && rand(2)) pick += pickR(["01", "07", "10", "22", "99", "2026", String(rand(90) + 10)]);
      set.add(pick.toLowerCase());
    }
    return [...set];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, interest, numbers, seed]);
  return (
    <ToolShell meta={meta}>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Interesse / área"><Input value={interest} onChange={(e) => setInterest(e.target.value)} /></Field>
        <Toggle checked={numbers} onChange={setNumbers} label="Números" />
        <Button onClick={() => setSeed((s) => s + 1)}><RefreshCw className="h-3.5 w-3.5" /> Gerar</Button>
      </div>
      <ResultPanel>
        <div className="grid gap-px border border-line bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">{list.map((u) => <div key={u} className="group flex items-center justify-between gap-2 bg-page p-3"><span className="font-mono text-sm">@{u}</span><CopyButton text={u} label="" size="sm" variant="ghost" className="h-7 w-7 px-0 opacity-0 group-hover:opacity-100" /></div>)}</div>
        <Actions copy={list.map((u) => "@" + u).join("\n")} />
      </ResultPanel>
    </ToolShell>
  );
}
