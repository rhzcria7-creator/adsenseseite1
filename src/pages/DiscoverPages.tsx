import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Bookmark, History, Search, Trash2 } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";
import { PROMPT_CATEGORIES, PROMPTS } from "@/data/prompts";
import { ALL_TAGS, CATEGORIES, categoryBySlug, contentByCategory, itemsByTagSlug, recommend, search, tagBySlug } from "@/lib/content";
import type { ContentKind } from "@/lib/types";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import { KIND_LABEL, relativeDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Shell";
import { Button, Empty, Input, PageHeader, Segmented } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { AdBanner } from "@/components/ui/monetization";
import { CategoryIcon, ContentCard, PromptCard, SearchResultRow, ToolCard } from "@/components/content/Cards";

export function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [kind, setKind] = useState<"all" | ContentKind>("all");
  const { pushSearch } = useStore();
  useSEO({ title: q ? `Busca: ${q}` : "Buscar", description: "Busque ferramentas, prompts, notícias, artigos, tutoriais, guias e vídeos.", path: "/buscar", noindex: true });
  useEffect(() => { const t = setTimeout(() => { const n = new URLSearchParams(); if (q) n.set("q", q); setSp(n, { replace: true }); if (q.trim().length > 2) pushSearch(q); }, 400); return () => clearTimeout(t); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = useMemo(() => search(q, { limit: 60, kinds: kind === "all" ? undefined : [kind] }), [q, kind]);
  const counts = useMemo(() => { const all = search(q, { limit: 200 }); const c: Record<string, number> = { all: all.length }; all.forEach((r) => (c[r.kind] = (c[r.kind] ?? 0) + 1)); return c; }, [q]);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Busca" }]} />
      <PageHeader eyebrow="Busca" title="Encontre qualquer coisa no Nexo.">
        <div className="relative max-w-2xl"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-3" /><Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="juros compostos, prompt para LinkedIn, passkeys…" className="h-14 pl-12 text-lg" /></div>
      </PageHeader>
      {q.trim() && <Segmented className="mb-6" value={kind} onChange={setKind} options={[{ value: "all", label: `Tudo (${counts.all ?? 0})` }, ...(["tool", "prompt", "news", "article", "tutorial", "guide", "video"] as ContentKind[]).filter((k) => counts[k]).map((k) => ({ value: k, label: `${KIND_LABEL[k]}s (${counts[k]})` }))]} />}
      {!q.trim() ? <div className="grid gap-6 md:grid-cols-2"><div className="rounded-2xl border bg-surface p-5"><p className="mb-3 text-sm font-semibold">Categorias de ferramentas</p><div className="flex flex-wrap gap-2">{TOOL_CATEGORIES.map((c) => <Link key={c.slug} to={`/ferramentas/categoria/${c.slug}`} className="rounded-full border px-3 py-1 text-sm hover:bg-surface-2">{c.name}</Link>)}</div></div><div className="rounded-2xl border bg-surface p-5"><p className="mb-3 text-sm font-semibold">Tags populares</p><div className="flex flex-wrap gap-2">{ALL_TAGS.slice(0, 20).map((t) => <Link key={t.slug} to={`/tags/${t.slug}`} className="rounded-full border px-3 py-1 text-sm hover:bg-surface-2">#{t.tag}</Link>)}</div></div></div>
        : results.length ? <div className="space-y-3">{results.map((r) => <SearchResultRow key={r.id} doc={r} />)}</div> : <Empty title={`Nada encontrado para “${q}”`} description="Verifique a grafia ou tente termos mais gerais." />}
      <AdBanner />
    </div>
  );
}

export function CategoriesIndex() {
  useSEO({ title: "Categorias", description: "Navegue por todos os temas do Nexo: IA, programação, marketing, finanças, segurança, design e mais.", path: "/categorias", breadcrumbs: [{ label: "Categorias", path: "/categorias" }] });
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Categorias" }]} />
      <PageHeader eyebrow="Explorar" title="Categorias" description="Conteúdo editorial, ferramentas e prompts organizados por tema." />
      <h2 className="mb-4 text-lg font-semibold">Conteúdo</h2>
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" delay={0.03}>{CATEGORIES.map((c) => { const n = contentByCategory(c.slug).length; return <StaggerItem key={c.slug}><Link to={`/categorias/${c.slug}`} className="group block h-full rounded-2xl border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-line-2 hover:shadow-pop"><h3 className="font-semibold group-hover:underline underline-offset-4">{c.name}</h3><p className="mt-1 text-sm text-fg-2">{c.description}</p><p className="mt-3 text-xs text-fg-3">{n} item(ns) · {c.kinds.map((k) => KIND_LABEL[k].toLowerCase()).join(", ")}</p></Link></StaggerItem>; })}</Stagger>
      <h2 className="mb-4 mt-12 text-lg font-semibold">Ferramentas</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{TOOL_CATEGORIES.map((c) => <Link key={c.slug} to={`/ferramentas/categoria/${c.slug}`} className="flex items-center gap-3 rounded-2xl border bg-surface p-4 hover:bg-surface-2"><CategoryIcon icon={c.icon} className="h-5 w-5 text-fg-2" /><span><span className="block font-medium">{c.name}</span><span className="text-xs text-fg-3">{TOOLS.filter((t) => t.category === c.slug).length} ferramentas</span></span></Link>)}</div>
      <h2 className="mb-4 mt-12 text-lg font-semibold">Prompts</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{PROMPT_CATEGORIES.map((c) => <Link key={c.slug} to={`/prompts/categoria/${c.slug}`} className="rounded-2xl border bg-surface p-4 hover:bg-surface-2"><span className="block font-medium">{c.name}</span><span className="text-xs text-fg-3">{PROMPTS.filter((p) => p.category === c.slug).length} prompts</span></Link>)}</div>
    </div>
  );
}

export function CategoryPage() {
  const { slug = "" } = useParams();
  const cat = categoryBySlug(slug);
  useSEO({ title: cat ? `${cat.name} — notícias, artigos e guias` : "Categoria", description: cat?.description ?? "", path: `/categorias/${slug}`, breadcrumbs: [{ label: "Categorias", path: "/categorias" }, { label: cat?.name ?? "", path: `/categorias/${slug}` }] });
  if (!cat) return <Navigate to="/categorias" replace />;
  const items = contentByCategory(cat.slug);
  const tools = TOOLS.filter((t) => t.tags.some((tg) => items.some((i) => i.tags.includes(tg)))).slice(0, 4);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Categorias", path: "/categorias" }, { label: cat.name }]} />
      <PageHeader eyebrow="Categoria" title={cat.name} description={cat.description} />
      {items.length ? <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delay={0.04}>{items.map((c) => <StaggerItem key={c.slug}><ContentCard item={c} /></StaggerItem>)}</Stagger> : <Empty title="Sem conteúdo nesta categoria ainda" />}
      {tools.length > 0 && <section className="mt-14"><h2 className="mb-4 text-xl font-semibold tracking-tight">Ferramentas relacionadas</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tools.map((t) => <ToolCard key={t.slug} tool={t} compact />)}</div></section>}
      <AdBanner />
    </div>
  );
}

