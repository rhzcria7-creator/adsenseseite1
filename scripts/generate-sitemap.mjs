/**
 * Gera public/sitemap.xml a partir dos dados em src/data.
 * Uso: node scripts/generate-sitemap.mjs
 * (Executa via regex sobre os arquivos TS para não exigir build/transpilação.)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const SITE = "https://nexo-ia.vercel.app";
const today = new Date().toISOString().slice(0, 10);

const read = (p) => readFileSync(resolve(root, p), "utf8");
const slugs = (src) => [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const slugify = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const urls = new Set(["/", "/ferramentas", "/prompts", "/prompts/builder", "/noticias", "/blog", "/tutoriais", "/guias", "/videos", "/tendencias", "/tags", "/sobre", "/contato", "/privacidade", "/termos"]);

// tools + categories
const toolsSrc = read("src/data/tools.ts");
for (const s of slugs(toolsSrc)) urls.add(s.match(/^(calculadoras|datas|conversores|texto|geradores|ia|produtividade)$/) ? `/ferramentas/categoria/${s}` : `/ferramentas/${s}`);

// prompts + categories
const promptsSrc = read("src/data/prompts.ts");
for (const s of slugs(promptsSrc)) urls.add(s.match(/^(ia|marketing|vendas|programacao|negocios|imagens|videos|estudos|produtividade|conteudo)$/) ? `/prompts/categoria/${s}` : `/prompts/${s}`);

// content
const add = (file, base) => {
  const src = read(file);
  for (const s of slugs(src)) urls.add(`${base}/${s}`);
  for (const m of src.matchAll(/category:\s*"([^"]+)"/g)) urls.add(`${base}/categoria/${slugify(m[1])}`);
};
add("src/data/news.ts", "/noticias");
add("src/data/articles.ts", "/blog");
// learning.ts contains tutorials, guides and videos: split by section markers
const learning = read("src/data/learning.ts");
const [tutPart, rest] = learning.split("export const guides");
const [guidePart, videoPart] = rest.split("export const videos");
for (const s of slugs(tutPart)) urls.add(`/tutoriais/${s}`);
for (const s of slugs(guidePart)) urls.add(`/guias/${s}`);
for (const s of slugs(videoPart)) urls.add(`/videos/${s}`);
for (const [part, base] of [[tutPart, "/tutoriais"], [guidePart, "/guias"], [videoPart, "/videos"]]) for (const m of part.matchAll(/category:\s*"([^"]+)"/g)) urls.add(`${base}/categoria/${slugify(m[1])}`);

// tags
const tags = new Set();
for (const src of [toolsSrc, promptsSrc, read("src/data/news.ts"), read("src/data/articles.ts"), learning]) for (const m of src.matchAll(/tags:\s*\[([^\]]*)\]/g)) for (const t of m[1].matchAll(/"([^"]+)"/g)) tags.add(slugify(t[1]));
for (const t of tags) urls.add(`/tags/${t}`);

const priority = (u) => (u === "/" ? "1.0" : /^\/(ferramentas|prompts)\/[^/]+$/.test(u) ? "0.8" : u.split("/").length <= 2 ? "0.9" : "0.6");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].sort().map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priority(u)}</priority></url>`).join("\n")}\n</urlset>\n`;
writeFileSync(resolve(root, "public/sitemap.xml"), xml);
console.log(`sitemap.xml gerado com ${urls.size} URLs`);
