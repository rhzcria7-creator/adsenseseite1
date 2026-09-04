// Gera public/sitemap.xml a partir dos slugs em src/data/* (sem executar TS).
// Uso: node scripts/generate-sitemap.mjs
import { readFileSync, writeFileSync } from "node:fs";
const SITE = "https://nexo.app";
const read = (p) => readFileSync(new URL(`../src/data/${p}`, import.meta.url), "utf8");
const slugs = (src, re) => [...src.matchAll(re)].map((m) => m[1]);
const tools = slugs(read("tools.ts"), /\bt\("([^"]+)"/g);
const prompts = slugs(read("prompts.ts"), /\bpr\("([^"]+)"/g);
const news = slugs(read("news.ts"), /\bn\("([^"]+)"/g);
const articles = slugs(read("articles.ts"), /\ba\("([^"]+)"/g);
const learning = read("learning.ts");
const tutorials = slugs(learning, /\btut\("([^"]+)"/g), guides = slugs(learning, /\bguide\("([^"]+)"/g), videos = slugs(learning, /\bvid\("([^"]+)"/g);
const toolCats = ["calculadoras", "datas", "conversores", "texto", "geradores", "ia", "produtividade"];
const promptCats = ["ia", "marketing", "vendas", "negocios", "programacao", "imagens", "videos", "estudos", "produtividade", "conteudo"];
const cats = ["inteligencia-artificial", "tecnologia", "programacao", "marketing", "negocios", "design", "financas", "produtividade", "seguranca", "hardware", "carreira", "educacao", "produto", "conteudo", "utilidades"];
const urls = [
  ["/", 1.0], ["/ferramentas", 0.9], ["/prompts", 0.9], ["/prompts/builder", 0.9], ["/noticias", 0.8], ["/blog", 0.8], ["/tutoriais", 0.8], ["/guias", 0.8], ["/videos", 0.8], ["/categorias", 0.6], ["/tags", 0.5], ["/sobre", 0.4], ["/contato", 0.4], ["/privacidade", 0.3], ["/termos", 0.3], ["/anuncios", 0.3], ["/sitemap", 0.3],
  ...toolCats.map((c) => [`/ferramentas/categoria/${c}`, 0.7]), ...tools.map((s) => [`/ferramentas/${s}`, 0.8]),
  ...promptCats.map((c) => [`/prompts/categoria/${c}`, 0.6]), ...prompts.map((s) => [`/prompts/${s}`, 0.7]),
  ...news.map((s) => [`/noticias/${s}`, 0.7]), ...articles.map((s) => [`/blog/${s}`, 0.7]), ...tutorials.map((s) => [`/tutoriais/${s}`, 0.7]), ...guides.map((s) => [`/guias/${s}`, 0.7]), ...videos.map((s) => [`/videos/${s}`, 0.6]),
  ...cats.map((c) => [`/categorias/${c}`, 0.5]),
];
const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, p]) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><priority>${p.toFixed(1)}</priority></url>`).join("\n")}\n</urlset>\n`;
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`sitemap.xml: ${urls.length} URLs`);