export function TagsIndex() {
  useSEO({ title: "Tags", description: "Todas as tags do Nexo, com contagem de ferramentas, prompts e conteúdos.", path: "/tags", breadcrumbs: [{ label: "Tags", path: "/tags" }] });
  const [q, setQ] = useState("");
  const list = ALL_TAGS.filter((t) => t.tag.toLowerCase().includes(q.toLowerCase()));
  const max = ALL_TAGS[0]?.count ?? 1;
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Tags" }]} />
      <PageHeader eyebrow="Explorar" title={`${ALL_TAGS.length} tags`} description="O tamanho reflete a quantidade de itens."><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar tags…" className="max-w-sm" /></PageHeader>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">{list.map((t) => <Link key={t.slug} to={`/tags/${t.slug}`} className="rounded-lg px-2 py-1 text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg" style={{ fontSize: `${0.85 + (t.count / max) * 0.9}rem` }}>#{t.tag}<span className="ml-1 text-xs text-fg-3">{t.count}</span></Link>)}</div>
    </div>
  );
}

export function TagPage() {
  const { slug = "" } = useParams();
  const tag = tagBySlug(slug);
  useSEO({ title: tag ? `#${tag.tag}` : "Tag", description: tag ? `Ferramentas, prompts e conteúdos marcados com ${tag.tag}.` : "", path: `/tags/${slug}`, breadcrumbs: [{ label: "Tags", path: "/tags" }, { label: `#${tag?.tag ?? slug}`, path: `/tags/${slug}` }] });
  if (!tag) return <Navigate to="/tags" replace />;
  const { content, tools, prompts } = itemsByTagSlug(slug);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Tags", path: "/tags" }, { label: `#${tag.tag}` }]} />
      <PageHeader eyebrow="Tag" title={`#${tag.tag}`} description={`${tag.count} item(ns): ${tools.length} ferramentas, ${prompts.length} prompts, ${content.length} conteúdos.`} />
      {tools.length > 0 && <section className="mb-12"><h2 className="mb-4 text-lg font-semibold">Ferramentas</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tools.map((t) => <ToolCard key={t.slug} tool={t} compact />)}</div></section>}
      {content.length > 0 && <section className="mb-12"><h2 className="mb-4 text-lg font-semibold">Conteúdo</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{content.map((c) => <ContentCard key={c.slug} item={c} />)}</div></section>}
      {prompts.length > 0 && <section><h2 className="mb-4 text-lg font-semibold">Prompts</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{prompts.map((p) => <PromptCard key={p.slug} prompt={p} />)}</div></section>}
    </div>
  );
}

