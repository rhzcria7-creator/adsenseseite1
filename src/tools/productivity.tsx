import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flag, Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button, Field, Input, Segmented, Select, Textarea } from "@/components/ui/primitives";
import { ResultBox, Stat } from "@/components/ui/feedback";
import { useLocalStorage, useStore } from "@/lib/store";
import { cn, downloadText, uid } from "@/lib/utils";
import { fmt, rnd, TemplateTool, ToolActions } from "./ToolShell";
import { words } from "./text";

const beep = () => { try { const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6); o.start(); o.stop(ctx.currentTime + 0.6); } catch { /* sem áudio */ } };
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* -------------------------------- Pomodoro -------------------------------- */
export function Pomodoro() {
  const [cfg, setCfg] = useLocalStorage("pomodoro-cfg", { focus: 25, short: 5, long: 15, sound: true });
  const [state, setState] = useLocalStorage("pomodoro-state", { mode: "focus" as "focus" | "short" | "long", endAt: 0, remaining: 25 * 60, running: false, done: 0, day: new Date().toDateString() });
  const [, tick] = useState(0);
  const { toast } = useStore();
  useEffect(() => { if (state.day !== new Date().toDateString()) setState({ ...state, done: 0, day: new Date().toDateString() }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const remaining = state.running ? Math.max(0, Math.round((state.endAt - Date.now()) / 1000)) : state.remaining;
  const total = cfg[state.mode] * 60;
  useEffect(() => { if (!state.running) return; const id = setInterval(() => { tick((x) => x + 1); if (Date.now() >= state.endAt) { if (cfg.sound) beep(); const nextDone = state.mode === "focus" ? state.done + 1 : state.done; const nextMode = state.mode === "focus" ? (nextDone % 4 === 0 ? "long" : "short") : "focus"; setState({ ...state, running: false, mode: nextMode, remaining: cfg[nextMode] * 60, done: nextDone }); toast({ title: state.mode === "focus" ? "Pomodoro concluído!" : "Pausa encerrada", description: state.mode === "focus" ? "Hora da pausa." : "De volta ao foco." }); } }, 500); return () => clearInterval(id); }, [state, cfg, setState, toast]);
  const start = () => setState({ ...state, running: true, endAt: Date.now() + remaining * 1000 });
  const pause = () => setState({ ...state, running: false, remaining });
  const reset = (mode = state.mode) => setState({ ...state, running: false, mode, remaining: cfg[mode] * 60 });
  const pctDone = 1 - remaining / total;
  useEffect(() => { document.title = state.running ? `${mmss(remaining)} · ${state.mode === "focus" ? "Foco" : "Pausa"} — Nexo` : document.title; }, [remaining, state.running, state.mode]);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col items-center">
        <Segmented value={state.mode} onChange={(m) => reset(m)} options={[{ value: "focus", label: "Foco" }, { value: "short", label: "Pausa curta" }, { value: "long", label: "Pausa longa" }]} />
        <div className="relative mt-8 grid h-64 w-64 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" strokeWidth="4" /><motion.circle cx="50" cy="50" r="46" fill="none" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" strokeDasharray={2 * Math.PI * 46} animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - pctDone) }} transition={{ duration: 0.4 }} /></svg>
          <div className="text-center"><p className="font-mono text-6xl font-semibold tabular-nums tracking-tight">{mmss(remaining)}</p><p className="mt-1 text-sm text-fg-3">{state.mode === "focus" ? "concentração" : "descanso"}</p></div>
        </div>
        <div className="mt-6 flex gap-2">{state.running ? <Button size="lg" onClick={pause}><Pause className="h-4 w-4" />Pausar</Button> : <Button size="lg" onClick={start}><Play className="h-4 w-4" />{remaining === total ? "Iniciar" : "Continuar"}</Button>}<Button size="lg" variant="outline" onClick={() => reset()}><RotateCcw className="h-4 w-4" /></Button></div>
        <p className="mt-5 text-sm text-fg-2">Hoje: <strong>{state.done}</strong> pomodoro(s) · {fmt(state.done * cfg.focus, 0)} min de foco</p>
        <div className="mt-2 flex gap-1">{Array.from({ length: 8 }).map((_, i) => <span key={i} className={cn("h-2 w-6 rounded-full", i < state.done ? "bg-brand" : "bg-line")} />)}</div>
      </div>
      <div className="space-y-4 rounded-2xl border bg-surface-2/50 p-5">
        <p className="text-sm font-medium">Configurações</p>
        <div className="grid grid-cols-3 gap-3">{(["focus", "short", "long"] as const).map((k) => <Field key={k} label={k === "focus" ? "Foco (min)" : k === "short" ? "Pausa curta" : "Pausa longa"}><Input type="number" min={1} max={120} value={cfg[k]} onChange={(e) => { const v = Math.max(1, +e.target.value || 1); setCfg({ ...cfg, [k]: v }); if (k === state.mode && !state.running) setState({ ...state, remaining: v * 60 }); }} /></Field>)}</div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={cfg.sound} onChange={(e) => setCfg({ ...cfg, sound: e.target.checked })} />Som ao terminar</label>
        <p className="text-xs leading-5 text-fg-3">O timer usa o relógio real: continua correto mesmo se você trocar de aba. A cada 4 pomodoros, a pausa longa é sugerida automaticamente.</p>
      </div>
    </div>
  );
}

/* -------------------------------- Cronômetro ------------------------------ */
export function Cronometro() {
  const [tab, setTab] = useState<"sw" | "timer">("sw");
  const [sw, setSw] = useState({ running: false, start: 0, acc: 0, laps: [] as number[] });
  const [, tick] = useState(0);
  useEffect(() => { if (!sw.running) return; const id = setInterval(() => tick((x) => x + 1), 50); return () => clearInterval(id); }, [sw.running]);
  const el = sw.acc + (sw.running ? performance.now() - sw.start : 0);
  const f = (ms: number) => `${mmss(ms / 1000)}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;
  const [tm, setTm] = useState({ min: "5", sec: "0", endAt: 0, running: false, left: 300 });
  const { toast } = useStore();
  useEffect(() => { if (!tm.running) return; const id = setInterval(() => { const left = Math.max(0, Math.round((tm.endAt - Date.now()) / 1000)); setTm((t) => ({ ...t, left })); if (left <= 0) { beep(); setTm((t) => ({ ...t, running: false })); toast({ title: "Tempo esgotado!" }); } }, 250); return () => clearInterval(id); }, [tm.running, tm.endAt, toast]);
  return (
    <div className="space-y-6">
      <Segmented value={tab} onChange={setTab} options={[{ value: "sw", label: "Cronômetro" }, { value: "timer", label: "Timer regressivo" }]} />
      {tab === "sw" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center rounded-2xl border bg-surface-2/50 p-8"><p className="font-mono text-6xl font-semibold tabular-nums">{f(el)}</p><div className="mt-6 flex gap-2">{sw.running ? <><Button onClick={() => setSw({ ...sw, laps: [el, ...sw.laps] })}><Flag className="h-4 w-4" />Volta</Button><Button variant="outline" onClick={() => setSw({ ...sw, running: false, acc: el })}><Pause className="h-4 w-4" />Pausar</Button></> : <><Button onClick={() => setSw({ ...sw, running: true, start: performance.now() })}><Play className="h-4 w-4" />{el ? "Continuar" : "Iniciar"}</Button><Button variant="outline" onClick={() => setSw({ running: false, start: 0, acc: 0, laps: [] })}><RotateCcw className="h-4 w-4" />Zerar</Button></>}</div></div>
          <div className="rounded-2xl border bg-surface p-4"><p className="mb-2 text-sm font-medium">Voltas</p>{sw.laps.length ? <ol className="max-h-64 space-y-1 overflow-auto font-mono text-sm">{sw.laps.map((l, i) => <li key={i} className="flex justify-between border-b py-1.5 last:border-0"><span className="text-fg-3">#{sw.laps.length - i}</span><span>{f(l - (sw.laps[i + 1] ?? 0))}</span><span className="text-fg-3">{f(l)}</span></li>)}</ol> : <p className="text-sm text-fg-3">Nenhuma volta ainda.</p>}</div>
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border bg-surface-2/50 p-8">
          <p className="font-mono text-6xl font-semibold tabular-nums">{mmss(tm.left)}</p>
          <div className="mt-6 flex items-end gap-2"><Field label="Min"><Input className="w-20" value={tm.min} onChange={(e) => setTm({ ...tm, min: e.target.value, left: (+e.target.value || 0) * 60 + (+tm.sec || 0) })} /></Field><Field label="Seg"><Input className="w-20" value={tm.sec} onChange={(e) => setTm({ ...tm, sec: e.target.value, left: (+tm.min || 0) * 60 + (+e.target.value || 0) })} /></Field>{tm.running ? <Button onClick={() => setTm({ ...tm, running: false })}><Pause className="h-4 w-4" />Pausar</Button> : <Button onClick={() => tm.left > 0 && setTm({ ...tm, running: true, endAt: Date.now() + tm.left * 1000 })}><Play className="h-4 w-4" />Iniciar</Button>}<Button variant="outline" onClick={() => setTm({ ...tm, running: false, left: (+tm.min || 0) * 60 + (+tm.sec || 0) })}><RotateCcw className="h-4 w-4" /></Button></div>
          <div className="mt-4 flex gap-2">{[1, 5, 10, 25].map((m) => <Button key={m} size="sm" variant="ghost" onClick={() => setTm({ min: String(m), sec: "0", endAt: 0, running: false, left: m * 60 })}>{m} min</Button>)}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- Tarefas ------------------------------- */
interface Task { id: string; text: string; done: boolean; pri: "alta" | "media" | "baixa"; createdAt: number }
export function ListaDeTarefas() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [text, setText] = useState(""); const [pri, setPri] = useState<Task["pri"]>("media"); const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const add = () => { if (!text.trim()) return; setTasks([{ id: uid(), text: text.trim(), done: false, pri, createdAt: Date.now() }, ...tasks]); setText(""); };
  const shown = tasks.filter((t) => filter === "all" || (filter === "open" ? !t.done : t.done)).sort((a, b) => Number(a.done) - Number(b.done) || ["alta", "media", "baixa"].indexOf(a.pri) - ["alta", "media", "baixa"].indexOf(b.pri));
  const done = tasks.filter((t) => t.done).length;
  const P = { alta: "bg-danger", media: "bg-warn", baixa: "bg-ok" };
  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="flex gap-2"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nova tarefa…" className="flex-1" /><Select value={pri} onChange={(e) => setPri(e.target.value as Task["pri"])} className="w-28"><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></Select><Button type="submit"><Plus className="h-4 w-4" />Adicionar</Button></form>
      <div className="flex flex-wrap items-center justify-between gap-3"><Segmented value={filter} onChange={setFilter} options={[{ value: "all", label: `Todas (${tasks.length})` }, { value: "open", label: `Abertas (${tasks.length - done})` }, { value: "done", label: `Feitas (${done})` }]} />{tasks.length > 0 && <div className="flex items-center gap-3 text-sm text-fg-3"><span className="h-1.5 w-32 rounded-full bg-line"><span className="block h-full rounded-full bg-brand transition-all" style={{ width: `${(done / tasks.length) * 100}%` }} /></span>{fmt((done / tasks.length) * 100, 0)}%<Button size="sm" variant="ghost" onClick={() => setTasks(tasks.filter((t) => !t.done))} disabled={!done}>Limpar feitas</Button></div>}</div>
      <ul className="divide-y rounded-2xl border bg-surface">
        <AnimatePresence initial={false}>
          {shown.map((t) => (
            <motion.li key={t.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors", t.done ? "border-brand bg-brand text-brand-fg" : "hover:border-line-2")} aria-label="Concluir">{t.done && <Check className="h-3.5 w-3.5" />}</button>
              <span className={cn("h-2 w-2 shrink-0 rounded-full", P[t.pri])} title={`Prioridade ${t.pri}`} />
              <span className={cn("flex-1 text-sm", t.done && "text-fg-3 line-through")}>{t.text}</span>
              <button onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))} className="text-fg-3 hover:text-danger" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button>
            </motion.li>
          ))}
        </AnimatePresence>
        {!shown.length && <li className="px-4 py-10 text-center text-sm text-fg-3">{tasks.length ? "Nada aqui com esse filtro." : "Adicione a primeira tarefa. Fica salvo neste navegador."}</li>}
      </ul>
    </div>
  );
}

/* ---------------------------------- Notas --------------------------------- */
export function NotasRapidas() {
  const [notes, setNotes] = useLocalStorage<{ id: string; title: string; body: string; updatedAt: number }[]>("notes", []);
  const [cur, setCur] = useState<string | null>(notes[0]?.id ?? null);
  const note = notes.find((n) => n.id === cur);
  const upd = (patch: Partial<{ title: string; body: string }>) => setNotes(notes.map((n) => (n.id === cur ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  const add = () => { const n = { id: uid(), title: "Nova nota", body: "", updatedAt: Date.now() }; setNotes([n, ...notes]); setCur(n.id); };
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="rounded-2xl border bg-surface p-2"><Button size="sm" className="w-full" onClick={add}><Plus className="h-4 w-4" />Nova nota</Button><ul className="mt-2 max-h-80 space-y-0.5 overflow-auto">{notes.map((n) => <li key={n.id}><button onClick={() => setCur(n.id)} className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", n.id === cur ? "bg-surface-2 font-medium" : "hover:bg-surface-2/60")}><span className="block truncate">{n.title || "Sem título"}</span><span className="block truncate text-xs text-fg-3">{new Date(n.updatedAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></button></li>)}</ul></div>
      {note ? <div className="space-y-3"><Input value={note.title} onChange={(e) => upd({ title: e.target.value })} className="text-base font-medium" /><Textarea rows={14} value={note.body} onChange={(e) => upd({ body: e.target.value })} placeholder="Escreva… salva automaticamente." /><div className="flex flex-wrap items-center gap-3 text-xs text-fg-3"><span>{words(note.body).length} palavras · {[...note.body].length} caracteres · salvo</span><ToolActions copyText={note.body}><Button size="sm" variant="outline" onClick={() => downloadText(`${note.title || "nota"}.md`, `# ${note.title}\n\n${note.body}`)}>Baixar .md</Button><Button size="sm" variant="ghost" onClick={() => { setNotes(notes.filter((n) => n.id !== cur)); setCur(notes.find((n) => n.id !== cur)?.id ?? null); }}><Trash2 className="h-4 w-4" />Excluir</Button></ToolActions></div></div> : <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed text-sm text-fg-3">Crie uma nota para começar.</div>}
    </div>
  );
}

/* ------------------------------- Eisenhower ------------------------------- */
type Quad = "do" | "schedule" | "delegate" | "delete";
const QUADS: { k: Quad; title: string; sub: string; cls: string }[] = [{ k: "do", title: "Fazer agora", sub: "urgente + importante", cls: "border-danger/30" }, { k: "schedule", title: "Agendar", sub: "importante, não urgente", cls: "border-brand/30" }, { k: "delegate", title: "Delegar", sub: "urgente, não importante", cls: "border-warn/30" }, { k: "delete", title: "Eliminar", sub: "nem urgente nem importante", cls: "border-line" }];
export function MatrizEisenhower() {
  const [items, setItems] = useLocalStorage<{ id: string; text: string; q: Quad }[]>("eisenhower", []);
  const [text, setText] = useState(""); const [q, setQ] = useState<Quad>("do"); const [drag, setDrag] = useState<string | null>(null);
  const add = () => { if (!text.trim()) return; setItems([...items, { id: uid(), text: text.trim(), q }]); setText(""); };
  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="flex flex-wrap gap-2"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tarefa…" className="min-w-[200px] flex-1" /><Select value={q} onChange={(e) => setQ(e.target.value as Quad)} className="w-44">{QUADS.map((x) => <option key={x.k} value={x.k}>{x.title}</option>)}</Select><Button type="submit"><Plus className="h-4 w-4" />Adicionar</Button></form>
      <div className="grid gap-3 sm:grid-cols-2">{QUADS.map((qd) => (
        <div key={qd.k} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) setItems(items.map((i) => (i.id === drag ? { ...i, q: qd.k } : i))); setDrag(null); }} className={cn("min-h-[160px] rounded-2xl border-2 bg-surface p-4", qd.cls)}>
          <p className="font-medium">{qd.title}</p><p className="mb-3 text-xs text-fg-3">{qd.sub}</p>
          <ul className="space-y-1.5">{items.filter((i) => i.q === qd.k).map((i) => <li key={i.id} draggable onDragStart={() => setDrag(i.id)} className="flex cursor-grab items-center gap-2 rounded-lg border bg-surface-2/60 px-3 py-2 text-sm active:cursor-grabbing"><span className="flex-1">{i.text}</span><select value={i.q} onChange={(e) => setItems(items.map((x) => (x.id === i.id ? { ...x, q: e.target.value as Quad } : x)))} className="rounded border bg-surface text-[11px] sm:hidden">{QUADS.map((x) => <option key={x.k} value={x.k}>{x.title}</option>)}</select><button onClick={() => setItems(items.filter((x) => x.id !== i.id))} className="text-fg-3 hover:text-danger" aria-label="Remover"><Trash2 className="h-3.5 w-3.5" /></button></li>)}</ul>
        </div>
      ))}</div>
      <p className="text-xs text-fg-3">Arraste entre quadrantes (desktop) ou use o seletor (mobile). Dados salvos localmente.</p>
    </div>
  );
}

