import { CheckCircle2, Clock, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toolBySlug } from "@/data/tools";
import { CATEGORIES, categoryName, contentByKind, contentPath, findContent } from "@/lib/content";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import type { ContentItem, ContentKind, GuideItem, TutorialItem, VideoItem } from "@/lib/types";
import { KIND_LABEL, KIND_PATH, normalize, slugify } from "@/lib/utils";
import { Container, PageHeader } from "@/components/layout/Shell";
import { ContentRow, FeatureCard, MiniList, VideoCard } from "@/components/content/Cards";
import { ArticleLayout, ContentBody, JumpLink, TOC } from "@/components/content/Body";
import { Accordion, Empty, Skeleton, SkeletonList, Tabs } from "@/components/ui/feedback";
import { AdSlot, Newsletter } from "@/components/ui/monetization";
import { Input, Segmented } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";

const META: Record<ContentKind, { title: string; description: string; eyebrow: string }> = {
  news: { title: "Notícias de IA e tecnologia", description: "Análises editoriais sobre o que muda em IA, desenvolvimento, hardware e negócios. Curadoria própria, sem republicação automática.", eyebrow: "Notícias" },
  article: { title: "Blog", description: "Artigos de análise e opinião sobre IA, design, produto, programação e finanças — com tese, exemplos e números.", eyebrow: "Blog" },
  tutorial: { title: "Tutoriais passo a passo", description: "Guias práticos com passos numerados, código e ferramentas da plataforma para aplicar na hora.", eyebrow: "Tutoriais" },
  guide: { title: "Guias completos", description: "Conteúdo de referência em capítulos, para ler em ordem ou consultar quando precisar.", eyebrow: "Guias" },
  video: { title: "Vídeos", description: "Aulas e demonstrações em vídeo com pontos-chave e resumo em texto para consulta rápida.", eyebrow: "Vídeos" },
  tool: { title: "", description: "", eyebrow: "" },
  prompt: { title: "", description: "", eyebrow: "" },
};

/** Simulates async loading so skeleton states are real and testable; data is local. */
function useSimulatedLoad(deps: unknown[]) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loading;
}

