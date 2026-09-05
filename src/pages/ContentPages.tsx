import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, Share2, Search } from "lucide-react";
import type { Article, Video } from "@/lib/types";
import { categoriesOf, collections, entryPath, kindMeta, relatedEntries, relatedDocsForTags, sortByDate, sortByPopularity, type Entry } from "@/lib/content";
import { useSeo, articleLd, breadcrumbLd } from "@/lib/seo";
import { useTrackVisit } from "@/lib/store";
import { cn, coverClass, formatDate, slugify, SITE } from "@/lib/utils";
import { Breadcrumbs, PageHeader } from "@/components/layout/Shell";
import { Badge, Button, Chip, Empty, Input } from "@/components/ui/primitives";
import { CopyButton, FavoriteButton, useToast } from "@/components/ui/feedback";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ContentCard } from "@/components/content/Cards";
import { Body, tocFromBlocks } from "@/components/content/Body";
import { AdBanner, AdMobile, AdSidebar } from "@/components/ui/monetization";
import { NotFound } from "./StaticPages";

type Kind = keyof typeof collections;
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const descriptions: Record<Kind, string> = {
  news: "Notícias de inteligência artificial e tecnologia explicadas com contexto: o que aconteceu, por que importa e o que fazer com isso.",
  blog: "Artigos de opinião e análise sobre IA na prática, desenvolvimento, produtividade, finanças e segurança digital.",
  tutorial: "Tutoriais passo a passo, do iniciante ao avançado, para colocar a mão na massa com IA e tecnologia.",
  guide: "Guias completos e aprofundados para dominar um tema do início ao fim.",
  video: "Vídeos selecionados de canais de referência sobre IA, programação e design — com resumo e contexto.",
};

/* ---------- Listing ---------- */
export function ContentList({ kind }: { kind: Kind }) {
  const meta = kindMeta[kind];
  const { cat: catParam } = useParams();
  const cats = categoriesOf(kind);
  const activeCat = cats.find((c) => c.slug === catParam);
  useSeo({ title: activeCat ? `${activeCat.name} — ${meta.plural}` : meta.plural, description: activeCat ? `${meta.plural} sobre ${activeCat.name}. ${descriptions[kind]}` : descriptions[kind], path: activeCat ? `${meta.base}/categoria/${activeCat.slug}` : meta.base });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "pop">("new");
  const [level, setLevel] = useState<string>("all");
  const [page, setPage] = useState(1);
  const PER = 9;

  const list = useMemo(() => {
    let l = collections[kind] as Entry[];
    if (activeCat) l = l.filter((e) => slugify(e.category) === activeCat.slug);
    if (level !== "all") l = l.filter((e) => (e as Article).level === level);
    if (q) l = l.filter((e) => norm(`${e.title} ${e.excerpt} ${e.tags.join(" ")}`).includes(norm(q)));
    return sort === "new" ? sortByDate(l) : sortByPopularity(l);
  }, [kind, activeCat, q, sort, level]);
  const shown = list.slice(0, page * PER);
  const isLearning = kind === "tutorial" || kind === "guide";

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={activeCat ? [{ name: meta.plural, path: meta.base }, { name: activeCat.name }] : [{ name: meta.plural }]} />
      <PageHeader eyebrow={`${list.length} ${list.length === 1 ? "item" : "itens"}`} title={activeCat ? activeCat.name : meta.plural} description={descriptions[kind]} />
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3" /><Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={`Filtrar ${meta.plural.toLowerCase()}…`} className="pl-10" /></div>
        <div className="flex flex-wrap gap-2"><Chip active={sort === "new"} onClick={() => setSort("new")}>Recentes</Chip><Chip active={sort === "pop"} onClick={() => setSort("pop")}>Populares</Chip>{isLearning && ["iniciante", "intermediário", "avançado"].map((l) => <Chip key={l} active={level === l} onClick={() => setLevel(level === l ? "all" : l)} className="capitalize">{l}</Chip>)}</div>
      </div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        <Link to={meta.base}><Chip active={!activeCat}>Todas</Chip></Link>
        {cats.map((c) => <Link key={c.slug} to={`${meta.base}/categoria/${c.slug}`}><Chip active={activeCat?.slug === c.slug}>{c.name} ({c.count})</Chip></Link>)}
      </div>
      {shown.length === 0 ? <Empty icon="SearchX" title="Nada encontrado" description="Tente outro filtro ou termo." /> : (
        <>
          {!q && !activeCat && sort === "new" && page === 1 && <Reveal className="mb-10"><ContentCard entry={shown[0]} variant="feature" /></Reveal>}
          <Stagger className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {(!q && !activeCat && sort === "new" && page === 1 ? shown.slice(1) : shown).map((e, i) => (
              <StaggerItem key={e.slug} className={cn(i === 5 && "contents")}>
                {i === 5 && <div className="sm:col-span-2 lg:col-span-3"><AdBanner className="my-0" /></div>}
                <ContentCard entry={e} />
              </StaggerItem>
            ))}
          </Stagger>
          {shown.length < list.length && <div className="mt-10 text-center"><Button variant="outline" size="lg" onClick={() => setPage((p) => p + 1)}>Carregar mais ({list.length - shown.length} restantes)</Button></div>}
        </>
      )}
    </div>
  );
}

