import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Reveal on scroll (inspirado no React Bits "AnimatedContent"). */
export function Reveal({ children, delay = 0, y = 16, className, once = true }: { children: ReactNode; delay?: number; y?: number; className?: string; once?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once, margin: "-40px" }} transition={{ duration: 0.55, ease, delay }}>
      {children}
    </motion.div>
  );
}

/** Lista com stagger. */
export function Stagger({ children, className, delay = 0.05 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: delay } } }}>
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} variants={{ hidden: reduce ? {} : { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}>{children}</motion.div>;
}

/** Transição entre páginas. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.28, ease }}>
      {children}
    </motion.div>
  );
}

/** SplitText (React Bits-like): anima palavra a palavra. */
export function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={cn("inline", className)} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
          <motion.span className="inline-block" initial={reduce ? false : { y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease, delay: delay + i * 0.045 }}>
            {w}{i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** CountUp (React Bits-like). */
export function CountUp({ to, duration = 1.4, suffix = "", prefix = "", className }: { to: number; duration?: number; suffix?: string; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString("pt-BR"));
  const [val, setVal] = useState("0");
  useEffect(() => { if (inView) spring.set(to); }, [inView, spring, to]);
  useEffect(() => rounded.on("change", (v) => setVal(v)), [rounded]);
  return <span ref={ref} className={className}>{prefix}{val}{suffix}</span>;
}

/** Spotlight card hover (React Bits-like): brilho sutil seguindo o mouse. */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`); el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={cn("group relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--brand) 9%, transparent), transparent 70%)" }} />
      {children}
    </div>
  );
}

/**
 * Fundo animado sofisticado e barato: malha de pontos + duas "correntes" de luz
 * desenhadas em canvas com baixa opacidade. Pausa quando a aba está oculta e
 * respeita prefers-reduced-motion.
 */
export function AmbientBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0, w = 0, h = 0, t = 0, running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const isDark = () => document.documentElement.classList.contains("dark");
    const draw = () => {
      if (!running) return;
      t += 0.0025;
      ctx.clearRect(0, 0, w, h);
      const dark = isDark();
      // grade de pontos
      ctx.fillStyle = dark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.05)";
      const gap = 28;
      for (let x = gap / 2; x < w; x += gap) for (let y = gap / 2; y < h; y += gap) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); }
      // correntes de luz
      const lines = 2;
      for (let i = 0; i < lines; i++) {
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        const c = dark ? "126,162,255" : "29,78,216";
        grad.addColorStop(0, `rgba(${c},0)`); grad.addColorStop(0.5, `rgba(${c},${dark ? 0.22 : 0.16})`); grad.addColorStop(1, `rgba(${c},0)`);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.2; ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const y = h * (0.25 + i * 0.35) + Math.sin(x * 0.0035 + t * 4 + i * 2) * 40 + Math.sin(x * 0.0012 - t * 2.5) * 60;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    const onVis = () => { running = !document.hidden; if (running && !reduce) draw(); else cancelAnimationFrame(raf); };
    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(); });
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    const obs = new MutationObserver(() => { if (reduce) draw(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); obs.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [reduce]);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden" aria-hidden>
      <canvas ref={ref} className="h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
    </div>
  );
}