export function ContentList({ kind }: { kind: ContentKind }) {
  const m = META[kind];
  useSEO({ title: m.title, description: m.description, path: KIND_PATH[kind] });
  const all = contentByKind(kind);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"recent" | "old" | "read">("recent");
  const cats = CATEGORIES.filter((c) => all.some((x) => x.category === c.slug));
  const loading = useSimulatedLoad([kind, cat]);
  const list = useMemo(() => {
    const nq = normalize(q);
    let arr = all.filter((x) => (cat === "all" || x.category === cat) && (!nq || normalize(`${x.title} ${x.excerpt} ${x.tags.join(" ")}`).includes(nq)));
    if (sort === "old") arr = [...arr].reverse();
    if (sort === "read") arr = [...arr].sort((a, b) => a.readingTime - b.readingTime);
    return arr;
  }, [all, q, cat, sort]);
  const lead = !q && cat === "all" ? all.find((x) => x.featured) : undefined;
  return (
    <Container wide>
      <PageHeader eyebrow={`${all.length} ${m.eyebrow.toLowerCase()}`} title={m.title} description={m.description} crumbs={[{ label: m.eyebrow }]} />
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filtrar ${m.eyebrow.toLowerCase()}…`} className="lg:max-w-sm" aria-label="Filtrar" />
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={cat} onChange={setCat} tabs={[{ value: "all", label: "Todas", count: all.length }, ...cats.map((c) => ({ value: c.slug, label: c.name, count: all.filter((x) => x.category === c.slug).length }))]} className="border-b-0" />
          <Segmented value={sort} onChange={setSort} options={[{ value: "recent", label: "Recentes" }, { value: "old", label: "Antigos" }, { value: "read", label: "Mais curtos" }]} />
        </div>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {loading ? (
            kind === "video" ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i}><Skeleton className="aspect-video" /><Skeleton className="mt-3 h-4 w-3/4" /><Skeleton className="mt-2 h-3 w-full" /></div>)}</div>
            ) : (
              <SkeletonList rows={6} />
            )
          ) : !list.length ? (
            <Empty title="Nada por aqui" description="Tente outro filtro ou termo." />
          ) : kind === "video" ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{(list as VideoItem[]).map((v) => <VideoCard key={v.slug} video={v} />)}</div>
          ) : kind === "guide" ? (
            <div className="grid gap-4 sm:grid-cols-2">{(list as GuideItem[]).map((g) => <FeatureCard key={g.slug} item={g} />)}</div>
          ) : (
            <>
              {lead && <Reveal className="mb-6"><FeatureCard item={lead} big /></Reveal>}
              <div className="divide-y divide-[var(--line)] border-t border-line">{list.filter((x) => x !== lead).map((x) => <ContentRow key={x.slug} item={x} />)}</div>
            </>
          )}
        </div>
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <MiniList title="Categorias" items={cats.map((c) => ({ title: c.name, path: `/categorias/${c.slug}`, meta: String(all.filter((x) => x.category === c.slug).length) }))} />
          <AdSlot format="rectangle" id={`${kind}-list-side`} />
          <Newsletter compact />
        </aside>
      </div>
    </Container>
  );
}

/* ------------------------------ Detail pages ------------------------------ */

function useDetail(kind: ContentKind) {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? findContent(kind, slug) : undefined;
  const { pushHistory } = useStore();
  useSEO({ title: item?.title ?? KIND_LABEL[kind], description: item?.excerpt ?? "", path: item ? contentPath(item) : "/", type: "article", publishedAt: item?.publishedAt, keywords: item?.tags });
  useEffect(() => {
    if (item) pushHistory({ kind, slug: item.slug, title: item.title, path: contentPath(item) });
    window.scrollTo({ top: 0 });
  }, [item, kind, pushHistory]);
  return item;
}

function Crumbs({ item }: { item: ContentItem }) {
  return (
    <div className="pt-6">
      <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-wider text-subtle">
        <Link to="/" className="hover:text-fg">Início</Link> / <Link to={KIND_PATH[item.kind]} className="hover:text-fg">{META[item.kind].eyebrow}</Link> / <Link to={`/categorias/${item.category}`} className="hover:text-fg">{categoryName(item.category)}</Link>
      </nav>
    </div>
  );
}

function DefaultSidebar({ item, extraToc }: { item: ContentItem; extraToc?: { id: string; label: string }[] }) {
  return (
    <>
      <TOC blocks={item.body} extra={extraToc} />
      <AdSlot format="rectangle" id={`${item.kind}-${item.slug}-side`} />
      <Newsletter compact />
    </>
  );
}

export function NewsDetail() {
  const item = useDetail("news");
  if (!item) return <Navigate to="/404" replace />;
  return (
    <Container wide>
      <Crumbs item={item} />
      <div className="py-8">
        <ArticleLayout item={item} sidebar={<DefaultSidebar item={item} />}>
          {item.source && <p className="mb-6 font-mono text-[11px] uppercase tracking-wider text-subtle">Fonte: {item.source.name} · conteúdo editorial local, preparado para ingestão futura via RSS/API</p>}
          <ContentBody blocks={item.body} />
        </ArticleLayout>
      </div>
    </Container>
  );
}

export function ArticleDetail() {
  const item = useDetail("article");
  if (!item) return <Navigate to="/404" replace />;
  return (
    <Container wide>
      <Crumbs item={item} />
      <div className="py-8">
        <ArticleLayout item={item} sidebar={<DefaultSidebar item={item} />}>
          <ContentBody blocks={item.body} />
        </ArticleLayout>
      </div>
    </Container>
  );
}

export function TutorialDetail() {
  const item = useDetail("tutorial") as TutorialItem | undefined;
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => setDone([]), [item?.slug]);
  if (!item) return <Navigate to="/404" replace />;
  const tools = (item.toolsUsed ?? []).map(toolBySlug).filter(Boolean);
  return (
    <Container wide>
      <Crumbs item={item} />
      <div className="py-8">
        <ArticleLayout
          item={item}
          kindLabel={`Tutorial · ${item.level} · ${item.steps.length} passos`}
          sidebar={
            <>
              <div className="border-t border-strong pt-3">
                <div className="eyebrow mb-2">Progresso</div>
                <div className="font-display text-3xl font-bold">{done.length}/{item.steps.length}</div>
                <div className="mt-2 h-1.5 w-full bg-[var(--line)]"><div className="h-full bg-mint transition-all duration-500" style={{ width: `${(done.length / item.steps.length) * 100}%` }} /></div>
              </div>
              <TOC blocks={[]} extra={item.steps.map((s, i) => ({ id: `passo-${i + 1}`, label: `${i + 1}. ${s.title}` }))} />
              {tools.length > 0 && <MiniList title="Ferramentas usadas" items={tools.map((t) => ({ title: t!.name, path: `/ferramentas/${t!.slug}` }))} />}
              <AdSlot format="rectangle" id={`tutorial-${item.slug}`} />
            </>
          }
        >
          <ContentBody blocks={item.body} />
          <ol className="mt-10 space-y-6">
            {item.steps.map((s, i) => {
              const ok = done.includes(i);
              return (
                <li key={i} id={`passo-${i + 1}`} className={`border-l-2 pl-5 transition-colors ${ok ? "border-mint" : "border-line"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display text-xl font-bold leading-snug"><span className="mr-2 font-mono text-sm text-subtle">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
                    <button onClick={() => setDone((d) => (ok ? d.filter((x) => x !== i) : [...d, i]))} aria-pressed={ok} className={`inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 text-xs ${ok ? "border-mint text-mint" : "border-line text-muted hover:border-strong"}`}><CheckCircle2 className="h-3.5 w-3.5" /> {ok ? "Feito" : "Marcar"}</button>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
                  {s.code && <pre className="mt-3 overflow-x-auto border border-line bg-[#0f0f0e] p-4 font-mono text-[13px] leading-relaxed text-[#e9e9e4]"><code>{s.code}</code></pre>}
                </li>
              );
            })}
          </ol>
        </ArticleLayout>
      </div>
    </Container>
  );
}

