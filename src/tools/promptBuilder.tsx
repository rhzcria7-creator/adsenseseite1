import { useMemo, useState } from "react";
import { Bookmark, History, Sparkles, Trash2, Wand2 } from "lucide-react";
import { builderOptions, builderPresets } from "@/data/prompts";
import { Button, Chip, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { CopyButton, useToast } from "@/components/ui/feedback";
import { usePromptHistory } from "@/lib/store";
import { Pop } from "@/components/ui/motion";
import { timeAgo } from "@/lib/utils";

type Values = { objetivo: string; contexto: string; publico: string; tom: string; formato: string; plataforma: string; detalhe: string; resultado: string };
const initial: Values = { objetivo: builderOptions.objetivo[0], contexto: "", publico: builderOptions.publico[0], tom: builderOptions.tom[0], formato: builderOptions.formato[0], plataforma: builderOptions.plataforma[0], detalhe: builderOptions.detalhe[1], resultado: "" };

export function buildPrompt(v: Values) {
  const lines: string[] = [];
  const persona = v.objetivo.toLowerCase().includes("código") ? "engenheiro(a) de software sênior" : v.objetivo.toLowerCase().includes("campanha") ? "estrategista de marketing sênior" : v.objetivo.toLowerCase().includes("analisar") ? "analista de dados experiente" : "especialista sênior no assunto";
  lines.push(`Atue como ${persona}. Sua tarefa: ${v.objetivo.toLowerCase()}.`);
  if (v.contexto.trim()) lines.push(`\nContexto:\n${v.contexto.trim()}`);
  lines.push(`\nPúblico-alvo: ${v.publico}.`);
  lines.push(`Tom de voz: ${v.tom.toLowerCase()}.`);
  lines.push(`Formato de saída: ${v.formato.toLowerCase()}.`);
  lines.push(`Nível de detalhe: ${v.detalhe.toLowerCase()}.`);
  if (v.resultado.trim()) lines.push(`\nResultado esperado (critério de sucesso):\n${v.resultado.trim()}`);
  lines.push(`\nRegras:\n1. Se faltar alguma informação essencial, faça até 3 perguntas objetivas antes de responder.\n2. Não invente dados; quando não tiver certeza, sinalize.\n3. Evite generalidades e clichês; seja específico e acionável.\n4. Ao final, sugira um próximo passo.`);
  if (v.plataforma === "Midjourney") lines.push(`\nObservação: transforme o pedido acima em um prompt de imagem em inglês com sujeito, ambiente, luz, lente/estilo e parâmetros (--ar, --style).`);
  else if (v.plataforma !== "Qualquer LLM") lines.push(`\nOtimizado para: ${v.plataforma}.`);
  return lines.join("\n");
}

export function PromptBuilder({ compact = false, initialTab = "build" }: { compact?: boolean; initialTab?: "build" | "history" }) {
  const [v, setV] = useState<Values>(initial);
  const [tab, setTab] = useState<"build" | "history">(initialTab);
  const prompt = useMemo(() => buildPrompt(v), [v]);
  const { items, push, remove, clear } = usePromptHistory();
  const { toast } = useToast();
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });
  const save = () => { push(`${v.objetivo} · ${v.publico}`, prompt); toast({ title: "Prompt salvo no histórico", tone: "success" }); };
  const sel = (k: keyof Values, label: string, opts: string[]) => (
    <Field label={label}><Select value={v[k]} onChange={set(k)}>{opts.map((o) => <option key={o}>{o}</option>)}</Select></Field>
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-fg-3">Presets</span>
        {builderPresets.map((p) => <Chip key={p.name} onClick={() => setV(p.values)}>{p.name}</Chip>)}
        <Chip onClick={() => setV(initial)}>Limpar</Chip>
        {!compact && <button onClick={() => setTab(tab === "build" ? "history" : "build")} className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-fg-2 hover:text-fg"><History size={15} /> Histórico ({items.length})</button>}
      </div>

      {tab === "history" ? (
        <div>
          <div className="mb-3 flex items-center justify-between"><h3 className="h-title text-lg">Prompts salvos</h3>{items.length > 0 && <Button variant="ghost" size="sm" onClick={clear}><Trash2 size={14} /> Limpar tudo</Button>}</div>
          {items.length === 0 ? <div className="rounded-xl border border-dashed border-line py-10 text-center text-sm text-fg-3">Nenhum prompt salvo ainda. Monte um prompt e clique em “Salvar”.</div> : (
            <ul className="space-y-2">{items.map((it) => <li key={it.id} className="rounded-xl border border-line bg-bg-2 p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="truncate text-sm font-semibold text-fg">{it.title}</div><div className="text-xs text-fg-3">{timeAgo(new Date(it.at).toISOString())}</div></div><div className="flex gap-1"><CopyButton text={it.text} size="sm" /><Button variant="ghost" size="sm" onClick={() => remove(it.id)}><Trash2 size={14} /></Button></div></div><pre className="mt-3 line-clamp-4 whitespace-pre-wrap font-mono text-xs text-fg-2">{it.text}</pre></li>)}</ul>
          )}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="grid gap-4">
            {sel("objetivo", "Objetivo", builderOptions.objetivo)}
            <Field label="Contexto" hint="Quem é você, situação atual, restrições, o que já tentou."><Textarea value={v.contexto} onChange={set("contexto")} placeholder="Ex.: sou dono de uma cafeteria em Curitiba, quero atrair clientes no inverno com orçamento de R$ 500/mês…" className="min-h-[110px]" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">{sel("publico", "Público", builderOptions.publico)}{sel("tom", "Tom", builderOptions.tom)}{sel("formato", "Formato", builderOptions.formato)}{sel("plataforma", "Plataforma", builderOptions.plataforma)}</div>
            {sel("detalhe", "Nível de detalhe", builderOptions.detalhe)}
            <Field label="Resultado esperado" hint="Como você vai saber que a resposta ficou boa?"><Input value={v.resultado} onChange={set("resultado")} placeholder="Ex.: 3 ideias com custo estimado e passo a passo para a primeira semana" /></Field>
          </div>
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between"><span className="eyebrow inline-flex items-center gap-1.5"><Sparkles size={13} /> Prompt gerado</span><div className="flex gap-2"><Button variant="outline" size="sm" onClick={save}><Bookmark size={14} /> Salvar</Button><CopyButton text={prompt} variant="primary" /></div></div>
            <Pop k={prompt} className="flex-1"><pre className="h-full min-h-[380px] whitespace-pre-wrap rounded-xl border border-line bg-bg-2 p-5 font-mono text-[13px] leading-relaxed text-fg">{prompt}</pre></Pop>
            <p className="mt-3 flex items-start gap-2 text-xs text-fg-3"><Wand2 size={13} className="mt-0.5 shrink-0" /> Cole no seu assistente favorito. Quanto mais específico o contexto e o resultado esperado, melhor a resposta.</p>
          </div>
        </div>
      )}
    </div>
  );
}
