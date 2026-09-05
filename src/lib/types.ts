export type ContentKind = "news" | "blog" | "tutorial" | "guide" | "video" | "tool" | "prompt";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; lang?: string; code: string }
  | { type: "callout"; tone?: "info" | "tip" | "warn"; text: string }
  | { type: "ad" };

export interface BaseEntry {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string; // ISO
  readTime: number; // minutes
  author?: string;
  cover?: string; // gradient key or url
  popularity: number; // 0-100
}

export interface Article extends BaseEntry {
  kind: "news" | "blog" | "tutorial" | "guide";
  level?: "iniciante" | "intermediário" | "avançado";
  body: Block[];
}

export interface Video extends BaseEntry {
  kind: "video";
  youtubeId: string;
  duration: string;
  channel: string;
  body: Block[];
}

export type ToolCategory = "calculadoras" | "conversores" | "texto" | "geradores" | "ia" | "produtividade" | "datas";

export interface ToolFaq { q: string; a: string }

export interface ToolMeta {
  slug: string;
  name: string;
  short: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  icon: string; // lucide icon name
  popularity: number;
  howTo: string[];
  examples: string[];
  faq: ToolFaq[];
  related: string[];
  seoTitle?: string;
}

export type PromptCategory =
  | "ia" | "marketing" | "vendas" | "programacao" | "negocios" | "imagens" | "videos" | "estudos" | "produtividade" | "conteudo";

export interface PromptTemplate {
  slug: string;
  title: string;
  category: PromptCategory;
  description: string;
  tags: string[];
  variables: string[]; // placeholders like {produto}
  template: string;
  popularity: number;
  platform?: string;
}

export interface SearchDoc {
  id: string;
  kind: ContentKind;
  title: string;
  excerpt: string;
  path: string;
  tags: string[];
  category: string;
  popularity: number;
  date?: string;
}
