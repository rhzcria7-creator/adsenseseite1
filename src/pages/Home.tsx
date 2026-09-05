import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Search, Sparkles } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/utils";
import { featured, popularTools, promptOfTheDay, recent, sortByDate, stats, toolOfTheDay, trending, kindMeta, collections } from "@/lib/content";
import { toolCategories, tools } from "@/data/tools";
import { prompts, promptCategories } from "@/data/prompts";
import { Badge, Button, Icon, SectionHead } from "@/components/ui/primitives";
import { CountUp, Reveal, SplitText, Stagger, StaggerItem } from "@/components/ui/motion";
import { ContentCard, PromptCard, ToolCard } from "@/components/content/Cards";
import { AdBanner } from "@/components/ui/monetization";
import { useFavorites, useHistory } from "@/lib/store";
import { recommendFor, searchDocs } from "@/lib/content";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  useSeo({ title: `${SITE.name} — IA, Tecnologia, Ferramentas e Prompts`, description: `Notícias, blog, tutoriais, guias, vídeos, ${stats.tools} ferramentas online e ${stats.prompts} prompts profissionais. Tudo gratuito, 100% no navegador.`, path: "/" });
  const feats = featured(5);
  const hot = trending(6);
  const news = sortByDate(collections.news).slice(0, 4);
  const latest = recent(6);
  const tod = toolOfTheDay();
  const pod = promptOfTheDay();
  const { items: hist } = useHistory();
  const { items: favs } = useFavorites();
  const recs = useMemo(() => {
    const ids = [...hist, ...favs].map((h) => h.id);
    const tags = ids.flatMap((id) => searchDocs.find((d) => d.id === id)?.tags ?? []);
    return recommendFor(tags, ids, 6);
  }, [hist, favs]);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-x pb-14 pt-16 sm:pb-20 sm:pt-24">
          <div className="max-w-3xl">
            <Reveal><Badge tone="accent" className="mb-5 gap-1.5 py-1 pl-1.5 pr-2.5"><Sparkles size={12} /> {stats.tools} ferramentas · {stats.prompts} prompts · {stats.articles} conteúdos</Badge></Reveal>
            <h1 className="h-display text-[40px] sm:text-6xl lg:text-7xl">
              <SplitText text="Inteligência artificial e tecnologia," /> <span className="text-fg-3"><SplitText text="do jeito que você usa de verdade." delay={0.35} /></span>
            </h1>
            <Reveal delay={0.5}><p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-2">Notícias explicadas, tutoriais práticos, ferramentas que funcionam no navegador e uma central de prompts para trabalhar melhor com IA — sem cadastro e sem enviar seus dados para lugar nenhum.</p></Reveal>
            <Reveal delay={0.6}>
              <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav(`/busca?q=${encodeURIComponent(q)}`); }} className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-bg p-1.5 shadow-[var(--shadow-soft)] focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
                <Search size={18} className="ml-3 text-fg-3" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busque uma ferramenta, prompt ou assunto…" className="h-11 flex-1 bg-transparent text-[15px] focus:outline-none" />
                <Button type="submit" className="rounded-xl">Buscar</Button>
              </form>
            </Reveal>
            <Reveal delay={0.7}>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="text-fg-3">Populares:</span>
                {["juros-compostos", "gerador-de-senha", "gerador-de-qr-code", "prompt-builder", "contador-de-palavras"].map((s) => { const t = tools.find((x) => x.slug === s)!; return <Link key={s} to={`/ferramentas/${s}`} className="link-underline text-fg-2 hover:text-fg">{t.name}</Link>; })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-line bg-bg-2/60">
        <div className="container-x grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {[{ v: stats.tools, l: "ferramentas gratuitas" }, { v: stats.prompts, l: "prompts profissionais" }, { v: stats.articles, l: "artigos, guias e vídeos" }, { v: stats.tags, l: "temas e tags" }].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.06}><div><div className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl"><CountUp to={s.v} suffix="+" /></div><div className="mt-1 text-sm text-fg-2">{s.l}</div></div></Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-x pt-16">
        <SectionHead eyebrow="Destaques de hoje" title="O que vale a sua atenção" description="Seleção que rotaciona diariamente entre os conteúdos mais relevantes." action={<Link to="/tendencias" className="inline-flex items-center gap-1 text-sm font-medium text-fg-2 hover:text-fg">Ver tendências <ArrowRight size={14} /></Link>} />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal><ContentCard entry={feats[0]} variant="feature" className="h-full" /></Reveal>
          <div className="surface divide-y divide-line px-5">
            {feats.slice(1, 5).map((e, i) => <Reveal key={e.slug} delay={0.05 * i}><ContentCard entry={e} variant="compact" /></Reveal>)}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="container-x pt-20">
        <SectionHead eyebrow="Ferramentas" title="Resolva em segundos, direto no navegador" description="Calculadoras, conversores, geradores e utilitários de texto e IA. Sem instalar nada." action={<Link to="/ferramentas" className="inline-flex items-center gap-1 text-sm font-medium text-fg-2 hover:text-fg">Todas as ferramentas <ArrowRight size={14} /></Link>} />
        <div className="mb-6 flex flex-wrap gap-2">
          {toolCategories.map((c) => <Link key={c.slug} to={`/ferramentas/categoria/${c.slug}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-sm font-medium text-fg-2 transition-colors hover:border-fg hover:text-fg"><Icon name={c.icon} size={15} /> {c.name}</Link>)}
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularTools(8).map((t) => <StaggerItem key={t.slug}><ToolCard tool={t} /></StaggerItem>)}
        </Stagger>
      </section>

      <div className="container-x"><AdBanner className="mt-14" /></div>

      {/* TOOL + PROMPT OF THE DAY */}
      <section className="container-x grid gap-6 pt-6 lg:grid-cols-2">
        <Reveal>
          <Link to={`/ferramentas/${tod.slug}`} className="group flex h-full flex-col justify-between rounded-2xl bg-fg p-7 text-bg transition-transform hover:-translate-y-0.5">
            <div><div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60">Ferramenta do dia</div><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg/10"><Icon name={tod.icon} size={22} /></span><h3 className="h-title text-2xl">{tod.name}</h3></div><p className="mt-3 max-w-md opacity-70">{tod.description}</p></div>
            <span className="mt-8 inline-flex items-center gap-1 text-sm font-medium">Abrir ferramenta <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <Link to={`/prompts/${pod.slug}`} className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-bg-2 p-7 transition-transform hover:-translate-y-0.5">
            <div><div className="eyebrow mb-6">Prompt do dia</div><h3 className="h-title text-2xl">{pod.title}</h3><p className="mt-3 text-fg-2">{pod.description}</p><pre className="mt-4 line-clamp-4 whitespace-pre-wrap rounded-xl bg-bg p-4 font-mono text-xs leading-relaxed text-fg-2">{pod.template}</pre></div>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-fg">Ver e copiar <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
          </Link>
        </Reveal>
      </section>

      {/* NEWS + LATEST */}
      <section className="container-x grid gap-12 pt-20 lg:grid-cols-[1fr_360px]">
        <div>
          <SectionHead eyebrow="Notícias" title="Últimas em IA e tecnologia" action={<Link to="/noticias" className="inline-flex items-center gap-1 text-sm font-medium text-fg-2 hover:text-fg">Todas <ArrowRight size={14} /></Link>} />
          <Stagger className="grid gap-8 sm:grid-cols-2">{news.map((e) => <StaggerItem key={e.slug}><ContentCard entry={e} /></StaggerItem>)}</Stagger>
        </div>
        <aside className="space-y-8">
          <div>
            <div className="eyebrow mb-3">Em alta</div>
            <ol className="surface divide-y divide-line">
              {hot.map((d, i) => <li key={d.id}><Link to={d.path} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bg-2"><span className="font-mono text-sm text-fg-3">{String(i + 1).padStart(2, "0")}</span><div className="min-w-0"><div className="text-[11px] font-semibold uppercase tracking-wider text-accent">{kindMeta[d.kind].label}</div><div className="line-clamp-2 text-sm font-medium text-fg">{d.title}</div></div></Link></li>)}
            </ol>
          </div>
          <div>
            <div className="eyebrow mb-3">Recentes</div>
            <div className="space-y-1">{latest.map((e) => <ContentCard key={e.slug} entry={e} variant="row" />)}</div>
          </div>
        </aside>
      </section>

      {/* PROMPTS */}
      <section className="container-x pt-20">
        <SectionHead eyebrow="Central de prompts" title="Prompts que já vêm com contexto" description="Templates testados para marketing, vendas, código, estudos e criação de imagens. Copie, adapte e use." action={<Link to="/prompts" className="inline-flex items-center gap-1 text-sm font-medium text-fg-2 hover:text-fg">Ver todos <ArrowRight size={14} /></Link>} />
        <div className="mb-6 flex flex-wrap gap-2">{promptCategories.map((c) => <Link key={c.slug} to={`/prompts/categoria/${c.slug}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-sm font-medium text-fg-2 transition-colors hover:border-fg hover:text-fg"><Icon name={c.icon} size={15} /> {c.name}</Link>)}</div>
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[...prompts].sort((a, b) => b.popularity - a.popularity).slice(0, 6).map((p) => <StaggerItem key={p.slug}><PromptCard prompt={p} /></StaggerItem>)}</Stagger>
        <Reveal className="mt-8">
          <div className="surface-2 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div><h3 className="h-title text-xl">Monte o seu com o Prompt Builder</h3><p className="mt-1 text-sm text-fg-2">Objetivo + contexto + público + tom + formato + resultado esperado. Sem API, salvo localmente.</p></div>
            <Button onClick={() => nav("/prompts/builder")}>Abrir Prompt Builder <ArrowRight size={15} /></Button>
          </div>
        </Reveal>
      </section>

      {/* LEARN */}
      <section className="container-x pt-20">
        <SectionHead eyebrow="Aprenda" title="Tutoriais, guias e vídeos" description="Do primeiro prompt ao deploy de um site: conteúdo prático em níveis." />
        <div className="grid gap-8 lg:grid-cols-3">
          {(["tutorial", "guide", "video"] as const).map((k) => (
            <Reveal key={k}>
              <div className="flex items-center justify-between"><h3 className="h-title text-lg">{kindMeta[k].plural}</h3><Link to={kindMeta[k].base} className="text-sm font-medium text-fg-2 hover:text-fg">Ver todos</Link></div>
              <div className="mt-3 space-y-1">{sortByDate(collections[k]).slice(0, 4).map((e) => <ContentCard key={e.slug} entry={e} variant="row" />)}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* RECOMMENDED */}
      {recs.length > 0 && (
        <section className="container-x pt-20">
          <SectionHead eyebrow={hist.length || favs.length ? "Para você" : "Sugestões"} title={hist.length || favs.length ? "Com base no que você acessou" : "Por onde começar"} description="Recomendações calculadas localmente a partir do seu histórico e favoritos." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((d) => <Link key={d.id} to={d.path} className="group flex items-center gap-3 rounded-xl border border-line p-4 transition-colors hover:border-line-2 hover:bg-bg-2"><Badge tone={d.kind === "tool" ? "accent" : "neutral"}>{kindMeta[d.kind].label}</Badge><span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{d.title}</span><ArrowUpRight size={15} className="shrink-0 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>)}
          </div>
        </section>
      )}
    </>
  );
}
