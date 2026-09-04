import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronRight, Heart, History, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/primitives";
import { SearchCommand } from "./SearchCommand";

export const NAV = [
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
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Nexo — início">
      <span className="relative flex h-7 w-7 items-center justify-center bg-fg text-bg">
        <span className="font-display text-sm font-bold leading-none">N</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-accent transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">Nexo</span>
    </Link>
  );
}

/* --------------------------------- Header --------------------------------- */

export function Header() {
  const { theme, toggleTheme, favorites } = useStore();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById("conteudo");
          el?.focus();
          el?.scrollIntoView({ block: "start" });
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
      >
        Pular para o conteúdo
      </button>
      <header className={cn("sticky top-0 z-50 border-b bg-page/85 backdrop-blur-md transition-colors duration-300", scrolled ? "border-line" : "border-transparent")}>
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-16 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo />
            <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={({ isActive }) => cn("relative px-3 py-2 text-[13px] font-medium tracking-tight transition-colors", isActive ? "text-fg" : "text-muted hover:text-fg")}>
                  {({ isActive }) => (
                    <>
                      {n.label}
                      {isActive && <motion.span layoutId="nav-dot" className="absolute -bottom-[13px] left-3 right-3 h-0.5 bg-accent lg:-bottom-[17px]" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)} className="hidden h-9 items-center gap-2 border border-line px-3 text-xs text-muted transition-colors hover:border-strong hover:text-fg md:inline-flex" aria-label="Abrir busca">
              <Search className="h-3.5 w-3.5" />
              <span>Buscar</span>
              <Kbd>⌘K</Kbd>
            </button>
            <button onClick={() => setSearchOpen(true)} className="inline-flex h-9 w-9 items-center justify-center text-muted hover:text-fg md:hidden" aria-label="Abrir busca">
              <Search className="h-4 w-4" />
            </button>
            <Link to="/favoritos" className="relative hidden h-9 w-9 items-center justify-center text-muted transition-colors hover:text-fg sm:inline-flex" aria-label="Favoritos">
              <Heart className="h-4 w-4" />
              {favorites.length > 0 && <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center bg-accent px-0.5 font-mono text-[9px] text-white">{favorites.length}</span>}
            </Link>
            <Link to="/historico" className="hidden h-9 w-9 items-center justify-center text-muted transition-colors hover:text-fg sm:inline-flex" aria-label="Histórico">
              <History className="h-4 w-4" />
            </Link>
            <button onClick={toggleTheme} className="inline-flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-fg" aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -40, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 40, opacity: 0 }} transition={{ duration: 0.2 }} className="inline-flex">
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button onClick={() => setOpen((v) => !v)} className="inline-flex h-9 w-9 items-center justify-center text-fg lg:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-page lg:hidden"
            >
              <nav aria-label="Menu móvel" className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
                <motion.ul initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} className="divide-y divide-[var(--line)] border-y border-line">
                  {[{ to: "/", label: "Início" }, ...NAV, { to: "/prompts/builder", label: "Prompt Builder" }, { to: "/categorias", label: "Categorias" }, { to: "/favoritos", label: "Favoritos" }, { to: "/historico", label: "Histórico" }].map((n) => (
                    <motion.li key={n.to} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                      <Link to={n.to} className="flex items-center justify-between py-4 font-display text-2xl font-semibold tracking-tight">
                        {n.label}
                        <ChevronRight className="h-5 w-5 text-subtle" />
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                  <Link to="/sobre">Sobre</Link>
                  <Link to="/contato">Contato</Link>
                  <Link to="/privacidade">Privacidade</Link>
                  <Link to="/sitemap">Mapa do site</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

/* --------------------------------- Footer --------------------------------- */

export function Footer() {
  const cols = [
    { title: "Explorar", links: [["Ferramentas", "/ferramentas"], ["Central de prompts", "/prompts"], ["Prompt Builder", "/prompts/builder"], ["Categorias", "/categorias"], ["Tags", "/tags"]] },
    { title: "Conteúdo", links: [["Notícias", "/noticias"], ["Blog", "/blog"], ["Tutoriais", "/tutoriais"], ["Guias", "/guias"], ["Vídeos", "/videos"]] },
    { title: "Você", links: [["Favoritos", "/favoritos"], ["Histórico", "/historico"], ["Buscar", "/buscar"]] },
    { title: "Nexo", links: [["Sobre", "/sobre"], ["Contato", "/contato"], ["Publicidade e afiliados", "/anuncios"], ["Privacidade", "/privacidade"], ["Termos", "/termos"], ["Mapa do site", "/sitemap"]] },
  ];
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">Ferramentas, prompts e conteúdo sobre IA e tecnologia. Tudo roda no seu navegador — sem cadastro, sem rastreamento invasivo.</p>
            <Link to="/ferramentas" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium link-underline">
              Ver todas as ferramentas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="eyebrow">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-muted transition-colors hover:text-fg">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Nexo. Conteúdo editorial próprio. Ferramentas 100% client-side.</span>
          <span className="font-mono">v2.0 · React · TypeScript · Vite</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------- Page blocks ------------------------------ */

export function Container({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", wide ? "max-w-[1400px]" : "max-w-[1200px]", className)}>{children}</div>;
}

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Início", to: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="overflow-x-auto no-scrollbar">
      <ol className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-subtle" itemScope itemType="https://schema.org/BreadcrumbList">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            {c.to && i < all.length - 1 ? (
              <Link to={c.to} className="transition-colors hover:text-fg" itemProp="item">
                <span itemProp="name">{c.label}</span>
              </Link>
            ) : (
              <span className="text-muted" itemProp="name" aria-current="page">
                {c.label}
              </span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
            {i < all.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ eyebrow, title, description, crumbs, aside, className }: { eyebrow?: string; title: string; description?: string; crumbs?: Crumb[]; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn("border-b border-line pb-8 pt-6 sm:pt-8", className)}>
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1 className="mt-2 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
          {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </div>
  );
}

export function SectionHeader({ title, eyebrow, to, toLabel = "Ver tudo", className }: { title: string; eyebrow?: string; to?: string; toLabel?: string; className?: string }) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4 border-b border-strong pb-3", className)}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="hidden shrink-0 items-center gap-1.5 text-sm font-medium link-underline sm:inline-flex">
          {toLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
