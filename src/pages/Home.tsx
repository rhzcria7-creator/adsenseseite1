import { ArrowRight, Bot, Bookmark, Calculator, Newspaper, Search, ShieldCheck, Sparkles, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";
import { PROMPTS } from "@/data/prompts";
import { ALL_CONTENT, contentByKind, popular, recommend, rotation, trending } from "@/lib/content";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import { KIND_LABEL } from "@/lib/utils";
import { Button, SectionHeader } from "@/components/ui/primitives";
import { AmbientBackground, CountUp, Reveal, SplitText, Stagger, StaggerItem } from "@/components/ui/motion";
import { AdBanner } from "@/components/ui/monetization";
import { CategoryIcon, ContentCard, ContentRow, PromptCard, ToolCard } from "@/components/content/Cards";

export default function Home() {
  useSEO({ title: "Nexo — IA, tecnologia, ferramentas e prompts", description: "Mais de 90 ferramentas online, central de prompts, notícias, blog, tutoriais, guias e vídeos sobre IA e tecnologia. Gratuito, sem cadastro, tudo no navegador.", path: "/" });
  const { history, favorites } = useStore();
  const featuredTools = TOOLS.filter((t) => t.featured);
  const newest = rotation(TOOLS.filter((t) => !t.featured), 4);
  const news = contentByKind("news").slice(0, 5);
  const hero = ALL_CONTENT.find((c) => c.featured && c.kind !== "news") ?? ALL_CONTENT[0];
  const editorial = popular(ALL_CONTENT.filter((c) => c.slug !== hero.slug && c.kind !== "news"), 6);
  const hot = trending(6);
  const recs = recommend([...history.map((h) => h.id), ...favorites.map((f) => f.id)], 4);
  const prompts = rotation(PROMPTS, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <AmbientBackground />
        <div className="container-x pb-16 pt-14 sm:pb-24 sm:pt-24">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-surface/80 px-3 py-1 text-[12px] font-medium text-fg-2 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-ok" />{TOOLS.length} ferramentas · {PROMPTS.length} prompts · {ALL_CONTENT.length} conteúdos — tudo offline</p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"><SplitText text="Ferramentas, prompts e conhecimento" /> <span className="text-fg-3"><SplitText text="para trabalhar com IA de verdade." delay={0.25} /></span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-fg-2">Calculadoras, conversores, geradores e uma central de prompts que rodam no seu navegador — junto com notícias, guias e tutoriais escritos para quem quer entender, não só usar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" to="/ferramentas">Explorar ferramentas <ArrowRight className="h-4 w-4" /></Button>
              <Button size="lg" variant="outline" to="/prompts/builder"><Sparkles className="h-4 w-4" />Abrir Prompt Builder</Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-fg-3">
              <span className="flex items-center gap-2"><WifiOff className="h-4 w-4" />Sem servidor, sem cadastro</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Dados ficam no seu dispositivo</span><span className="flex items-center gap-2"><Search className="h-4 w-4" />Busca instantânea (⌘K)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x">
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" delay={0.06}>
          {TOOL_CATEGORIES.slice(0, 4).map((c) => (
            <StaggerItem key={c.slug}>
              <Link to={`/ferramentas/categoria/${c.slug}`} className="group flex items-center gap-4 rounded-2xl border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-2 hover:shadow-pop">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-fg-2 transition-colors group-hover:bg-brand-soft group-hover:text-brand"><CategoryIcon icon={c.icon} className="h-5 w-5" /></span>
                <span><span className="block font-medium">{c.name}</span><span className="block text-xs text-fg-3">{TOOLS.filter((t) => t.category === c.slug).length} ferramentas</span></span>
                <ArrowRight className="ml-auto h-4 w-4 text-fg-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-x mt-20">
        <SectionHeader eyebrow="Ferramentas" title="As mais usadas" description="Resultados instantâneos, com explicação, exemplos e FAQ em cada página." action={<Button variant="ghost" to="/ferramentas">Ver todas ({TOOLS.length}) <ArrowRight className="h-4 w-4" /></Button>} />
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...featuredTools.slice(0, 4), ...newest].map((t) => <StaggerItem key={t.slug}><ToolCard tool={t} /></StaggerItem>)}</Stagger>
      </section>

      <section className="container-x mt-20 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionHeader eyebrow="Destaque editorial" title="Leitura da semana" />
          <Reveal><ContentCard item={hero} size="lg" /></Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{editorial.slice(0, 3).map((c, i) => <Reveal key={c.slug} delay={i * 0.06}><ContentCard item={c} size="sm" /></Reveal>)}</div>
        </div>
        <aside className="space-y-8">
          <div className="rounded-2xl border bg-surface p-2">
            <div className="flex items-center justify-between px-3 pb-2 pt-3"><p className="flex items-center gap-2 text-sm font-semibold"><Newspaper className="h-4 w-4" />Últimas notícias</p><Link to="/noticias" className="text-xs text-brand hover:underline">todas</Link></div>
            <div className="divide-y">{news.map((n) => <ContentRow key={n.slug} item={n} />)}</div>
          </div>
          <div className="rounded-2xl border bg-surface p-5">
            <p className="text-sm font-semibold">Em alta hoje</p>
            <ol className="mt-3 space-y-2.5">{hot.map((h, i) => <li key={h.id}><Link to={h.path} className="group flex gap-3 text-sm"><span className="w-5 font-mono text-fg-3">{String(i + 1).padStart(2, "0")}</span><span className="min-w-0"><span className="block truncate group-hover:underline underline-offset-4">{h.title}</span><span className="text-xs text-fg-3">{KIND_LABEL[h.kind]}</span></span></Link></li>)}</ol>
          </div>
          <AdBanner className="my-0" />
        </aside>
      </section>

      <section className="container-x mt-20">
        <div className="rounded-3xl border bg-surface-2/60 p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">Central de prompts</p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Prompts profissionais, prontos para adaptar.</h2>
              <p className="mt-3 text-fg-2 leading-7">{PROMPTS.length} templates com variáveis por categoria — marketing, código, vendas, estudos, imagens — e um Prompt Builder que monta a estrutura ideal (objetivo, contexto, público, tom, formato) sem nenhuma API.</p>
              <div className="mt-6 flex flex-wrap gap-3"><Button to="/prompts"><Bot className="h-4 w-4" />Ver prompts</Button><Button variant="outline" to="/prompts/builder">Prompt Builder</Button></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">{prompts.map((p) => <PromptCard key={p.slug} prompt={p} />)}</div>
          </div>
        </div>
      </section>

      <section className="container-x mt-20">
        <SectionHeader eyebrow={history.length || favorites.length ? "Para você" : "Sugestões"} title={history.length || favorites.length ? "Com base no que você usou" : "Comece por aqui"} description={history.length || favorites.length ? "Recomendações locais a partir do seu histórico e favoritos." : "Ferramentas e artigos populares para começar."} action={<Button variant="ghost" to="/favoritos"><Bookmark className="h-4 w-4" />Favoritos</Button>} />
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{recs.map((r) => <StaggerItem key={r.id}><Link to={r.path} className="group block h-full rounded-2xl border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-line-2 hover:shadow-pop"><p className="text-[11px] font-medium uppercase tracking-wide text-fg-3">{KIND_LABEL[r.kind]}</p><h3 className="mt-2 font-semibold leading-snug group-hover:underline underline-offset-4">{r.title}</h3><p className="mt-1.5 line-clamp-2 text-sm text-fg-2">{r.description}</p></Link></StaggerItem>)}</Stagger>
      </section>

      <section className="container-x mt-20">
        <div className="grid gap-6 rounded-3xl border bg-fg p-8 text-bg sm:grid-cols-3 sm:p-12">
          {[{ n: TOOLS.length, l: "ferramentas funcionais", i: Calculator }, { n: PROMPTS.length, l: "prompts com variáveis", i: Bot }, { n: ALL_CONTENT.length, l: "notícias, artigos, guias e vídeos", i: Newspaper }].map((s) => (
            <div key={s.l} className="flex items-start gap-4"><s.i className="mt-1 h-5 w-5 opacity-60" /><div><p className="text-4xl font-semibold tabular-nums tracking-tight"><CountUp to={s.n} />+</p><p className="mt-1 text-sm opacity-70">{s.l}</p></div></div>
          ))}
        </div>
      </section>

      <section className="container-x mt-20">
        <SectionHeader eyebrow="Aprender" title="Tutoriais e guias recentes" action={<div className="flex gap-2"><Button variant="ghost" to="/tutoriais">Tutoriais</Button><Button variant="ghost" to="/guias">Guias</Button></div>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...contentByKind("tutorial").slice(0, 2), ...contentByKind("guide").slice(0, 1)].map((c, i) => <Reveal key={c.slug} delay={i * 0.06}><ContentCard item={c} /></Reveal>)}</div>
      </section>
    </>
  );
}
