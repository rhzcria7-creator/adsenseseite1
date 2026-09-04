# Nexo — IA, tecnologia e ferramentas

Plataforma front-end (React 19 + TypeScript + Vite + Tailwind v4 + Framer Motion) com:

- **72 ferramentas funcionais** (calculadoras, datas, conversores, texto, geradores, IA, produtividade) — `src/tools/*`
- **Central de prompts** com 45 templates, variáveis, favoritos, histórico e **Prompt Builder** local — `src/pages/PromptPages.tsx`
- **Conteúdo editorial local**: notícias, blog, tutoriais, guias e vídeos — `src/data/*`
- Busca global (⌘K) com autocomplete, categorias, tags, favoritos, histórico e recomendações — `src/lib/content.ts`
- Dark/light mode, transições de página, reveal, skeletons, toasts, accordions, fundo animado em canvas
- SEO client-side (title, description, OG, canonical, JSON-LD, breadcrumbs com schema), `robots.txt`, `sitemap.xml` e página `/sitemap`
- Espaços rotulados para **AdSense**, **afiliados** e **produtos digitais** — `src/components/ui/monetization.tsx`

> 230+ rotas geradas a partir dos dados locais (veja `/sitemap`).

## Rodar

```bash
npm install
npm run dev
npm run build && npm run preview
```

## Roteamento

- Padrão: `HashRouter` (funciona em qualquer host estático / preview single-file).
- Na Vercel, `vercel.json` define `VITE_ROUTER=browser` + rewrites → URLs limpas (`/ferramentas/porcentagem`).

## Conectar backend depois (sem refazer a UI)

| Camada | Arquivo | Como trocar |
| --- | --- | --- |
| Persistência do usuário | `src/lib/store.tsx` → objeto `storage` | Substituir `localStorage` por chamadas à API mantendo a assinatura `get/set/remove` |
| Notícias/artigos | `src/data/news.ts`, `articles.ts`, `learning.ts` | Mapear RSS/CMS para os tipos em `src/lib/types.ts` |
| Newsletter / contato | `Newsletter` e `ContactPage` | Trocar o `localStorage.setItem` por `fetch("/api/...")` |
| Câmbio | `src/tools/converters.tsx` → `Moeda` | Preencher a taxa a partir de uma API |

## AdSense

Adicione o script do AdSense em `index.html` e substitua o placeholder de `AdSlot` por `<ins class="adsbygoogle" …>`. Os tamanhos (horizontal, rectangle, vertical, in-article) já estão reservados.
