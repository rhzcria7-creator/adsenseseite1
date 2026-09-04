import { forwardRef, useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/* ---------------------------------- Button --------------------------------- */
type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";
const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:opacity-90 active:scale-[0.98]",
  secondary: "bg-surface-2 text-fg hover:bg-line active:scale-[0.98]",
  outline: "border bg-surface text-fg hover:bg-surface-2 active:scale-[0.98]",
  ghost: "text-fg-2 hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger text-white hover:opacity-90",
};
const sizes: Record<Size, string> = { sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg", md: "h-10 px-4 text-sm gap-2 rounded-xl", lg: "h-12 px-6 text-[15px] gap-2 rounded-xl", icon: "h-9 w-9 rounded-lg" };
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; to?: string }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "md", to, children, ...props }, ref) => {
  const cls = cn("inline-flex items-center justify-center font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 select-none", variants[variant], sizes[size], className);
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button ref={ref} className={cls} {...props}>{children}</button>;
});
Button.displayName = "Button";

/* ---------------------------------- Inputs --------------------------------- */
const fieldBase = "w-full rounded-xl border bg-surface px-3.5 text-sm text-fg placeholder:text-fg-3 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => <input ref={ref} className={cn(fieldBase, "h-10", className)} {...p} />);
Input.displayName = "Input";
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => <textarea ref={ref} className={cn(fieldBase, "min-h-[120px] py-2.5 leading-6 resize-y", className)} {...p} />);
Textarea.displayName = "Textarea";
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(fieldBase, "h-10 appearance-none pr-9", className)} {...p}>{children}</select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
  </div>
));
Select.displayName = "Select";

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-fg-2">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-fg-3">{hint}</span> : null}
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2.5 text-sm text-fg-2">
      <span className={cn("relative h-6 w-10 rounded-full transition-colors", checked ? "bg-brand" : "bg-line-2")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4.5 left-0.5" : "left-0.5")} style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
      </span>
      {label}
    </button>
  );
}

export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <div className={cn("inline-flex rounded-xl border bg-surface-2 p-1 gap-0.5 max-w-full overflow-x-auto", className)} role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)} className={cn("relative whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors", value === o.value ? "text-fg" : "text-fg-3 hover:text-fg-2")}>
          {value === o.value && <motion.span layoutId={`seg-${options.map((x) => x.value).join("")}`} className="absolute inset-0 rounded-lg bg-surface shadow-card" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------- Card ---------------------------------- */
export function Card({ className, children, hover = false, as: Tag = "div" }: { className?: string; children: ReactNode; hover?: boolean; as?: "div" | "article" | "section" }) {
  return <Tag className={cn("rounded-2xl border bg-surface shadow-card", hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop hover:border-line-2", className)}>{children}</Tag>;
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "brand" | "ok" | "warn"; className?: string }) {
  const tones = { neutral: "bg-surface-2 text-fg-2 border", brand: "bg-brand-soft text-brand border-brand/10 border", ok: "bg-ok/10 text-ok", warn: "bg-warn/10 text-warn" };
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase", tones[tone], className)}>{children}</span>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-surface-2 px-1.5 font-mono text-[11px] text-fg-3">{children}</kbd>;
}

/* --------------------------------- Accordion -------------------------------- */
export function Accordion({ items, single = true }: { items: { q: string; a: ReactNode }[]; single?: boolean }) {
  const [open, setOpen] = useState<number[]>([]);
  const id = useId();
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : single ? [i] : [...o, i]));
  return (
    <div className="divide-y rounded-2xl border bg-surface">
      {items.map((it, i) => {
        const isOpen = open.includes(i);
        return (
          <div key={i}>
            <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium hover:bg-surface-2/60 transition-colors" aria-expanded={isOpen} aria-controls={`${id}-${i}`} onClick={() => toggle(i)}>
              {it.q}
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-fg-3 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`${id}-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <div className="px-5 pb-5 text-sm leading-6 text-fg-2">{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Skeleton --------------------------------- */
export function Skeleton({ className }: { className?: string }) { return <div className={cn("skeleton rounded-lg", className)} aria-hidden />; }
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-surface p-5 space-y-3">
      <Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function Empty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed bg-surface/50 px-6 py-14 text-center">
      <p className="text-base font-medium">{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-md text-sm text-fg-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, description, action, className }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">{eyebrow}</p>}
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        {description && <p className="mt-1.5 text-[15px] text-fg-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <header className="pb-8 pt-4 sm:pt-6">
      {eyebrow && <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-base text-fg-2 sm:text-lg">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
