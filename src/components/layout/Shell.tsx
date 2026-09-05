import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronRight, Heart, Menu, Moon, Search, Sun, X } from "lucide-react";
import { cn, SITE } from "@/lib/utils";
import { useTheme, useFavorites } from "@/lib/store";
import { SearchCommand } from "./SearchCommand";
import { stats } from "@/lib/content";

const nav = [
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
    <Link to="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${SITE.name} — início`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fg text-bg">
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 23V9l14 14V9" />
        </svg>
      </span>
      <span className="text-[17px] font-bold tracking-tight">{SITE.name}</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { items: favs } = useFavorites();
  const loc = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.2 });

  useEffect(() => setOpen(false), [loc.pathname]);
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
        setSearchOpen((s) => !s);
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
      <header className={cn("sticky top-0 z-50 border-b transition-colors duration-300", scrolled ? "border-line bg-bg/85 backdrop-blur-md" : "border-transparent bg-bg/0")}>
        <motion.div style={{ scaleX: progress }} className="absolute inset-x-0 top-0 h-[2px] origin-left bg-accent" />
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
              {nav.map((n) => (
                <NavLink key={n.to} to={n.to} className={({ isActive }) => cn("rounded-lg px-3 py-2 text-[14px] font-medium transition-colors", isActive ? "text-fg bg-bg-3" : "text-fg-2 hover:text-fg hover:bg-bg-2")}>
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)} className="hidden h-9 items-center gap-2 rounded-xl border border-line bg-bg-2 px-3 text-sm text-fg-3 transition-colors hover:border-line-2 hover:text-fg-2 sm:flex" aria-label="Buscar">
              <Search size={15} />
              <span className="pr-6">Buscar…</span>
              <kbd className="ml-auto rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] text-fg-3">⌘K</kbd>
            </button>
            <button onClick={() => setSearchOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 hover:bg-bg-3 sm:hidden" aria-label="Buscar">
              <Search size={18} />
            </button>
            <Link to="/favoritos" className="relative flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg" aria-label="Favoritos">
              <Heart size={18} />
              {favs.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">{favs.length}</span>}
            </Link>
            <button onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg" aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button onClick={() => setOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 hover:bg-bg-3 lg:hidden" aria-label="Menu" aria-expanded={open}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 top-16 z-40 bg-bg lg:hidden">
            <motion.nav initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="container-x flex flex-col py-4" aria-label="Menu mobile">
              {[{ to: "/", label: "Início" }, ...nav, { to: "/favoritos", label: "Favoritos" }, { to: "/historico", label: "Histórico" }, { to: "/tendencias", label: "Tendências" }, { to: "/tags", label: "Tags" }].map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                  <NavLink to={n.to} end={n.to === "/"} className={({ isActive }) => cn("flex items-center justify-between border-b border-line py-4 text-lg font-medium", isActive ? "text-fg" : "text-fg-2")}>
                    {n.label}
                    <ChevronRight size={18} className="text-fg-3" />
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export function Footer() {
  const cols = [
    { title: "Explorar", links: [{ to: "/ferramentas", l: "Ferramentas" }, { to: "/prompts", l: "Central de prompts" }, { to: "/prompts/builder", l: "Prompt Builder" }, { to: "/tendencias", l: "Tendências" }, { to: "/tags", l: "Todas as tags" }] },
    { title: "Conteúdo", links: [{ to: "/noticias", l: "Notícias" }, { to: "/blog", l: "Blog" }, { to: "/tutoriais", l: "Tutoriais" }, { to: "/guias", l: "Guias" }, { to: "/videos", l: "Vídeos" }] },
    { title: "Você", links: [{ to: "/favoritos", l: "Favoritos" }, { to: "/historico", l: "Histórico" }, { to: "/busca", l: "Busca" }] },
    { title: "Nexo", links: [{ to: "/sobre", l: "Sobre" }, { to: "/contato", l: "Contato" }, { to: "/privacidade", l: "Privacidade" }, { to: "/termos", l: "Termos de uso" }] },
  ];
  return (
    <footer className="mt-24 border-t border-line bg-bg-2/60">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-2">{SITE.tagline}. {stats.tools} ferramentas, {stats.prompts} prompts e {stats.articles} conteúdos — tudo gratuito e processado no seu navegador.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="eyebrow mb-4">{c.title}</div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="link-underline text-sm text-fg-2 hover:text-fg">{l.l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-fg-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.</span>
          <span>Conteúdo informativo. Não constitui aconselhamento financeiro, jurídico ou médico.</span>
        </div>
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto">
      <ol className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-fg-3">
        <li><Link to="/" className="hover:text-fg">Início</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight size={13} />
            {it.path && i < items.length - 1 ? <Link to={it.path} className="hover:text-fg">{it.name}</Link> : <span className="text-fg-2" aria-current="page">{it.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ eyebrow, title, description, children, className }: { eyebrow?: string; title: string; description?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-10", className)}>
      {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
      <h1 className="h-display text-4xl sm:text-5xl">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-2">{description}</p>}
      {children}
    </div>
  );
}
