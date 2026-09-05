import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Download, Flag, Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button, Field, Input, Range, Stat, Tabs, Textarea } from "@/components/ui/primitives";
import { CopyButton, useToast } from "@/components/ui/feedback";
import { useLocalStorage } from "@/lib/store";
import { cn, downloadText, fmtNum } from "@/lib/utils";
import { words } from "./text";

function beep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.08;
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch { /* no audio */ }
}
const pad = (n: number) => String(n).padStart(2, "0");

/* ---------- Pomodoro ---------- */
export function Pomodoro() {
  const [focus, setFocus] = useState(25);
  const [brk, setBrk] = useState(5);
  const [longBrk, setLongBrk] = useState(15);
  const [phase, setPhase] = useState<"focus" | "break" | "long">("focus");
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useLocalStorage<number>("pomodoro-sessions", 0);
  const { toast } = useToast();
  const total = (phase === "focus" ? focus : phase === "break" ? brk : longBrk) * 60;

  useEffect(() => { if (!running) setLeft((phase === "focus" ? focus : phase === "break" ? brk : longBrk) * 60); }, [focus, brk, longBrk, phase, running]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => {
      if (l <= 1) {
        beep();
        if (phase === "focus") { const s = sessions + 1; setSessions(s); const next = s % 4 === 0 ? "long" : "break"; setPhase(next); toast({ title: "Foco concluído!", description: next === "long" ? "Pausa longa merecida." : "Hora da pausa curta.", tone: "success" }); return (next === "long" ? longBrk : brk) * 60; }
        setPhase("focus"); toast({ title: "Pausa encerrada", description: "Vamos para mais um ciclo de foco.", tone: "info" }); return focus * 60;
      }
      return l - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running, phase, focus, brk, longBrk, sessions, setSessions, toast]);
  useEffect(() => { document.title = running ? `${pad(Math.floor(left / 60))}:${pad(left % 60)} · ${phase === "focus" ? "Foco" : "Pausa"} · Nexo` : document.title; }, [left, running, phase]);

  const pct = 1 - left / total;
  const R = 88, C = 2 * Math.PI * R;
  return (
    <div className="grid gap-8 md:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center">
        <div className="relative h-56 w-56">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90"><circle cx="100" cy="100" r={R} fill="none" stroke="var(--line)" strokeWidth="10" /><motion.circle cx="100" cy="100" r={R} fill="none" stroke={phase === "focus" ? "var(--accent)" : "#16a34a"} strokeWidth="10" strokeLinecap="round" strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - pct) }} transition={{ duration: 0.6 }} /></svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-mono text-5xl font-semibold tabular-nums">{pad(Math.floor(left / 60))}:{pad(left % 60)}</span><span className="mt-1 text-xs font-semibold uppercase tracking-widest text-fg-3">{phase === "focus" ? "Foco" : phase === "break" ? "Pausa" : "Pausa longa"}</span></div>
        </div>
        <div className="mt-5 flex gap-2"><Button size="lg" onClick={() => setRunning((r) => !r)}>{running ? <><Pause size={17} /> Pausar</> : <><Play size={17} /> Iniciar</>}</Button><Button size="lg" variant="outline" onClick={() => { setRunning(false); setLeft(total); }}><RotateCcw size={17} /></Button></div>
        <div className="mt-4 flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className={cn("h-2 w-6 rounded-full", i < sessions % 4 ? "bg-accent" : "bg-line")} />)}</div>
      </div>
      <div className="space-y-5">
        <Tabs value={phase} onChange={(p) => { setRunning(false); setPhase(p); }} items={[{ value: "focus", label: "Foco" }, { value: "break", label: "Pausa" }, { value: "long", label: "Longa" }]} />
        <Range label="Foco" min={5} max={90} step={5} value={focus} onChange={setFocus} display={`${focus} min`} />
        <Range label="Pausa curta" min={1} max={30} value={brk} onChange={setBrk} display={`${brk} min`} />
        <Range label="Pausa longa" min={5} max={45} step={5} value={longBrk} onChange={setLongBrk} display={`${longBrk} min`} />
        <div className="grid grid-cols-2 gap-3"><Stat label="Sessões concluídas" value={String(sessions)} /><Stat label="Tempo focado" value={`${fmtNum((sessions * focus) / 60, 1)} h`} /></div>
        <Button variant="ghost" size="sm" onClick={() => setSessions(0)}>Zerar contagem</Button>
      </div>
    </div>
  );
}

