import { Search as SearchIcon, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { PROMPT_CATEGORIES, promptsByCategory } from "@/data/prompts";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";
import { ALL_TAGS, CATEGORIES, categoryBySlug, contentByCategory, itemsByTagSlug, recommend, search, tagBySlug } from "@/lib/content";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import type { ContentKind } from "@/lib/types";
import { KIND_LABEL, relativeDate } from "@/lib/utils";
import { Container, PageHeader } from "@/components/layout/Shell";
import { ContentRow, MiniList, PromptCard, ToolCard } from "@/components/content/Cards";
import { Empty, Tabs } from "@/components/ui/feedback";
import { AdSlot } from "@/components/ui/monetization";
import { Badge, Button, Input } from "@/components/ui/primitives";

const KINDS: ContentKind[] = ["tool", "prompt", "news", "article", "tutorial", "guide", "video"];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const [kind, setKind] = useState<"all" | ContentKind>("all");
  const { pushSearch, searchHistory, clearSearchHistory } = useStore();
  useSEO({ title: q ? `Busca: ${q}` : "Buscar", description: "Busque ferramentas, prompts, notícias, artigos, tutoriais, guias e vídeos.", path: "/buscar", noindex: true });
  useEffect(() => { setInput(q); if (q) pushSearch(q); }, [q, pushSearch]);
  const results = useMemo(() => search(q, { limit: 100 }), [q]);
  const counts = useMemo(() => Object.fromEntries(KINDS.map((k) => [k, results.filter((r) => r.kind === k).length])) as Record<ContentKind, number>, [results]);
  const list = kind === "all" ? results : results.filter((r) => r.kind === kind);
  return (
    <Container wide>
      <PageHeader eyebrow="Busca global" title={q ? `Resultados para “${q}”` : "Buscar na plataforma"} description={q ? `${results.length} resultados em ferramentas, prompts e conteúdo.` : "Ferramentas, prompts, notícias, artigos, tutoriais, guias e vídeos — tudo indexado localmente."} crumbs={[{ label: "Buscar" }]} />
      <form onSubmit={(e) => { e.preventDefault(); setParams(input.trim() ? { q: input.trim() } : {}); }} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="O que você procura?" className="h-12 pl-9 text-base" aria-label="Buscar" autoFocus />
        </div>
        <Button type="submit" size="lg">Buscar</Button>
      </form>
      {q && <Tabs value={kind} onChange={setKind} className="mt-6" tabs={[{ value: "all" as const, label: "Tudo", count: results.length }, ...KINDS.filter((k) => counts[k] > 0).map((k) => ({ value: k, label: KIND_LABEL[k] + "s", count: counts[k] }))]} />}
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {!q ? (
            <div className="grid gap-8 sm:grid-cols-2">
              <MiniList title="Ferramentas populares" items={TOOLS.filter((t) => t.featured).map((t) => ({ title: t.name, path: `/ferramentas/${t.slug}` }))} />
              <div>
                <div className="mb-2 flex items-center justify-between border-b border-strong pb-2"><span className="eyebrow">Buscas recentes</span>{searchHistory.length > 0 && <button onClick={clearSearchHistory} aria-label="Limpar" className="text-subtle hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>}</div>
                {searchHistory.length ? <ul className="divide-y divide-[var(--line)]">{searchHistory.map((s) => <li key={s}><Link to={`/buscar?q=${encodeURIComponent(s)}`} className="block py-2.5 text-sm hover:text-accent">{s}</Link></li>)}</ul> : <p className="text-xs text-subtle">Suas buscas ficam salvas neste navegador.</p>}
              </div>
            </div>
          ) : list.length ? (
            <ul className="divide-y divide-[var(--line)] border-y border-line">
              {list.map((r) => (
                <li key={r.id}>
                  <Link to={r.path} className="group grid gap-2 py-4 sm:grid-cols-[100px_1fr] sm:gap-6">
                    <Badge tone="outline" className="w-fit">{KIND_LABEL[r.kind]}</Badge>
                    <div>
                      <div className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-accent">{r.title}</div>
                      <p className="mt-1 text-sm text-muted">{r.description}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">{r.tags.slice(0, 4).map((t) => <span key={t} className="font-mono text-[10px] text-subtle">#{t}</span>)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title={`Nada encontrado para “${q}”`} description="Verifique a grafia ou tente termos mais gerais, como 'juros', 'prompt' ou 'texto'." action={<Button to="/ferramentas" variant="secondary">Ver todas as ferramentas</Button>} />
          )}
        </div>
        <aside className="space-y-8">
          <MiniList title="Categorias" items={CATEGORIES.slice(0, 8).map((c) => ({ title: c.name, path: `/categorias/${c.slug}` }))} />
          <AdSlot format="rectangle" id="search-side" />
        </aside>
      </div>
    </Container>
  );
}

export function CategoriesIndex() {
  useSEO({ title: "Categorias", description: "Navegue por todas as categorias de conteúdo, ferramentas e prompts da Nexo.", path: "/categorias" });
  return (
    <Container wide>
      <PageHeader eyebrow="Navegação" title="Categorias" description="Conteúdo editorial, ferramentas e prompts organizados por tema." crumbs={[{ label: "Categorias" }]} />
      <section className="mt-10">
        <h2 className="border-b border-strong pb-2 font-display text-xl font-bold">Conteúdo</h2>
        <div className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => { const n = contentByCategory(c.slug).length; return <Link key={c.slug} to={`/categorias/${c.slug}`} className="group border-b border-r border-line p-5 transition-colors hover:bg-elev"><div className="flex items-center justify-between"><h3 className="font-display text-lg font-semibold group-hover:text-accent">{c.name}</h3><span className="font-mono text-xs text-subtle">{n}</span></div><p className="mt-1 text-sm text-muted">{c.description}</p></Link>; })}
        </div>
      </section>
      <section className="mt-12 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="border-b border-strong pb-2 font-display text-xl font-bold">Ferramentas</h2>
          <ul className="divide-y divide-[var(--line)]">{TOOL_CATEGORIES.map((c) => <li key={c.slug}><Link to={`/ferramentas/categoria/${c.slug}`} className="flex items-center justify-between py-3 hover:text-accent"><span className="font-medium">{c.name}</span><span className="font-mono text-xs text-subtle">{TOOLS.filter((t) => t.category === c.slug).length}</span></Link></li>)}</ul>
        </div>
        <div>
          <h2 className="border-b border-strong pb-2 font-display text-xl font-bold">Prompts</h2>
          <ul className="divide-y divide-[var(--line)]">{PROMPT_CATEGORIES.map((c) => <li key={c.slug}><Link to={`/prompts/categoria/${c.slug}`} className="flex items-center justify-between py-3 hover:text-accent"><span className="font-medium">{c.name}</span><span className="font-mono text-xs text-subtle">{promptsByCategory(c.slug).length}</span></Link></li>)}</ul>
        </div>
      </section>
    </Container>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const c = slug ? categoryBySlug(slug) : undefined;
  useSEO({ title: c ? `${c.name} — notícias, artigos e tutoriais` : "Categoria", description: c?.description ?? "", path: `/categorias/${slug}` });
  const [kind, setKind] = useState<"all" | ContentKind>("all");
  if (!c) return <Navigate to="/404" replace />;
  const items = contentByCategory(c.slug);
  const kinds = KINDS.filter((k) => items.some((i) => i.kind === k));
  const list = kind === "all" ? items : items.filter((i) => i.kind === kind);
  const relatedTools = TOOLS.filter((t) => t.tags.some((tag) => c.name.toLowerCase().includes(tag) || items.some((i) => i.tags.includes(tag)))).slice(0, 6);
  return (
    <Container wide>
      <PageHeader eyebrow={`${items.length} conteúdos`} title={c.name} description={c.description} crumbs={[{ label: "Categorias", to: "/categorias" }, { label: c.name }]} />
      <Tabs value={kind} onChange={setKind} className="mt-6" tabs={[{ value: "all" as const, label: "Tudo", count: items.length }, ...kinds.map((k) => ({ value: k, label: KIND_LABEL[k] + "s", count: items.filter((i) => i.kind === k).length }))]} />
      <div className="mt-2 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="divide-y divide-[var(--line)]">{list.length ? list.map((i) => <ContentRow key={`${i.kind}-${i.slug}`} item={i} showKind />) : <div className="py-8"><Empty title="Sem conteúdo neste tipo" /></div>}</div>
        <aside className="space-y-8 pt-6">
          <MiniList title="Ferramentas relacionadas" items={relatedTools.map((t) => ({ title: t.name, path: `/ferramentas/${t.slug}` }))} />
          <MiniList title="Outras categorias" items={CATEGORIES.filter((x) => x.slug !== c.slug).slice(0, 8).map((x) => ({ title: x.name, path: `/categorias/${x.slug}` }))} />
        </aside>
      </div>
    </Container>
  );
}

export function TagsIndex() {
  useSEO({ title: "Tags", description: "Todas as tags usadas em ferramentas, prompts e conteúdo.", path: "/tags" });
  const max = ALL_TAGS[0]?.count ?? 1;
  return (
    <Container wide>
      <PageHeader eyebrow={`${ALL_TAGS.length} tags`} title="Tags" description="Explore por assunto. O tamanho indica a quantidade de itens." crumbs={[{ label: "Tags" }]} />
      <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-3">
        {ALL_TAGS.map((t) => { const scale = 0.85 + (t.count / max) * 1.4; return <Link key={t.slug} to={`/tags/${t.slug}`} className="font-display font-semibold tracking-tight text-muted transition-colors hover:text-accent" style={{ fontSize: `${scale}rem` }}>#{t.tag}<sup className="ml-0.5 font-mono text-[10px] text-subtle">{t.count}</sup></Link>; })}
      </div>
    </Container>
  );
}

export function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const t = slug ? tagBySlug(slug) : undefined;
  useSEO({ title: t ? `#${t.tag}` : "Tag", description: t ? `Tudo sobre ${t.tag}: ferramentas, prompts e conteúdo.` : "", path: `/tags/${slug}` });
  if (!t || !slug) return <Navigate to="/404" replace />;
  const { content, tools, prompts } = itemsByTagSlug(slug);
  return (
    <Container wide>
      <PageHeader eyebrow={`${t.count} itens`} title={`#${t.tag}`} crumbs={[{ label: "Tags", to: "/tags" }, { label: `#${t.tag}` }]} />
      {tools.length > 0 && <section className="mt-10"><h2 className="border-b border-strong pb-2 font-display text-xl font-bold">Ferramentas</h2><div className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">{tools.map((x) => <ToolCard key={x.slug} tool={x} />)}</div></section>}
      {content.length > 0 && <section className="mt-10"><h2 className="border-b border-strong pb-2 font-display text-xl font-bold">Conteúdo</h2><div className="divide-y divide-[var(--line)]">{content.map((x) => <ContentRow key={`${x.kind}-${x.slug}`} item={x} showKind />)}</div></section>}
      {prompts.length > 0 && <section className="mt-10"><h2 className="mb-4 border-b border-strong pb-2 font-display text-xl font-bold">Prompts</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{prompts.map((x) => <PromptCard key={x.slug} prompt={x} />)}</div></section>}
    </Container>
  );
}

export function FavoritesPage() {
  const { favorites, toggleFavorite, history } = useStore();
  const [kind, setKind] = useState<"all" | ContentKind>("all");
  useSEO({ title: "Favoritos", description: "Suas ferramentas, prompts e conteúdos salvos.", path: "/favoritos", noindex: true });
  const list = kind === "all" ? favorites : favorites.filter((f) => f.kind === kind);
  const kinds = KINDS.filter((k) => favorites.some((f) => f.kind === k));
  const recs = recommend([...favorites.map((f) => f.id), ...history.map((h) => h.id)].slice(0, 12), 6);
  return (
    <Container wide>
      <PageHeader eyebrow={`${favorites.length} salvos`} title="Favoritos" description="Salvos apenas neste navegador. Exporte ou limpe quando quiser." crumbs={[{ label: "Favoritos" }]} />
      {favorites.length > 0 && <Tabs value={kind} onChange={setKind} className="mt-6" tabs={[{ value: "all" as const, label: "Tudo", count: favorites.length }, ...kinds.map((k) => ({ value: k, label: KIND_LABEL[k] + "s", count: favorites.filter((f) => f.kind === k).length }))]} />}
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {list.length ? (
            <ul className="divide-y divide-[var(--line)] border-y border-line">{list.map((f) => <li key={f.id} className="flex items-center gap-4 py-3"><Badge tone="outline" className="w-[84px] justify-center">{KIND_LABEL[f.kind]}</Badge><Link to={f.path} className="min-w-0 flex-1 truncate font-medium hover:text-accent">{f.title}</Link><span className="hidden font-mono text-[11px] text-subtle sm:block">{relativeDate(new Date(f.addedAt).toISOString())}</span><button onClick={() => toggleFavorite(f)} aria-label="Remover" className="text-subtle hover:text-red-600"><Trash2 className="h-4 w-4" /></button></li>)}</ul>
          ) : (
            <Empty title="Nenhum favorito ainda" description="Use o botão Favoritar em ferramentas, prompts e artigos." action={<Button to="/ferramentas">Explorar ferramentas</Button>} />
          )}
        </div>
        <aside><MiniList title="Recomendado para você" items={recs.map((r) => ({ title: r.title, path: r.path, meta: KIND_LABEL[r.kind] }))} /></aside>
      </div>
    </Container>
  );
}

export function HistoryPage() {
  const { history, clearHistory } = useStore();
  useSEO({ title: "Histórico", description: "Páginas visitadas recentemente.", path: "/historico", noindex: true });
  const groups = useMemo(() => {
    const g = new Map<string, typeof history>();
    history.forEach((h) => { const d = new Date(h.visitedAt); const key = d.toDateString() === new Date().toDateString() ? "Hoje" : d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }); g.set(key, [...(g.get(key) ?? []), h]); });
    return [...g.entries()];
  }, [history]);
  return (
    <Container wide>
      <PageHeader eyebrow={`${history.length} itens`} title="Histórico" description="Últimas 60 páginas visitadas, salvas localmente." crumbs={[{ label: "Histórico" }]} aside={history.length > 0 ? <Button variant="danger" size="sm" onClick={clearHistory}><Trash2 className="h-3.5 w-3.5" /> Limpar histórico</Button> : undefined} />
      <div className="mt-8">
        {history.length ? groups.map(([day, items]) => (
          <section key={day} className="mb-8">
            <h2 className="eyebrow mb-2 border-b border-strong pb-2 capitalize">{day}</h2>
            <ul className="divide-y divide-[var(--line)]">{items.map((h) => <li key={h.id}><Link to={h.path} className="flex items-center gap-4 py-2.5 hover:text-accent"><span className="w-14 font-mono text-[11px] text-subtle">{new Date(h.visitedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span><Badge tone="outline" className="w-[84px] justify-center">{KIND_LABEL[h.kind]}</Badge><span className="truncate font-medium">{h.title}</span></Link></li>)}</ul>
          </section>
        )) : <Empty title="Histórico vazio" description="Visite ferramentas e conteúdos para vê-los aqui." action={<Button to="/">Ir para o início</Button>} />}
      </div>
    </Container>
  );
}
