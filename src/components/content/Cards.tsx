import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, Play } from "lucide-react";
import type { PromptTemplate, SearchDoc, ToolMeta } from "@/lib/types";
import { entryPath, kindMeta, type Entry } from "@/lib/content";
import { cn, coverClass, formatDate } from "@/lib/utils";
import { Badge, Icon } from "@/components/ui/primitives";
import { FavoriteButton } from "@/components/ui/feedback";
import { SpotlightCard } from "@/components/ui/motion";
import { promptCategoryBySlug } from "@/data/prompts";

/* ---------- Cover (gradient-based, no external images) ---------- */
export function Cover({ entry, className, big = false }: { entry: Entry; className?: string; big?: boolean }) {
  const isVideo = entry.kind === "video";
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br", coverClass(entry.cover), className)}>
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)" }} />
      <div className="absolute inset-0 flex items-end p-4">
        <span className={cn("font-mono text-white/60", big ? "text-xs" : "text-[10px]")}>{kindMeta[entry.kind].label.toUpperCase()} · {entry.category.toUpperCase()}</span>
      </div>
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform group-hover:scale-110">
            <Play size={18} className="ml-0.5 fill-current" />
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- Content card ---------- */
export function ContentCard({ entry, variant = "default", className }: { entry: Entry; variant?: "default" | "compact" | "feature" | "row"; className?: string }) {
  const path = entryPath(entry);
  const id = `${entry.kind}:${entry.slug}`;

  if (variant === "row") {
    return (
      <Link to={path} className={cn("group flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-bg-2", className)}>
        <Cover entry={entry} className="h-16 w-24 shrink-0" />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-center gap-2 text-[11px] text-fg-3">
            <span className="font-semibold uppercase tracking-wider text-accent">{kindMeta[entry.kind].label}</span>
            <span>·</span>
            <span>{formatDate(entry.date)}</span>
          </div>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-fg group-hover:underline decoration-line-2 underline-offset-4">{entry.title}</h3>
        </div>
      </Link>
    );
  }

  if (variant === "feature") {
    return (
      <Link to={path} className={cn("group relative block overflow-hidden rounded-2xl", className)}>
        <Cover entry={entry} className="h-full min-h-[360px] w-full" big />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="mb-3 flex items-center gap-2">
            <Badge className="bg-white/15 text-white backdrop-blur">{kindMeta[entry.kind].label}</Badge>
            <span className="text-xs text-white/70">{formatDate(entry.date)} · {entry.readTime} min</span>
          </div>
          <h3 className="h-title max-w-xl text-2xl text-white sm:text-3xl">{entry.title}</h3>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/80">{entry.excerpt}</p>
        </div>
        <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight size={18} />
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={path} className={cn("group block border-b border-line py-4 last:border-0", className)}>
        <div className="flex items-center gap-2 text-[11px] text-fg-3">
          <span className="font-semibold uppercase tracking-wider text-accent">{kindMeta[entry.kind].label}</span>
          <span>·</span>
          <span>{formatDate(entry.date)}</span>
        </div>
        <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-fg group-hover:text-accent">{entry.title}</h3>
      </Link>
    );
  }

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link to={path} className="block">
        <Cover entry={entry} className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.01]" />
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center gap-2 text-xs text-fg-3">
          <span className="font-semibold uppercase tracking-wider text-accent">{entry.category}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} /> {entry.readTime} min</span>
        </div>
        <Link to={path}>
          <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-fg transition-colors group-hover:text-accent">{entry.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-2">{entry.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs text-fg-3">{formatDate(entry.date)}</span>
          <FavoriteButton id={id} kind={entry.kind} title={entry.title} path={path} className="h-8 border-transparent px-2" />
        </div>
      </div>
    </article>
  );
}

/* ---------- Tool card ---------- */
export function ToolCard({ tool, className, compact = false }: { tool: ToolMeta; className?: string; compact?: boolean }) {
  const path = `/ferramentas/${tool.slug}`;
  if (compact) {
    return (
      <Link to={path} className={cn("group flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-line-2 hover:bg-bg-2", className)}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-3 text-fg-2 group-hover:bg-fg group-hover:text-bg transition-colors"><Icon name={tool.icon} size={17} /></span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-fg">{tool.name}</div>
          <div className="truncate text-xs text-fg-3">{tool.short}</div>
        </div>
      </Link>
    );
  }
  return (
    <SpotlightCard className={cn("h-full", className)}>
      <Link to={path} className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-3 text-fg transition-colors group-hover:bg-fg group-hover:text-bg"><Icon name={tool.icon} size={20} /></span>
          <FavoriteButton id={`tool:${tool.slug}`} kind="tool" title={tool.name} path={path} className="h-8 border-transparent px-2" />
        </div>
        <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-fg">{tool.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-2">{tool.short}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-fg-3">
          <span className="capitalize">{tool.category}</span>
          <span className="inline-flex items-center gap-1 font-medium text-fg-2 transition-transform group-hover:translate-x-0.5">Abrir <ArrowUpRight size={13} /></span>
        </div>
      </Link>
    </SpotlightCard>
  );
}

/* ---------- Prompt card ---------- */
export function PromptCard({ prompt, className }: { prompt: PromptTemplate; className?: string }) {
  const path = `/prompts/${prompt.slug}`;
  const cat = promptCategoryBySlug(prompt.category);
  return (
    <SpotlightCard className={cn("h-full", className)}>
      <Link to={path} className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between">
          <Badge tone="accent">{cat?.name}</Badge>
          <FavoriteButton id={`prompt:${prompt.slug}`} kind="prompt" title={prompt.title} path={path} className="h-8 border-transparent px-2" />
        </div>
        <h3 className="mt-3 text-[16px] font-semibold tracking-tight text-fg">{prompt.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-2">{prompt.description}</p>
        <pre className="mt-4 line-clamp-3 whitespace-pre-wrap rounded-lg bg-bg-3 p-3 font-mono text-[11.5px] leading-relaxed text-fg-2">{prompt.template}</pre>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {prompt.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-bg-2 px-2 py-0.5 text-[11px] text-fg-3">#{t}</span>
          ))}
        </div>
      </Link>
    </SpotlightCard>
  );
}

/* ---------- Generic doc card (search results, favorites) ---------- */
export function DocRow({ doc, className, right }: { doc: SearchDoc; className?: string; right?: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-xl border border-line p-3 transition-colors hover:bg-bg-2", className)}>
      <Badge tone={doc.kind === "tool" ? "accent" : "neutral"} className="hidden w-[90px] justify-center sm:inline-flex">{kindMeta[doc.kind].label}</Badge>
      <Link to={doc.path} className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-fg">{doc.title}</div>
        <div className="truncate text-xs text-fg-3">{doc.excerpt}</div>
      </Link>
      {right}
    </div>
  );
}