/* ---------- Stopwatch ---------- */
export function Cronometro() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const start = useRef(0);
  useEffect(() => {
    if (!running) return;
    start.current = performance.now() - ms;
    let raf: number;
    const tick = () => { setMs(performance.now() - start.current); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  const f = (m: number) => `${pad(Math.floor(m / 60000))}:${pad(Math.floor((m % 60000) / 1000))}.${pad(Math.floor((m % 1000) / 10))}`;
  return (
    <div>
      <div className="rounded-2xl border border-line bg-bg-2 py-10 text-center font-mono text-6xl font-semibold tabular-nums sm:text-7xl">{f(ms)}</div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button size="lg" onClick={() => setRunning((r) => !r)}>{running ? <><Pause size={17} /> Pausar</> : <><Play size={17} /> {ms ? "Continuar" : "Iniciar"}</>}</Button>
        <Button size="lg" variant="outline" disabled={!running} onClick={() => setLaps((l) => [ms, ...l])}><Flag size={17} /> Volta</Button>
        <Button size="lg" variant="outline" onClick={() => { setRunning(false); setMs(0); setLaps([]); }}><RotateCcw size={17} /> Zerar</Button>
        {laps.length > 0 && <CopyButton text={laps.map((l, i) => `Volta ${laps.length - i}: ${f(l)}`).reverse().join("\n")} size="md" label="Copiar voltas" />}
      </div>
      {laps.length > 0 && <ol className="mt-6 divide-y divide-line rounded-xl border border-line">{laps.map((l, i) => { const prev = laps[i + 1] ?? 0; return <li key={i} className="flex items-center justify-between px-4 py-2.5 font-mono text-sm"><span className="text-fg-3">Volta {laps.length - i}</span><span className="text-fg-2">+{f(l - prev)}</span><span className="font-semibold">{f(l)}</span></li>; })}</ol>}
    </div>
  );
}

/* ---------- Tasks ---------- */
interface Task { id: string; text: string; done: boolean; p: 1 | 2 | 3; at: number }
const emptyTasks: Task[] = [];
export function Tarefas() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", emptyTasks);
  const [text, setText] = useState("");
  const [p, setP] = useState<1 | 2 | 3>(2);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const add = () => { if (!text.trim()) return; setTasks((t) => [{ id: crypto.randomUUID(), text: text.trim(), done: false, p, at: Date.now() }, ...t]); setText(""); };
  const shown = tasks.filter((t) => (filter === "all" ? true : filter === "open" ? !t.done : t.done)).sort((a, b) => Number(a.done) - Number(b.done) || a.p - b.p || b.at - a.at);
  const done = tasks.filter((t) => t.done).length;
  const pc: Record<number, string> = { 1: "bg-danger", 2: "bg-warn", 3: "bg-fg-3" };
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row"><Input placeholder="Nova tarefa… (Enter para adicionar)" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} /><div className="flex gap-1 rounded-xl bg-bg-3 p-1">{([1, 2, 3] as const).map((x) => <button key={x} onClick={() => setP(x)} className={cn("rounded-lg px-3 text-xs font-semibold", p === x ? "bg-bg shadow-sm" : "text-fg-3")}>{x === 1 ? "Alta" : x === 2 ? "Média" : "Baixa"}</button>)}</div><Button onClick={add}><Plus size={16} /> Adicionar</Button></div>
      {tasks.length > 0 && <div className="mt-4"><div className="flex items-center justify-between text-xs text-fg-3"><span>{done} de {tasks.length} concluídas</span><span>{Math.round((done / tasks.length) * 100)}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"><motion.div className="h-full bg-ok" animate={{ width: `${(done / tasks.length) * 100}%` }} /></div></div>}
      <div className="mt-4 flex items-center justify-between"><Tabs value={filter} onChange={setFilter} items={[{ value: "all", label: "Todas" }, { value: "open", label: "Abertas" }, { value: "done", label: "Feitas" }]} /><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => downloadText("tarefas.txt", tasks.map((t) => `${t.done ? "[x]" : "[ ]"} ${t.text}`).join("\n"))} disabled={!tasks.length}><Download size={14} /></Button><Button variant="ghost" size="sm" onClick={() => setTasks((t) => t.filter((x) => !x.done))} disabled={!done}>Limpar feitas</Button></div></div>
      <ul className="mt-3 space-y-1.5">
        {shown.length === 0 && <li className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-fg-3">Nenhuma tarefa aqui.</li>}
        {shown.map((t) => (
          <motion.li layout key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("group flex items-center gap-3 rounded-xl border border-line bg-bg px-3 py-2.5", t.done && "opacity-60")}>
            <button onClick={() => setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors", t.done ? "border-ok bg-ok text-white" : "border-line-2 hover:border-fg")} aria-label="Concluir">{t.done && <Check size={12} />}</button>
            <span className={cn("h-2 w-2 shrink-0 rounded-full", pc[t.p])} />
            <span className={cn("flex-1 text-[15px]", t.done && "line-through")}>{t.text}</span>
            <button onClick={() => setTasks((all) => all.filter((x) => x.id !== t.id))} className="text-fg-3 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100" aria-label="Excluir"><Trash2 size={15} /></button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Notes ---------- */
export function Notas() {
  const [note, setNote] = useLocalStorage<string>("notes", "");
  const [saved, setSaved] = useState(true);
  const { toast } = useToast();
  useEffect(() => { setSaved(false); const id = setTimeout(() => setSaved(true), 600); return () => clearTimeout(id); }, [note]);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-fg-3"><span>{saved ? "Salvo automaticamente" : "Salvando…"} · {words(note)} palavras · {note.length} caracteres</span><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => downloadText("notas.txt", note)} disabled={!note}><Download size={14} /> .txt</Button><CopyButton text={note} disabled={!note} variant="ghost" /><Button variant="ghost" size="sm" onClick={() => { if (confirm("Apagar todas as notas?")) { setNote(""); toast({ title: "Notas apagadas", tone: "info" }); } }} disabled={!note}><Trash2 size={14} /></Button></div></div>
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Escreva aqui. Tudo fica salvo neste navegador." className="min-h-[420px] text-[16px] leading-relaxed" />
    </div>
  );
}

/* ---------- Reading time ---------- */
export function TempoLeitura() {
  const [t, setT] = useState("");
  const [wpm, setWpm] = useState(200);
  const w = words(t);
  const f = (m: number) => (m < 1 ? `${Math.round(m * 60)} s` : `${Math.floor(m)} min ${Math.round((m % 1) * 60)} s`);
  return (
    <div>
      <Field label="Texto"><Textarea value={t} onChange={(e) => setT(e.target.value)} className="min-h-[200px]" placeholder="Cole o texto…" /></Field>
      <div className="mt-4"><Range label="Velocidade de leitura" min={100} max={400} step={10} value={wpm} onChange={setWpm} display={`${wpm} ppm`} /></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Leitura silenciosa" value={f(w / wpm)} /><Stat label="Leitura em voz alta" value={f(w / 130)} hint="130 ppm" /><Stat label="Narração de vídeo" value={f(w / 150)} hint="150 ppm" /><Stat label="Palavras" value={String(w)} /></div>
    </div>
  );
}

/* ---------- Decision wheel ---------- */
export function Roda() {
  const [opts, setOpts] = useState("Pizza\nSushi\nHambúrguer\nSalada\nMassa");
  const items = useMemo(() => opts.split("\n").map((s) => s.trim()).filter(Boolean), [opts]);
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const colors = ["#2f5bff", "#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#22c55e"];
  const spin = () => {
    if (items.length < 2 || spinning) return;
    setSpinning(true); setWinner(null);
    const extra = 1440 + Math.random() * 360;
    const next = rot + extra;
    setRot(next);
    setTimeout(() => { const deg = (360 - (next % 360) + 90) % 360; const idx = Math.floor((deg / 360) * items.length) % items.length; setWinner(items[idx]); setSpinning(false); }, 4200);
  };
  const seg = 360 / Math.max(1, items.length);
  const gradient = `conic-gradient(${items.map((_, i) => `${colors[i % colors.length]} ${i * seg}deg ${(i + 1) * seg}deg`).join(",")})`;
  return (
    <div className="grid gap-8 md:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1 border-x-[12px] border-t-[20px] border-x-transparent border-t-fg" />
          <motion.div animate={{ rotate: rot }} transition={{ duration: 4, ease: [0.15, 0.85, 0.2, 1] }} className="relative h-64 w-64 rounded-full border-4 border-bg shadow-[var(--shadow-pop)]" style={{ background: gradient }}>
            {items.map((it, i) => <span key={i} className="absolute left-1/2 top-1/2 origin-left -translate-y-1/2 pl-14 text-xs font-semibold text-white drop-shadow" style={{ transform: `rotate(${i * seg + seg / 2 - 90}deg) translateY(-50%)`, width: 128 }}>{it.slice(0, 14)}</span>)}
          </motion.div>
        </div>
        <Button size="lg" className="mt-5" onClick={spin} disabled={spinning || items.length < 2}>{spinning ? "Girando…" : "Girar"}</Button>
        {winner && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 rounded-xl bg-fg px-5 py-2 text-lg font-semibold text-bg">{winner}</motion.div>}
      </div>
      <Field label="Opções (uma por linha)"><Textarea value={opts} onChange={(e) => setOpts(e.target.value)} className="min-h-[240px]" /></Field>
    </div>
  );
}
