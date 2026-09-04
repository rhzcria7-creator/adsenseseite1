import { AnimatePresence, motion } from "framer-motion";
import { Download, Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage, useStore } from "@/lib/store";
import { downloadText, uid } from "@/lib/utils";
import { Button, Field, Input, Segmented, Select, Textarea } from "@/components/ui/primitives";
import { Empty } from "@/components/ui/feedback";
import { Actions, Bar, BigNumber, KV, OutputArea, ResultPanel, ToolGrid, ToolShell } from "./ToolShell";
import type { ToolProps } from "./calculators";

const pad = (n: number) => String(n).padStart(2, "0");

function beep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o.start();
    o.stop(ctx.currentTime + 0.6);
  } catch {
    /* audio blocked */
  }
}

/* -------------------------------- Pomodoro -------------------------------- */
type Phase = "focus" | "short" | "long";
interface PomoState { phase: Phase; endsAt: number | null; remaining: number; sessions: number; }
export function Pomodoro({ meta }: ToolProps) {
  const [cfg, setCfg] = useLocalStorage("pomodoro-cfg", { focus: 25, short: 5, long: 15 });
  const [st, setSt] = useLocalStorage<PomoState>("pomodoro-state", { phase: "focus", endsAt: null, remaining: 25 * 60, sessions: 0 });
  const [, tick] = useState(0);
  const { toast } = useStore();
  const total = cfg[st.phase] * 60;
  const remaining = st.endsAt ? Math.max(0, Math.round((st.endsAt - Date.now()) / 1000)) : st.remaining;
  const running = !!st.endsAt;
  const next = useCallback(() => {
    setSt((s) => {
      const sessions = s.phase === "focus" ? s.sessions + 1 : s.sessions;
      const phase: Phase = s.phase === "focus" ? (sessions % 4 === 0 ? "long" : "short") : "focus";
      return { phase, endsAt: null, remaining: cfg[phase] * 60, sessions };
    });
  }, [cfg, setSt]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      tick((t) => t + 1);
      if (st.endsAt && Date.now() >= st.endsAt) {
        beep();
        toast({ title: st.phase === "focus" ? "Foco concluído. Hora da pausa." : "Pausa encerrada. De volta ao foco.", tone: "success" });
        next();
      }
    }, 500);
    return () => clearInterval(id);
  }, [running, st.endsAt, st.phase, next, toast]);
  useEffect(() => { document.title = running ? `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)} · Pomodoro — Nexo` : document.title; }, [remaining, running]);
  const start = () => setSt((s) => ({ ...s, endsAt: Date.now() + (s.remaining || total) * 1000 }));
  const pause = () => setSt((s) => ({ ...s, endsAt: null, remaining }));
  const reset = () => setSt((s) => ({ ...s, endsAt: null, remaining: cfg[s.phase] * 60 }));
  const setPhase = (phase: Phase) => setSt((s) => ({ ...s, phase, endsAt: null, remaining: cfg[phase] * 60 }));
  const labels: Record<Phase, string> = { focus: "Foco", short: "Pausa curta", long: "Pausa longa" };
  return (
    <ToolShell meta={meta}>
      <Segmented value={st.phase} onChange={setPhase} options={(["focus", "short", "long"] as Phase[]).map((p) => ({ value: p, label: labels[p] }))} />
      <div className="mt-6 flex flex-col items-center border border-strong py-10">
        <div className="eyebrow">{labels[st.phase]} · sessão {st.sessions + 1}</div>
        <motion.div key={remaining} className="mt-2 font-display text-7xl font-bold tabular tracking-tighter sm:text-8xl">{pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}</motion.div>
        <Bar value={total - remaining} max={total} className="mt-6 w-64" tone={st.phase === "focus" ? "accent" : "mint"} />
        <div className="mt-6 flex gap-2">
          {running ? <Button onClick={pause} size="lg"><Pause className="h-4 w-4" /> Pausar</Button> : <Button onClick={start} size="lg" variant="accent"><Play className="h-4 w-4" /> {remaining < total ? "Continuar" : "Iniciar"}</Button>}
          <Button variant="secondary" size="lg" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="lg" onClick={next}>Pular</Button>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ToolGrid cols={3}>
          {(["focus", "short", "long"] as Phase[]).map((p) => <Field key={p} label={`${labels[p]} (min)`}><Input inputMode="numeric" value={cfg[p]} onChange={(e) => { const v = Math.max(1, Math.min(120, Number(e.target.value) || 1)); setCfg({ ...cfg, [p]: v }); if (st.phase === p && !running) setSt((s) => ({ ...s, remaining: v * 60 })); }} /></Field>)}
        </ToolGrid>
        <div>
          <KV rows={[["Pomodoros concluídos", String(st.sessions)], ["Tempo focado (estimado)", `${st.sessions * cfg.focus} min`], ["Próxima pausa longa em", `${4 - (st.sessions % 4)} pomodoros`]]} />
          <button onClick={() => setSt({ phase: "focus", endsAt: null, remaining: cfg.focus * 60, sessions: 0 })} className="mt-2 text-xs text-muted underline underline-offset-2">Zerar contagem</button>
        </div>
      </div>
    </ToolShell>
  );
}

