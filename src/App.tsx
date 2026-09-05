import { Component, Suspense, useEffect, type ReactNode } from "react";
import { BrowserRouter, HashRouter, Route, Routes, useLocation, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Header, Footer } from "@/components/layout/Shell";
import { ToastProvider } from "@/components/ui/feedback";
import { AnimatedBackground, PageTransition } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/primitives";

import Home from "@/pages/Home";
import { ToolsIndex, ToolCategoryPage, ToolPage } from "@/pages/ToolPages";
import { ContentList, ContentDetail } from "@/pages/ContentPages";
import { PromptsIndex, PromptDetail, PromptBuilderPage, SavedPrompts } from "@/pages/PromptPages";
import { SearchPage, FavoritesPage, HistoryPage, TrendingPage, TagsIndex, TagPage } from "@/pages/DiscoverPages";
import { About, Contact, Privacy, Terms, NotFound } from "@/pages/StaticPages";

/* ---------- Error boundary ---------- */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="container-x py-24 text-center">
          <h1 className="h-display text-3xl">Algo deu errado nesta página</h1>
          <p className="mx-auto mt-3 max-w-md text-fg-2">{this.state.error.message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => this.setState({ error: null })} className="rounded-xl bg-fg px-4 py-2 text-sm font-medium text-bg">Tentar novamente</button>
            <Link to="/" onClick={() => this.setState({ error: null })} className="rounded-xl border border-line px-4 py-2 text-sm font-medium">Ir para o início</Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) return el.scrollIntoView({ behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function PageSkeleton() {
  return (
    <div className="container-x py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-12 w-2/3" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const loc = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={loc.pathname}>
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={loc}>
              <Route path="/" element={<Home />} />

              <Route path="/ferramentas" element={<ToolsIndex />} />
              <Route path="/ferramentas/categoria/:cat" element={<ToolCategoryPage />} />
              <Route path="/ferramentas/:slug" element={<ToolPage />} />

              <Route path="/prompts" element={<PromptsIndex />} />
              <Route path="/prompts/builder" element={<PromptBuilderPage />} />
              <Route path="/prompts/salvos" element={<SavedPrompts />} />
              <Route path="/prompts/categoria/:cat" element={<PromptsIndex />} />
              <Route path="/prompts/:slug" element={<PromptDetail />} />

              <Route path="/noticias" element={<ContentList kind="news" />} />
              <Route path="/noticias/categoria/:cat" element={<ContentList kind="news" />} />
              <Route path="/noticias/:slug" element={<ContentDetail kind="news" />} />

              <Route path="/blog" element={<ContentList kind="blog" />} />
              <Route path="/blog/categoria/:cat" element={<ContentList kind="blog" />} />
              <Route path="/blog/:slug" element={<ContentDetail kind="blog" />} />

              <Route path="/tutoriais" element={<ContentList kind="tutorial" />} />
              <Route path="/tutoriais/categoria/:cat" element={<ContentList kind="tutorial" />} />
              <Route path="/tutoriais/:slug" element={<ContentDetail kind="tutorial" />} />

              <Route path="/guias" element={<ContentList kind="guide" />} />
              <Route path="/guias/categoria/:cat" element={<ContentList kind="guide" />} />
              <Route path="/guias/:slug" element={<ContentDetail kind="guide" />} />

              <Route path="/videos" element={<ContentList kind="video" />} />
              <Route path="/videos/categoria/:cat" element={<ContentList kind="video" />} />
              <Route path="/videos/:slug" element={<ContentDetail kind="video" />} />

              <Route path="/busca" element={<SearchPage />} />
              <Route path="/favoritos" element={<FavoritesPage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/tendencias" element={<TrendingPage />} />
              <Route path="/tags" element={<TagsIndex />} />
              <Route path="/tags/:tag" element={<TagPage />} />

              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/privacidade" element={<Privacy />} />
              <Route path="/termos" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </PageTransition>
    </AnimatePresence>
  );
}

/** HashRouter por padrão (funciona em qualquer host estático / preview single-file).
 *  Na Vercel, vercel.json define VITE_ROUTER=browser + rewrites → URLs limpas. */
const Router = import.meta.env.VITE_ROUTER === "browser" ? BrowserRouter : HashRouter;

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AnimatedBackground />
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </Router>
  );
}
