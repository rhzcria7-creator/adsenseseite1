import { ArrowLeftRight, ArrowUpRight, Bot, CalendarDays, Calculator, Circle, Clock, PlayCircle, Sparkles, Timer, Type } from "lucide-react";
import { Link } from "react-router-dom";
import { TOOL_CATEGORIES } from "@/data/tools";
import { categoryName, contentPath } from "@/lib/content";
import type { ContentItem, PromptItem, SearchDoc, ToolMeta } from "@/lib/types";
import { cn, formatDate, KIND_LABEL, KIND_PATH } from "@/lib/utils";
import { Badge } from "../ui/primitives";
import { Spotlight } from "../ui/motion";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = { calculator: Calculator, calendar: CalendarDays, "arrow-left-right": ArrowLeftRight, type: Type, sparkles: Sparkles, bot: Bot, timer: Timer };
export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Cmp = ICONS[icon] ?? Circle;
  return <Cmp className={className} />;
}

/** Cor de capa determinística a partir do slug — evita imagens pesadas. */
export function coverStyle(seed: string, kind?: string) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = kind === "news" ? 215 + (h % 30) : kind === "video" ? 340 + (h % 30) : kind === "tutorial" ? 150 + (h % 40) : kind === "guide" ? 30 + (h % 30) : 250 + (h % 40);
  return { background: `linear-gradient(135deg, hsl(${hue} 32% 92%) 0%, hsl(${hue + 20} 28% 84%) 100%)` } as React.CSSProperties;
}
function CoverPattern({ seed, kind, className }: { seed: string; kind?: string; className?: string }) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  const variant = h % 4;
  return (
    <div className={cn("relative overflow-hidden dark:opacity-80", className)} style={coverStyle(seed, kind)} aria-hidden>
      <svg className="absolute inset-0 h-full w-full text-black/[0.07] dark:text-black/20" viewBox="0 0 400 200" preserveAspectRatio="none">
        {variant === 0 && Array.from({ length: 7 }).map((_, i) => <circle key={i} cx={60 + i * 50} cy={100 + Math.sin(i) * 40} r={40 + (i % 3) * 14} fill="none" stroke="currentColor" strokeWidth="1.2" />)}
        {variant === 1 && Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 40} y1="0" x2={i * 40 + 120} y2="200" stroke="currentColor" strokeWidth="1.2" />)}
        {variant === 2 && Array.from({ length: 24 }).map((_, i) => <rect key={i} x={(i % 8) * 50 + 10} y={Math.floor(i / 8) * 65 + 10} width="30" height="30" rx="6" fill="none" stroke="currentColor" strokeWidth="1.2" />)}
        {variant === 3 && <path d="M0 150 C 80 60, 160 200, 240 100 S 400 40, 400 120" fill="none" stroke="currentColor" strokeWidth="1.5" />}
      </svg>
    </div>
  );
}

