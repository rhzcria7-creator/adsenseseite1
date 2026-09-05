import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bookmark, Search, Wand2 } from "lucide-react";
import { prompts, promptCategories, promptBySlug, promptCategoryBySlug, promptsByCategory } from "@/data/prompts";
import { useSeo, breadcrumbLd } from "@/lib/seo";
import { useTrackVisit, usePromptHistory } from "@/lib/store";
import { Breadcrumbs, PageHeader } from "@/components/layout/Shell";
import { Badge, Button, Chip, Empty, Field, Icon, Input } from "@/components/ui/primitives";
import { CopyButton, FavoriteButton, useToast } from "@/components/ui/feedback";
import { Pop, Stagger, StaggerItem } from "@/components/ui/motion";
import { PromptCard } from "@/components/content/Cards";
import { AdBanner, AdSidebar } from "@/components/ui/monetization";
import { PromptBuilder } from "@/tools/promptBuilder";
import { NotFound } from "./StaticPages";
import { slugify } from "@/lib/utils";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function PromptsIndex() {
  const { cat } = useParams();
  const c = cat ? promptCategoryBySlug(cat) : undefined;
  useSeo({ title: c ? `Prompts de ${c.name}` : "Central de Prompts para IA", description: c ? `${c.description} Prompts prontos para ChatGPT, Claude, Gemini e Midjourney.` : `${prompts.length} prompts profissionais para ChatGPT, Claude, Gemini e Midjourney: marketing, vendas, programação, estudos, imagens e mais. Copie e use.`, path: c ? `/prompts/categoria/${c.slug}` : "/prompts" });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"pop" | "az">("pop");
  if (cat && !c) return <NotFound />;
  const list = (c ? promptsByCategory(c.slug) : prompts).filter((p) => !q || norm(`${p.title} ${p.description} ${p.tags.join(" ")}`).includes(norm(q))).sort((a, b) => (sort === "pop" ? b.popularity - a.popularity : a.title.localeCompare(b.title, "pt-BR")));

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={c ? [{ name: "Prompts", path: "/prompts" }, { name: c.name }] : [{ name: "Prompts" }]} />
      <PageHeader eyebrow={`${list.length} prompts`} title={c ? `Prompts de ${c.name}` : "Central de Prompts"} description={c ? c.description : "Templates estruturados e testados para tirar mais dos assistentes de IA. Cada prompt traz variáveis marcadas entre chaves para você preencher."}>
        <div className="mt-6 flex flex-wrap gap-3"><Link to="/prompts/builder"><Button><Wand2 size={15} /> Abrir Prompt Builder</Button></Link><Link to="/prompts/salvos"><Button variant="outline"><Bookmark size={15} /> Meus prompts salvos</Button></Link></div>
      </PageHeader>
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar prompts…" className="pl-10" /></div>
        <div className="flex gap-2"><Chip active={sort === "pop"} onClick={() => setSort("pop")}>Populares</Chip><Chip active={sort === "az"} onClick={() => setSort("az")}>A–Z</Chip></div>
      </div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        <Link to="/prompts"><Chip active={!c}>Todos</Chip></Link>
        {promptCategories.map((x) => <Link key={x.slug} to={`/prompts/categoria/${x.slug}`}><Chip active={c?.slug === x.slug}><span className="inline-flex items-center gap-1.5"><Icon name={x.icon} size={14} /> {x.name} ({promptsByCategory(x.slug).length})</span></Chip></Link>)}
      </div>
      {list.length === 0 ? <Empty icon="SearchX" title="Nenhum prompt encontrado" /> : <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <StaggerItem key={p.slug}><PromptCard prompt={p} /></StaggerItem>)}</Stagger>}
      <AdBanner />
    </div>
  );
}

