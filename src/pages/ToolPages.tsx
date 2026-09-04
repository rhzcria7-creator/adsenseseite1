import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { TOOLS, TOOL_CATEGORIES, toolBySlug, toolCategory } from "@/data/tools";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import type { ToolCategory } from "@/lib/types";
import { normalize } from "@/lib/utils";
import { TOOL_COMPONENTS } from "@/tools/registry";
import { Container, PageHeader } from "@/components/layout/Shell";
import { ToolCard } from "@/components/content/Cards";
import { Empty, Tabs } from "@/components/ui/feedback";
import { AdSlot } from "@/components/ui/monetization";
import { Input, Segmented } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export function ToolsIndex() {
  useSEO({ title: "Ferramentas online grátis — calculadoras, conversores, geradores e IA", description: `${TOOLS.length} ferramentas que rodam no navegador: porcentagem, juros compostos, QR Code, senha, contador de palavras, prompt builder e muito mais.`, path: "/ferramentas" });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | ToolCategory>("all");
  const [sort, setSort] = useState<"popular" | "az" | "new">("popular");
  const { history } = useStore();
  const recent = history.filter((h) => h.kind === "tool").slice(0, 6);
  const list = useMemo(() => {
    const nq = normalize(q);
    let arr = TOOLS.filter((t) => (cat === "all" || t.category === cat) && (!nq || normalize(`${t.name} ${t.short} ${t.tags.join(" ")}`).includes(nq)));
    if (sort === "az") arr = [...arr].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sort === "new") arr = [...arr].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    if (sort === "popular") arr = [...arr].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return arr;
  }, [q, cat, sort]);
  return (
    <Container wide>
      <PageHeader eyebrow={`${TOOLS.length} ferramentas`} title="Ferramentas que funcionam no navegador" description="Sem cadastro, sem envio de dados. Cada ferramenta vem com explicação do cálculo, exemplos, perguntas frequentes e relacionadas." crumbs={[{ label: "Ferramentas" }]} />
      <div className="sticky top-14 z-30 -mx-4 border-b border-line bg-page/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-16 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar ferramentas…" className="pl-9" aria-label="Filtrar ferramentas" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={cat} onChange={setCat} tabs={[{ value: "all" as const, label: "Todas", count: TOOLS.length }, ...TOOL_CATEGORIES.map((c) => ({ value: c.slug, label: c.name, count: TOOLS.filter((t) => t.category === c.slug).length }))]} className="border-b-0" />
            <Segmented value={sort} onChange={setSort} options={[{ value: "popular", label: "Populares" }, { value: "az", label: "A–Z" }, { value: "new", label: "Novas" }]} />
          </div>
        </div>
      </div>
      {recent.length > 0 && !q && cat === "all" && (
        <div className="mt-6">
          <div className="eyebrow mb-2">Usadas recentemente</div>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((r) => (
              <Link key={r.id} to={r.path} className="border border-line px-2.5 py-1 text-xs transition-colors hover:border-strong">
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="mt-8">
        {list.length ? (
          <Stagger className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap={0.02}>
            {list.map((t, i) => (
              <StaggerItem key={t.slug}>
                <ToolCard tool={t} index={i} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Empty title="Nenhuma ferramenta encontrada" description={`Tente outro termo ou navegue por categoria.`} />
        )}
      </div>
      <div className="mt-12">
        <AdSlot format="horizontal" id="tools-index" />
      </div>
    </Container>
  );
}

export function ToolCategoryPage() {
  const { cat } = useParams<{ cat: string }>();
  const c = TOOL_CATEGORIES.find((x) => x.slug === cat);
  useSEO({ title: c ? `${c.name} — ferramentas online` : "Categoria", description: c?.description ?? "", path: `/ferramentas/categoria/${cat}` });
  if (!c) return <Navigate to="/404" replace />;
  const list = TOOLS.filter((t) => t.category === c.slug);
  return (
    <Container wide>
      <PageHeader eyebrow={`${list.length} ferramentas`} title={c.name} description={c.description} crumbs={[{ label: "Ferramentas", to: "/ferramentas" }, { label: c.name }]} />
      <div className="mt-8 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((t, i) => (
          <ToolCard key={t.slug} tool={t} index={i} />
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-2">
        {TOOL_CATEGORIES.filter((x) => x.slug !== c.slug).map((x) => (
          <Link key={x.slug} to={`/ferramentas/categoria/${x.slug}`} className="border border-line px-3 py-1.5 text-sm transition-colors hover:border-strong">
            {x.name}
          </Link>
        ))}
      </div>
    </Container>
  );
}

export function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const meta = slug ? toolBySlug(slug) : undefined;
  const Comp = slug ? TOOL_COMPONENTS[slug] : undefined;
  if (!meta || !Comp) return <Navigate to="/404" replace />;
  // ensure category exists (dev guard)
  toolCategory(meta.category);
  return <Comp key={meta.slug} meta={meta} />;
}
