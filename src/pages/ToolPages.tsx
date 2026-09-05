import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { toolCategories, tools, toolBySlug, categoryBySlug, toolsByCategory } from "@/data/tools";
import { useSeo, breadcrumbLd } from "@/lib/seo";
import { useToolUsage } from "@/lib/store";
import { Breadcrumbs, PageHeader } from "@/components/layout/Shell";
import { Chip, Icon, Input, Empty, SectionHead } from "@/components/ui/primitives";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/motion";
import { ToolCard } from "@/components/content/Cards";
import { AdBanner } from "@/components/ui/monetization";
import { ToolLayout } from "@/tools/ToolShell";
import { toolComponents, wideTools } from "@/tools/registry";
import { NotFound } from "./StaticPages";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function ToolsIndex() {
  useSeo({ title: "Ferramentas Online Gratuitas", description: `${tools.length} ferramentas gratuitas: calculadoras, conversores, geradores, texto, IA e produtividade. Tudo no navegador, sem cadastro.`, path: "/ferramentas" });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<"pop" | "az">("pop");
  const { usage } = useToolUsage();
  const list = useMemo(() => {
    let l = tools.filter((t) => (cat === "all" || t.category === cat) && (!q || norm(`${t.name} ${t.short} ${t.tags.join(" ")}`).includes(norm(q))));
    l = sort === "az" ? [...l].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")) : [...l].sort((a, b) => b.popularity - a.popularity);
    return l;
  }, [q, cat, sort]);
  const mine = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s]) => toolBySlug(s)).filter(Boolean);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Ferramentas" }]} />
      <PageHeader eyebrow="Ferramentas" title="Utilitários que funcionam no navegador" description="Calculadoras, conversores, geradores e ferramentas de texto e IA. Gratuitas, sem cadastro, com processamento 100% local." />
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar ferramentas…" className="pl-10" /></div>
        <div className="flex gap-2"><Chip active={sort === "pop"} onClick={() => setSort("pop")}>Mais usadas</Chip><Chip active={sort === "az"} onClick={() => setSort("az")}>A–Z</Chip></div>
      </div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>Todas ({tools.length})</Chip>
        {toolCategories.map((c) => <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>{c.name} ({toolsByCategory(c.slug).length})</Chip>)}
      </div>
      {mine.length > 0 && !q && cat === "all" && (
        <Reveal className="mb-10"><SectionHead eyebrow="Suas mais usadas" title="Continue de onde parou" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{mine.map((t) => <ToolCard key={t!.slug} tool={t!} compact />)}</div></Reveal>
      )}
      {list.length === 0 ? <Empty icon="SearchX" title="Nenhuma ferramenta encontrada" description="Tente outro termo ou categoria." /> : (
        cat === "all" && !q ? (
          toolCategories.map((c) => (
            <section key={c.slug} className="mb-14">
              <SectionHead eyebrow={`${toolsByCategory(c.slug).length} ferramentas`} title={c.name} description={c.description} action={<Link to={`/ferramentas/categoria/${c.slug}`} className="text-sm font-medium text-fg-2 hover:text-fg">Ver categoria</Link>} />
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{list.filter((t) => t.category === c.slug).map((t) => <StaggerItem key={t.slug}><ToolCard tool={t} /></StaggerItem>)}</Stagger>
              {c.slug === "datas" && <AdBanner />}
            </section>
          ))
        ) : (
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{list.map((t) => <StaggerItem key={t.slug}><ToolCard tool={t} /></StaggerItem>)}</Stagger>
        )
      )}
    </div>
  );
}

export function ToolCategoryPage() {
  const { cat } = useParams();
  const c = categoryBySlug(cat ?? "");
  useSeo({ title: c ? `${c.name} Online` : "Categoria", description: c?.description, path: `/ferramentas/categoria/${cat}`, jsonLd: c ? breadcrumbLd([{ name: "Ferramentas", path: "/ferramentas" }, { name: c.name, path: `/ferramentas/categoria/${c.slug}` }]) : undefined });
  if (!c) return <NotFound />;
  const list = toolsByCategory(c.slug).sort((a, b) => b.popularity - a.popularity);
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Ferramentas", path: "/ferramentas" }, { name: c.name }]} />
      <PageHeader eyebrow={`${list.length} ferramentas`} title={c.name} description={c.description} />
      <div className="mb-8 flex flex-wrap gap-2">{toolCategories.map((x) => <Link key={x.slug} to={`/ferramentas/categoria/${x.slug}`}><Chip active={x.slug === c.slug}><span className="inline-flex items-center gap-1.5"><Icon name={x.icon} size={14} /> {x.name}</span></Chip></Link>)}</div>
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{list.map((t) => <StaggerItem key={t.slug}><ToolCard tool={t} /></StaggerItem>)}</Stagger>
      <AdBanner />
      <section className="mt-6"><h2 className="h-title mb-3 text-xl">Sobre as ferramentas de {c.name.toLowerCase()}</h2><p className="max-w-3xl text-[15px] leading-relaxed text-fg-2">Todas as ferramentas desta categoria processam os dados localmente no seu navegador. Cada página traz instruções de uso, exemplos, perguntas frequentes e ferramentas relacionadas. Se sentir falta de algo, <Link to="/contato" className="text-accent underline underline-offset-4">fale com a gente</Link>.</p></section>
    </div>
  );
}

export function ToolPage() {
  const { slug } = useParams();
  const tool = toolBySlug(slug ?? "");
  if (!tool) return <NotFound />;
  const Cmp = toolComponents[tool.slug];
  if (!Cmp) return <Navigate to="/ferramentas" replace />;
  return (
    <ToolLayout tool={tool} wide={wideTools.has(tool.slug)}>
      <Cmp />
    </ToolLayout>
  );
}
