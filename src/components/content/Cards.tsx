import { ArrowUpRight, Clock, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { categoryName, contentPath } from "@/lib/content";
import { promptCategory } from "@/data/prompts";
import { toolCategory } from "@/data/tools";
import type { ContentItem, PromptItem, ToolMeta, VideoItem } from "@/lib/types";
import { cn, formatDate, KIND_LABEL } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

/* ---------------------------- Tool (grid item) ---------------------------- */

export function ToolCard({ tool, index, className }: { tool: ToolMeta; index?: number; className?: string }) {
  return (
    <Link to={`/ferramentas/${tool.slug}`} className={cn("group relative flex flex-col justify-between border-b border-r border-line bg-page p-5 transition-colors hover:bg-elev", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[11px] text-subtle">{typeof index === "number" ? String(index + 1).padStart(2, "0") : toolCategory(tool.category).name}</span>
        <div className="flex gap-1">
          {tool.isNew && <Badge tone="accent">Novo</Badge>}
          <ArrowUpRight className="h-4 w-4 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </div>
      <div className="mt-8">
        <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">{tool.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{tool.short}</p>
      </div>
      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export function ToolRow({ tool }: { tool: ToolMeta }) {
  return (
    <Link to={`/ferramentas/${tool.slug}`} className="group flex items-center justify-between gap-4 py-3 transition-colors hover:text-accent">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{tool.name}</div>
        <div className="truncate text-xs text-muted">{tool.short}</div>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle group-hover:text-accent" />
    </Link>
  );
}

/* ---------------------------- Editorial rows ------------------------------ */

export function ContentRow({ item, showKind }: { item: ContentItem; showKind?: boolean }) {
  return (
    <Link to={contentPath(item)} className="group grid gap-2 py-5 sm:grid-cols-[140px_1fr_auto] sm:gap-6">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-subtle sm:block">
        <span>{formatDate(item.publishedAt)}</span>
        {showKind && <span className="sm:mt-1 sm:block text-accent">{KIND_LABEL[item.kind]}</span>}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent sm:text-xl">{item.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{item.excerpt}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
          <span>{categoryName(item.category)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {item.kind === "video" ? (item as VideoItem).duration : `${item.readingTime} min`}
          </span>
        </div>
      </div>
      <ArrowUpRight className="hidden h-5 w-5 self-start text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:block" />
    </Link>
  );
}

/* ------------------------------ Featured ---------------------------------- */

export function FeatureCard({ item, big }: { item: ContentItem; big?: boolean }) {
  return (
    <Link to={contentPath(item)} className={cn("group flex h-full flex-col justify-between border border-line p-6 transition-colors hover:border-strong", big && "sm:p-8")}>
      <div className="flex items-center justify-between">
        <Badge tone="outline">{KIND_LABEL[item.kind]}</Badge>
        <span className="font-mono text-[11px] text-subtle">{formatDate(item.publishedAt)}</span>
      </div>
      <div className={cn("mt-10", big && "mt-16")}>
        <div className="eyebrow">{categoryName(item.category)}</div>
        <h3 className={cn("mt-2 font-display font-bold leading-[1.1] tracking-tight transition-colors group-hover:text-accent", big ? "text-3xl sm:text-4xl lg:text-5xl" : "text-xl sm:text-2xl")}>{item.title}</h3>
        <p className={cn("mt-3 text-muted", big ? "max-w-xl text-base" : "line-clamp-3 text-sm")}>{item.excerpt}</p>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-subtle">
        <span>{item.author}</span>
        <span className="inline-flex items-center gap-1 font-medium text-fg">
          Ler <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/* -------------------------------- Video ----------------------------------- */

export function VideoCard({ video }: { video: VideoItem }) {
  return (
    <Link to={`/videos/${video.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden border border-line bg-fg text-bg">
        <div className="grid-lines absolute inset-0 opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center border border-current/40 transition-all duration-300 group-hover:scale-110 group-hover:border-accent group-hover:bg-accent">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 bg-page px-1.5 py-0.5 font-mono text-[11px] text-fg">{video.duration}</span>
        <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wider opacity-60">{video.channel}</span>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent sm:text-lg">{video.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{video.excerpt}</p>
    </Link>
  );
}

/* -------------------------------- Prompt ---------------------------------- */

export function PromptCard({ prompt }: { prompt: PromptItem }) {
  return (
    <Link to={`/prompts/${prompt.slug}`} className="group flex h-full flex-col border border-line p-5 transition-colors hover:border-strong">
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{promptCategory(prompt.category).name}</span>
        <Badge tone="outline">{prompt.difficulty}</Badge>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">{prompt.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted">{prompt.description}</p>
      <pre className="mt-4 line-clamp-3 whitespace-pre-wrap border-l-2 border-line pl-3 font-mono text-[11px] leading-relaxed text-subtle">{prompt.prompt}</pre>
      <div className="mt-auto flex flex-wrap gap-1 pt-4">
        {prompt.platform.slice(0, 3).map((p) => (
          <span key={p} className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">
            {p}
          </span>
        ))}
      </div>
    </Link>
  );
}

/* ------------------------------ Mini list --------------------------------- */

export function MiniList({ items, title }: { items: { title: string; path: string; meta?: string }[]; title?: string }) {
  if (!items.length) return null;
  return (
    <div>
      {title && <div className="eyebrow mb-2 border-b border-strong pb-2">{title}</div>}
      <ul className="divide-y divide-[var(--line)]">
        {items.map((it) => (
          <li key={it.path}>
            <Link to={it.path} className="group flex items-start justify-between gap-3 py-2.5">
              <span className="text-sm font-medium leading-snug transition-colors group-hover:text-accent">{it.title}</span>
              {it.meta && <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-subtle">{it.meta}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
