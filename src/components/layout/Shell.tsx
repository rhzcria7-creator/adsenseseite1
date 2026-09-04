import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bookmark, ChevronRight, Command, History, Menu, Moon, Search, Sun, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Kbd } from "../ui/primitives";
import { SearchCommand } from "./SearchCommand";
import { Toaster } from "../ui/feedback";

const NAV = [
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/prompts", label: "Prompts" },
  { to: "/noticias", label: "Notícias" },
  { to: "/blog", label: "Blog" },
  { to: "/tutoriais", label: "Tutoriais" },
  { to: "/guias", label: "Guias" },
  { to: "/videos", label: "Vídeos" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)} aria-label="Nexo — início">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-fg text-bg">
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 23V9l14 14V9" /></svg>
      </span>
      <span className="text-[17px]">Nexo</span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme, favorites } = useStore();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => { setOpen(false); window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [loc.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((s) => !s); }
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName) && !(e.target as HTMLElement).isContentEditable) { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">Pular para o conteúdo</a>
      <header className={cn("sticky top-0 z-50 border-b transition-all duration-300", scrolled ? "border-line bg-bg/85 backdrop-blur-md" : "border-transparent bg-bg/0")}>
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Principal">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={({ isActive }) => cn("rounded-lg px-3 py-2 text-[14px] font-medium transition-colors", isActive ? "bg-surface-2 text-fg" : "text-fg-2 hover:text-fg hover:bg-surface-2/70")}>{n.label}</NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)} className="hidden h-9 items-center gap-2 rounded-lg border bg-surface px-3 text-sm text-fg-3 transition-colors hover:border-line-2 hover:text-fg-2 md:flex" aria-label="Buscar">
              <Search className="h-4 w-4" /><span className="pr-6">Buscar…</span><Kbd>⌘K</Kbd>
            </button>
            <button onClick={() => setSearchOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-fg-2 hover:bg-surface-2 md:hidden" aria-label="Buscar"><Search className="h-[18px] w-[18px]" /></button>
            <Link to="/favoritos" className="relative hidden h-9 w-9 place-items-center rounded-lg text-fg-2 hover:bg-surface-2 sm:grid" aria-label="Favoritos">
              <Bookmark className="h-[18px] w-[18px]" />
              {favorites.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand" />}
            </Link>
            <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-lg text-fg-2 hover:bg-surface-2" aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -40, opacity: 0, scale: 0.7 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 40, opacity: 0, scale: 0.7 }} transition={{ duration: 0.2 }}>
                  {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-fg-2 hover:bg-surface-2 lg:hidden" aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[60] bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 right-0 z-[70] flex w-[86%] max-w-sm flex-col bg-bg shadow-pop lg:hidden" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }} role="dialog" aria-label="Menu">
              <div className="flex h-16 items-center justify-between border-b px-5"><Logo /><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2" aria-label="Fechar menu"><X className="h-5 w-5" /></button></div>
              <nav className="flex-1 overflow-y-auto p-3">
                {NAV.map((n, i) => (
                  <motion.div key={n.to} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                    <NavLink to={n.to} className={({ isActive }) => cn("flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium", isActive ? "bg-surface-2" : "hover:bg-surface-2/70")}>{n.label}<ChevronRight className="h-4 w-4 text-fg-3" /></NavLink>
                  </motion.div>
                ))}
                <div className="my-3 border-t" />
                {[{ to: "/favoritos", label: "Favoritos", icon: Bookmark }, { to: "/historico", label: "Histórico", icon: History }, { to: "/categorias", label: "Categorias", icon: Command }].map((l) => (
                  <NavLink key={l.to} to={l.to} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] text-fg-2 hover:bg-surface-2/70"><l.icon className="h-4 w-4" />{l.label}</NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main id="conteudo" className="flex-1">{children}</main>
      <Footer />
      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster />
      <BackToTop />
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => { const f = () => setShow(window.scrollY > 900); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  return (
    <AnimatePresence>
      {show && <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-5 left-5 z-40 grid h-10 w-10 place-items-center rounded-full border bg-surface shadow-pop hover:bg-surface-2" aria-label="Voltar ao topo"><ArrowUp className="h-4 w-4" /></motion.button>}
    </AnimatePresence>
  );
}

function Footer() {
  const cols = [
    { title: "Explorar", links: [["/ferramentas", "Ferramentas"], ["/prompts", "Central de prompts"], ["/prompts/builder", "Prompt Builder"], ["/categorias", "Categorias"], ["/tags", "Tags"]] },
    { title: "Conteúdo", links: [["/noticias", "Notícias"], ["/blog", "Blog"], ["/tutoriais", "Tutoriais"], ["/guias", "Guias"], ["/videos", "Vídeos"]] },
    { title: "Você", links: [["/favoritos", "Favoritos"], ["/historico", "Histórico"], ["/buscar", "Busca"]] },
    { title: "Nexo", links: [["/sobre", "Sobre"], ["/contato", "Contato"], ["/anuncios", "Publicidade"], ["/privacidade", "Privacidade"], ["/termos", "Termos"], ["/sitemap", "Mapa do site"]] },
  ];
  return (
    <footer className="mt-24 border-t bg-surface/40">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-fg-3">Ferramentas, prompts e conteúdo sobre IA e tecnologia. Tudo roda no seu navegador — sem cadastro, sem envio de dados.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-fg-3">{c.title}</p>
              <ul className="mt-4 space-y-2.5">{c.links.map(([to, label]) => <li key={to}><Link to={to} className="text-sm text-fg-2 hover:text-fg">{label}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs text-fg-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nexo. Conteúdo editorial local; não substitui aconselhamento profissional.</p>
          <p>Feito com React, Vite, Tailwind e Framer Motion.</p>
        </div>
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; path?: string }[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-fg-3">
        <li><Link to="/" className="hover:text-fg">Início</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            {it.path && i < items.length - 1 ? <Link to={it.path} className="hover:text-fg truncate">{it.label}</Link> : <span className="truncate text-fg-2" aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