/* --------------------------------- Roleta --------------------------------- */
export function RoletaDeDecisao() {
  const [opts, setOpts] = useLocalStorage<string[]>("roulette", ["Pizza", "Japonês", "Hambúrguer", "Salada", "Mexicano"]);
  const [text, setText] = useState(""); const [rot, setRot] = useState(0); const [spinning, setSpinning] = useState(false); const [result, setResult] = useState<string | null>(null);
  const ref = useRef(0);
  const colors = ["#1d4ed8", "#0f766e", "#b45309", "#7c3aed", "#be123c", "#4d7c0f", "#0369a1", "#a21caf"];
  const spin = () => { if (opts.length < 2 || spinning) return; const idx = rnd(opts.length); const seg = 360 / opts.length; const target = 360 * 6 + (360 - (idx * seg + seg / 2)); ref.current += target - (ref.current % 360); setRot(ref.current); setSpinning(true); setResult(null); setTimeout(() => { setSpinning(false); setResult(opts[idx]); }, 4200); };
  const grad = `conic-gradient(${opts.map((_, i) => `${colors[i % colors.length]} ${(i / opts.length) * 100}% ${((i + 1) / opts.length) * 100}%`).join(", ")})`;
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col items-center">
        <div className="relative"><div className="absolute -top-1 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[20px] border-x-transparent border-t-fg" /><motion.div className="relative h-72 w-72 rounded-full border-4 border-surface shadow-pop" style={{ background: grad }} animate={{ rotate: rot }} transition={{ duration: 4, ease: [0.15, 0.85, 0.15, 1] }}>{opts.map((o, i) => <span key={i} className="absolute left-1/2 top-1/2 origin-left text-[12px] font-medium text-white drop-shadow" style={{ transform: `rotate(${(i + 0.5) * (360 / opts.length) - 90}deg) translateX(40px)`, maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o}</span>)}</motion.div></div>
        <Button size="lg" className="mt-6" onClick={spin} disabled={spinning || opts.length < 2}>{spinning ? "Girando…" : "Girar"}</Button>
        <AnimatePresence>{result && <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl border bg-surface px-5 py-3 text-lg font-semibold">→ {result}</motion.p>}</AnimatePresence>
      </div>
      <div className="space-y-3"><form onSubmit={(e) => { e.preventDefault(); if (text.trim() && opts.length < 12) { setOpts([...opts, text.trim()]); setText(""); } }} className="flex gap-2"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nova opção…" /><Button type="submit" disabled={opts.length >= 12}><Plus className="h-4 w-4" /></Button></form><ul className="divide-y rounded-2xl border bg-surface">{opts.map((o, i) => <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm"><span className="h-3 w-3 rounded-full" style={{ background: colors[i % colors.length] }} /><span className="flex-1">{o}</span><button onClick={() => setOpts(opts.filter((_, j) => j !== i))} className="text-fg-3 hover:text-danger" aria-label="Remover"><Trash2 className="h-4 w-4" /></button></li>)}</ul><p className="text-xs text-fg-3">De 2 a 12 opções. Resultado escolhido com aleatoriedade criptográfica.</p></div>
    </div>
  );
}

