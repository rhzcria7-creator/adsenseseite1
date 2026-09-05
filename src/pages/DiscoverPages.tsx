import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Heart, History, Search, Trash2, TrendingUp } from "lucide-react";
import type { ContentKind } from "@/lib/types";
import { allTags, byTag, kindMeta, popular, recent, search, searchDocs, trending } from "@/lib/content";
import { useSeo } from "@/lib/seo";
import { useFavorites, useHistory } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import { Breadcrumbs, PageHeader } from "@/components/layout/Shell";
import { Badge, Button, Chip, Empty, Input } from "@/components/ui/primitives";
import { FavoriteButton } from "@/components/ui/feedback";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ContentCard, DocRow, PromptCard, ToolCard } from "@/components/content/Cards";
import { AdBanner } from "@/components/ui/monetization";

const kinds: { k: ContentKind | "all"; l: string }[] = [{ k: "all", l: "Tudo" }, { k: "tool", l: "Ferramentas" }, { k: "prompt", l: "Prompts" }, { k: "news", l: "Notícias" }, { k: "blog", l: "Blog" }, { k: "tutorial", l: "Tutoriais" }, { k: "guide", l: "Guias" }, { k: "video", l: "Vídeos" }];

export function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const [kind, setKind] = useState<ContentKind | "all">("all");
  const [input, setInput] = useState(q);
  useSeo({ title: q ? `Busca: ${q}` : "Busca", description: "Busque ferramentas, prompts, notícias, artigos, tutoriais, guias e vídeos.", path: "/busca", noindex: true });
  const results = useMemo(() => search(q, { kinds: kind === "all" ? undefined : [kind], limit: 60 }), [q, kind]);
  const counts = useMemo(() => { const all = search(q, { limit: 200 }); const m: Record<string, number> = { all: all.length }; for (const r of all) m[r.kind] = (m[r.kind] ?? 0) + 1; return m; }, [q]);
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Busca" }]} />
      <PageHeader eyebrow="Busca" title={q ? `Resultados para “${q}”` : "O que você procura?"} />
      <form onSubmit={(e) => { e.preventDefault(); setSp(input.trim() ? { q: input.trim() } : {}); }} className="mb-6 flex max-w-2xl gap-2"><div className="relative flex-1"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3" /><Input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ex.: juros, prompt de marketing, react…" className="pl-10" /></div><Button type="submit">Buscar</Button></form>
      {q && <div className="mb-6 flex gap-2 overflow-x-auto pb-1">{kinds.map((k) => <Chip key={k.k} active={kind === k.k} onClick={() => setKind(k.k)}>{k.l} {counts[k.k] ? `(${counts[k.k]})` : ""}</Chip>)}</div>}
      {!q ? (
        <div><div className="eyebrow mb-3">Em alta hoje</div><div className="grid gap-2 md:grid-cols-2">{trending(8).map((d) => <DocRow key={d.id} doc={d} />)}</div></div>
      ) : results.length === 0 ? (
        <Empty icon="SearchX" title={`Nada encontrado para “${q}”`} description="Tente termos mais curtos ou sinônimos." action={<Link to="/ferramentas"><Button variant="outline">Ver todas as ferramentas</Button></Link>} />
      ) : (
        <Stagger className="grid gap-2 md:grid-cols-2">{results.map((d) => <StaggerItem key={d.id}><DocRow doc={d} right={<FavoriteButton id={d.id} kind={d.kind} title={d.title} path={d.path} className="h-8 border-transparent px-2" />} /></StaggerItem>)}</Stagger>
      )}
      <AdBanner />
    </div>
  );
}

