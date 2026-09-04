import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ARTICLES } from "@/data/articles";
import { GUIDES, TUTORIALS, VIDEOS } from "@/data/learning";
import { NEWS } from "@/data/news";
import { PROMPTS, PROMPT_CATEGORIES } from "@/data/prompts";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";
import { ALL_CONTENT, recommend, rotation, SEARCH_INDEX } from "@/lib/content";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import { KIND_LABEL } from "@/lib/utils";
import { Container, SectionHeader } from "@/components/layout/Shell";
import { ContentRow, FeatureCard, MiniList, PromptCard, ToolCard, VideoCard } from "@/components/content/Cards";
import { AnimatedBackground, CountUp, Marquee, Reveal, SplitText, Stagger, StaggerItem } from "@/components/ui/motion";
import { AdSlot, Newsletter, ProductBox } from "@/components/ui/monetization";
import { Button } from "@/components/ui/primitives";

export default function Home() {
  useSEO({ title: "Nexo — IA, tecnologia e ferramentas que funcionam", description: "Mais de 70 ferramentas online, central de prompts com builder, notícias, tutoriais e guias sobre IA e tecnologia. Grátis, sem cadastro, direto no navegador.", path: "/" });
  const { history, favorites } = useStore();
  const featuredTools = TOOLS.filter((t) => t.featured);
  const todaysTools = rotation(TOOLS.filter((t) => !t.featured), 8);
  const featured = ALL_CONTENT.filter((c) => c.featured);
  const lead = featured[0] ?? ALL_CONTENT[0];
  const secondary = featured.filter((c) => c !== lead).slice(0, 2);
  const latestNews = NEWS.slice(0, 6);
  const recs = recommend([...history.map((h) => h.id), ...favorites.map((f) => f.id)].slice(0, 10), 5);
  const promptPicks = rotation(PROMPTS, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <AnimatedBackground className="opacity-70 dark:opacity-60" />
        <Container wide className="relative">
          <div className="grid gap-10 pb-16 pt-14 lg:grid-cols-12 lg:pb-24 lg:pt-24">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3">
                <span className="eyebrow">Plataforma independente · 100% no navegador</span>
              </div>
              <h1 className="display-xl mt-6 text-[2.75rem] sm:text-6xl lg:text-[5.5rem]">
                <SplitText text="Ferramentas, prompts e" as="span" className="block" />
                <SplitText text="clareza sobre IA." as="span" className="block text-accent" delay={0.2} />
              </h1>
              <Reveal delay={0.5} className="mt-8 max-w-xl">
                <p className="text-lg leading-relaxed text-muted sm:text-xl">
                  Calculadoras, conversores, geradores e um Prompt Builder que funcionam de verdade — acompanhados de notícias, tutoriais e guias escritos para quem quer usar tecnologia, não só ler sobre ela.
                </p>
              </Reveal>
              <Reveal delay={0.6} className="mt-8 flex flex-wrap gap-3">
                <Button to="/ferramentas" size="lg">
                  Explorar ferramentas <ArrowRight className="h-4 w-4" />
                </Button>
                <Button to="/prompts/builder" size="lg" variant="secondary">
                  <Sparkles className="h-4 w-4" /> Abrir Prompt Builder
                </Button>
              </Reveal>
            </div>
            <Reveal delay={0.4} className="lg:col-span-4 lg:self-end">
              <div className="grid grid-cols-3 gap-px border border-line bg-[var(--line)] lg:grid-cols-1">
                {[
                  { n: TOOLS.length, l: "ferramentas", s: "+" },
                  { n: PROMPTS.length, l: "prompts", s: "" },
                  { n: SEARCH_INDEX.length, l: "páginas indexadas", s: "+" },
                ].map((s) => (
                  <div key={s.l} className="bg-page p-4 lg:p-5">
                    <div className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
                      <CountUp to={s.n} suffix={s.s} />
                    </div>
                    <div className="eyebrow mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
        <Marquee items={[...TOOL_CATEGORIES.map((c) => c.name), "Prompt Builder", "Notícias", "Tutoriais", "Guias", "Vídeos"]} className="border-b-0" />
      </section>

      {/* FERRAMENTAS EM DESTAQUE */}
      <Container wide className="pt-16">
        <SectionHeader eyebrow="Ferramentas" title="As mais usadas" to="/ferramentas" toLabel={`Ver todas (${TOOLS.length})`} />
        <Stagger className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {featuredTools.map((t, i) => (
            <StaggerItem key={t.slug}>
              <ToolCard tool={t} index={i} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {TOOL_CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/ferramentas/categoria/${c.slug}`} className="group flex items-center justify-between border border-line px-4 py-3 text-sm font-medium transition-colors hover:border-strong">
              {c.name}
              <span className="font-mono text-[11px] text-subtle group-hover:text-accent">{TOOLS.filter((t) => t.category === c.slug).length}</span>
            </Link>
          ))}
        </div>
      </Container>

      {/* EDITORIAL */}
      <Container wide className="pt-20">
        <SectionHeader eyebrow="Editorial" title="Em destaque" to="/noticias" />
        <div className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <FeatureCard item={lead} big />
          </Reveal>
          <div className="grid gap-4 lg:col-span-5">
            {secondary.map((c, i) => (
              <Reveal key={c.slug} delay={0.1 * (i + 1)}>
                <FeatureCard item={c} />
              </Reveal>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-2 flex items-center justify-between border-b border-strong pb-2">
              <span className="eyebrow">Últimas notícias</span>
              <span className="font-mono text-[11px] text-subtle">rotação editorial interna</span>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {latestNews.map((n) => (
                <ContentRow key={n.slug} item={n} />
              ))}
            </div>
            <Link to="/noticias" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium link-underline">
              Todas as notícias <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <aside className="space-y-8">
            <MiniList title={history.length || favorites.length ? "Recomendado para você" : "Para começar"} items={recs.map((r) => ({ title: r.title, path: r.path, meta: KIND_LABEL[r.kind] }))} />
            <AdSlot format="rectangle" id="home-side" />
            <ProductBox title="Kit de prompts profissionais" description="Espaço reservado para o seu primeiro produto digital: 100 prompts testados, em PDF e Notion." price="em breve" />
          </aside>
        </div>
      </Container>

      {/* PROMPTS */}
      <section className="mt-20 border-y border-line bg-elev">
        <Container wide className="py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Central de prompts</div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Prompts que você entende, não só copia.</h2>
              <p className="mt-4 text-muted">{PROMPTS.length} prompts em {PROMPT_CATEGORIES.length} categorias, com variáveis destacadas. Ou monte o seu no Prompt Builder: objetivo, contexto, público, tom, formato, detalhe, plataforma e resultado esperado.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to="/prompts/builder">Prompt Builder</Button>
                <Button to="/prompts" variant="secondary">Ver biblioteca</Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-1.5">
                {PROMPT_CATEGORIES.map((c) => (
                  <Link key={c.slug} to={`/prompts/categoria/${c.slug}`} className="border border-line px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-strong hover:text-fg">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <Stagger className="grid gap-4 md:grid-cols-3 lg:col-span-8">
              {promptPicks.map((p) => (
                <StaggerItem key={p.slug} className="h-full">
                  <PromptCard prompt={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* APRENDER */}
      <Container wide className="pt-20">
        <SectionHeader eyebrow="Aprender" title="Tutoriais, guias e vídeos" />
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <div className="eyebrow mb-2 border-b border-strong pb-2">Tutoriais</div>
            <ul className="divide-y divide-[var(--line)]">
              {TUTORIALS.slice(0, 4).map((t) => (
                <li key={t.slug}>
                  <Link to={`/tutoriais/${t.slug}`} className="group flex items-start justify-between gap-3 py-3">
                    <div>
                      <div className="font-medium leading-snug transition-colors group-hover:text-accent">{t.title}</div>
                      <div className="mt-1 text-xs text-muted">
                        {t.level} · {t.steps.length} passos
                      </div>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-subtle" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/tutoriais" className="mt-3 inline-block text-sm font-medium link-underline">
              Todos os tutoriais
            </Link>
          </div>
          <div>
            <div className="eyebrow mb-2 border-b border-strong pb-2">Guias completos</div>
            <ul className="divide-y divide-[var(--line)]">
              {GUIDES.slice(0, 4).map((g) => (
                <li key={g.slug}>
                  <Link to={`/guias/${g.slug}`} className="group flex items-start justify-between gap-3 py-3">
                    <div>
                      <div className="font-medium leading-snug transition-colors group-hover:text-accent">{g.title}</div>
                      <div className="mt-1 text-xs text-muted">
                        {g.chapters.length} capítulos · {g.readingTime} min
                      </div>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-subtle" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/guias" className="mt-3 inline-block text-sm font-medium link-underline">
              Todos os guias
            </Link>
          </div>
          <div>
            <div className="eyebrow mb-2 border-b border-strong pb-2">Vídeo em destaque</div>
            <VideoCard video={VIDEOS.find((v) => v.featured) ?? VIDEOS[0]} />
            <Link to="/videos" className="mt-3 inline-block text-sm font-medium link-underline">
              Todos os vídeos
            </Link>
          </div>
        </div>
      </Container>

      {/* ROTAÇÃO DO DIA */}
      <Container wide className="pt-20">
        <SectionHeader eyebrow="Rotação de hoje" title="Ferramentas para descobrir" />
        <div className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {todaysTools.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-subtle">A seleção muda diariamente a partir do catálogo local — sem chamadas externas.</p>
      </Container>

      {/* BLOG + NEWSLETTER */}
      <Container wide className="pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <SectionHeader eyebrow="Blog" title="Análises e opinião" to="/blog" />
            <div className="divide-y divide-[var(--line)]">
              {ARTICLES.slice(0, 5).map((a) => (
                <ContentRow key={a.slug} item={a} />
              ))}
            </div>
          </div>
          <div className="space-y-10">
            <Newsletter />
            <AdSlot format="rectangle" id="home-bottom" />
          </div>
        </div>
      </Container>
    </>
  );
}
