import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button, Input } from "./primitives";

/**
 * AdSlot — reserved, honestly labelled space for Google AdSense.
 * To activate: add the AdSense script to index.html and replace the placeholder
 * with <ins class="adsbygoogle" data-ad-client="ca-pub-XXXX" data-ad-slot="..." />.
 * Until then it renders a clearly labelled, non-deceptive placeholder.
 */
export function AdSlot({ format = "horizontal", className, id }: { format?: "horizontal" | "rectangle" | "vertical" | "in-article"; className?: string; id?: string }) {
  const sizes = {
    horizontal: "min-h-[90px]",
    rectangle: "min-h-[250px] max-w-[336px]",
    vertical: "min-h-[600px] max-w-[300px]",
    "in-article": "min-h-[120px]",
  };
  return (
    <aside aria-label="Espaço publicitário" data-ad-slot={id} className={cn("flex w-full items-center justify-center border border-dashed border-line bg-elev/60", sizes[format], className)}>
      <div className="text-center">
        <div className="eyebrow">Publicidade</div>
        <p className="mt-1 max-w-xs px-4 text-[11px] leading-relaxed text-subtle">Espaço reservado para anúncios. Saiba como financiamos a plataforma em <Link to="/anuncios" className="underline underline-offset-2 hover:text-fg">Publicidade e afiliados</Link>.</p>
      </div>
    </aside>
  );
}

/** AffiliateBox — transparent recommendation block with disclosure. */
export function AffiliateBox({ title, description, cta = "Conhecer", href, tag = "Recomendação", className }: { title: string; description: string; cta?: string; href?: string; tag?: string; className?: string }) {
  return (
    <div className={cn("border border-line p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{tag}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">Link de afiliado</span>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-tight">{title}</h3>
      <p className="mt-1.5 text-sm text-muted">{description}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex h-9 items-center gap-1.5 border border-line px-3 text-xs font-medium transition-colors hover:border-strong">
            {cta} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="text-xs text-subtle">Link em breve</span>
        )}
        <Link to="/anuncios" className="text-[11px] text-subtle underline underline-offset-2 hover:text-fg">
          Como funciona?
        </Link>
      </div>
    </div>
  );
}

/** ProductBox — space for own digital products (ebooks, templates, courses). */
export function ProductBox({ title, description, price, cta = "Em breve", href, className }: { title: string; description: string; price?: string; cta?: string; href?: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden border border-strong bg-fg p-5 text-bg", className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">Produto digital</span>
        {price && <span className="font-mono text-xs">{price}</span>}
      </div>
      <h3 className="mt-3 font-display text-xl font-semibold leading-tight">{title}</h3>
      <p className="mt-1.5 text-sm opacity-75">{description}</p>
      <div className="mt-4">
        {href ? (
          <a href={href} className="inline-flex h-9 items-center gap-1.5 bg-accent px-3 text-xs font-medium text-white transition-colors hover:bg-accent-strong">
            {cta} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="inline-flex h-9 items-center border border-current/30 px-3 text-xs font-medium opacity-70">{cta}</span>
        )}
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 border border-current/15" />
    </div>
  );
}

/** Newsletter — stores subscription intent locally; ready to POST to a provider. */
export function Newsletter({ className, compact }: { className?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const { toast } = useStore();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Informe um e-mail válido", tone: "error" });
      return;
    }
    try {
      const list: string[] = JSON.parse(localStorage.getItem("nexo:newsletter") ?? "[]");
      if (!list.includes(email)) list.push(email);
      localStorage.setItem("nexo:newsletter", JSON.stringify(list));
    } catch {
      /* noop */
    }
    setDone(true);
    toast({ title: "Inscrição registrada", description: "Você será avisado quando a newsletter começar.", tone: "success" });
  };
  return (
    <div className={cn("border-t border-strong pt-5", className)}>
      {!compact && <div className="eyebrow">Newsletter</div>}
      <h3 className={cn("font-display font-semibold leading-tight", compact ? "text-lg" : "mt-2 text-2xl")}>Uma edição por semana. Ferramentas, prompts e o que importa em IA.</h3>
      {done ? (
        <p className="mt-4 text-sm text-mint">Pronto. Guardamos seu interesse localmente — sem spam, sem envio até a newsletter existir.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" aria-label="E-mail" className="sm:max-w-xs" />
          <Button type="submit">Quero receber</Button>
        </form>
      )}
      <p className="mt-2 text-[11px] text-subtle">Sem backend nesta versão: o e-mail fica apenas no seu navegador.</p>
    </div>
  );
}