/* ----------------------------- Lista de tarefas --------------------------- */
interface Task { id: string; text: string; done: boolean; priority: "alta" | "media" | "baixa"; createdAt: number; }
export function ListaDeTarefas({ meta }: ToolProps) {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [text, setText] = useState("");
  const [prio, setPrio] = useState<Task["priority"]>("media");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const add = (e: React.FormEvent) => { e.preventDefault(); if (!text.trim()) return; setTasks((t) => [{ id: uid(), text: text.trim(), done: false, priority: prio, createdAt: Date.now() }, ...t]); setText(""); };
  const order = { alta: 0, media: 1, baixa: 2 };
  const visible = tasks.filter((t) => (filter === "all" ? true : filter === "open" ? !t.done : t.done)).sort((a, b) => Number(a.done) - Number(b.done) || order[a.priority] - order[b.priority]);
  const done = tasks.filter((t) => t.done).length;
  return (
    <ToolShell meta={meta}>
      <form onSubmit={add} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nova tarefa…" aria-label="Nova tarefa" />
        <Select value={prio} onChange={(e) => setPrio(e.target.value as Task["priority"])}><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></Select>
        <Button type="submit"><Plus className="h-4 w-4" /> Adicionar</Button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented value={filter} onChange={setFilter} options={[{ value: "all", label: `Todas (${tasks.length})` }, { value: "open", label: `Abertas (${tasks.length - done})` }, { value: "done", label: `Concluídas (${done})` }]} />
        <div className="flex items-center gap-3"><Bar value={done} max={Math.max(1, tasks.length)} className="w-32" tone="mint" /><span className="font-mono text-xs text-muted">{tasks.length ? Math.round((done / tasks.length) * 100) : 0}%</span></div>
      </div>
      <ul className="mt-4 divide-y divide-[var(--line)] border-y border-line">
        <AnimatePresence initial={false}>
          {visible.map((t) => (
            <motion.li key={t.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex items-center gap-3 py-2.5">
              <input type="checkbox" checked={t.done} onChange={() => setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} aria-label={`Concluir ${t.text}`} className="h-4 w-4 shrink-0 accent-[var(--color-accent)]" />
              <span className={`h-2 w-2 shrink-0 ${t.priority === "alta" ? "bg-accent" : t.priority === "media" ? "bg-amber" : "bg-[var(--line)]"}`} title={t.priority} />
              <input value={t.text} onChange={(e) => setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x)))} className={`min-w-0 flex-1 bg-transparent text-sm focus:outline-none ${t.done ? "text-subtle line-through" : ""}`} aria-label="Editar tarefa" />
              <button onClick={() => setTasks((all) => all.filter((x) => x.id !== t.id))} aria-label="Excluir" className="text-subtle hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {!visible.length && <div className="mt-4"><Empty title={tasks.length ? "Nada neste filtro" : "Nenhuma tarefa ainda"} description="Adicione até 3 prioridades para hoje." /></div>}
      <Actions extra={<><Button size="sm" variant="ghost" onClick={() => setTasks((t) => t.filter((x) => !x.done))} disabled={!done}>Limpar concluídas</Button><Button size="sm" variant="ghost" onClick={() => downloadText("tarefas.json", JSON.stringify(tasks, null, 2), "application/json")} disabled={!tasks.length}><Download className="h-3.5 w-3.5" /> Exportar JSON</Button></>} />
    </ToolShell>
  );
}

/* ------------------------------ Notas rápidas ----------------------------- */
interface Note { id: string; title: string; body: string; updatedAt: number; }
export function NotasRapidas({ meta }: ToolProps) {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", []);
  const [active, setActive] = useState<string | null>(notes[0]?.id ?? null);
  const [q, setQ] = useState("");
  const note = notes.find((n) => n.id === active) ?? null;
  const create = () => { const n: Note = { id: uid(), title: "Nova nota", body: "", updatedAt: Date.now() }; setNotes((all) => [n, ...all]); setActive(n.id); };
  const update = (patch: Partial<Note>) => setNotes((all) => all.map((n) => (n.id === active ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  const remove = () => { setNotes((all) => all.filter((n) => n.id !== active)); setActive(null); };
  const list = notes.filter((n) => (n.title + n.body).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.updatedAt - a.updatedAt);
  const words = note?.body.trim() ? note.body.trim().split(/\s+/).length : 0;
  return (
    <ToolShell meta={meta}>
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="flex flex-col border border-line">
          <div className="flex gap-2 border-b border-line p-2"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="h-8 text-xs" aria-label="Buscar notas" /><Button size="sm" onClick={create} aria-label="Nova nota"><Plus className="h-3.5 w-3.5" /></Button></div>
          <ul className="max-h-[420px] flex-1 overflow-y-auto">
            {list.map((n) => <li key={n.id}><button onClick={() => setActive(n.id)} className={`block w-full border-b border-line px-3 py-2.5 text-left transition-colors ${n.id === active ? "bg-fg text-bg" : "hover:bg-elev"}`}><div className="truncate text-sm font-medium">{n.title || "Sem título"}</div><div className={`truncate text-xs ${n.id === active ? "opacity-70" : "text-muted"}`}>{n.body.slice(0, 60) || "vazia"}</div></button></li>)}
            {!list.length && <li className="p-4 text-xs text-subtle">{notes.length ? "Nenhuma nota encontrada." : "Crie sua primeira nota."}</li>}
          </ul>
        </div>
        <div className="flex min-h-[420px] flex-col border border-line">
          {note ? (
            <>
              <input value={note.title} onChange={(e) => update({ title: e.target.value })} className="border-b border-line bg-transparent px-4 py-3 font-display text-lg font-semibold focus:outline-none" aria-label="Título da nota" />
              <textarea value={note.body} onChange={(e) => update({ body: e.target.value })} className="flex-1 resize-none bg-transparent p-4 text-sm leading-relaxed focus:outline-none" placeholder="Escreva aqui. Salva automaticamente." aria-label="Conteúdo da nota" />
              <div className="flex items-center justify-between border-t border-line px-4 py-2 text-xs text-muted"><span className="font-mono">{words} palavras · salvo {new Date(note.updatedAt).toLocaleTimeString("pt-BR")}</span><div className="flex gap-2"><button onClick={() => downloadText(`${note.title || "nota"}.txt`, note.body)} className="hover:text-fg">Baixar</button><button onClick={remove} className="hover:text-red-600">Excluir</button></div></div>
            </>
          ) : <div className="flex flex-1 items-center justify-center p-6"><Empty title="Selecione ou crie uma nota" action={<Button onClick={create}><Plus className="h-4 w-4" /> Nova nota</Button>} /></div>}
        </div>
      </div>
    </ToolShell>
  );
}

/* -------------------------------- Cronômetro ------------------------------ */
export function Cronometro({ meta }: ToolProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - elapsed;
    const loop = () => { setElapsed(performance.now() - startRef.current); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  const fmt = (ms: number) => `${pad(Math.floor(ms / 60000))}:${pad(Math.floor((ms % 60000) / 1000))}.${pad(Math.floor((ms % 1000) / 10))}`;
  const lapTimes = laps.map((l, i) => l - (laps[i - 1] ?? 0));
  const best = Math.min(...lapTimes), worst = Math.max(...lapTimes);
  return (
    <ToolShell meta={meta}>
      <div className="flex flex-col items-center border border-strong py-10">
        <div className="font-display text-6xl font-bold tabular tracking-tighter sm:text-8xl">{fmt(elapsed)}</div>
        <div className="mt-6 flex gap-2">
          <Button size="lg" variant={running ? "primary" : "accent"} onClick={() => setRunning((r) => !r)}>{running ? <><Pause className="h-4 w-4" /> Pausar</> : <><Play className="h-4 w-4" /> {elapsed ? "Continuar" : "Iniciar"}</>}</Button>
          <Button size="lg" variant="secondary" onClick={() => setLaps((l) => [...l, elapsed])} disabled={!running}>Volta</Button>
          <Button size="lg" variant="ghost" onClick={() => { setRunning(false); setElapsed(0); setLaps([]); }}><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </div>
      {laps.length > 0 && (
        <ResultPanel title={`${laps.length} voltas`}>
          <ul className="divide-y divide-[var(--line)] border-y border-line">{lapTimes.map((t, i) => <li key={i} className={`flex items-center justify-between py-2 font-mono text-sm ${t === best && lapTimes.length > 1 ? "text-mint" : t === worst && lapTimes.length > 1 ? "text-red-600" : ""}`}><span>Volta {i + 1}</span><span>{fmt(t)}</span><span className="text-subtle">{fmt(laps[i])}</span></li>).reverse()}</ul>
          <Actions copy={lapTimes.map((t, i) => `Volta ${i + 1}: ${fmt(t)}`).join("\n")} />
        </ResultPanel>
      )}
    </ToolShell>
  );
}

/* ---------------------------- Matriz de Eisenhower ------------------------ */
type Quad = "do" | "schedule" | "delegate" | "delete";
interface EItem { id: string; text: string; q: Quad; }
const QUADS: { q: Quad; title: string; sub: string; tone: string }[] = [{ q: "do", title: "Fazer agora", sub: "Urgente + importante", tone: "border-accent" }, { q: "schedule", title: "Agendar", sub: "Importante, não urgente", tone: "border-signal" }, { q: "delegate", title: "Delegar", sub: "Urgente, não importante", tone: "border-amber" }, { q: "delete", title: "Eliminar", sub: "Nem urgente nem importante", tone: "border-line" }];
export function MatrizEisenhower({ meta }: ToolProps) {
  const [items, setItems] = useLocalStorage<EItem[]>("eisenhower", []);
  const [text, setText] = useState("");
  const [q, setQ] = useState<Quad>("do");
  const add = (e: React.FormEvent) => { e.preventDefault(); if (!text.trim()) return; setItems((all) => [...all, { id: uid(), text: text.trim(), q }]); setText(""); };
  const move = (id: string, to: Quad) => setItems((all) => all.map((i) => (i.id === id ? { ...i, q: to } : i)));
  return (
    <ToolShell meta={meta}>
      <form onSubmit={add} className="grid gap-2 sm:grid-cols-[1fr_200px_auto]">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tarefa…" aria-label="Tarefa" />
        <Select value={q} onChange={(e) => setQ(e.target.value as Quad)}>{QUADS.map((x) => <option key={x.q} value={x.q}>{x.title}</option>)}</Select>
        <Button type="submit"><Plus className="h-4 w-4" /> Adicionar</Button>
      </form>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {QUADS.map((Q) => (
          <div key={Q.q} className={`border-t-2 ${Q.tone} border-x border-b border-line p-4 min-h-[160px]`}>
            <div className="flex items-baseline justify-between"><h3 className="font-display text-lg font-semibold">{Q.title}</h3><span className="font-mono text-[10px] uppercase tracking-wider text-subtle">{Q.sub}</span></div>
            <ul className="mt-3 space-y-1.5">
              <AnimatePresence>
                {items.filter((i) => i.q === Q.q).map((i) => (
                  <motion.li key={i.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group flex items-center gap-2 border border-line bg-page px-2 py-1.5 text-sm">
                    <span className="flex-1">{i.text}</span>
                    <Select value={i.q} onChange={(e) => move(i.id, e.target.value as Quad)} className="h-7 w-28 text-[11px]" aria-label="Mover">{QUADS.map((x) => <option key={x.q} value={x.q}>{x.title}</option>)}</Select>
                    <button onClick={() => setItems((all) => all.filter((x) => x.id !== i.id))} aria-label="Remover" className="text-subtle hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        ))}
      </div>
      <Actions copy={QUADS.map((Q) => `${Q.title}:\n${items.filter((i) => i.q === Q.q).map((i) => `- ${i.text}`).join("\n") || "-"}`).join("\n\n")} onClear={() => setItems([])} />
    </ToolShell>
  );
}

/* ----------------------------- Roleta de decisão -------------------------- */
export function RoletaDeDecisao({ meta }: ToolProps) {
  const [text, setText] = useState("Pizza\nSushi\nHambúrguer\nComida árabe\nSalada");
  const [remove, setRemove] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const options = useMemo(() => text.split("\n").map((s) => s.trim()).filter(Boolean), [text]);
  const spin = () => {
    if (options.length < 2 || spinning) return;
    setSpinning(true); setWinner(null);
    const a = new Uint32Array(1); crypto.getRandomValues(a);
    const target = a[0] % options.length;
    const totalSteps = options.length * 3 + target;
    let step = 0;
    const run = () => {
      setCurrent(options[step % options.length]);
      step++;
      if (step <= totalSteps) setTimeout(run, 40 + Math.pow(step / totalSteps, 3) * 320);
      else { const w = options[target]; setWinner(w); setSpinning(false); setHistory((h) => [w, ...h].slice(0, 8)); if (remove) setText(options.filter((_, i) => i !== target).join("\n")); }
    };
    run();
  };
  return (
    <ToolShell meta={meta} examples={[{ label: "Onde almoçar", onClick: () => setText("Pizza\nSushi\nHambúrguer\nComida árabe\nSalada") }, { label: "Quem apresenta", onClick: () => setText("Ana\nBruno\nCarla\nDiego") }]}>
      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <div>
          <Field label={`Opções (${options.length}) — uma por linha`}><Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} /></Field>
          <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={remove} onChange={(e) => setRemove(e.target.checked)} className="accent-[var(--color-accent)]" /> Remover sorteado da lista</label>
        </div>
        <div className="flex flex-col items-center justify-center border border-strong p-6 text-center">
          <div className="eyebrow">{spinning ? "Sorteando…" : winner ? "Resultado" : "Pronto"}</div>
          <motion.div key={current ?? "x"} initial={{ opacity: 0.5, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.08 }} className={`mt-3 min-h-[3rem] font-display text-3xl font-bold tracking-tight sm:text-4xl ${winner ? "text-accent" : ""}`}>{winner ?? current ?? "—"}</motion.div>
          <Button className="mt-6" size="lg" variant="accent" onClick={spin} disabled={spinning || options.length < 2}>{spinning ? "Girando…" : "Girar"}</Button>
          {options.length < 2 && <p className="mt-2 text-xs text-subtle">Adicione pelo menos 2 opções.</p>}
        </div>
      </div>
      {history.length > 0 && <div className="mt-5"><div className="eyebrow mb-2">Últimos sorteios</div><div className="flex flex-wrap gap-1.5">{history.map((h, i) => <span key={i} className="border border-line px-2 py-1 text-xs">{h}</span>)}</div></div>}
    </ToolShell>
  );
}

/* ------------------------------ Gerador de OKR ---------------------------- */
export function GeradorDeOkr({ meta }: ToolProps) {
  const [obj, setObj] = useState("crescer a base de clientes pagantes");
  const [area, setArea] = useState("vendas");
  const [q, setQ] = useState("Q3");
  const krs = useMemo(() => {
    const bank: Record<string, [string, string, string][]> = {
      vendas: [["número de clientes pagantes", "120", "180"], ["taxa de conversão de trial", "8%", "12%"], ["ticket médio", "R$ 290", "R$ 340"], ["ciclo de vendas", "32 dias", "24 dias"]],
      marketing: [["leads qualificados por mês", "400", "650"], ["custo por lead", "R$ 38", "R$ 28"], ["tráfego orgânico mensal", "25 mil", "40 mil"], ["taxa de abertura da newsletter", "31%", "38%"]],
      produto: [["ativação em 7 dias", "42%", "55%"], ["retenção D30", "28%", "36%"], ["NPS", "38", "50"], ["tempo até o primeiro valor", "18 min", "8 min"]],
      pessoas: [["eNPS", "22", "40"], ["tempo médio de contratação", "48 dias", "30 dias"], ["turnover voluntário", "14%", "9%"], ["cobertura de 1:1 quinzenal", "60%", "95%"]],
      pessoal: [["horas de estudo por semana", "2", "5"], ["projetos entregues", "1", "3"], ["dias com exercício", "8/mês", "16/mês"], ["livros lidos no trimestre", "1", "3"]],
    };
    const list = bank[area] ?? bank.vendas;
    return list.slice(0, 3).map(([m, a, b]) => ({ text: `${m.charAt(0).toUpperCase() + m.slice(1)}: de ${a} para ${b} até o fim do ${q}`, initiatives: [`Definir dono e dashboard semanal para ${m}`, `Rodar 2 experimentos por mês focados em ${m}`] }));
  }, [area, q]);
  const doc = `OBJETIVO (${q}): ${obj.charAt(0).toUpperCase() + obj.slice(1)}\n\n${krs.map((k, i) => `KR${i + 1}. ${k.text}\n   Iniciativas:\n   - ${k.initiatives.join("\n   - ")}`).join("\n\n")}\n\nChecklist de qualidade:\n[ ] Cada KR tem métrica, baseline e alvo\n[ ] Nenhum KR é uma tarefa\n[ ] Alvos são ambiciosos (70% de atingimento = sucesso)\n[ ] Um dono por KR`;
  return (
    <ToolShell meta={meta}>
      <ToolGrid cols={3}>
        <Field label="Objetivo (amplo, inspirador)"><Input value={obj} onChange={(e) => setObj(e.target.value)} /></Field>
        <Field label="Área"><Select value={area} onChange={(e) => setArea(e.target.value)}><option value="vendas">Vendas</option><option value="marketing">Marketing</option><option value="produto">Produto</option><option value="pessoas">Pessoas / RH</option><option value="pessoal">Pessoal</option></Select></Field>
        <Field label="Período"><Segmented value={q} onChange={setQ} options={["Q1", "Q2", "Q3", "Q4"].map((x) => ({ value: x, label: x }))} /></Field>
      </ToolGrid>
      <ResultPanel>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <BigNumber label="Objetivo" value={<span className="text-2xl sm:text-3xl">{obj || "—"}</span>} />
            <ol className="mt-5 space-y-3">{krs.map((k, i) => <li key={i} className="border-l-2 border-accent pl-3"><div className="text-sm font-medium">KR{i + 1}. {k.text}</div><ul className="mt-1 text-xs text-muted">{k.initiatives.map((x) => <li key={x}>· {x}</li>)}</ul></li>)}</ol>
          </div>
          <OutputArea value={doc} rows={16} mono={false} />
        </div>
        <Actions copy={doc} />
      </ResultPanel>
    </ToolShell>
  );
}
