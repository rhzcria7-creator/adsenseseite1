import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/* --------------------------------- Button --------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg border border-transparent hover:bg-accent hover:text-white",
  secondary: "bg-transparent text-fg border border-line hover:border-strong",
  ghost: "bg-transparent text-muted border border-transparent hover:text-fg hover:bg-[var(--line)]/40",
  accent: "bg-accent text-white border border-accent hover:bg-accent-strong hover:border-accent-strong",
  danger: "bg-transparent text-red-600 border border-line hover:border-red-600",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "md", to, children, ...props }, ref) => {
  const cls = cn("inline-flex select-none items-center justify-center gap-2 font-medium tracking-tight transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 active:translate-y-px", variants[variant], sizes[size], className);
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} {...props}>
      {children}
    </button>
  );
});
Button.displayName = "Button";

/* ---------------------------------- Field --------------------------------- */

export function Field({ label, hint, error, children, className, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

const inputBase = "w-full bg-elev border border-line px-3 text-sm text-fg placeholder:text-subtle transition-colors focus:border-strong focus:outline-none disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { suffix?: string; prefix?: string }>(({ className, suffix, prefix, ...props }, ref) => {
  if (suffix || prefix) {
    return (
      <div className={cn("flex items-stretch border border-line bg-elev transition-colors focus-within:border-strong", className)}>
        {prefix && <span className="flex items-center border-r border-line px-3 font-mono text-xs text-subtle">{prefix}</span>}
        <input ref={ref} className="h-10 w-full min-w-0 bg-transparent px-3 text-sm text-fg placeholder:text-subtle focus:outline-none" {...props} />
        {suffix && <span className="flex items-center border-l border-line px-3 font-mono text-xs text-subtle">{suffix}</span>}
      </div>
    );
  }
  return <input ref={ref} className={cn(inputBase, "h-10", className)} {...props} />;
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(inputBase, "min-h-[120px] resize-y py-2.5 leading-relaxed", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(inputBase, "h-10 appearance-none pr-9", className)} {...props}>
      {children}
    </select>
    <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  </div>
));
Select.displayName = "Select";

/* --------------------------------- Toggle --------------------------------- */

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer select-none items-center justify-between gap-3 border border-line px-3 py-2 text-sm transition-colors hover:border-strong">
      <span>{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-5 w-9 shrink-0 border transition-colors", checked ? "border-fg bg-fg" : "border-line bg-transparent")}
      >
        <span className={cn("absolute top-0.5 h-3.5 w-3.5 transition-transform duration-200", checked ? "translate-x-4 bg-bg" : "translate-x-0.5 bg-fg")} />
      </button>
    </label>
  );
}

/* ------------------------------- Segmented -------------------------------- */

export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <div role="tablist" className={cn("inline-flex max-w-full overflow-x-auto no-scrollbar border border-line", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors sm:text-sm", value === o.value ? "bg-fg text-bg" : "text-muted hover:text-fg")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------- Badge --------------------------------- */

export function Badge({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "accent" | "outline" | "muted"; className?: string }) {
  const tones = {
    default: "bg-fg text-bg",
    accent: "bg-accent text-white",
    outline: "border border-line text-muted",
    muted: "bg-[var(--line)] text-fg",
  };
  return <span className={cn("inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", tones[tone], className)}>{children}</span>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center border border-line px-1 font-mono text-[10px] text-muted">{children}</kbd>;
}

/* ---------------------------------- Stat ---------------------------------- */

export function Stat({ label, value, sub, accent, className }: { label: string; value: ReactNode; sub?: ReactNode; accent?: boolean; className?: string }) {
  return (
    <div className={cn("border-t border-line pt-3", className)}>
      <div className="eyebrow">{label}</div>
      <div className={cn("mt-1 font-display text-2xl font-semibold tracking-tight tabular sm:text-3xl", accent && "text-accent")}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

/* --------------------------------- Divider -------------------------------- */

export function Rule({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-px flex-1 bg-[var(--line)]" />
      {label && <span className="eyebrow">{label}</span>}
      {label && <div className="h-px flex-1 bg-[var(--line)]" />}
    </div>
  );
}
