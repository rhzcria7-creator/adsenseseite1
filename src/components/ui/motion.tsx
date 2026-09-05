import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export const ease = [0.22, 1, 0.36, 1] as const;

/* ---------- Reveal on scroll ---------- */
export function Reveal({ children, delay = 0, y = 18, className, once = true, as: Tag = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; once?: boolean; as?: "div" | "section" | "li" | "article" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  const M = motion[Tag] as typeof motion.div;
  return (
    <M ref={ref} initial={reduce ? false : { opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.6, ease, delay }} className={className}>
      {children}
    </M>
  );
}

/* ---------- Stagger container ---------- */
export const staggerContainer: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
export const staggerItem: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -6% 0px" });
  return (
    <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- Split text (React Bits-like) ---------- */
export function SplitText({ text, className, delay = 0, per = "word" }: { text: string; className?: string; delay?: number; per?: "word" | "char" }) {
  const parts = per === "word" ? text.split(" ") : Array.from(text);
  const reduce = useReducedMotion();
  return (
    <span className={cn("inline", className)} aria-label={text}>
      {parts.map((p, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span className="inline-block" initial={reduce ? false : { y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease, delay: delay + i * (per === "word" ? 0.05 : 0.02) }}>
            {p}
            {per === "word" && i < parts.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------- Count up ---------- */
export function CountUp({ to, duration = 1.4, suffix = "", prefix = "", className }: { to: number; duration?: number; suffix?: string; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString("pt-BR"));
  const [txt, setTxt] = useState("0");
  useEffect(() => rounded.on("change", (v) => setTxt(v)), [rounded]);
  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {txt}
      {suffix}
    </span>
  );
}

/* ---------- Spotlight card (React Bits-like) ---------- */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseLeave={() => setPos({ x: -1000, y: -1000 })}
      className={cn("group relative overflow-hidden surface", className)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(360px circle at ${pos.x}px ${pos.y}px, color-mix(in oklab, var(--accent) 10%, transparent), transparent 60%)` }} />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ---------- Tilt (subtle) ---------- */
export function Tilt({ children, className, max = 4 }: { children: ReactNode; className?: string; max?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 });
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Animated background (performance-safe) ---------- */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[520px] grid-bg opacity-70 dark:opacity-40" />
      <div className="bg-orb absolute -top-40 left-[10%] h-[480px] w-[480px] rounded-full bg-accent/10 blur-[120px] dark:bg-accent/15" />
      <div className="bg-orb-2 absolute -top-20 right-[5%] h-[380px] w-[380px] rounded-full bg-teal-500/10 blur-[120px] dark:bg-teal-400/10" />
    </div>
  );
}

/* ---------- Page transition ---------- */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.32, ease }}>
      {children}
    </motion.div>
  );
}

/* ---------- Result pop ---------- */
export function Pop({ children, k, className }: { children: ReactNode; k: string | number; className?: string }) {
  return (
    <motion.div key={k} initial={{ opacity: 0, scale: 0.98, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.28, ease }} className={className}>
      {children}
    </motion.div>
  );
}