/* ----------------------------------- OKR ---------------------------------- */
export const GeradorDeOkr = () => <TemplateTool cta="Gerar OKR" fields={[{ key: "obj", label: "Meta (mesmo que vaga)", placeholder: "melhorar a retenção de clientes" }, { key: "area", label: "Área", type: "select", default: "produto", options: ["produto", "marketing", "vendas", "operações", "pessoas", "financeiro", "pessoal"].map((x) => ({ value: x, label: x })) }, { key: "prazo", label: "Prazo", type: "select", default: "trimestre", options: ["mês", "trimestre", "semestre", "ano"].map((x) => ({ value: x, label: x })) }, { key: "base", label: "Situação atual (número, se souber)", placeholder: "churn mensal de 6%" }]} build={(v) => { if (!v.obj) return "Descreva a meta."; const KR: Record<string, string[]> = { produto: ["Aumentar ativação em 7 dias de X% para Y%", "Reduzir tempo até o primeiro valor de X para Y min", "Elevar NPS de X para Y", "Reduzir tickets de suporte por usuário em Z%"], marketing: ["Crescer tráfego orgânico de X para Y visitas/mês", "Aumentar taxa de conversão de visitante para lead de X% para Y%", "Reduzir CAC de R$ X para R$ Y", "Publicar N conteúdos que ranqueiem no top 10"], vendas: ["Aumentar taxa de fechamento de X% para Y%", "Reduzir ciclo de vendas de X para Y dias", "Elevar ticket médio de R$ X para R$ Y", "Gerar N oportunidades qualificadas por mês"], operações: ["Reduzir tempo de processo de X para Y horas", "Diminuir erros/retrabalho de X% para Y%", "Automatizar N etapas manuais", "Atingir SLA de X% nas entregas"], pessoas: ["Elevar eNPS de X para Y", "Reduzir turnover voluntário de X% para Y%", "Concluir plano de desenvolvimento para 100% do time", "Reduzir tempo de contratação de X para Y dias"], financeiro: ["Aumentar margem bruta de X% para Y%", "Reduzir despesas fixas em Z%", "Atingir R$ X de caixa livre", "Reduzir inadimplência de X% para Y%"], pessoal: ["Praticar N vezes por semana durante o período", "Concluir X unidades (livros, cursos, km)", "Reduzir métrica ruim de X para Y", "Manter sequência de N dias"] }; const krs = KR[v.area] ?? KR.produto; return `OBJETIVO (${v.prazo})\n${v.obj.charAt(0).toUpperCase() + v.obj.slice(1)} — de forma visível para clientes e time.\n\nRESULTADOS-CHAVE\n${krs.slice(0, 3).map((k, i) => `KR${i + 1}. ${k}${i === 0 && v.base ? `  (baseline: ${v.base})` : ""}`).join("\n")}\n\nINICIATIVAS (o que vamos fazer para mover os KRs)\n- [iniciativa 1 — dona/dono, prazo]\n- [iniciativa 2]\n- [iniciativa 3]\n\nCHECK-IN\n- Ritmo: semanal, 15 min. Cada KR recebe confiança 0–10.\n- Regra: KR sem número não é KR. Substitua X/Y por valores reais antes de começar.\n- Ao final do ${v.prazo}: nota 0,7 é sucesso; 1,0 sugere meta fácil demais.`; }} />;

