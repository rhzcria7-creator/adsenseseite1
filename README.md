# Nexo — IA, Tecnologia, Ferramentas e Prompts

Plataforma **100% front-end** (React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + Framer Motion + React Router 7). Sem backend, banco ou login. Todo processamento (ferramentas, favoritos, histórico, prompts) acontece no navegador.

## Estrutura

```
index.html                  meta tags, fontes, script AdSense (carregado 1× de forma assíncrona), anti-flash de tema
vercel.json                 rewrites SPA + VITE_ROUTER=browser + headers de cache/segurança
public/                     robots.txt, sitemap.xml (~230 URLs), ads.txt
scripts/generate-sitemap.mjs  regenera public/sitemap.xml a partir de src/data
src/
  App.tsx                   rotas (HashRouter por padrão; BrowserRouter na Vercel), transições, error boundary, scroll restore
  index.css                 tokens de tema (light/dark via .dark), tipografia, utilitários, animações
  lib/
    types.ts                tipos de conteúdo, ferramentas, prompts e busca
    utils.ts                formatação pt-BR, slugify, seeded shuffle (rotação diária), clipboard, download
    store.ts                localStorage "nexo:*" (tema, favoritos, histórico, prompts salvos, uso de ferramentas, tarefas, notas)
    seo.ts                  useSeo (title/description/OG/canonical/robots) + JSON-LD (Article, FAQPage, BreadcrumbList, SoftwareApplication)
    content.ts              índice unificado, busca com ranking, tags, relacionados, recomendações e rotações (destaques/tendências/recentes/populares)
  data/
    tools.ts                catálogo de 75 ferramentas (descrição, como usar, exemplos, FAQ, relacionadas)
    prompts.ts              48 templates de prompts em 10 categorias + opções e presets do Prompt Builder
    news.ts                 12 notícias   |  articles.ts  12 artigos de blog
    learning.ts             8 tutoriais, 7 guias, 10 vídeos
  components/
    ui/primitives.tsx       Button, Input, Select, Textarea, Switch, Range, Badge, Chip, Tabs (animado), Accordion, Skeleton, Empty, Stat…
    ui/motion.tsx           Reveal, Stagger, SplitText, CountUp, SpotlightCard, Tilt, AnimatedBackground, PageTransition, Pop (estilo React Bits)
    ui/feedback.tsx         ToastProvider/useToast, CopyButton, FavoriteButton
    ui/monetization.tsx     AdSlot, AdBanner, AdInArticle, AdSidebar, AdMobile
    layout/Shell.tsx        Header (progress bar, menu mobile, tema), Footer, Breadcrumbs, PageHeader
    layout/SearchCommand.tsx  busca ⌘K com navegação por teclado
    content/Cards.tsx       ContentCard (4 variantes), ToolCard, PromptCard, DocRow
    content/Body.tsx        renderizador de blocos (p/h2/h3/listas/quote/code/callout/ad) com markdown inline
  tools/
    ToolShell.tsx           ToolLayout (SEO, breadcrumbs, como usar, exemplos, FAQ, relacionadas, ads) + FormulaTool + TextTool genéricos
    calculators.tsx         19 calculadoras + 6 ferramentas de datas
    converters.tsx          17 conversores/codificadores (unidades, bases, cores, JSON, Base64, URL, timestamp…)
    text.tsx                13 ferramentas de texto
    generators.tsx          senha (entropia), QR Code (PNG), UUID, hash (Web Crypto), paleta, sorteador, aleatório, username
    ai.tsx                  tokens/custo, resumidor extrativo, títulos, hashtags, bio, legibilidade (Flesch PT), tom, entrevista
    productivity.tsx        Pomodoro, cronômetro, tarefas, notas, tempo de leitura, roda de decisão
    promptBuilder.tsx       Prompt Builder (objetivo+contexto+público+tom+formato+plataforma+detalhe+resultado) com presets e histórico
    registry.tsx            slug → componente
  pages/                    Home, ToolPages, ContentPages, PromptPages, DiscoverPages (busca, favoritos, histórico, tendências, tags), StaticPages
```

## Rotas (≈ 230 páginas funcionais)

| Rota | Conteúdo |
|---|---|
| `/` | Home: hero com busca, stats animadas, destaques rotativos, ferramentas, ferramenta/prompt do dia, notícias, em alta, recentes, prompts, aprenda, recomendações locais |
| `/ferramentas`, `/ferramentas/categoria/:cat`, `/ferramentas/:slug` | 75 ferramentas em 7 categorias |
| `/prompts`, `/prompts/categoria/:cat`, `/prompts/:slug`, `/prompts/builder`, `/prompts/salvos` | 48 prompts com preenchimento de variáveis + Prompt Builder |
| `/noticias`, `/blog`, `/tutoriais`, `/guias`, `/videos` (+ `/categoria/:cat`, `/:slug`) | 49 conteúdos com corpo estruturado, TOC, relacionados, tags |
| `/busca?q=`, `/favoritos`, `/historico`, `/tendencias`, `/tags`, `/tags/:tag` | descoberta |
| `/sobre`, `/contato`, `/privacidade`, `/termos`, `*` | institucionais + 404 útil |

## AdSense

- Script oficial carregado **uma única vez** no `<head>` de `index.html` (`ca-pub-6438481907721951`, `async`, `crossorigin`).
- `public/ads.txt` incluído.
- Componentes em `src/components/ui/monetization.tsx`. Cada `AdSlot` faz `adsbygoogle.push({})` apenas uma vez após montar, reserva altura mínima (sem CLS) e é rotulado “Publicidade”.
- Posicionamentos: `AdBanner` (entre seções/listas), `AdInArticle` (bloco `{type:"ad"}` no corpo dos artigos), `AdSidebar` (sticky, desktop), `AdMobile` (apenas mobile). Nenhum anúncio sobre inputs das ferramentas.
- Para usar unidades específicas, passe `slot="1234567890"` ao `AdSlot`; sem slot, funciona com Auto Ads.

## SEO

Title/description/OG/canonical por rota (`useSeo`), JSON-LD (Article, FAQPage, BreadcrumbList, SoftwareApplication), headings semânticos, breadcrumbs, links internos, `robots.txt`, `sitemap.xml`. Com `VITE_ROUTER=browser` (Vercel) as URLs são limpas.

## Executar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/ (single-file)
npm run preview
node scripts/generate-sitemap.mjs   # regenera o sitemap após adicionar conteúdo
```

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel: **Add New Project → Import**. Framework detectado: Vite. Build: `npm run build`. Output: `dist`.
3. `vercel.json` já define `VITE_ROUTER=browser` (URLs limpas) e os rewrites de SPA. Nada mais a configurar.
4. Após o deploy, teste abrir uma rota interna diretamente (ex.: `/ferramentas/juros-compostos`).
5. Atualize `SITE.url` em `src/lib/utils.ts` e o domínio em `robots.txt`/`sitemap.xml` para o seu domínio final.

## Dados locais

Tudo sob o prefixo `nexo:` no `localStorage`: `theme`, `favorites`, `history`, `prompt-history`, `tool-usage`, `tasks`, `notes`, `pomodoro-sessions`.
