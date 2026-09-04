# Nexo — IA, tecnologia, ferramentas e prompts

Plataforma **100% front-end** (React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + Framer Motion + React Router 7). Sem backend, banco ou login.

- **116 ferramentas funcionais** — `src/tools/*` (32 calculadoras, 8 de datas, 23 conversores, 15 de texto, 17 geradores, 12 de IA, 9 de produtividade)
- **Central de prompts**: 45 templates com variáveis, filtros, favoritos, histórico e **Prompt Builder** com presets — `src/pages/PromptPages.tsx`
- **Conteúdo editorial local**: 14 notícias, 12 artigos, 8 tutoriais, 6 guias (com capítulos), 8 vídeos — `src/data/*`
- Busca global (⌘K / `/`) com autocomplete, categorias, tags, favoritos, histórico, recomendações e rotação diária de destaques — `src/lib/content.ts`
- Dark/light mode sem flash, transições de página, reveal, skeletons, toasts, accordions, fundo animado em canvas (pausa em aba oculta, respeita `prefers-reduced-motion`)
- SEO client-side: title, description, canonical, Open Graph, JSON-LD (WebPage/Article + BreadcrumbList), `robots.txt`, `sitemap.xml`, `/sitemap`
- **AdSense** configurado — `index.html` (script único) + `src/components/ui/monetization.tsx`

> 300+ rotas geradas a partir dos dados locais (veja `/sitemap`).

## Rodar

```bash
npm install
npm run dev
npm run build && npm run preview
```

## Estrutura

```
src/
  App.tsx                 rotas, transições, error boundary, Hash/BrowserRouter
  lib/                    types, utils, store (localStorage "nexo:*"), seo, content (busca/tags/recomendação)
  data/                   tools.ts, prompts.ts, news.ts, articles.ts, learning.ts
  components/ui/          primitives, motion (React Bits-like), feedback (toasts/copy/fav), monetization (AdSense)
  components/layout/      Shell (header, menu mobile, footer, breadcrumbs), SearchCommand (⌘K)
  components/content/     Cards, Body (renderizador de blocos)
  tools/                  ToolShell (FormulaTool/TextTool/TemplateTool), calculators, converters, text, generators, ai, productivity, registry
  pages/                  Home, ToolPages, ContentPages, PromptPages, DiscoverPages, StaticPages
public/                   robots.txt, sitemap.xml, ads.txt
scripts/generate-sitemap.mjs   regenera o sitemap a partir dos dados
```

## Adicionar uma ferramenta

1. Adicione o metadado em `src/data/tools.ts` (nome, descrição, exemplos, FAQ, relacionadas).
2. Calculadora simples: adicione uma entrada em `CALC_CONFIGS` (`src/tools/calculators.tsx`).
   Ferramenta custom: crie o componente e registre em `src/tools/registry.tsx`.
3. Rode `node scripts/generate-sitemap.mjs`.

## Roteamento

- Padrão: `HashRouter` (funciona em qualquer host estático / preview single-file).
- Na Vercel, `vercel.json` define `VITE_ROUTER=browser` + rewrites → URLs limpas (`/ferramentas/porcentagem`).

## AdSense

- Script carregado **uma única vez** no `<head>` de `index.html` (`ca-pub-2412850402145505`).
- `AdSlot`, `AdBanner`, `AdInArticle`, `AdSidebar` em `src/components/ui/monetization.tsx`.
- Substitua os `data-ad-slot` de exemplo (`SLOT_IDS`) pelos IDs reais das unidades criadas no painel do AdSense.
- `public/ads.txt` já inclui o publisher.

## Deploy na Vercel

1. Suba o repositório no GitHub.
2. Em vercel.com → *New Project* → importe o repositório (framework: Vite; build `npm run build`; output `dist`).
3. `vercel.json` já configura `VITE_ROUTER=browser`, rewrites de SPA e headers de segurança.
4. Após publicar, atualize `SITE_URL` em `src/lib/seo.ts`, `public/robots.txt` e `public/sitemap.xml` com o domínio final.

## Conectar backend depois (sem refazer a UI)

| Camada | Arquivo | Como trocar |
| --- | --- | --- |
| Persistência do usuário | `src/lib/store.tsx` → objeto `storage` | Substituir localStorage por chamadas à API mantendo `get/set/remove` |
| Notícias/artigos | `src/data/news.ts`, `articles.ts`, `learning.ts` | Mapear RSS/CMS para os tipos em `src/lib/types.ts` |
| Contato | `ContactPage` | Trocar `setMsgs` por `fetch("/api/contato")` |
| Câmbio | `src/tools/converters.tsx` → `Moeda` | Preencher a taxa a partir de uma API |