export function FavoritesPage() {
  useSeo({ title: "Favoritos", noindex: true, path: "/favoritos" });
  const { items, clear } = useFavorites();
  const [kind, setKind] = useState<string>("all");
  const list = items.filter((i) => kind === "all" || i.kind === kind);
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Favoritos" }]} />
      <PageHeader eyebrow="Salvos neste navegador" title="Seus favoritos" description="Ferramentas, prompts e conteúdos que você marcou. Ficam apenas no seu dispositivo.">{items.length > 0 && <div className="mt-5"><Button variant="ghost" size="sm" onClick={() => confirm("Remover todos os favoritos?") && clear()}><Trash2 size={14} /> Limpar tudo</Button></div>}</PageHeader>
      {items.length === 0 ? <Empty icon="Heart" title="Nenhum favorito ainda" description="Toque no coração em qualquer ferramenta, prompt ou artigo para salvar aqui." action={<Link to="/ferramentas"><Button>Explorar ferramentas</Button></Link>} /> : (
        <>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">{kinds.filter((k) => k.k === "all" || items.some((i) => i.kind === k.k)).map((k) => <Chip key={k.k} active={kind === k.k} onClick={() => setKind(k.k)}>{k.l}</Chip>)}</div>
          <Stagger className="grid gap-2 md:grid-cols-2">{list.map((i) => { const doc = searchDocs.find((d) => d.id === i.id); return <StaggerItem key={i.id}>{doc ? <DocRow doc={doc} right={<FavoriteButton id={i.id} kind={i.kind} title={i.title} path={i.path} className="h-8 border-transparent px-2" />} /> : <div className="flex items-center gap-3 rounded-xl border border-line p-3"><Badge>{i.kind}</Badge><Link to={i.path} className="flex-1 text-sm font-medium">{i.title}</Link><FavoriteButton id={i.id} kind={i.kind} title={i.title} path={i.path} className="h-8 border-transparent px-2" /></div>}</StaggerItem>; })}</Stagger>
        </>
      )}
    </div>
  );
}

export function HistoryPage() {
  useSeo({ title: "Histórico", noindex: true, path: "/historico" });
  const { items, clear } = useHistory();
  const groups = useMemo(() => { const g: Record<string, typeof items> = {}; for (const i of items) { const d = new Date(i.at); const key = d.toDateString() === new Date().toDateString() ? "Hoje" : d.toDateString() === new Date(Date.now() - 864e5).toDateString() ? "Ontem" : d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }); (g[key] ??= []).push(i); } return g; }, [items]);
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Histórico" }]} />
      <PageHeader eyebrow="Local" title="Histórico de navegação" description="As últimas 100 páginas que você visitou no Nexo. Armazenado apenas neste navegador.">{items.length > 0 && <div className="mt-5"><Button variant="ghost" size="sm" onClick={() => confirm("Apagar histórico?") && clear()}><Trash2 size={14} /> Apagar histórico</Button></div>}</PageHeader>
      {items.length === 0 ? <Empty icon="History" title="Histórico vazio" description="Conforme você navega, as páginas aparecem aqui." /> : Object.entries(groups).map(([day, list]) => (
        <section key={day} className="mb-8"><div className="eyebrow mb-3 flex items-center gap-2"><History size={13} /> {day}</div><div className="grid gap-2 md:grid-cols-2">{list.map((i) => { const doc = searchDocs.find((d) => d.id === i.id); return doc ? <DocRow key={i.id + i.at} doc={doc} right={<span className="hidden text-xs text-fg-3 sm:block">{timeAgo(new Date(i.at).toISOString())}</span>} /> : <Link key={i.id + i.at} to={i.path} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm font-medium hover:bg-bg-2"><Badge>{i.kind}</Badge>{i.title}</Link>; })}</div></section>
      ))}
    </div>
  );
}

export function TrendingPage() {
  useSeo({ title: "Tendências", description: "O que está em alta no Nexo hoje: ferramentas, prompts e conteúdos mais populares, recentes e em tendência.", path: "/tendencias" });
  const hot = trending(9);
  const pop = popular(6);
  const rec = recent(6);
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Tendências" }]} />
      <PageHeader eyebrow="Rotação diária" title="Tendências" description="Seleção calculada localmente a partir de popularidade e data, com rotação diária determinística — sem fingir atualização em tempo real." />
      <section className="mb-14"><div className="mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-accent" /><h2 className="h-title text-2xl">Em alta hoje</h2></div><Stagger className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">{hot.map((d, i) => <StaggerItem key={d.id}><Link to={d.path} className="flex h-full items-start gap-3 rounded-xl border border-line p-4 transition-colors hover:bg-bg-2"><span className="font-mono text-lg text-fg-3">{String(i + 1).padStart(2, "0")}</span><div><div className="text-[11px] font-semibold uppercase tracking-wider text-accent">{kindMeta[d.kind].label}</div><div className="mt-0.5 font-semibold text-fg">{d.title}</div><div className="mt-1 line-clamp-2 text-sm text-fg-2">{d.excerpt}</div></div></Link></StaggerItem>)}</Stagger></section>
      <AdBanner />
      <section className="mb-14"><h2 className="h-title mb-6 text-2xl">Mais populares</h2><div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{pop.map((e) => <ContentCard key={e.slug} entry={e} />)}</div></section>
      <section><h2 className="h-title mb-6 text-2xl">Recém-publicados</h2><div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{rec.map((e) => <ContentCard key={e.slug} entry={e} />)}</div></section>
    </div>
  );
}