/* ------------------------------- Hábitos ---------------------------------- */
export function RastreadorDeHabitos() {
  const [habits, setHabits] = useLocalStorage<{ id: string; name: string; days: string[] }[]>("habits", []);
  const [name, setName] = useState("");
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toISOString().slice(0, 10); }), []);
  const toggle = (id: string, day: string) => setHabits(habits.map((h) => (h.id === id ? { ...h, days: h.days.includes(day) ? h.days.filter((x) => x !== day) : [...h.days, day] } : h)));
  const streak = (h: { days: string[] }) => { let s = 0; const d = new Date(); for (;;) { const k = d.toISOString().slice(0, 10); if (h.days.includes(k)) { s++; d.setDate(d.getDate() - 1); } else if (s === 0 && k === new Date().toISOString().slice(0, 10)) { d.setDate(d.getDate() - 1); } else break; if (s > 999) break; } return s; };
  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim() && habits.length < 10) { setHabits([...habits, { id: uid(), name: name.trim(), days: [] }]); setName(""); } }} className="flex gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Novo hábito (ex.: ler 20 min)" /><Button type="submit" disabled={habits.length >= 10}><Plus className="h-4 w-4" />Adicionar</Button></form>
      {habits.length ? (
        <div className="overflow-x-auto rounded-2xl border bg-surface"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-fg-3"><th className="sticky left-0 bg-surface px-4 py-2 text-left font-medium">Hábito</th>{days.map((d) => <th key={d} className="px-1 py-2 font-normal"><span className="block">{["D", "S", "T", "Q", "Q", "S", "S"][new Date(d + "T00:00:00").getDay()]}</span><span className="text-[10px]">{d.slice(8)}</span></th>)}<th className="px-3 py-2 font-medium">Sequência</th><th className="px-3 py-2 font-medium">14 d</th><th /></tr></thead>
          <tbody>{habits.map((h) => <tr key={h.id} className="border-b last:border-0"><td className="sticky left-0 bg-surface px-4 py-2 font-medium">{h.name}</td>{days.map((d) => { const on = h.days.includes(d); return <td key={d} className="px-1 py-2 text-center"><button onClick={() => toggle(h.id, d)} className={cn("h-7 w-7 rounded-md border transition-all", on ? "border-brand bg-brand text-brand-fg scale-100" : "hover:border-line-2 hover:bg-surface-2")} aria-label={`${h.name} em ${d}`} aria-pressed={on}>{on && <Check className="mx-auto h-3.5 w-3.5" />}</button></td>; })}<td className="px-3 py-2 text-center tabular-nums">🔥 {streak(h)}</td><td className="px-3 py-2 text-center tabular-nums text-fg-3">{fmt((days.filter((d) => h.days.includes(d)).length / 14) * 100, 0)}%</td><td className="px-2"><button onClick={() => setHabits(habits.filter((x) => x.id !== h.id))} className="text-fg-3 hover:text-danger" aria-label="Remover"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
      ) : <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-fg-3">Comece com 1 a 3 hábitos. Clique nos dias para marcar.</div>}
    </div>
  );
}

export function CalculadoraDeMetas() {
  const [f, setF] = useState({ meta: "24", unidade: "livros", prazo: "", atual: "0", mode: "corridos" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const r = useMemo(() => { const meta = parseFloat(f.meta.replace(",", ".")), atual = parseFloat(f.atual.replace(",", ".")) || 0; if (!Number.isFinite(meta) || !f.prazo) return null; const end = new Date(f.prazo + "T00:00:00"), now = new Date(); now.setHours(0, 0, 0, 0); if (end <= now) return { err: "O prazo precisa ser no futuro." }; let dias = 0; const d = new Date(now); while (d < end) { if (f.mode === "corridos" || d.getDay() % 6 !== 0) dias++; d.setDate(d.getDate() + 1); } const rest = Math.max(0, meta - atual); return { dias, porDia: rest / dias, porSemana: (rest / dias) * (f.mode === "corridos" ? 7 : 5), porMes: (rest / dias) * (f.mode === "corridos" ? 30.44 : 21.7), rest, prog: meta ? (atual / meta) * 100 : 0 }; }, [f]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Meta total"><Input value={f.meta} onChange={set("meta")} /></Field><Field label="Unidade"><Input value={f.unidade} onChange={set("unidade")} placeholder="livros, km, R$, páginas" /></Field><Field label="Prazo final"><Input type="date" value={f.prazo} onChange={set("prazo")} /></Field><Field label="Progresso atual"><Input value={f.atual} onChange={set("atual")} /></Field><Field label="Contar" className="sm:col-span-2"><Select value={f.mode} onChange={set("mode")}><option value="corridos">Dias corridos</option><option value="uteis">Apenas dias úteis</option></Select></Field></div>
      {r ? "err" in r ? <ResultBox title="Atenção"><p className="text-sm text-danger">{r.err}</p></ResultBox> : <ResultBox copyText={`${fmt(r.porDia, 2)} ${f.unidade}/dia`}><div className="grid grid-cols-2 gap-4"><Stat label="Por dia" value={`${fmt(r.porDia, 2)} ${f.unidade}`} big /><Stat label="Por semana" value={fmt(r.porSemana, 1)} /><Stat label="Por mês" value={fmt(r.porMes, 1)} /><Stat label="Dias restantes" value={String(r.dias)} /></div><div className="mt-4 border-t pt-4"><div className="mb-1 flex justify-between text-xs text-fg-3"><span>Progresso</span><span>{fmt(r.prog, 0)}% · faltam {fmt(r.rest, 1)} {f.unidade}</span></div><div className="h-2 rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, r.prog)}%` }} /></div></div></ResultBox> : <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed text-sm text-fg-3">Defina a meta e o prazo.</div>}
    </div>
  );
}