export function GuideDetail() {
  const item = useDetail("guide") as GuideItem | undefined;
  if (!item) return <Navigate to="/404" replace />;
  return (
    <Container wide>
      <Crumbs item={item} />
      <div className="py-8">
        <ArticleLayout item={item} kindLabel={`Guia · ${item.chapters.length} capítulos · ${item.readingTime} min`} sidebar={<DefaultSidebar item={item} extraToc={item.chapters.map((c, i) => ({ id: slugify(`cap-${i + 1}-${c.title}`), label: `${i + 1}. ${c.title}` }))} />}>
          <ContentBody blocks={item.body} />
          <div className="mt-8 border border-line">
            <div className="border-b border-line px-5 py-3 eyebrow">Índice do guia</div>
            <ol className="divide-y divide-[var(--line)]">{item.chapters.map((c, i) => <li key={i}><JumpLink to={slugify(`cap-${i + 1}-${c.title}`)} className="flex items-start gap-4 px-5 py-3 transition-colors hover:bg-elev"><span className="font-mono text-sm text-subtle">{String(i + 1).padStart(2, "0")}</span><span><span className="block font-medium">{c.title}</span><span className="block text-sm text-muted">{c.summary}</span></span></JumpLink></li>)}</ol>
          </div>
          {item.chapters.map((c, i) => (
            <section key={i} id={slugify(`cap-${i + 1}-${c.title}`)} className="mt-14 scroll-mt-24">
              <div className="eyebrow">Capítulo {i + 1}</div>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{c.title}</h2>
              <p className="mt-2 text-muted">{c.summary}</p>
              <div className="mt-5"><ContentBody blocks={c.body} /></div>
            </section>
          ))}
        </ArticleLayout>
      </div>
    </Container>
  );
}

export function VideoDetail() {
  const item = useDetail("video") as VideoItem | undefined;
  if (!item) return <Navigate to="/404" replace />;
  return (
    <Container wide>
      <Crumbs item={item} />
      <div className="py-8">
        <ArticleLayout
          item={item}
          kindLabel={`Vídeo · ${item.duration} · ${item.channel}`}
          sidebar={
            <>
              <div className="border-t border-strong pt-3">
                <div className="eyebrow mb-2">Pontos-chave</div>
                <ul className="space-y-2">{item.keyPoints.map((k) => <li key={k} className="flex gap-2 text-sm"><span className="mt-2 h-1 w-1 shrink-0 bg-accent" />{k}</li>)}</ul>
              </div>
              <AdSlot format="rectangle" id={`video-${item.slug}`} />
              <Newsletter compact />
            </>
          }
        >
          <div className="relative aspect-video overflow-hidden border border-strong bg-fg text-bg">
            {item.youtubeId ? (
              <iframe title={item.title} src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
                <div className="grid-lines absolute inset-0 opacity-30" />
                <span className="relative flex h-16 w-16 items-center justify-center border border-current/40"><Play className="ml-1 h-6 w-6 fill-current" /></span>
                <div className="relative px-6">
                  <div className="font-display text-lg font-semibold">Player reservado</div>
                  <p className="mt-1 max-w-sm text-xs opacity-70">Este espaço recebe o embed do vídeo (YouTube/Vimeo) ao preencher <code className="font-mono">youtubeId</code> no conteúdo. Abaixo, o resumo em texto está completo.</p>
                </div>
                <span className="absolute bottom-3 right-3 flex items-center gap-1 font-mono text-xs opacity-70"><Clock className="h-3 w-3" /> {item.duration}</span>
              </div>
            )}
          </div>
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold">Resumo do vídeo</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.transcriptSummary}</p>
          </div>
          <div className="mt-8"><ContentBody blocks={item.body} /></div>
          <div className="mt-8">
            <h2 className="mb-2 font-display text-xl font-bold">Capítulos</h2>
            <Accordion items={item.keyPoints.map((k, i) => ({ q: `${i + 1}. ${k}`, a: `Trecho do vídeo dedicado a "${k.toLowerCase()}". Use os pontos-chave como guia de revisão depois de assistir.` }))} />
          </div>
        </ArticleLayout>
      </div>
    </Container>
  );
}