export function PromptDetail() {
  const { slug } = useParams();
  const p = promptBySlug(slug ?? "");
  const cat = p ? promptCategoryBySlug(p.category) : undefined;
  const path = `/prompts/${slug}`;
  useSeo({ title: p ? `Prompt: ${p.title}` : "Prompt", description: p?.description, path, jsonLd: p && cat ? breadcrumbLd([{ name: "Prompts", path: "/prompts" }, { name: cat.name, path: `/prompts/categoria/${cat.slug}` }, { name: p.title, path }]) : undefined });
  useTrackVisit(p ? { id: `prompt:${p.slug}`, kind: "prompt", title: p.title, path } : null);
  const [vars, setVars] = useState<Record<string, string>>({});
  const { push } = usePromptHistory();
  const { toast } = useToast();
  const filled = useMemo(() => (p ? p.template.replace(/\{([^}]+)\}/g, (m, k) => vars[k]?.trim() || m) : ""), [p, vars]);
  if (!p || !cat) return <NotFound />;
  const related = prompts.filter((x) => x.slug !== p.slug && (x.category === p.category || x.tags.some((t) => p.tags.includes(t)))).sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  const missing = p.variables.filter((v) => !vars[v]?.trim());

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Prompts", path: "/prompts" }, { name: cat.name, path: `/prompts/categoria/${cat.slug}` }, { name: p.title }]} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <header className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-2"><Badge tone="accent">{cat.name}</Badge>{p.platform && <Badge>{p.platform}</Badge>}</div>
            <div className="flex items-start justify-between gap-4"><h1 className="h-display text-3xl sm:text-4xl">{p.title}</h1><FavoriteButton id={`prompt:${p.slug}`} kind="prompt" title={p.title} path={path} showLabel className="hidden shrink-0 sm:inline-flex" /></div>
            <p className="mt-3 max-w-2xl text-lg text-fg-2">{p.description}</p>
          </header>

          {p.variables.length > 0 && (
            <section className="surface mb-6 p-5 sm:p-6">
              <h2 className="h-title mb-1 text-lg">Preencha as variáveis</h2>
              <p className="mb-4 text-sm text-fg-2">Os campos abaixo substituem os marcadores entre chaves no template.</p>
              <div className="grid gap-4 sm:grid-cols-2">{p.variables.map((v) => <Field key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} className={v.length > 12 || ["texto", "código", "conteúdo", "documento", "anotações", "consulta"].includes(v) ? "sm:col-span-2" : ""}><Input value={vars[v] ?? ""} onChange={(e) => setVars({ ...vars, [v]: e.target.value })} placeholder={`{${v}}`} /></Field>)}</div>
            </section>
          )}

          <section className="surface p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="h-title text-lg">Prompt {missing.length ? <span className="text-sm font-normal text-fg-3">({missing.length} {missing.length === 1 ? "variável pendente" : "variáveis pendentes"})</span> : <span className="text-sm font-normal text-ok">pronto para usar</span>}</h2><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { push(p.title, filled); toast({ title: "Salvo no seu histórico de prompts", tone: "success" }); }}><Bookmark size={14} /> Salvar</Button><CopyButton text={filled} variant="primary" /></div></div>
            <Pop k={filled}><pre className="whitespace-pre-wrap rounded-xl border border-line bg-bg-2 p-5 font-mono text-[13.5px] leading-relaxed text-fg">{filled.split(/(\{[^}]+\})/g).map((part, i) => (/^\{[^}]+\}$/.test(part) ? <mark key={i} className="rounded bg-warn/20 px-1 text-fg">{part}</mark> : part))}</pre></Pop>
          </section>

          <AdBanner />

          <section className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-bg-2 p-5"><h3 className="h-title mb-2 text-base">Como usar</h3><ol className="list-decimal space-y-1.5 pl-5 text-sm text-fg-2"><li>Preencha as variáveis acima com o seu contexto real.</li><li>Copie o prompt e cole no seu assistente ({p.platform ?? "ChatGPT, Claude, Gemini…"}).</li><li>Se a resposta vier genérica, adicione exemplos do que você considera bom.</li><li>Peça uma revisão crítica antes de usar o resultado.</li></ol></div>
            <div className="rounded-xl border border-line bg-bg-2 p-5"><h3 className="h-title mb-2 text-base">Dicas para este prompt</h3><ul className="list-disc space-y-1.5 pl-5 text-sm text-fg-2"><li>Quanto mais específico o contexto, menos genérica a resposta.</li><li>Defina o formato de saída se precisar integrar com outra ferramenta.</li><li>Combine com o <Link to="/prompts/builder" className="text-accent underline underline-offset-4">Prompt Builder</Link> para estruturar contexto e resultado esperado.</li></ul></div>
          </section>

          <div className="mt-8 flex flex-wrap gap-2">{p.tags.map((t) => <Link key={t} to={`/tags/${slugify(t)}`} className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 hover:border-fg hover:text-fg">#{t}</Link>)}</div>

          {related.length > 0 && <section className="mt-12"><h2 className="h-title mb-4 text-xl">Prompts relacionados</h2><div className="grid gap-4 md:grid-cols-3">{related.map((r) => <PromptCard key={r.slug} prompt={r} />)}</div></section>}
        </div>
        <aside className="space-y-6">
          <AdSidebar />
          <div className="surface-2 p-5"><div className="eyebrow mb-3">Mais em {cat.name}</div><ul className="space-y-1">{promptsByCategory(cat.slug).filter((x) => x.slug !== p.slug).slice(0, 8).map((x) => <li key={x.slug}><Link to={`/prompts/${x.slug}`} className="block rounded-lg px-2 py-1.5 text-sm text-fg-2 hover:bg-bg hover:text-fg">{x.title}</Link></li>)}</ul></div>
        </aside>
      </div>
    </div>
  );
}

export function PromptBuilderPage() {
  useSeo({ title: "Prompt Builder — Monte prompts profissionais", description: "Construa prompts estruturados combinando objetivo, contexto, público, tom, formato, plataforma, nível de detalhe e resultado esperado. Sem API, salvo localmente.", path: "/prompts/builder" });
  useTrackVisit({ id: "tool:prompt-builder", kind: "tool", title: "Prompt Builder", path: "/prompts/builder" });
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Prompts", path: "/prompts" }, { name: "Prompt Builder" }]} />
      <PageHeader eyebrow="Prompt Engine" title="Prompt Builder" description="Objetivo + contexto + público + tom + formato + plataforma + nível de detalhe + resultado esperado. Escolha um preset ou monte do zero; salve no histórico local." />
      <section className="surface p-5 sm:p-7"><PromptBuilder /></section>
      <AdBanner />
    </div>
  );
}

export function SavedPrompts() {
  useSeo({ title: "Meus prompts salvos", noindex: true, path: "/prompts/salvos" });
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Prompts", path: "/prompts" }, { name: "Salvos" }]} />
      <PageHeader eyebrow="Local" title="Prompts salvos" description="Histórico de prompts gerados ou salvos neste navegador." />
      <section className="surface p-5 sm:p-7"><PromptBuilder initialTab="history" /></section>
    </div>
  );
}
