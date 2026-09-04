export type ContentKind = "tool" | "news" | "article" | "tutorial" | "guide" | "video" | "prompt";

export type ToolCategory = "calculadoras" | "datas" | "conversores" | "texto" | "geradores" | "ia" | "produtividade";

export interface FAQItem { q: string; a: string }

export interface ToolMeta {
  slug: string;
  name: string;
  short: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  keywords?: string[];
  howItWorks: string;
  examples: string[];
  faq: FAQItem[];
  related: string[];
  featured?: boolean;
  isNew?: boolean;
}

export interface ContentBlock {
  type: "p" | "h2" | "h3" | "ul" | "ol" | "quote" | "code" | "callout" | "table";
  text?: string;
  items?: string[];
  lang?: string;
  rows?: string[][];
}

export interface BaseContent {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readingTime: number;
  body: ContentBlock[];
  featured?: boolean;
  cover?: string;
  source?: { name: string; url?: string };
}

export interface NewsItem extends BaseContent { kind: "news" }
export interface ArticleItem extends BaseContent { kind: "article" }
export interface TutorialItem extends BaseContent {
  kind: "tutorial";
  level: "iniciante" | "intermediário" | "avançado";
  steps: { title: string; text: string; code?: string; lang?: string }[];
  toolsUsed?: string[];
}
export interface GuideItem extends BaseContent {
  kind: "guide";
  chapters: { title: string; summary: string; body: ContentBlock[] }[];
}
export interface VideoItem extends BaseContent {
  kind: "video";
  duration: string;
  channel: string;
  youtubeId?: string;
  keyPoints: string[];
  transcriptSummary: string;
}

export type ContentItem = NewsItem | ArticleItem | TutorialItem | GuideItem | VideoItem;

export type PromptCategory = "ia" | "marketing" | "vendas" | "negocios" | "programacao" | "imagens" | "videos" | "estudos" | "produtividade" | "conteudo";

export interface PromptItem {
  slug: string;
  title: string;
  category: PromptCategory;
  description: string;
  prompt: string;
  variables: string[];
  tags: string[];
  platform: string[];
  difficulty: "básico" | "intermediário" | "avançado";
}

export interface SearchDoc {
  id: string;
  kind: ContentKind;
  title: string;
  description: string;
  path: string;
  tags: string[];
  category: string;
  date?: string;
  haystack: string;
}

export interface Category { slug: string; name: string; description: string; kinds: ContentKind[] }
