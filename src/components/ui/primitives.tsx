import { forwardRef, useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Icon by name ---------- */
export function Icon({ name, className, size = 18 }: { name: string; className?: string; size?: number }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[name] ?? Icons.Sparkles;
  return <Cmp className={className} size={size} />;
}

/* ---------- Button ---------- */
type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";
const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:opacity-90 active:scale-[0.98]",
  secondary: "bg-bg-3 text-fg hover:bg-line active:scale-[0.98]",
  ghost: "text-fg-2 hover:text-fg hover:bg-bg-3",
  outline: "border border-line-2 text-fg hover:bg-bg-2 active:scale-[0.98]",
  danger: "bg-danger/10 text-danger hover:bg-danger/15",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
  icon: "h-9 w-9",
};
export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button ref={ref} className={cn("inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none", variants[variant], sizes[size], className)} {...props} />
  )
);
Button.displayName = "Button";

/* ---------- Inputs ---------- */
const fieldBase = "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-[15px] text-fg placeholder:text-fg-3 transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:opacity-50";

export function Field({ label, hint, error, children, className }: { label?: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1.5 block text-[13px] font-medium text-fg-2">{label}</span>}
      {children}
      {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-fg-3">{hint}</span> : null}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { suffix?: string; prefix?: string }>(({ className, suffix, prefix, ...props }, ref) => {
  if (!suffix && !prefix) return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
  return (
    <div className="relative">
      {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-fg-3">{prefix}</span>}
      <input ref={ref} className={cn(fieldBase, prefix && "pl-10", suffix && "pr-14", className)} {...props} />
      {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fg-3">{suffix}</span>}
    </div>
  );
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[140px] resize-y font-sans leading-relaxed", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(fieldBase, "appearance-none pr-10", className)} {...props}>
      {children}
    </select>
    <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-3" />
  </div>
));
Select.displayName = "Select";

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2.5 text-sm text-fg-2">
      <span className={cn("relative h-6 w-10 rounded-full transition-colors", checked ? "bg-accent" : "bg-line-2")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </span>
      {label}
    </button>
  );
}

export function Range({ value, min, max, step = 1, onChange, label, display }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label?: string; display?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-[13px]">
          <span className="font-medium text-fg-2">{label}</span>
          <span className="font-mono text-fg">{display ?? value}</span>
        </div>
      )}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
    </div>
  );
}

/* ---------- Badge / Chip ---------- */
export function Badge({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "accent" | "ok" | "warn" }) {
  const tones = {
    neutral: "bg-bg-3 text-fg-2",
    accent: "bg-accent/10 text-accent",
    ok: "bg-ok/10 text-ok",
    warn: "bg-warn/10 text-warn",
  };
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", tones[tone], className)}>{children}</span>;
}

export function Chip({ active, children, onClick, className }: { active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors", active ? "border-fg bg-fg text-bg" : "border-line text-fg-2 hover:border-line-2 hover:text-fg", className)}>
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className, hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={cn("surface p-5", hover && "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]", className)}>{children}</div>;
}

/* ---------- Tabs ---------- */
export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: { value: T; label: string }[]; className?: string }) {
  return (
    <div className={cn("inline-flex rounded-xl bg-bg-3 p-1", className)}>
      {items.map((it) => (
        <button key={it.value} type="button" onClick={() => onChange(it.value)} className={cn("relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors", value === it.value ? "text-fg" : "text-fg-3 hover:text-fg-2")}>
          {value === it.value && <motion.span layoutId={`tab-${items.map((i) => i.value).join("-")}`} className="absolute inset-0 rounded-lg bg-bg shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          <span className="relative">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Accordion ---------- */
export function Accordion({ items, className }: { items: { q: string; a: ReactNode }[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className={cn("divide-y divide-line rounded-2xl border border-line", className)}>
      {items.map((it, i) => (
        <div key={i}>
          <button type="button" aria-expanded={open === i} aria-controls={`${id}-${i}`} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
            <span className="text-[15px] font-medium text-fg">{it.q}</span>
            <ChevronDown size={18} className={cn("shrink-0 text-fg-3 transition-transform duration-300", open === i && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div id={`${id}-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                <div className="px-5 pb-5 text-[15px] leading-relaxed text-fg-2">{it.a}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

/* ---------- Empty ---------- */
export function Empty({ icon = "Inbox", title, description, action }: { icon?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="surface-2 flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg text-fg-3 shadow-sm">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="h-title text-lg">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-fg-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Section heading ---------- */
export function SectionHead({ eyebrow, title, description, action, className }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h2 className="h-title text-2xl sm:text-[28px]">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-fg-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Stat ---------- */
export function Stat({ label, value, hint, mono = true, big = false }: { label: string; value: string; hint?: string; mono?: boolean; big?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-bg-2 px-4 py-3">
      <div className="text-xs font-medium text-fg-3">{label}</div>
      <div className={cn("mt-0.5 truncate text-fg", mono && "font-mono", big ? "text-2xl font-semibold" : "text-lg font-semibold")}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-fg-3">{hint}</div>}
    </div>
  );
}
