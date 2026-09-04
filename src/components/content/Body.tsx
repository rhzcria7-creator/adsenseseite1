import { Link } from "react-router-dom";
import { categoryName, contentPath, relatedContent, tagSlug } from "@/lib/content";
import type { ContentBlock, ContentItem } from "@/lib/types";
import { cn, formatDate, KIND_LABEL, slugify } from "@/lib/utils";
import { Callout, CopyButton, FavoriteButton } from "@/components/ui/feedback";
import { AdSlot } from "@/components/ui/monetization";
import { ContentRow } from "./Cards";

export function ContentBody({ blocks, className }: { blocks: ContentBlock[]; className?: string }) {
  return (
    <div className={cn("prose-editorial", className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} id={slugify(b.text ?? "")}>
                {b.text}
              </h2>
            );
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {b.items?.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items?.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            );
          case "quote":
            return <blockquote key={i}>{b.text}</blockquote>;
          case "callout":
            return (
              <div key={i}>
                <Callout>{b.text}</Callout>
              </div>
            );
          case "code":
            return (
              <div key={i} className="relative">
                <pre>
                  <code>{b.text}</code>
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton text={b.text ?? ""} label="" size="sm" className="h-7 w-7 border-white/20 bg-black/40 px-0 text-white hover:border-white/50" />
                </div>
              </div>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>{b.rows?.[0]?.map((c, j) => <th key={j}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows?.slice(1).map((r, j) => (
                      <tr key={j}>
                        {r.map((c, k) => (
                          <td key={k}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return <p key={i}>{b.text}</p>;
        }
      })}
    </div>
  );
}

/** In-page anchor that works with HashRouter: scrolls to the element without touching the URL hash. */
export function JumpLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById(to);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.setAttribute("tabindex", "-1");
          el.focus({ preventScroll: true });
        }
      }}
    >
      {children}
    </a>
  );
}

export function TOC({ blocks, extra }: { blocks: ContentBlock[]; extra?: { id: string; label: string }[] }) {
  const heads = blocks.filter((b) => b.type === "h2").map((b) => ({ id: slugify(b.text ?? ""), label: b.text ?? "" }));
  const all = [...heads, ...(extra ?? [])];
  if (!all.length) return null;
  return (
    <nav aria-label="Índice" className="border-t border-strong pt-3">
      <div className="eyebrow mb-2">Neste conteúdo</div>
      <ul className="space-y-1.5">
        {all.map((h) => (
          <li key={h.id}>
            <JumpLink to={h.id} className="block text-sm text-muted transition-colors hover:text-fg">
              {h.label}
            </JumpLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ContentMeta({ item }: { item: ContentItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
      <span className="font-medium text-fg">{item.author}</span>
      <time dateTime={item.publishedAt}>{formatDate(item.publishedAt, { day: "2-digit", month: "long", year: "numeric" })}</time>
      <span>{item.readingTime} min de leitura</span>
      <Link to={`/categorias/${item.category}`} className="text-accent hover:underline">
        {categoryName(item.category)}
      </Link>
    </div>
  );
}

export function TagList({ tags, className }: { tags: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((t) => (
        <Link key={t} to={`/tags/${tagSlug(t)}`} className="border border-line px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-strong hover:text-fg">
          #{t}
        </Link>
      ))}
    </div>
  );
}

export function ContentActions({ item }: { item: ContentItem }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FavoriteButton kind={item.kind} slug={item.slug} title={item.title} path={contentPath(item)} />
      <CopyButton text={`${item.title} — ${window.location.href}`} label="Copiar link" />
    </div>
  );
}

export function RelatedContent({ item }: { item: ContentItem }) {
  const related = relatedContent(item, 4);
  if (!related.length) return null;
  return (
    <section aria-labelledby="relacionados" className="mt-16">
      <h2 id="relacionados" className="border-b border-strong pb-3 font-display text-2xl font-bold tracking-tight">
        Conteúdos relacionados
      </h2>
      <div className="divide-y divide-[var(--line)]">
        {related.map((r) => (
          <ContentRow key={`${r.kind}-${r.slug}`} item={r} showKind />
        ))}
      </div>
    </section>
  );
}

/** Shared article-style layout used by news, blog, tutorials, guides, videos. */
export function ArticleLayout({ item, children, sidebar, kindLabel }: { item: ContentItem; children: React.ReactNode; sidebar?: React.ReactNode; kindLabel?: string }) {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article>
        <header className="border-b border-line pb-8">
          <div className="eyebrow text-accent">{kindLabel ?? KIND_LABEL[item.kind]}</div>
          <h1 className="mt-3 font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">{item.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{item.excerpt}</p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ContentMeta item={item} />
            <ContentActions item={item} />
          </div>
        </header>
        <div className="mt-8 max-w-3xl">{children}</div>
        <div className="mt-10 max-w-3xl">
          <AdSlot format="in-article" id="content-bottom" />
        </div>
        <div className="mt-8">
          <TagList tags={item.tags} />
        </div>
        <RelatedContent item={item} />
      </article>
      <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
    </div>
  );
}