export function ContentCard({ item, size = "md", className }: { item: ContentItem; size?: "sm" | "md" | "lg"; className?: string }) {
  const path = contentPath(item);
  const isVideo = item.kind === "video";
  return (
    <Link to={path} className={cn("group block", className)}>
      <article className={cn("h-full overflow-hidden rounded-2xl border bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-pop", size === "lg" && "md:grid md:grid-cols-2")}>
        <div className="relative">
          <CoverPattern seed={item.slug} kind={item.kind} className={cn(size === "sm" ? "h-28" : size === "lg" ? "h-52 md:h-full" : "h-40")} />
          {isVideo && <div className="absolute inset-0 grid place-items-center"><PlayCircle className="h-12 w-12 text-fg/70 transition-transform group-hover:scale-110" /><span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[11px] text-white">{(item as { duration: string }).duration}</span></div>}
        </div>
        <div className={cn("flex flex-col p-5", size === "lg" && "md:p-8")}>
          <div className="mb-2.5 flex flex-wrap items-center gap-2 text-[12px] text-fg-3">
            <Badge tone="brand">{KIND_LABEL[item.kind]}</Badge>
            <span>{categoryName(item.category)}</span><span aria-hidden>·</span><time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
          </div>
          <h3 className={cn("font-semibold tracking-tight leading-snug group-hover:underline decoration-line-2 underline-offset-4", size === "lg" ? "text-2xl" : size === "sm" ? "text-[15px]" : "text-lg")}>{item.title}</h3>
          {size !== "sm" && <p className={cn("mt-2 text-fg-2 leading-6", size === "lg" ? "text-[15px] line-clamp-4" : "text-sm line-clamp-3")}>{item.excerpt}</p>}
          <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-fg-3">
            <span>{item.author}</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.readingTime} min</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function ContentRow({ item }: { item: ContentItem }) {
  return (
    <Link to={contentPath(item)} className="group flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-surface-2/70">
      <CoverPattern seed={item.slug} kind={item.kind} className="h-16 w-24 shrink-0 rounded-lg" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-fg-3">{KIND_LABEL[item.kind]} · {formatDate(item.publishedAt)}</p>
        <h4 className="mt-0.5 line-clamp-2 text-[15px] font-medium leading-snug group-hover:underline underline-offset-4">{item.title}</h4>
      </div>
    </Link>
  );
}

export function ToolCard({ tool, compact = false }: { tool: ToolMeta; compact?: boolean }) {
  const cat = TOOL_CATEGORIES.find((c) => c.slug === tool.category)!;
  return (
    <Link to={`/ferramentas/${tool.slug}`} className="group block h-full">
      <Spotlight className={cn("h-full rounded-2xl border bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-pop", compact ? "p-4" : "p-5")}>
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border bg-surface-2 text-fg-2 transition-colors group-hover:bg-brand-soft group-hover:text-brand group-hover:border-brand/10"><CategoryIcon icon={cat.icon} className="h-5 w-5" /></span>
          <div className="flex gap-1.5">{tool.isNew && <Badge tone="ok">Novo</Badge>}{tool.featured && !compact && <Badge>Popular</Badge>}</div>
        </div>
        <h3 className={cn("mt-4 font-semibold tracking-tight leading-snug", compact ? "text-[15px]" : "text-base")}>{tool.name}</h3>
        <p className={cn("mt-1.5 text-fg-2 leading-5", compact ? "text-[13px] line-clamp-2" : "text-sm line-clamp-2")}>{tool.short}</p>
        {!compact && <p className="mt-4 flex items-center gap-1 text-[12px] text-fg-3">{cat.name}<ArrowUpRight className="ml-auto h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" /></p>}
      </Spotlight>
    </Link>
  );
}

export function PromptCard({ prompt }: { prompt: PromptItem }) {
  return (
    <Link to={`/prompts/${prompt.slug}`} className="group block h-full">
      <article className="flex h-full flex-col rounded-2xl border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-pop">
        <div className="mb-3 flex items-center justify-between gap-2"><Badge tone="brand">{categoryName(prompt.category)}</Badge><span className="text-[11px] text-fg-3">{prompt.difficulty}</span></div>
        <h3 className="text-base font-semibold tracking-tight leading-snug">{prompt.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-fg-2">{prompt.description}</p>
        <pre className="mt-4 line-clamp-3 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 font-mono text-[11.5px] leading-5 text-fg-3">{prompt.prompt}</pre>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">{prompt.platform.slice(0, 3).map((p) => <span key={p} className="rounded-md border px-1.5 py-0.5 text-[11px] text-fg-3">{p}</span>)}{prompt.variables.length > 0 && <span className="ml-auto text-[11px] text-fg-3">{prompt.variables.length} variáveis</span>}</div>
      </article>
    </Link>
  );
}

export function SearchResultRow({ doc }: { doc: SearchDoc }) {
  return (
    <Link to={doc.path} className="group flex items-start gap-4 rounded-xl border bg-surface p-4 transition-colors hover:border-line-2 hover:bg-surface-2/50">
      <span className="mt-0.5 w-20 shrink-0 text-[11px] font-medium uppercase tracking-wide text-fg-3">{KIND_LABEL[doc.kind]}</span>
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-medium leading-snug group-hover:underline underline-offset-4">{doc.title}</h4>
        <p className="mt-1 line-clamp-2 text-sm text-fg-2">{doc.description}</p>
        <p className="mt-1.5 text-xs text-fg-3">{KIND_PATH[doc.kind]}/{doc.path.split("/").pop()} · {categoryName(doc.category)}</p>
      </div>
    </Link>
  );
}
