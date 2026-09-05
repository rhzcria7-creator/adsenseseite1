import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { Block } from "@/lib/types";
import { AdInArticle } from "@/components/ui/monetization";
import { CopyButton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

/** Minimal inline markdown: **bold**, `code`, [text](/path) */
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<Fragment key={k++}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) parts.push(<code key={k++}>{tok.slice(1, -1)}</code>);
    else {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      const href = mm[2];
      parts.push(href.startsWith("/") ? <Link key={k++} to={href}>{mm[1]}</Link> : <a key={k++} href={href} target="_blank" rel="noopener noreferrer">{mm[1]}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return <>{parts}</>;
}

export function Body({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <div className={cn("prose-nexo", className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}><Inline text={b.text} /></p>;
          case "h2":
            return <h2 key={i} id={slug(b.text)}>{b.text}</h2>;
          case "h3":
            return <h3 key={i} id={slug(b.text)}>{b.text}</h3>;
          case "ul":
            return <ul key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ul>;
          case "ol":
            return <ol key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ol>;
          case "quote":
            return <blockquote key={i}>{b.text}</blockquote>;
          case "code":
            return (
              <div key={i} className="group relative">
                <pre><code>{b.code}</code></pre>
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <CopyButton text={b.code} size="icon" variant="secondary" />
                </div>
                {b.lang && <span className="absolute left-3 top-2 font-mono text-[10px] uppercase text-fg-3">{b.lang}</span>}
              </div>
            );
          case "callout": {
            const tone = b.tone ?? "info";
            const map = {
              info: { icon: <Info size={18} />, cls: "border-accent/30 bg-accent/5 text-fg" },
              tip: { icon: <Lightbulb size={18} />, cls: "border-ok/30 bg-ok/5 text-fg" },
              warn: { icon: <TriangleAlert size={18} />, cls: "border-warn/40 bg-warn/5 text-fg" },
            }[tone];
            return (
              <div key={i} className={cn("my-6 flex gap-3 rounded-xl border px-4 py-3.5 text-[15px] leading-relaxed", map.cls)}>
                <span className="mt-0.5 shrink-0 text-fg-2">{map.icon}</span>
                <span><Inline text={b.text} /></span>
              </div>
            );
          }
          case "ad":
            return <AdInArticle key={i} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export function tocFromBlocks(blocks: Block[]) {
  return blocks.filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2").map((b) => ({ id: slug(b.text), text: b.text }));
}

function slug(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