/* ---------- Detail ---------- */
export function ContentDetail({ kind }: { kind: Kind }) {
  const { slug } = useParams();
  const entry = (collections[kind] as Entry[]).find((e) => e.slug === slug);
  const meta = kindMeta[kind];
  const path = entry ? entryPath(entry) : "";
  useSeo({ title: entry?.title ?? "Conteúdo", description: entry?.excerpt, path, type: "article", jsonLd: entry ? [articleLd({ title: entry.title, excerpt: entry.excerpt, date: entry.date, author: entry.author, path }), breadcrumbLd([{ name: meta.plural, path: meta.base }, { name: entry.category, path: `${meta.base}/categoria/${slugify(entry.category)}` }, { name: entry.title, path }])] : undefined });
  useTrackVisit(entry ? { id: `${kind}:${entry.slug}`, kind, title: entry.title, path } : null);
  const { toast } = useToast();
  if (!entry) return <NotFound />;
  const related = relatedEntries(entry, 4);
  const relTools = relatedDocsForTags(entry.tags, `${kind}:${entry.slug}`, 6).filter((d) => d.kind === "tool" || d.kind === "prompt").slice(0, 4);
  const toc = tocFromBlocks(entry.body);
  const url = `${SITE.url}${path}`;
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: entry.title, url }); } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(url); toast({ title: "Link copiado", tone: "success" }); }
  };
  const video = entry.kind === "video" ? (entry as Video) : null;
  const art = entry as Article;

  return (
    <article className="container-x py-8">
      <Breadcrumbs items={[{ name: meta.plural, path: meta.base }, { name: entry.category, path: `${meta.base}/categoria/${slugify(entry.category)}` }, { name: entry.title }]} />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <header className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone="accent">{meta.label}</Badge>
              <Link to={`${meta.base}/categoria/${slugify(entry.category)}`} className="text-sm font-medium text-fg-2 hover:text-fg">{entry.category}</Link>
              {art.level && <Badge className="capitalize">{art.level}</Badge>}
            </div>
            <h1 className="h-display text-3xl sm:text-4xl lg:text-[44px]">{entry.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-fg-2">{entry.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3 text-sm text-fg-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {entry.author && <span className="font-medium text-fg-2">{entry.author}</span>}
                {video && <span className="font-medium text-fg-2">{video.channel}</span>}
                <time dateTime={entry.date}>{formatDate(entry.date, { day: "numeric", month: "long", year: "numeric" })}</time>
                <span className="inline-flex items-center gap-1"><Clock size={13} /> {video ? video.duration : `${entry.readTime} min de leitura`}</span>
              </div>
              <div className="flex gap-2"><FavoriteButton id={`${kind}:${entry.slug}`} kind={kind} title={entry.title} path={path} showLabel /><Button variant="outline" size="sm" className="h-9" onClick={share}><Share2 size={14} /> Compartilhar</Button></div>
            </div>
          </header>

          {video ? (
            <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-black"><div className="aspect-video"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`} title={entry.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" /></div></div>
          ) : (
            <div className={cn("mt-8 h-56 rounded-2xl bg-gradient-to-br sm:h-72", coverClass(entry.cover))} aria-hidden />
          )}

          {toc.length > 2 && (
            <nav className="mt-8 rounded-xl border border-line bg-bg-2 p-5 lg:hidden" aria-label="Neste artigo"><div className="eyebrow mb-2">Neste artigo</div><ol className="space-y-1.5 text-sm">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="text-fg-2 hover:text-fg">{t.text}</a></li>)}</ol></nav>
          )}

          <div className="mt-8 max-w-3xl"><Body blocks={entry.body} /></div>

          <AdMobile />

          <div className="mt-10 flex flex-wrap gap-2">{entry.tags.map((t) => <Link key={t} to={`/tags/${slugify(t)}`} className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 transition-colors hover:border-fg hover:text-fg">#{t}</Link>)}</div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-line bg-bg-2 p-4 text-sm text-fg-2"><span>Gostou? Compartilhe:</span><CopyButton text={url} label="Copiar link" /><Button variant="outline" size="sm" onClick={share}><Share2 size={14} /> Compartilhar</Button></div>

          {related.length > 0 && (
            <section className="mt-14"><h2 className="h-title mb-6 text-2xl">Leia também</h2><div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">{related.map((e) => <ContentCard key={e.slug} entry={e} />)}</div></section>
          )}
        </div>

        <aside className="space-y-8">
          {toc.length > 2 && (
            <nav className="hidden lg:block" aria-label="Neste artigo"><div className="eyebrow mb-3">Neste artigo</div><ol className="space-y-2 border-l border-line text-sm">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-4 text-fg-2 transition-colors hover:border-fg hover:text-fg">{t.text}</a></li>)}</ol></nav>
          )}
          {relTools.length > 0 && (
            <div><div className="eyebrow mb-3">Ferramentas e prompts relacionados</div><div className="space-y-2">{relTools.map((d) => <Link key={d.id} to={d.path} className="block rounded-xl border border-line p-3 transition-colors hover:bg-bg-2"><div className="text-[11px] font-semibold uppercase tracking-wider text-accent">{kindMeta[d.kind].label}</div><div className="text-sm font-medium text-fg">{d.title}</div></Link>)}</div></div>
          )}
          <AdSidebar />
          <div><div className="eyebrow mb-3">Mais {meta.plural.toLowerCase()}</div><div className="space-y-1">{sortByDate(collections[kind] as Entry[]).filter((e) => e.slug !== entry.slug).slice(0, 5).map((e) => <ContentCard key={e.slug} entry={e} variant="row" />)}</div></div>
        </aside>
      </div>
    </article>
  );
}