export function FavoritesPage() {
  useSEO({ title: "Favoritos", description: "Suas ferramentas, prompts e conteúdos salvos.", path: "/favoritos", noindex: true });
  const { favorites, toggleFavorite, history } = useStore();
  const [kind, setKind] = useState<"all" | ContentKind>("all");
  const list = favorites.filter((f) => kind === "all" || f.kind === kind);
  const recs = recommend([...favorites.map((f) => f.id), ...history.map((h) => h.id)], 4);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Favoritos" }]} />
      <PageHeader eyebrow="Você" title="Favoritos" description="Salvos apenas neste navegador. Nada é enviado para servidores." />
      {favorites.length > 0 && <Segmented className="mb-6" value={kind} onChange={setKind} options={[{ value: "all", label: `Todos (${favorites.length})` }, ...(["tool", "prompt", "news", "article", "tutorial", "guide", "video"] as ContentKind[]).filter((k) => favorites.some((f) => f.kind === k)).map((k) => ({ value: k, label: KIND_LABEL[k] }))]} />}
      {list.length ? <ul className="divide-y rounded-2xl border bg-surface">{list.map((f) => <li key={f.id} className="flex items-center gap-4 px-5 py-3.5"><Bookmark className="h-4 w-4 fill-current text-brand" /><Link to={f.path} className="min-w-0 flex-1"><span className="block truncate font-medium hover:underline underline-offset-4">{f.title}</span><span className="text-xs text-fg-3">{KIND_LABEL[f.kind]} · salvo {relativeDate(new Date(f.addedAt).toISOString())}</span></Link><button onClick={() => toggleFavorite(f)} className="text-fg-3 hover:text-danger" aria-label="Remover"><Trash2 className="h-4 w-4" /></button></li>)}</ul> : <Empty title="Nenhum favorito ainda" description="Use o botão “Salvar” em ferramentas, prompts e artigos." action={<Button variant="outline" to="/ferramentas">Explorar ferramentas</Button>} />}
      <section className="mt-14"><h2 className="mb-4 text-xl font-semibold tracking-tight">Recomendado para você</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{recs.map((r) => <Link key={r.id} to={r.path} className="rounded-2xl border bg-surface p-4 hover:bg-surface-2"><p className="text-[11px] uppercase tracking-wide text-fg-3">{KIND_LABEL[r.kind]}</p><p className="mt-1 font-medium leading-snug">{r.title}</p></Link>)}</div></section>
    </div>
  );
}

export function HistoryPage() {
  useSEO({ title: "Histórico", description: "Itens visitados recentemente.", path: "/historico", noindex: true });
  const { history, clearHistory, favorites } = useStore();
  const groups = useMemo(() => { const g: Record<string, typeof history> = {}; history.forEach((h) => { const d = new Date(h.visitedAt); const key = d.toDateString() === new Date().toDateString() ? "Hoje" : d.toDateString() === new Date(Date.now() - 864e5).toDateString() ? "Ontem" : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }); (g[key] ??= []).push(h); }); return g; }, [history]);
  const recs = recommend([...history.map((h) => h.id), ...favorites.map((f) => f.id)], 4);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Histórico" }]} />
      <PageHeader eyebrow="Você" title="Histórico" description="Últimos 60 itens visitados, salvos localmente.">{history.length > 0 && <Button variant="outline" size="sm" onClick={clearHistory}><Trash2 className="h-4 w-4" />Limpar histórico</Button>}</PageHeader>
      {history.length ? Object.entries(groups).map(([day, items]) => <section key={day} className="mb-8"><p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-fg-3">{day}</p><ul className="divide-y rounded-2xl border bg-surface">{items.map((h) => <li key={h.id} className="flex items-center gap-4 px-5 py-3"><History className="h-4 w-4 text-fg-3" /><Link to={h.path} className="min-w-0 flex-1"><span className="block truncate font-medium hover:underline underline-offset-4">{h.title}</span><span className="text-xs text-fg-3">{KIND_LABEL[h.kind]} · {new Date(h.visitedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></Link></li>)}</ul></section>) : <Empty title="Histórico vazio" description="As páginas que você visitar aparecerão aqui." />}
      <section className="mt-6"><h2 className="mb-4 text-xl font-semibold tracking-tight">Continue explorando</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{recs.map((r) => <Link key={r.id} to={r.path} className="rounded-2xl border bg-surface p-4 hover:bg-surface-2"><p className="text-[11px] uppercase tracking-wide text-fg-3">{KIND_LABEL[r.kind]}</p><p className="mt-1 font-medium leading-snug">{r.title}</p></Link>)}</div></section>
    </div>
  );
}
