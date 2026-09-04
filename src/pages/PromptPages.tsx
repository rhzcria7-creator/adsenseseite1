import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { History, Search, Sparkles, Trash2, Wand2 } from "lucide-react";
import { PROMPTS, PROMPT_CATEGORIES, promptBySlug } from "@/data/prompts";
import { useSEO } from "@/lib/seo";
import { useLocalStorage, useStore } from "@/lib/store";
import { normalize } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Shell";
import { Badge, Button, Empty, Field, Input, PageHeader, Select, Textarea } from "@/components/ui/primitives";
import { CopyButton, FavoriteButton, ResultBox } from "@/components/ui/feedback";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { AdBanner, AdInArticle } from "@/components/ui/monetization";
import { PromptCard } from "@/components/content/Cards";

export function PromptsIndex() {
  useSEO({ title: `Central de prompts (${PROMPTS.length} templates)`, description: "Prompts profissionais para ChatGPT, Claude, Gemini e Midjourney: marketing, vendas, código, negócios, estudos, imagens e vídeos. Com variáveis, favoritos e histórico.", path: "/prompts", breadcrumbs: [{ label: "Prompts", path: "/prompts" }] });
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const cat = sp.get("cat") ?? "all"; const diff = sp.get("nivel") ?? "all"; const plat = sp.get("plat") ?? "all";
  const platforms = [...new Set(PROMPTS.flatMap((p) => p.platform))];
  const list = useMemo(() => PROMPTS.filter((p) => (cat === "all" || p.category === cat) && (diff === "all" || p.difficulty === diff) && (plat === "all" || p.platform.includes(plat)) && (!q || normalize(`${p.title} ${p.description} ${p.tags.join(" ")}`).includes(normalize(q)))), [q, cat, diff, plat]);
  const setP = (k: string, v: string) => { const n = new URLSearchParams(sp); v === "all" ? n.delete(k) : n.set(k, v); setSp(n); };
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Prompts" }]} />
      <PageHeader eyebrow="Central de prompts" title="Prompts que já vêm com a estrutura certa." description="Templates com variáveis para adaptar em segundos. Ou monte o seu do zero no Prompt Builder.">
        <div className="flex flex-wrap gap-3"><div className="relative min-w-[260px] flex-1 max-w-xl"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar prompts…" className="h-12 pl-10 text-base" /></div><Button size="lg" to="/prompts/builder"><Wand2 className="h-4 w-4" />Prompt Builder</Button></div>
      </PageHeader>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">{[{ slug: "all", name: "Todas" }, ...PROMPT_CATEGORIES].map((c) => <button key={c.slug} onClick={() => setP("cat", c.slug)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${cat === c.slug ? "border-fg bg-fg text-bg" : "bg-surface hover:bg-surface-2"}`}>{c.name}</button>)}</div>
        <div className="ml-auto flex gap-2"><Select value={diff} onChange={(e) => setP("nivel", e.target.value)} className="h-9 w-36"><option value="all">Todos os níveis</option><option value="básico">Básico</option><option value="intermediário">Intermediário</option><option value="avançado">Avançado</option></Select><Select value={plat} onChange={(e) => setP("plat", e.target.value)} className="h-9 w-40"><option value="all">Toda plataforma</option>{platforms.map((p) => <option key={p}>{p}</option>)}</Select></div>
      </div>
      <p className="mb-4 text-sm text-fg-3">{list.length} prompt(s)</p>
      {list.length ? <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.03}>{list.map((p) => <StaggerItem key={p.slug}><PromptCard prompt={p} /></StaggerItem>)}</Stagger> : <Empty title="Nenhum prompt com esses filtros" />}
      <AdBanner />
    </div>
  );
}

export function PromptCategoryPage() {
  const { slug = "" } = useParams();
  const cat = PROMPT_CATEGORIES.find((c) => c.slug === slug);
  useSEO({ title: cat ? `Prompts de ${cat.name}` : "Prompts", description: cat?.description ?? "", path: `/prompts/categoria/${slug}`, breadcrumbs: [{ label: "Prompts", path: "/prompts" }, { label: cat?.name ?? "", path: `/prompts/categoria/${slug}` }] });
  if (!cat) return <Navigate to="/prompts" replace />;
  const list = PROMPTS.filter((p) => p.category === cat.slug);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Prompts", path: "/prompts" }, { label: cat.name }]} />
      <PageHeader eyebrow="Categoria de prompts" title={cat.name} description={cat.description} />
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <StaggerItem key={p.slug}><PromptCard prompt={p} /></StaggerItem>)}</Stagger>
      <div className="mt-10 flex flex-wrap gap-2">{PROMPT_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => <Link key={c.slug} to={`/prompts/categoria/${c.slug}`} className="rounded-full border bg-surface px-3.5 py-1.5 text-sm hover:bg-surface-2">{c.name}</Link>)}</div>
    </div>
  );
}

