import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES, toolBySlug, toolsByCategory } from "@/data/tools";
import type { ToolCategory } from "@/lib/types";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import { normalize } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Shell";
import { Empty, Input, PageHeader, Skeleton } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { AdBanner } from "@/components/ui/monetization";
import { CategoryIcon, ToolCard } from "@/components/content/Cards";
import { ToolShell } from "@/tools/ToolShell";

const Registry = lazy(() => import("@/tools/registry").then((m) => ({ default: function ToolRenderer({ slug }: { slug: string }) { const meta = toolBySlug(slug)!; const Cmp = m.resolveTool(slug); return Cmp ? <Cmp meta={meta} /> : <Empty title="Ferramenta em manutenção" />; } })));

export function ToolsIndex() {
  useSEO({ title: `Ferramentas online gratuitas (${TOOLS.length})`, description: "Calculadoras, conversores, ferramentas de texto, geradores, IA e produtividade. Funcionam no navegador, sem cadastro.", path: "/ferramentas", breadcrumbs: [{ label: "Ferramentas", path: "/ferramentas" }] });
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const cat = (sp.get("cat") ?? "all") as ToolCategory | "all";
  useEffect(() => { const next = new URLSearchParams(sp); if (q) next.set("q", q); else next.delete("q"); setSp(next, { replace: true }); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = useMemo(() => TOOLS.filter((t) => (cat === "all" || t.category === cat) && (!q || normalize(`${t.name} ${t.short} ${t.tags.join(" ")}`).includes(normalize(q)))), [q, cat]);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Ferramentas" }]} />
      <PageHeader eyebrow="Ferramentas" title="Tudo funciona aqui, no seu navegador." description={`${TOOLS.length} ferramentas gratuitas com explicação, exemplos e perguntas frequentes. Nenhum dado sai do seu dispositivo.`}>
        <div className="relative max-w-xl"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ferramenta… (ex.: juros, QR, senha)" className="h-12 pl-10 text-base" /></div>
      </PageHeader>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        {[{ slug: "all", name: "Todas", icon: "" }, ...TOOL_CATEGORIES].map((c) => <button key={c.slug} onClick={() => { const n = new URLSearchParams(sp); if (c.slug === "all") n.delete("cat"); else n.set("cat", c.slug); setSp(n); }} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${cat === c.slug ? "border-fg bg-fg text-bg" : "bg-surface hover:bg-surface-2"}`}>{c.icon && <CategoryIcon icon={c.icon} className="h-4 w-4" />}{c.name}<span className="text-xs opacity-60">{c.slug === "all" ? TOOLS.length : toolsByCategory(c.slug as ToolCategory).length}</span></button>)}
      </div>
      {list.length ? <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" delay={0.03}>{list.map((t) => <StaggerItem key={t.slug}><ToolCard tool={t} /></StaggerItem>)}</Stagger> : <Empty title="Nenhuma ferramenta encontrada" description="Tente outro termo ou limpe o filtro." />}
      <AdBanner />
    </div>
  );
}

export function ToolCategoryPage() {
  const { slug = "" } = useParams();
  const cat = TOOL_CATEGORIES.find((c) => c.slug === slug);
  useSEO({ title: cat ? `${cat.name} — ferramentas online` : "Categoria", description: cat?.description ?? "", path: `/ferramentas/categoria/${slug}`, breadcrumbs: [{ label: "Ferramentas", path: "/ferramentas" }, { label: cat?.name ?? "", path: `/ferramentas/categoria/${slug}` }] });
  if (!cat) return <Navigate to="/ferramentas" replace />;
  const list = toolsByCategory(cat.slug);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Ferramentas", path: "/ferramentas" }, { label: cat.name }]} />
      <PageHeader eyebrow="Categoria" title={cat.name} description={cat.description} />
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" delay={0.03}>{list.map((t) => <StaggerItem key={t.slug}><ToolCard tool={t} /></StaggerItem>)}</Stagger>
      <AdBanner />
      <div className="mt-8 flex flex-wrap gap-2">{TOOL_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => <Link key={c.slug} to={`/ferramentas/categoria/${c.slug}`} className="rounded-full border bg-surface px-3.5 py-1.5 text-sm hover:bg-surface-2">{c.name}</Link>)}</div>
    </div>
  );
}

export function ToolPage() {
  const { slug = "" } = useParams();
  const meta = toolBySlug(slug);
  const { pushHistory } = useStore();
  useSEO({ title: meta ? `${meta.name} online grátis` : "Ferramenta", description: meta ? `${meta.short} ${meta.description}`.slice(0, 160) : "", path: `/ferramentas/${slug}`, keywords: meta?.tags, breadcrumbs: meta ? [{ label: "Ferramentas", path: "/ferramentas" }, { label: TOOL_CATEGORIES.find((c) => c.slug === meta.category)!.name, path: `/ferramentas/categoria/${meta.category}` }, { label: meta.name, path: `/ferramentas/${slug}` }] : undefined });
  useEffect(() => { if (meta) pushHistory({ kind: "tool", slug: meta.slug, title: meta.name, path: `/ferramentas/${meta.slug}` }); }, [meta, pushHistory]);
  if (!meta) return <Navigate to="/ferramentas" replace />;
  const cat = TOOL_CATEGORIES.find((c) => c.slug === meta.category)!;
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Ferramentas", path: "/ferramentas" }, { label: cat.name, path: `/ferramentas/categoria/${cat.slug}` }, { label: meta.name }]} />
      <PageHeader eyebrow={cat.name} title={meta.name} description={meta.short} />
      <ToolShell meta={meta}>
        <Suspense fallback={<div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-2/3" /><Skeleton className="h-40 w-full" /></div>}>
          <Registry key={slug} slug={slug} />
        </Suspense>
      </ToolShell>
    </div>
  );
}
