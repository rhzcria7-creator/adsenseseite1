import type { Article, ContentKind, SearchDoc, Video } from "./types";
import { news } from "@/data/news";
import { articles } from "@/data/articles";
import { tutorials, guides, videos } from "@/data/learning";
import { tools } from "@/data/tools";
import { prompts } from "@/data/prompts";
import { shuffleSeeded, slugify, todayKey, uniq } from "./utils";

export type Entry = Article | Video;

export const kindMeta: Record<ContentKind, { label: string; plural: string; base: string }> = {
  news: { label: "Notícia", plural: "Notícias", base: "/noticias" },
  blog: { label: "Artigo", plural: "Blog", base: "/blog" },
  tutorial: { label: "Tutorial", plural: "Tutoriais", base: "/tutoriais" },
  guide: { label: "Guia", plural: "Guias", base: "/guias" },
  video: { label: "Vídeo", plural: "Vídeos", base: "/videos" },
  tool: { label: "Ferramenta", plural: "Ferramentas", base: "/ferramentas" },
  prompt: { label: "Prompt", plural: "Prompts", base: "/prompts" },
};

export const collections: Record<"news" | "blog" | "tutorial" | "guide" | "video", Entry[]> = {
  news,
  blog: articles,
  tutorial: tutorials,
  guide: guides,
  video: videos,
};

export const allEntries: Entry[] = [...news, ...articles, ...tutorials, ...guides, ...videos];

export const entryPath = (e: Entry) => `${kindMeta[e.kind].base}/${e.slug}`;

export function getEntry(kind: Entry["kind"], slug: string): Entry | undefined {
  return collections[kind].find((e) => e.slug === slug);
}