export function PromptPage() {
  const { slug = "" } = useParams();
  const p = promptBySlug(slug);
  const { pushHistory, pushPrompt } = useStore();
  const [vals, setVals] = useState<Record<string, string>>({});
  useSEO({ title: p ? `Prompt: ${p.title}` : "Prompt", description: p?.description ?? "", path: `/prompts/${slug}`, keywords: p?.tags, breadcrumbs: p ? [{ label: "Prompts", path: "/prompts" }, { label: PROMPT_CATEGORIES.find((c) => c.slug === p.category)!.name, path: `/prompts/categoria/${p.category}` }, { label: p.title, path: `/prompts/${slug}` }] : undefined });
  useEffect(() => { if (p) pushHistory({ kind: "prompt", slug: p.slug, title: p.title, path: `/prompts/${p.slug}` }); setVals({}); }, [p, pushHistory]);
  if (!p) return <Navigate to="/prompts" replace />;
  const cat = PROMPT_CATEGORIES.find((c) => c.slug === p.category)!;
  const filled = p.prompt.replace(/\{\{([^}]+)\}\}/g, (_, k) => vals[k.trim()]?.trim() || `[${k.trim()}]`);
  const related = PROMPTS.filter((x) => x.slug !== p.slug && (x.category === p.category || x.tags.some((t) => p.tags.includes(t)))).slice(0, 3);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Prompts", path: "/prompts" }, { label: cat.name, path: `/prompts/categoria/${cat.slug}` }, { label: p.title }]} />
      <PageHeader eyebrow={cat.name} title={p.title} description={p.description}>
        <div className="flex flex-wrap items-center gap-2"><Badge>{p.difficulty}</Badge>{p.platform.map((x) => <span key={x} className="rounded-md border px-2 py-0.5 text-xs text-fg-3">{x}</span>)}<FavoriteButton kind="prompt" slug={p.slug} title={p.title} path={`/prompts/${p.slug}`} className="ml-auto" /></div>
      </PageHeader>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <ResultBox title="Prompt" copyText={filled}><pre className="whitespace-pre-wrap font-sans text-[15px] leading-7">{filled.split(/(\[[^\]]+\])/g).map((part, i) => /^\[[^\]]+\]$/.test(part) ? <mark key={i} className="rounded bg-warn/15 px-1 text-warn">{part}</mark> : part)}</pre>
            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4"><CopyButton text={filled} label="Copiar prompt" variant="primary" size="md" /><Button variant="outline" onClick={() => pushPrompt(p.title, filled)}><History className="h-4 w-4" />Salvar no histórico</Button></div>
          </ResultBox>
          <AdInArticle />
          <div><h2 className="mb-3 text-lg font-semibold">Como usar</h2><ol className="list-decimal space-y-1.5 pl-5 text-sm leading-6 text-fg-2"><li>Preencha as variáveis ao lado — os campos entre colchetes serão substituídos.</li><li>Copie e cole no seu modelo ({p.platform.join(", ")}).</li><li>Peça uma segunda versão pedindo críticas à primeira: "avalie sua resposta contra os critérios e melhore".</li></ol></div>
          <div className="flex flex-wrap gap-2">{p.tags.map((t) => <Link key={t} to={`/tags/${normalize(t).replace(/[^a-z0-9]+/g, "-")}`} className="rounded-full border bg-surface px-3 py-1 text-xs text-fg-2 hover:bg-surface-2">#{t}</Link>)}</div>
        </div>
        <aside className="space-y-6">
          {p.variables.length > 0 && <div className="rounded-2xl border bg-surface p-5"><p className="mb-4 text-sm font-semibold">Variáveis ({p.variables.length})</p><div className="space-y-3">{p.variables.map((v) => <Field key={v} label={v.replace(/_/g, " ")}>{v.length > 12 || /texto|conteudo|codigo|documento|resposta|anotacoes|prompt|tarefas/.test(v) ? <Textarea rows={3} value={vals[v] ?? ""} onChange={(e) => setVals({ ...vals, [v]: e.target.value })} /> : <Input value={vals[v] ?? ""} onChange={(e) => setVals({ ...vals, [v]: e.target.value })} />}</Field>)}</div><Button variant="ghost" size="sm" className="mt-3" onClick={() => setVals({})}>Limpar</Button></div>}
          {related.length > 0 && <div><p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-fg-3">Relacionados</p><div className="space-y-3">{related.map((r) => <PromptCard key={r.slug} prompt={r} />)}</div></div>}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------ Prompt Builder ------------------------------ */
const PRESETS: Record<string, Partial<BuilderState> & { label: string }> = {
  blank: { label: "Em branco" },
  artigo: { label: "Artigo de blog", objetivo: "escrever um artigo de blog sobre [tema]", contexto: "para o blog de uma empresa de [setor], que quer atrair leitores que buscam [problema]", publico: "profissionais iniciantes no tema", tom: "didático", formato: "artigo com subtítulos H2, listas e exemplos", plataforma: "ChatGPT", detalhe: "alto", resultado: "um artigo de 1.200 palavras pronto para publicar, com título e meta description", papel: "redator sênior especializado em SEO" },
  codigo: { label: "Revisão de código", objetivo: "revisar o código abaixo e apontar bugs, riscos de segurança e melhorias", contexto: "projeto em [linguagem/framework], em produção, com testes automatizados", publico: "desenvolvedor pleno", tom: "técnico e direto", formato: "lista por severidade com trecho, problema e sugestão em código", plataforma: "Claude", detalhe: "alto", resultado: "revisão acionável que eu possa aplicar em um pull request", papel: "engenheiro de software sênior" },
  vendas: { label: "E-mail de vendas", objetivo: "escrever um e-mail frio para [cargo] da [empresa]", contexto: "vendemos [produto] que resolve [problema]; temos o caso [prova]", publico: "decisor ocupado, pouco técnico", tom: "direto e respeitoso", formato: "e-mail com assunto, até 100 palavras, um único pedido", plataforma: "ChatGPT", detalhe: "médio", resultado: "e-mail pronto para enviar com 2 variações de assunto", papel: "especialista em prospecção B2B" },
  estudo: { label: "Plano de estudos", objetivo: "montar um plano de estudos para [objetivo]", contexto: "tenho [horas] horas por semana e prazo de [prazo]; meu nível é [nível]", publico: "eu mesmo", tom: "encorajador e organizado", formato: "tabela por semana com tópicos, prática e revisão", plataforma: "Gemini", detalhe: "alto", resultado: "cronograma realista com checkpoints", papel: "tutor experiente" },
  imagem: { label: "Prompt de imagem", objetivo: "gerar uma imagem de [sujeito]", contexto: "para usar como capa de [uso]", publico: "público do [canal]", tom: "sofisticado e limpo", formato: "prompt único em inglês, com estilo, luz, lente e proporção", plataforma: "Midjourney", detalhe: "alto", resultado: "prompt pronto com parâmetros --ar e --stylize", papel: "diretor de arte" },
  video: { label: "Roteiro de vídeo", objetivo: "escrever o roteiro de um vídeo de [duração] sobre [tema]", contexto: "canal sobre [nicho], público que busca [resultado]", publico: "espectador iniciante", tom: "energético mas claro", formato: "tabela com tempo, fala, visual e texto na tela", plataforma: "ChatGPT", detalhe: "médio", resultado: "roteiro gravável com gancho forte nos 3 primeiros segundos", papel: "roteirista de conteúdo digital" },
};
interface BuilderState { objetivo: string; contexto: string; publico: string; tom: string; formato: string; plataforma: string; detalhe: string; resultado: string; papel: string; restricoes: string; exemplos: string; idioma: string }
const EMPTY: BuilderState = { objetivo: "", contexto: "", publico: "", tom: "profissional e direto", formato: "texto com subtítulos", plataforma: "ChatGPT", detalhe: "médio", resultado: "", papel: "", restricoes: "", exemplos: "", idioma: "português do Brasil" };

export function buildPrompt(s: BuilderState) {
  const det = { baixo: "Seja conciso: no máximo 150 palavras, sem introduções.", médio: "Nível de detalhe médio: cubra o essencial com exemplos curtos.", alto: "Seja completo: explique o raciocínio, dê exemplos concretos e antecipe casos limite." }[s.detalhe] ?? "";
  const platformNote = s.plataforma === "Midjourney" || s.plataforma === "Stable Diffusion" ? "\n\n# Saída\nEntregue apenas o prompt final de imagem em inglês, seguido dos parâmetros da plataforma." : s.plataforma === "API" ? "\n\n# Saída\nResponda em JSON válido com as chaves indicadas no formato." : "";
  return [`# Papel\nVocê é ${s.papel || "um especialista no assunto"}, com experiência prática e foco em resultados aplicáveis.`,
    `# Objetivo\n${s.objetivo || "[descreva o objetivo]"}`,
    `# Contexto\n${s.contexto || "[situação, o que já existe, restrições do projeto]"}`,
    `# Público\n${s.publico || "[quem vai ler ou usar o resultado]"}`,
    `# Formato e tom\n- Formato: ${s.formato}.\n- Tom: ${s.tom}.\n- Idioma: ${s.idioma}.\n- ${det}`,
    `# Resultado esperado\n${s.resultado || "[como é um resultado excelente? o que ele deve permitir fazer?]"}`,
    s.restricoes && `# Restrições\n${s.restricoes}`,
    s.exemplos && `# Exemplos de referência\n${s.exemplos}`,
    `# Processo\n1. Antes de responder, liste em 2–3 linhas o que você entendeu e as suposições que fará.\n2. Produza o resultado.\n3. Ao final, avalie em 1 linha o quanto o resultado atende ao objetivo e o que poderia melhorar.`,
  ].filter(Boolean).join("\n\n") + platformNote;
}

export function PromptBuilder() {
  useSEO({ title: "Prompt Builder — monte prompts profissionais", description: "Crie prompts estruturados com objetivo, contexto, público, tom, formato, plataforma, nível de detalhe e resultado esperado. Sem API, direto no navegador.", path: "/prompts/builder", breadcrumbs: [{ label: "Prompts", path: "/prompts" }, { label: "Prompt Builder", path: "/prompts/builder" }] });
  const [s, setS] = useLocalStorage<BuilderState>("builder", EMPTY);
  const [preset, setPreset] = useState("blank");
  const { pushPrompt, promptHistory, clearPromptHistory, toast } = useStore();
  const out = useMemo(() => buildPrompt(s), [s]);
  const set = (k: keyof BuilderState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setS({ ...s, [k]: e.target.value });
  const applyPreset = (k: string) => { setPreset(k); const { label: _l, ...rest } = PRESETS[k]; setS({ ...EMPTY, ...rest }); };
  const score = [s.objetivo, s.contexto, s.publico, s.resultado, s.papel].filter((x) => x.trim().length > 8).length;
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Prompts", path: "/prompts" }, { label: "Prompt Builder" }]} />
      <PageHeader eyebrow="Prompt Builder" title="Monte um prompt completo em um minuto." description="Objetivo + contexto + público + tom + formato + plataforma + nível de detalhe + resultado esperado. O prompt é gerado localmente enquanto você digita." />
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <Field label="Começar de um preset"><Select value={preset} onChange={(e) => applyPreset(e.target.value)}>{Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</Select></Field>
          <Field label="Objetivo *" hint="Um verbo e um resultado. O que você quer que aconteça?"><Textarea rows={2} value={s.objetivo} onChange={set("objetivo")} placeholder="escrever um e-mail para clientes inativos oferecendo retorno com desconto" /></Field>
          <Field label="Contexto *" hint="Situação, o que já existe, o que foi tentado."><Textarea rows={3} value={s.contexto} onChange={set("contexto")} placeholder="loja online de suplementos; clientes sem compra há 90 dias; já enviamos 1 e-mail sem resposta" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Público *"><Input value={s.publico} onChange={set("publico")} placeholder="homens 25–40, praticantes de musculação" /></Field>
            <Field label="Papel do modelo"><Input value={s.papel} onChange={set("papel")} placeholder="especialista em CRM e retenção" /></Field>
            <Field label="Tom"><Select value={s.tom} onChange={set("tom")}>{["profissional e direto", "amigável e próximo", "formal", "didático", "persuasivo", "criativo", "técnico e direto", "encorajador e organizado", "energético mas claro", "sofisticado e limpo", "direto e respeitoso"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Formato"><Select value={s.formato} onChange={set("formato")}>{["texto com subtítulos", "lista com tópicos", "tabela", "passo a passo numerado", "e-mail pronto para enviar", "JSON estruturado", "roteiro com cenas", "artigo com subtítulos H2, listas e exemplos", "lista por severidade com trecho, problema e sugestão em código", "e-mail com assunto, até 100 palavras, um único pedido", "tabela por semana com tópicos, prática e revisão", "prompt único em inglês, com estilo, luz, lente e proporção", "tabela com tempo, fala, visual e texto na tela"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Plataforma"><Select value={s.plataforma} onChange={set("plataforma")}>{["ChatGPT", "Claude", "Gemini", "Copilot", "Midjourney", "Stable Diffusion", "API"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Nível de detalhe"><Select value={s.detalhe} onChange={set("detalhe")}><option value="baixo">Baixo — resposta curta</option><option value="médio">Médio</option><option value="alto">Alto — completo e explicado</option></Select></Field>
          </div>
          <Field label="Resultado esperado *" hint="Como é um resultado excelente?"><Textarea rows={2} value={s.resultado} onChange={set("resultado")} placeholder="3 variações de e-mail com assunto, com no máximo 120 palavras cada, prontas para o Mailchimp" /></Field>
          <Field label="Restrições (opcional)"><Textarea rows={2} value={s.restricoes} onChange={set("restricoes")} placeholder="não usar 'imperdível'; não prometer resultados; citar a política de devolução" /></Field>
          <Field label="Exemplos de referência (opcional)"><Textarea rows={2} value={s.exemplos} onChange={set("exemplos")} placeholder="cole um exemplo de e-mail que funcionou bem" /></Field>
          <div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => { setS(EMPTY); setPreset("blank"); }}>Limpar tudo</Button></div>
        </div>
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-surface p-4"><div className="flex items-center justify-between text-sm"><span className="font-medium">Qualidade do prompt</span><span className="text-fg-3">{score}/5 campos essenciais</span></div><div className="mt-2 flex gap-1">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? (score >= 4 ? "bg-ok" : "bg-warn") : "bg-line"}`} />)}</div><p className="mt-2 text-xs text-fg-3">{score < 3 ? "Preencha objetivo, contexto, público, papel e resultado para um prompt forte." : score < 5 ? "Bom. Complete os campos restantes para um resultado mais preciso." : "Excelente — prompt completo."}</p></div>
          <ResultBox title="Prompt gerado" copyText={out}><pre className="max-h-[560px] overflow-auto whitespace-pre-wrap font-sans text-[14px] leading-7">{out}</pre><div className="mt-4 flex flex-wrap gap-2 border-t pt-4"><CopyButton text={out} label="Copiar prompt" variant="primary" size="md" /><Button variant="outline" onClick={() => { pushPrompt(s.objetivo.slice(0, 60) || "Prompt do builder", out); toast({ title: "Salvo no histórico" }); }}><History className="h-4 w-4" />Salvar</Button></div></ResultBox>
          <AdInArticle className="my-0" />
        </div>
      </div>
      <section className="mt-16">
        <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight"><History className="h-5 w-5" />Histórico de prompts</h2>{promptHistory.length > 0 && <Button size="sm" variant="ghost" onClick={clearPromptHistory}><Trash2 className="h-4 w-4" />Limpar</Button>}</div>
        {promptHistory.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{promptHistory.map((h) => <div key={h.id} className="flex flex-col rounded-2xl border bg-surface p-4"><p className="font-medium">{h.title}</p><p className="text-xs text-fg-3">{new Date(h.createdAt).toLocaleString("pt-BR")}</p><pre className="mt-2 line-clamp-4 whitespace-pre-wrap font-mono text-[11.5px] leading-5 text-fg-3">{h.prompt}</pre><div className="mt-auto pt-3"><CopyButton text={h.prompt} /></div></div>)}</div> : <Empty title="Nenhum prompt salvo" description="Prompts salvos aqui ficam apenas no seu navegador." action={<Button variant="outline" to="/prompts"><Sparkles className="h-4 w-4" />Explorar templates</Button>} />}
      </section>
    </div>
  );
}
