import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Clock, ExternalLink, PlayCircle, Share2 } from "lucide-react";
import { toolBySlug } from "@/data/tools";
import { CATEGORIES, categoryName, contentByKind, findContent, relatedContent, tagSlug } from "@/lib/content";
import type { ContentItem, ContentKind } from "@/lib/types";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import { copyToClipboard, formatDate, KIND_LABEL, KIND_PATH } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Shell";
import { Badge, Button, Empty, PageHeader, Select } from "@/components/ui/primitives";
import { FavoriteButton } from "@/components/ui/feedback";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { AdBanner, AdInArticle, AdSidebar } from "@/components/ui/monetization";
import { ContentCard, ToolCard } from "@/components/content/Cards";
import { Body, TableOfContents } from "@/components/content/Body";

const META: Record<ContentKind, { title: string; eyebrow: string; description: string }> = {
  news: { title: "Notícias de IA e tecnologia", eyebrow: "Notícias", description: "Análises editoriais sobre IA, hardware, regulação, mercado e produto — o que mudou e o que fazer a respeito." },
  article: { title: "Blog", eyebrow: "Blog", description: "Artigos aprofundados sobre prompts, programação, design, finanças e produtividade — com exemplos e método." },
  tutorial: { title: "Tutoriais passo a passo", eyebrow: "Tutoriais", description: "Guias práticos com etapas numeradas, código quando necessário e as ferramentas usadas em cada passo." },
  guide: { title: "Guias completos", eyebrow: "Guias", description: "Conteúdo organizado em capítulos para dominar um tema do início ao fim." },
  video: { title: "Vídeos", eyebrow: "Vídeos", description: "Resumos, pontos-chave e transcrições comentadas de vídeos sobre IA, tecnologia e produtividade." },
  tool: { title: "", eyebrow: "", description: "" }, prompt: { title: "", eyebrow: "", description: "" },
};

export function ContentIndex({ kind }: { kind: ContentKind }) {
  const m = META[kind];
  useSEO({ title: m.title, description: m.description, path: KIND_PATH[kind], breadcrumbs: [{ label: m.eyebrow, path: KIND_PATH[kind] }] });
  const [sp, setSp] = useSearchParams();
  const cat = sp.get("cat") ?? "all"; const sort = sp.get("sort") ?? "recent";
  const all = contentByKind(kind);
  const cats = CATEGORIES.filter((c) => all.some((i) => i.category === c.slug));
  const list = useMemo(() => { const l = all.filter((i) => cat === "all" || i.category === cat); return sort === "old" ? [...l].reverse() : sort === "read" ? [...l].sort((a, b) => a.readingTime - b.readingTime) : l; }, [all, cat, sort]);
  const [page, setPage] = useState(1); const per = 9;
  useEffect(() => setPage(1), [cat, sort]);
  const featured = cat === "all" && sort === "recent" ? list.find((i) => i.featured) ?? list[0] : null;
  const rest = featured ? list.filter((i) => i.slug !== featured.slug) : list;
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: m.eyebrow }]} />
      <PageHeader eyebrow={m.eyebrow} title={m.title} description={m.description} />
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">{[{ slug: "all", name: "Todas" }, ...cats].map((c) => <button key={c.slug} onClick={() => { const n = new URLSearchParams(sp); c.slug === "all" ? n.delete("cat") : n.set("cat", c.slug); setSp(n); }} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${cat === c.slug ? "border-fg bg-fg text-bg" : "bg-surface hover:bg-surface-2"}`}>{c.name}</button>)}</div>
        <div className="ml-auto w-44"><Select value={sort} onChange={(e) => { const n = new URLSearchParams(sp); n.set("sort", e.target.value); setSp(n); }}><option value="recent">Mais recentes</option><option value="old">Mais antigos</option><option value="read">Leitura mais rápida</option></Select></div>
      </div>
      {featured && <Reveal><ContentCard item={featured} size="lg" className="mb-8" /></Reveal>}
      {rest.length ? <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delay={0.04}>{rest.slice(0, page * per).map((c) => <StaggerItem key={c.slug}><ContentCard item={c} /></StaggerItem>)}</Stagger> : <Empty title="Nada por aqui ainda" description="Tente outra categoria." />}
      {rest.length > page * per && <div className="mt-8 text-center"><Button variant="outline" onClick={() => setPage(page + 1)}>Carregar mais</Button></div>}
      <AdBanner />
    </div>
  );
}

