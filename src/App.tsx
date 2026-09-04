import { Component, Suspense, lazy, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/layout/Shell";
import { PageTransition } from "@/components/ui/motion";
import { Button, CardSkeleton } from "@/components/ui/primitives";
import Home from "@/pages/Home";

const L = <M extends Record<string, unknown>, K extends keyof M>(loader: () => Promise<M>, key: K) => lazy(() => loader().then((m) => ({ default: m[key] as React.ComponentType<Record<string, unknown>> })));
const ToolsIndex = L(() => import("@/pages/ToolPages"), "ToolsIndex"), ToolCategoryPage = L(() => import("@/pages/ToolPages"), "ToolCategoryPage"), ToolPage = L(() => import("@/pages/ToolPages"), "ToolPage");
const ContentIndex = L(() => import("@/pages/ContentPages"), "ContentIndex"), ContentPage = L(() => import("@/pages/ContentPages"), "ContentPage");
const PromptsIndex = L(() => import("@/pages/PromptPages"), "PromptsIndex"), PromptCategoryPage = L(() => import("@/pages/PromptPages"), "PromptCategoryPage"), PromptPage = L(() => import("@/pages/PromptPages"), "PromptPage"), PromptBuilder = L(() => import("@/pages/PromptPages"), "PromptBuilder");
const SearchPage = L(() => import("@/pages/DiscoverPages"), "SearchPage"), CategoriesIndex = L(() => import("@/pages/DiscoverPages"), "CategoriesIndex"), CategoryPage = L(() => import("@/pages/DiscoverPages"), "CategoryPage"), TagsIndex = L(() => import("@/pages/DiscoverPages"), "TagsIndex"), TagPage = L(() => import("@/pages/DiscoverPages"), "TagPage"), FavoritesPage = L(() => import("@/pages/DiscoverPages"), "FavoritesPage"), HistoryPage = L(() => import("@/pages/DiscoverPages"), "HistoryPage");
const AboutPage = L(() => import("@/pages/StaticPages"), "AboutPage"), ContactPage = L(() => import("@/pages/StaticPages"), "ContactPage"), PrivacyPage = L(() => import("@/pages/StaticPages"), "PrivacyPage"), TermsPage = L(() => import("@/pages/StaticPages"), "TermsPage"), AdsPage = L(() => import("@/pages/StaticPages"), "AdsPage"), SitemapPage = L(() => import("@/pages/StaticPages"), "SitemapPage"), NotFoundPage = L(() => import("@/pages/StaticPages"), "NotFoundPage");

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div className="container-x py-24 text-center"><p className="font-mono text-sm text-fg-3">erro</p><h1 className="mt-2 text-2xl font-semibold">Algo deu errado nesta página</h1><p className="mx-auto mt-2 max-w-md text-sm text-fg-2">{this.state.error.message}</p><div className="mt-6 flex justify-center gap-3"><Button onClick={() => { this.setState({ error: null }); window.location.reload(); }}>Recarregar</Button><Button variant="outline" to="/">Início</Button></div></div>
    );
    return this.props.children;
  }
}

function Fallback() {
  return <div className="container-x py-10"><div className="skeleton mb-6 h-10 w-1/3 rounded-lg" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div></div>;
}

function AnimatedRoutes() {
  const loc = useLocation();
  return (
    <ErrorBoundary key={loc.pathname}>
      <Suspense fallback={<Fallback />}>
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={loc.pathname}>
            <Routes location={loc}>
              <Route path="/" element={<Home />} />
              <Route path="/ferramentas" element={<ToolsIndex />} />
              <Route path="/ferramentas/categoria/:slug" element={<ToolCategoryPage />} />
              <Route path="/ferramentas/:slug" element={<ToolPage />} />
              <Route path="/prompts" element={<PromptsIndex />} />
              <Route path="/prompts/builder" element={<PromptBuilder />} />
              <Route path="/prompts/categoria/:slug" element={<PromptCategoryPage />} />
              <Route path="/prompts/:slug" element={<PromptPage />} />
              <Route path="/noticias" element={<ContentIndex kind="news" />} />
              <Route path="/noticias/:slug" element={<ContentPage kind="news" />} />
              <Route path="/blog" element={<ContentIndex kind="article" />} />
              <Route path="/blog/:slug" element={<ContentPage kind="article" />} />
              <Route path="/tutoriais" element={<ContentIndex kind="tutorial" />} />
              <Route path="/tutoriais/:slug" element={<ContentPage kind="tutorial" />} />
              <Route path="/guias" element={<ContentIndex kind="guide" />} />
              <Route path="/guias/:slug" element={<ContentPage kind="guide" />} />
              <Route path="/videos" element={<ContentIndex kind="video" />} />
              <Route path="/videos/:slug" element={<ContentPage kind="video" />} />
              <Route path="/buscar" element={<SearchPage />} />
              <Route path="/categorias" element={<CategoriesIndex />} />
              <Route path="/categorias/:slug" element={<CategoryPage />} />
              <Route path="/tags" element={<TagsIndex />} />
              <Route path="/tags/:slug" element={<TagPage />} />
              <Route path="/favoritos" element={<FavoritesPage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="/privacidade" element={<PrivacyPage />} />
              <Route path="/termos" element={<TermsPage />} />
              <Route path="/anuncios" element={<AdsPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}

/** HashRouter por padrão (funciona em qualquer host estático / preview single-file).
 *  Na Vercel, vercel.json define VITE_ROUTER=browser + rewrites → URLs limpas. */
const Router = import.meta.env.VITE_ROUTER === "browser" ? BrowserRouter : HashRouter;

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Shell><AnimatedRoutes /></Shell>
      </Router>
    </StoreProvider>
  );
}
