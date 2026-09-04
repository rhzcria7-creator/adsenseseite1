import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Footer, Header } from "@/components/layout/Shell";
import { Toaster } from "@/components/ui/feedback";
import { PageTransition } from "@/components/ui/motion";
import { Container } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/feedback";

const Home = lazy(() => import("@/pages/Home"));
const ToolPages = lazy(() => import("@/pages/ToolPages").then((m) => ({ default: m.ToolsIndex })));
const ToolPage = lazy(() => import("@/pages/ToolPages").then((m) => ({ default: m.ToolPage })));
const ToolCategoryPage = lazy(() => import("@/pages/ToolPages").then((m) => ({ default: m.ToolCategoryPage })));
const PromptsHub = lazy(() => import("@/pages/PromptPages").then((m) => ({ default: m.PromptsHub })));
const PromptBuilder = lazy(() => import("@/pages/PromptPages").then((m) => ({ default: m.PromptBuilder })));
const PromptDetail = lazy(() => import("@/pages/PromptPages").then((m) => ({ default: m.PromptDetail })));
const PromptCategoryPage = lazy(() => import("@/pages/PromptPages").then((m) => ({ default: m.PromptCategoryPage })));
const ContentList = lazy(() => import("@/pages/ContentPages").then((m) => ({ default: m.ContentList })));
const NewsDetail = lazy(() => import("@/pages/ContentPages").then((m) => ({ default: m.NewsDetail })));
const ArticleDetail = lazy(() => import("@/pages/ContentPages").then((m) => ({ default: m.ArticleDetail })));
const TutorialDetail = lazy(() => import("@/pages/ContentPages").then((m) => ({ default: m.TutorialDetail })));
const GuideDetail = lazy(() => import("@/pages/ContentPages").then((m) => ({ default: m.GuideDetail })));
const VideoDetail = lazy(() => import("@/pages/ContentPages").then((m) => ({ default: m.VideoDetail })));
const SearchPage = lazy(() => import("@/pages/DiscoverPages").then((m) => ({ default: m.SearchPage })));
const CategoriesIndex = lazy(() => import("@/pages/DiscoverPages").then((m) => ({ default: m.CategoriesIndex })));
const CategoryPage = lazy(() => import("@/pages/DiscoverPages").then((m) => ({ default: m.CategoryPage })));
const TagsIndex = lazy(() => import("@/pages/DiscoverPages").then((m) => ({ default: m.TagsIndex })));
const TagPage = lazy(() => import("@/pages/DiscoverPages").then((m) => ({ default: m.TagPage })));
const FavoritesPage = lazy(() => import("@/pages/DiscoverPages").then((m) => ({ default: m.FavoritesPage })));
const HistoryPage = lazy(() => import("@/pages/DiscoverPages").then((m) => ({ default: m.HistoryPage })));
const AboutPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.TermsPage })));
const AdsPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.AdsPage })));
const SitemapPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.SitemapPage })));
const NotFoundPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.NotFoundPage })));

function PageFallback() {
  return (
    <Container wide className="py-10">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-6 h-12 w-2/3 max-w-xl" />
      <Skeleton className="mt-4 h-4 w-1/2 max-w-md" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </Container>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/ferramentas" element={<ToolPages />} />
                <Route path="/ferramentas/categoria/:cat" element={<ToolCategoryPage />} />
                <Route path="/ferramentas/:slug" element={<ToolPage />} />
                <Route path="/prompts" element={<PromptsHub />} />
                <Route path="/prompts/builder" element={<PromptBuilder />} />
                <Route path="/prompts/categoria/:cat" element={<PromptCategoryPage />} />
                <Route path="/prompts/:slug" element={<PromptDetail />} />
                <Route path="/noticias" element={<ContentList kind="news" />} />
                <Route path="/noticias/:slug" element={<NewsDetail />} />
                <Route path="/blog" element={<ContentList kind="article" />} />
                <Route path="/blog/:slug" element={<ArticleDetail />} />
                <Route path="/tutoriais" element={<ContentList kind="tutorial" />} />
                <Route path="/tutoriais/:slug" element={<TutorialDetail />} />
                <Route path="/guias" element={<ContentList kind="guide" />} />
                <Route path="/guias/:slug" element={<GuideDetail />} />
                <Route path="/videos" element={<ContentList kind="video" />} />
                <Route path="/videos/:slug" element={<VideoDetail />} />
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
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/artigos" element={<Navigate to="/blog" replace />} />
                <Route path="/tools" element={<Navigate to="/ferramentas" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