export function ContentPage({ kind }: { kind: ContentKind }) {
  const { slug = "" } = useParams();
  const item = findContent(kind, slug);
  const { pushHistory, toast } = useStore();
  const path = `${KIND_PATH[kind]}/${slug}`;
  useSEO({ title: item?.title ?? "Conteúdo", description: item?.excerpt ?? "", path, type: "article", publishedAt: item?.publishedAt, keywords: item?.tags, breadcrumbs: item ? [{ label: META[kind].eyebrow, path: KIND_PATH[kind] }, { label: item.title, path }] : undefined });
  useEffect(() => { if (item) pushHistory({ kind, slug: item.slug, title: item.title, path }); }, [item, kind, path, pushHistory]);
  if (!item) return <Navigate to={KIND_PATH[kind]} replace />;
  const related = relatedContent(item, 4);
  const share = async () => { const url = window.location.href; if (navigator.share) { try { await navigator.share({ title: item.title, url }); return; } catch { /* cancelado */ } } await copyToClipboard(url); toast({ title: "Link copiado" }); };
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: META[kind].eyebrow, path: KIND_PATH[kind] }, { label: categoryName(item.category), path: `/categorias/${item.category}` }, { label: item.title }]} />
      <article className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 max-w-3xl">
          <header>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-fg-3"><Badge tone="brand">{KIND_LABEL[kind]}</Badge><Link to={`/categorias/${item.category}`} className="hover:text-fg">{categoryName(item.category)}</Link><span>·</span><time dateTime={item.publishedAt}>{formatDate(item.publishedAt, { day: "2-digit", month: "long", year: "numeric" })}</time><span>·</span><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.readingTime} min</span></div>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.6rem]">{item.title}</h1>
            <p className="mt-4 text-lg leading-8 text-fg-2">{item.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y py-4">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-sm font-semibold">{item.author[0]}</span><div><p className="text-sm font-medium">{item.author}</p><p className="text-xs text-fg-3">{item.kind === "video" ? "Canal" : "Equipe editorial Nexo"}</p></div></div>
              <div className="flex gap-2"><FavoriteButton kind={kind} slug={item.slug} title={item.title} path={path} /><Button size="sm" variant="outline" onClick={share}><Share2 className="h-4 w-4" />Compartilhar</Button></div>
            </div>
          </header>

          {item.kind === "video" && <VideoBlock item={item} />}
          <div className="lg:hidden mt-6"><TableOfContents blocks={item.body} /></div>
          <div className="mt-2"><Body blocks={item.body.slice(0, Math.ceil(item.body.length / 2))} /></div>
          {item.body.length > 3 && <AdInArticle />}
          <Body blocks={item.body.slice(Math.ceil(item.body.length / 2))} />

          {item.kind === "tutorial" && <TutorialSteps item={item} />}
          {item.kind === "guide" && <GuideChapters item={item} />}
          {item.kind === "video" && <VideoExtras item={item} />}

          {item.source && <p className="mt-8 text-xs text-fg-3">Fonte: {item.source.name}. Conteúdo editorial produzido localmente; não há atualização automática via internet.</p>}
          <div className="mt-8 flex flex-wrap gap-2">{item.tags.map((t) => <Link key={t} to={`/tags/${tagSlug(t)}`} className="rounded-full border bg-surface px-3 py-1 text-xs text-fg-2 hover:bg-surface-2">#{t}</Link>)}</div>

          {related.length > 0 && <section className="mt-14"><h2 className="mb-5 text-xl font-semibold tracking-tight">Leia também</h2><div className="grid gap-4 sm:grid-cols-2">{related.map((r) => <ContentCard key={r.slug} item={r} size="sm" />)}</div></section>}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block"><TableOfContents blocks={item.body} /></div>
          {"toolsUsed" in item && item.toolsUsed && item.toolsUsed.length > 0 && <div><p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-fg-3">Ferramentas usadas</p><div className="space-y-3">{item.toolsUsed.map(toolBySlug).filter(Boolean).map((t) => <ToolCard key={t!.slug} tool={t!} compact />)}</div></div>}
          <AdSidebar />
        </aside>
      </article>
    </div>
  );
}

function VideoBlock({ item }: { item: Extract<ContentItem, { kind: "video" }> }) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border bg-black">
      {item.youtubeId ? <iframe className="aspect-video w-full" src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`} title={item.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div className="relative aspect-video w-full bg-gradient-to-br from-neutral-800 to-neutral-950 text-white"><div className="absolute inset-0 grid place-items-center text-center"><div><PlayCircle className="mx-auto h-14 w-14 opacity-80" /><p className="mt-3 text-sm opacity-80">{item.channel} · {item.duration}</p><p className="mt-1 max-w-sm text-xs opacity-60">Vídeo referenciado editorialmente — resumo e pontos-chave abaixo.</p></div></div></div>}
    </div>
  );
}
function VideoExtras({ item }: { item: Extract<ContentItem, { kind: "video" }> }) {
  return (
    <section className="mt-10 space-y-6">
      <div className="rounded-2xl border bg-surface p-6"><h2 className="text-lg font-semibold">Pontos-chave</h2><ul className="mt-3 space-y-2">{item.keyPoints.map((k, i) => <li key={i} className="flex gap-3 text-sm leading-6 text-fg-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{k}</li>)}</ul></div>
      <div className="flex flex-wrap gap-3 text-sm text-fg-3"><span>Canal: <strong className="text-fg-2">{item.channel}</strong></span><span>Duração: {item.duration}</span>{item.youtubeId && <a className="flex items-center gap-1 text-brand hover:underline" href={`https://www.youtube.com/watch?v=${item.youtubeId}`} target="_blank" rel="noopener noreferrer">Abrir no YouTube <ExternalLink className="h-3.5 w-3.5" /></a>}</div>
    </section>
  );
}
function TutorialSteps({ item }: { item: Extract<ContentItem, { kind: "tutorial" }> }) {
  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center gap-3"><h2 className="text-2xl font-semibold tracking-tight">Passo a passo</h2><Badge>{item.level}</Badge></div>
      <ol className="space-y-6">{item.steps.map((s, i) => (
        <li key={i} className="relative rounded-2xl border bg-surface p-6 pl-16"><span className="absolute left-5 top-6 grid h-8 w-8 place-items-center rounded-full bg-fg text-sm font-semibold text-bg">{i + 1}</span><h3 className="text-lg font-semibold">{s.title}</h3><p className="mt-2 leading-7 text-fg-2">{s.text}</p>{s.code && <div className="prose-nexo"><pre><code>{s.code}</code></pre></div>}</li>
      ))}</ol>
    </section>
  );
}
function GuideChapters({ item }: { item: Extract<ContentItem, { kind: "guide" }> }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="mt-10">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">Capítulos</h2>
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <nav className="space-y-1 md:sticky md:top-24 md:self-start">{item.chapters.map((c, i) => <button key={i} onClick={() => setOpen(i)} className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${open === i ? "bg-surface-2 font-medium" : "text-fg-2 hover:bg-surface-2/60"}`}><span className="mr-2 font-mono text-xs text-fg-3">{String(i + 1).padStart(2, "0")}</span>{c.title}</button>)}</nav>
        <div className="rounded-2xl border bg-surface p-6 sm:p-8"><p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">Capítulo {open + 1}</p><h3 className="mt-2 text-2xl font-semibold tracking-tight">{item.chapters[open].title}</h3><p className="mt-2 text-fg-2">{item.chapters[open].summary}</p><div className="mt-4"><Body blocks={item.chapters[open].body} /></div><div className="mt-8 flex justify-between border-t pt-4">{open > 0 ? <Button variant="ghost" onClick={() => setOpen(open - 1)}>← Anterior</Button> : <span />}{open < item.chapters.length - 1 && <Button variant="outline" onClick={() => setOpen(open + 1)}>Próximo →</Button>}</div></div>
      </div>
    </section>
  );
}