export function TagsIndex() {
  useSeo({ title: "Todas as tags", description: "Navegue por todos os temas do Nexo.", path: "/tags" });
  const tags = allTags();
  const [q, setQ] = useState("");
  const list = tags.filter((t) => !q || t.name.includes(q.toLowerCase()));
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Tags" }]} />
      <PageHeader eyebrow={`${tags.length} temas`} title="Explore por tema" />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar tags…" className="mb-8 max-w-sm" />
      <Reveal><div className="flex flex-wrap gap-2">{list.map((t) => <Link key={t.slug} to={`/tags/${t.slug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 transition-colors hover:border-fg hover:text-fg" style={{ fontSize: `${Math.min(18, 12 + t.count)}px` }}>#{t.name} <span className="font-mono text-[11px] text-fg-3">{t.count}</span></Link>)}</div></Reveal>
    </div>
  );
}

export function TagPage() {
  const { tag } = useParams();
  const { entries, tools, prompts } = byTag(tag ?? "");
  const name = allTags().find((t) => t.slug === tag)?.name ?? tag;
  const total = entries.length + tools.length + prompts.length;
  useSeo({ title: `#${name}`, description: `${total} itens sobre ${name}: ferramentas, prompts, notícias, artigos e tutoriais.`, path: `/tags/${tag}` });
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Tags", path: "/tags" }, { name: `#${name}` }]} />
      <PageHeader eyebrow={`${total} itens`} title={`#${name}`} />
      {total === 0 && <Empty icon="Tag" title="Nenhum conteúdo com esta tag" action={<Link to="/tags"><Button variant="outline">Ver todas as tags</Button></Link>} />}
      {tools.length > 0 && <section className="mb-12"><h2 className="h-title mb-4 text-xl">Ferramentas</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tools.map((t) => <ToolCard key={t.slug} tool={t} compact />)}</div></section>}
      {prompts.length > 0 && <section className="mb-12"><h2 className="h-title mb-4 text-xl">Prompts</h2><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{prompts.map((p) => <PromptCard key={p.slug} prompt={p} />)}</div></section>}
      {entries.length > 0 && <section><h2 className="h-title mb-6 text-xl">Conteúdos</h2><div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{entries.map((e) => <ContentCard key={`${e.kind}-${e.slug}`} entry={e} />)}</div></section>}
      <div className="mt-10 flex items-center gap-2 text-sm text-fg-3"><Heart size={14} /> Dica: favorite itens para receber recomendações relacionadas na página inicial.</div>
    </div>
  );
}
