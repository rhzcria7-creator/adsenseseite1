import { ARTICLES } from "@/data/articles";
import { GUIDES, TUTORIALS, VIDEOS } from "@/data/learning";
import { NEWS } from "@/data/news";
import { PROMPTS, PROMPT_CATEGORIES } from "@/data/prompts";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";
import type { Category, ContentItem, ContentKind, SearchDoc } from "./types";
import { KIND_PATH, normalize, shuffleDaily } from "./utils";

/* ------------------------------- Categorias ------------------------------- */

export const CATEGORIES: Category[] = [
  { slug: "inteligencia-artificial", name: "Inteligência Artificial", description: "Modelos, agentes, prompts e aplicações práticas de IA.", kinds: ["news", "article", "tutorial", "guide", "video"] },
  { slug: "tecnologia", name: "Tecnologia", description: "Infraestrutura, regulação, tendências e o impacto da tecnologia.", kinds: ["news"] },
  { slug: "programacao", name: "Programação", description: "Front-end, TypeScript, arquitetura e ferramentas de desenvolvimento.", kinds: ["news", "article", "tutorial", "guide", "video"] },
  { slug: "marketing", name: "Marketing", description: "SEO, conteúdo, aquisição e posicionamento.", kinds: ["news", "article"] },
  { slug: "negocios", name: "Negócios", description: "Estratégia, custos, produtos e pequenas empresas.", kinds: ["news", "guide", "video"] },
  { slug: "design", name: "Design", description: "Interfaces, tipografia, cores e acessibilidade.", kinds: ["article", "tutorial", "video"] },
  { slug: "financas", name: "Finanças", description: "Juros, investimentos, dívidas e decisões com números.", kinds: ["article", "guide", "video"] },
  { slug: "produtividade", name: "Produtividade", description: "Métodos, foco, planejamento e automação pessoal.", kinds: ["article", "tutorial", "guide", "video"] },
  { slug: "seguranca", name: "Segurança", description: "Senhas, autenticação, privacidade e golpes.", kinds: ["news", "article", "guide", "video"] },
  { slug: "hardware", name: "Hardware", description: "Chips, dispositivos e computação local.", kinds: ["news"] },
  { slug: "carreira", name: "Carreira", description: "Habilidades, vagas e mercado de trabalho em tecnologia.", kinds: ["news"] },
  { slug: "educacao", name: "Educação", description: "Aprendizado, tutores de IA e métodos de estudo.", kinds: ["news", "video"] },
  { slug: "produto", name: "Produto", description: "Estratégia de produto e decisões de UX.", kinds: ["article"] },
  { slug: "conteudo", name: "Conteúdo", description: "Escrita, credibilidade e produção editorial.", kinds: ["article"] },
  { slug: "utilidades", name: "Utilidades", description: "QR Codes, conversões e tarefas práticas.", kinds: ["tutorial", "video"] },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const categoryName = (slug: string) => categoryBySlug(slug)?.name ?? TOOL_CATEGORIES.find((c) => c.slug === slug)?.name ?? PROMPT_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

/* --------------------------- Coleções unificadas -------------------------- */

export const ALL_CONTENT: ContentItem[] = [...NEWS, ...ARTICLES, ...TUTORIALS, ...GUIDES, ...VIDEOS].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

export const contentByKind = (kind: ContentKind) => ALL_CONTENT.filter((c) => c.kind === kind);
export const contentByCategory = (slug: string) => ALL_CONTENT.filter((c) => c.category === slug);
export const contentByTag = (tag: string) => ALL_CONTENT.filter((c) => c.tags.map(normalize).includes(normalize(tag)));
export const contentPath = (c: ContentItem) => `${KIND_PATH[c.kind]}/${c.slug}`;

export function findContent(kind: ContentKind, slug: string): ContentItem | undefined {
  return ALL_CONTENT.find((c) => c.kind === kind && c.slug === slug);
}

/* ----------------------------------- Tags --------------------------------- */

export interface TagInfo {
  tag: string;
  slug: string;
  count: number;
}

export const ALL_TAGS: TagInfo[] = (() => {
  const map = new Map<string, TagInfo>();
  const add = (tag: string) => {
    const slug = normalize(tag).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const cur = map.get(slug);
    if (cur) cur.count++;
    else map.set(slug, { tag, slug, count: 1 });
  };
  ALL_CONTENT.forEach((c) => c.tags.forEach(add));
  TOOLS.forEach((t) => t.tags.forEach(add));
  PROMPTS.forEach((p) => p.tags.forEach(add));
  return [...map.values()].sort((a, b) => b.count - a.count);
})();

export const tagBySlug = (slug: string) => ALL_TAGS.find((t) => t.slug === slug);
export const tagSlug = (tag: string) => normalize(tag).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function itemsByTagSlug(slug: string) {
  const match = (tags: string[]) => tags.some((t) => tagSlug(t) === slug);
  return {
    content: ALL_CONTENT.filter((c) => match(c.tags)),
    tools: TOOLS.filter((t) => match(t.tags)),
    prompts: PROMPTS.filter((p) => match(p.tags)),
  };
}

/* ----------------------------- Relacionados ------------------------------- */

export function relatedContent(item: ContentItem, limit = 4): ContentItem[] {
  const tags = new Set(item.tags.map(normalize));
  return ALL_CONTENT.filter((c) => c.slug !== item.slug)
    .map((c) => ({ c, score: (c.category === item.category ? 2 : 0) + c.tags.filter((t) => tags.has(normalize(t))).length + (c.kind === item.kind ? 0.5 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

/** Simulates an internal editorial rotation: changes daily, no network. */
export function rotation<T>(items: T[], n: number): T[] {
  return shuffleDaily(items).slice(0, n);
}

/* --------------------------------- Busca ---------------------------------- */

export const SEARCH_INDEX: SearchDoc[] = [
  ...TOOLS.map<SearchDoc>((t) => ({ id: `tool:${t.slug}`, kind: "tool", title: t.name, description: t.short, path: `/ferramentas/${t.slug}`, tags: t.tags, category: t.category, haystack: normalize([t.name, t.short, t.description, ...t.tags, ...(t.keywords ?? []), t.category].join(" ")) })),
  ...ALL_CONTENT.map<SearchDoc>((c) => ({ id: `${c.kind}:${c.slug}`, kind: c.kind, title: c.title, description: c.excerpt, path: contentPath(c), tags: c.tags, category: c.category, date: c.publishedAt, haystack: normalize([c.title, c.excerpt, ...c.tags, c.category, c.author].join(" ")) })),
  ...PROMPTS.map<SearchDoc>((p) => ({ id: `prompt:${p.slug}`, kind: "prompt", title: p.title, description: p.description, path: `/prompts/${p.slug}`, tags: p.tags, category: p.category, haystack: normalize([p.title, p.description, ...p.tags, p.category, ...p.platform].join(" ")) })),
];

export interface SearchOptions {
  kinds?: ContentKind[];
  limit?: number;
}

export function search(query: string, opts: SearchOptions = {}): SearchDoc[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const { kinds, limit = 30 } = opts;
  return SEARCH_INDEX.filter((d) => !kinds || kinds.includes(d.kind))
    .map((d) => {
      let score = 0;
      const title = normalize(d.title);
      for (const term of terms) {
        if (title === term) score += 12;
        else if (title.startsWith(term)) score += 8;
        else if (title.includes(term)) score += 5;
        else if (d.tags.some((t) => normalize(t).includes(term))) score += 3;
        else if (d.haystack.includes(term)) score += 1;
        else return { d, score: 0 };
      }
      if (d.kind === "tool") score += 0.5;
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.d);
}

export function suggest(query: string, limit = 8): SearchDoc[] {
  return search(query, { limit });
}

/** Simple recommendation engine based on the user's history and favorites. */
export function recommend(seedIds: string[], limit = 6): SearchDoc[] {
  const seeds = SEARCH_INDEX.filter((d) => seedIds.includes(d.id));
  if (!seeds.length) return rotation(SEARCH_INDEX.filter((d) => d.kind === "tool" || d.kind === "article"), limit);
  const tagWeights = new Map<string, number>();
  const cats = new Map<string, number>();
  seeds.forEach((s) => {
    s.tags.forEach((t) => tagWeights.set(normalize(t), (tagWeights.get(normalize(t)) ?? 0) + 1));
    cats.set(s.category, (cats.get(s.category) ?? 0) + 1);
  });
  return SEARCH_INDEX.filter((d) => !seedIds.includes(d.id))
    .map((d) => ({ d, score: d.tags.reduce((acc, t) => acc + (tagWeights.get(normalize(t)) ?? 0), 0) * 2 + (cats.get(d.category) ?? 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.d);
}

/* --------------------------------- Sitemap -------------------------------- */

export function allRoutes(): { path: string; label: string; group: string }[] {
  const r: { path: string; label: string; group: string }[] = [
    { path: "/", label: "Início", group: "Principal" },
    { path: "/ferramentas", label: "Ferramentas", group: "Principal" },
    { path: "/prompts", label: "Central de prompts", group: "Principal" },
    { path: "/prompts/builder", label: "Prompt Builder", group: "Principal" },
    { path: "/noticias", label: "Notícias", group: "Principal" },
    { path: "/blog", label: "Blog", group: "Principal" },
    { path: "/tutoriais", label: "Tutoriais", group: "Principal" },
    { path: "/guias", label: "Guias", group: "Principal" },
    { path: "/videos", label: "Vídeos", group: "Principal" },
    { path: "/categorias", label: "Categorias", group: "Principal" },
    { path: "/tags", label: "Tags", group: "Principal" },
    { path: "/buscar", label: "Busca", group: "Utilitárias" },
    { path: "/favoritos", label: "Favoritos", group: "Utilitárias" },
    { path: "/historico", label: "Histórico", group: "Utilitárias" },
    { path: "/sobre", label: "Sobre", group: "Utilitárias" },
    { path: "/contato", label: "Contato", group: "Utilitárias" },
    { path: "/privacidade", label: "Privacidade", group: "Utilitárias" },
    { path: "/termos", label: "Termos de uso", group: "Utilitárias" },
    { path: "/anuncios", label: "Publicidade e afiliados", group: "Utilitárias" },
    { path: "/sitemap", label: "Mapa do site", group: "Utilitárias" },
  ];
  TOOL_CATEGORIES.forEach((c) => r.push({ path: `/ferramentas/categoria/${c.slug}`, label: c.name, group: "Categorias de ferramentas" }));
  TOOLS.forEach((t) => r.push({ path: `/ferramentas/${t.slug}`, label: t.name, group: "Ferramentas" }));
  PROMPT_CATEGORIES.forEach((c) => r.push({ path: `/prompts/categoria/${c.slug}`, label: c.name, group: "Categorias de prompts" }));
  PROMPTS.forEach((p) => r.push({ path: `/prompts/${p.slug}`, label: p.title, group: "Prompts" }));
  NEWS.forEach((c) => r.push({ path: `/noticias/${c.slug}`, label: c.title, group: "Notícias" }));
  ARTICLES.forEach((c) => r.push({ path: `/blog/${c.slug}`, label: c.title, group: "Blog" }));
  TUTORIALS.forEach((c) => r.push({ path: `/tutoriais/${c.slug}`, label: c.title, group: "Tutoriais" }));
  GUIDES.forEach((c) => r.push({ path: `/guias/${c.slug}`, label: c.title, group: "Guias" }));
  VIDEOS.forEach((c) => r.push({ path: `/videos/${c.slug}`, label: c.title, group: "Vídeos" }));
  CATEGORIES.forEach((c) => r.push({ path: `/categorias/${c.slug}`, label: c.name, group: "Categorias" }));
  ALL_TAGS.forEach((t) => r.push({ path: `/tags/${t.slug}`, label: `#${t.tag}`, group: "Tags" }));
  return r;
}