export function sortByDate<T extends { date: string }>(arr: T[]) {
  return [...arr].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
export function sortByPopularity<T extends { popularity: number }>(arr: T[]) {
  return [...arr].sort((a, b) => b.popularity - a.popularity);
}

/* ---------- Categories & tags ---------- */
export function categoriesOf(kind: Entry["kind"]) {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const e of collections[kind]) {
    const s = slugify(e.category);
    const cur = map.get(s);
    if (cur) cur.count++;
    else map.set(s, { name: e.category, slug: s, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function allTags() {
  const map = new Map<string, number>();
  for (const e of allEntries) for (const t of e.tags) map.set(t, (map.get(t) ?? 0) + 1);
  for (const t of tools) for (const tag of t.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
  for (const p of prompts) for (const tag of p.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count);
}

export function byTag(tagSlug: string) {
  const match = (tags: string[]) => tags.some((t) => slugify(t) === tagSlug);
  return {
    entries: allEntries.filter((e) => match(e.tags)),
    tools: tools.filter((t) => match(t.tags)),
    prompts: prompts.filter((p) => match(p.tags)),
  };
}

/* ---------- Search ---------- */
export const searchDocs: SearchDoc[] = [
  ...allEntries.map<SearchDoc>((e) => ({ id: `${e.kind}:${e.slug}`, kind: e.kind, title: e.title, excerpt: e.excerpt, path: entryPath(e), tags: e.tags, category: e.category, popularity: e.popularity, date: e.date })),
  ...tools.map<SearchDoc>((t) => ({ id: `tool:${t.slug}`, kind: "tool", title: t.name, excerpt: t.short, path: `/ferramentas/${t.slug}`, tags: t.tags, category: t.category, popularity: t.popularity })),
  ...prompts.map<SearchDoc>((p) => ({ id: `prompt:${p.slug}`, kind: "prompt", title: p.title, excerpt: p.description, path: `/prompts/${p.slug}`, tags: p.tags, category: p.category, popularity: p.popularity })),
];

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function search(query: string, opts: { kinds?: ContentKind[]; limit?: number } = {}) {
  const q = norm(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = searchDocs
    .filter((d) => !opts.kinds || opts.kinds.includes(d.kind))
    .map((d) => {
      const title = norm(d.title);
      const excerpt = norm(d.excerpt);
      const tags = norm(d.tags.join(" "));
      const cat = norm(d.category);
      let score = 0;
      for (const t of terms) {
        if (title === t) score += 50;
        if (title.startsWith(t)) score += 20;
        if (title.includes(t)) score += 12;
        if (tags.includes(t)) score += 8;
        if (cat.includes(t)) score += 5;
        if (excerpt.includes(t)) score += 3;
      }
      if (score > 0) score += d.popularity / 25;
      return { doc: d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, opts.limit ?? 40).map((x) => x.doc);
}

/* ---------- Related & recommendations ---------- */
export function relatedEntries(e: Entry, n = 4): Entry[] {
  const tags = new Set(e.tags);
  return allEntries
    .filter((x) => x.slug !== e.slug)
    .map((x) => {
      let s = 0;
      for (const t of x.tags) if (tags.has(t)) s += 3;
      if (x.category === e.category) s += 2;
      if (x.kind === e.kind) s += 1;
      return { x, s: s + x.popularity / 100 };
    })
    .filter((r) => r.s > 1)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((r) => r.x);
}

export function relatedDocsForTags(tags: string[], excludeId: string, n = 4): SearchDoc[] {
  const set = new Set(tags.map(norm));
  return searchDocs
    .filter((d) => d.id !== excludeId)
    .map((d) => ({ d, s: d.tags.reduce((acc, t) => acc + (set.has(norm(t)) ? 1 : 0), 0) + d.popularity / 200 }))
    .filter((r) => r.s >= 1)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((r) => r.d);
}

/* ---------- Rotations (deterministic per day) ---------- */
export function featured(n = 5): Entry[] {
  const pool = sortByPopularity(allEntries).slice(0, 14);
  return shuffleSeeded(pool, `featured:${todayKey()}`).slice(0, n);
}
export function trending(n = 8): SearchDoc[] {
  const pool = [...searchDocs].sort((a, b) => b.popularity - a.popularity).slice(0, 30);
  return shuffleSeeded(pool, `trending:${todayKey()}`).slice(0, n);
}
export function recent(n = 8): Entry[] {
  return sortByDate(allEntries).slice(0, n);
}
export function popular(n = 8): Entry[] {
  return sortByPopularity(allEntries).slice(0, n);
}
export function popularTools(n = 8) {
  return [...tools].sort((a, b) => b.popularity - a.popularity).slice(0, n);
}
export function toolOfTheDay() {
  const pool = [...tools].sort((a, b) => b.popularity - a.popularity).slice(0, 20);
  return shuffleSeeded(pool, `tool:${todayKey()}`)[0];
}
export function promptOfTheDay() {
  const pool = [...prompts].sort((a, b) => b.popularity - a.popularity).slice(0, 20);
  return shuffleSeeded(pool, `prompt:${todayKey()}`)[0];
}

/** Recommendations based on the user's local history/favorites tags. */
export function recommendFor(seedTags: string[], excludeIds: string[], n = 6): SearchDoc[] {
  if (seedTags.length === 0) return trending(n);
  const counts = new Map<string, number>();
  for (const t of seedTags) counts.set(norm(t), (counts.get(norm(t)) ?? 0) + 1);
  const ex = new Set(excludeIds);
  return searchDocs
    .filter((d) => !ex.has(d.id))
    .map((d) => ({ d, s: d.tags.reduce((a, t) => a + (counts.get(norm(t)) ?? 0), 0) + d.popularity / 150 }))
    .filter((r) => r.s > 0.7)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((r) => r.d);
}

export const stats = {
  tools: tools.length,
  prompts: prompts.length,
  articles: allEntries.length,
  tags: uniq([...allEntries.flatMap((e) => e.tags), ...tools.flatMap((t) => t.tags)]).length,
};
