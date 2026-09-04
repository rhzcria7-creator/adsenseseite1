import { Fragment } from "react";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import type { ContentBlock } from "@/lib/types";
import { CopyButton } from "../ui/feedback";

/** Renderiza texto com **negrito**, `código` e [links](/rota). */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <strong key={i} className="font-semibold text-fg">{p.slice(2, -2)}</strong>;
        if (p.startsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) return m[2].startsWith("/") ? <Link key={i} to={m[2]}>{m[1]}</Link> : <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

export function Body({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-nexo">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2": return <h2 key={i} id={slug(b.text!)}>{b.text}</h2>;
          case "h3": return <h3 key={i}>{b.text}</h3>;
          case "p": return <p key={i}><Inline text={b.text!} /></p>;
          case "ul": return <ul key={i}>{b.items!.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ul>;
          case "ol": return <ol key={i}>{b.items!.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ol>;
          case "quote": return <blockquote key={i}>{b.text}</blockquote>;
          case "callout": return (
            <div key={i} className="my-6 flex gap-3 rounded-xl border border-brand/20 bg-brand-soft/60 p-4 text-sm leading-6 text-fg-2 dark:bg-brand-soft/40">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" /><p className="!my-0"><Inline text={b.text!} /></p>
            </div>
          );
          case "code": return (
            <div key={i} className="relative group">
              <pre><code>{b.text}</code></pre>
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"><CopyButton text={b.text!} size="icon" variant="secondary" /></div>
              {b.lang && <span className="absolute left-3 top-2 font-mono text-[10px] uppercase text-fg-3">{b.lang}</span>}
            </div>
          );
          case "table": {
            const [head, ...rows] = b.rows!;
            return (
              <div key={i} className="overflow-x-auto"><table><thead><tr>{head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead><tbody>{rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody></table></div>
            );
          }
          default: return null;
        }
      })}
    </div>
  );
}

export function slug(s: string) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export function TableOfContents({ blocks }: { blocks: ContentBlock[] }) {
  const heads = blocks.filter((b) => b.type === "h2");
  if (heads.length < 2) return null;
  return (
    <nav aria-label="Neste artigo" className="rounded-2xl border bg-surface p-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-fg-3">Neste artigo</p>
      <ol className="mt-3 space-y-2">{heads.map((h, i) => <li key={i}><a href={`#${slug(h.text!)}`} className="block text-sm text-fg-2 hover:text-fg leading-5">{h.text}</a></li>)}</ol>
    </nav>
  );
}
