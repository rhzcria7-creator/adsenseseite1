import { motion, useInView, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/* --------------------------------- Reveal --------------------------------- */

export function Reveal({ children, delay = 0, className, y = 14, once = true }: { children: ReactNode; delay?: number; className?: string; y?: number; once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className, gap = 0.05 }: { children: ReactNode; className?: string; gap?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }} className={className}>
      {children}
    </motion.div>
  );
}

/* ----------------------------- PageTransition ----------------------------- */

export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------- SplitText ------------------------------- */

export function SplitText({ text, className, delay = 0, as: Tag = "span" }: { text: string; className?: string; delay?: number; as?: "span" | "h1" | "h2" | "p" }) {
  const words = text.split(" ");
  const reduce = useReducedMotion();
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: delay + i * 0.045, ease: EASE }}
            aria-hidden
          >
            {w}
          </motion.span>
          {i < words.length - 1 && <span aria-hidden>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}

/* --------------------------------- CountUp -------------------------------- */

export function CountUp({ to, duration = 1.4, suffix = "", prefix = "", className, decimals = 0 }: { to: number; duration?: number; suffix?: string; prefix?: string; className?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals).replace(".", ",")}${suffix}`);
  const [text, setText] = useState(`${prefix}0${suffix}`);
  useEffect(() => {
    if (inView) spring.set(to);
  }, [inView, to, spring]);
  useEffect(() => display.on("change", (v) => setText(v)), [display]);
  return (
    <span ref={ref} className={cn("tabular", className)}>
      {text}
    </span>
  );
}

/* --------------------------- AnimatedBackground --------------------------- */
/** A subtle "flow field" of drifting points on a technical grid. Respects reduced motion and pauses when hidden. */

export function AnimatedBackground({ className, density = 42, opacity = 1 }: { className?: string; density?: number; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let t = 0;
    let running = true;
    let dark = document.documentElement.classList.contains("dark");
    const mo = new MutationObserver(() => (dark = document.documentElement.classList.contains("dark")));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) loop();
    });
    io.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / density) + 1;
      const rows = Math.ceil(h / density) + 1;
      const ink = dark ? "242,242,239" : "18,18,17";
      const accent = "228,87,46";
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * density;
          const y = j * density;
          const n = Math.sin(x * 0.012 + t * 0.6) * Math.cos(y * 0.011 - t * 0.45) + Math.sin((x + y) * 0.006 + t * 0.3);
          const a = (n + 2) / 4; // 0..1
          const len = 4 + a * 10;
          const ang = n * Math.PI;
          const dx = Math.cos(ang) * len;
          const dy = Math.sin(ang) * len;
          ctx.strokeStyle = a > 0.86 ? `rgba(${accent},${(0.35 + a * 0.4) * opacity})` : `rgba(${ink},${(0.05 + a * 0.14) * opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - dx / 2, y - dy / 2);
          ctx.lineTo(x + dx / 2, y + dy / 2);
          ctx.stroke();
        }
      }
    };

    const loop = () => {
      if (!running) return;
      t += 0.008;
      draw();
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, [density, opacity, reduce]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}

/* --------------------------------- Marquee -------------------------------- */

export function Marquee({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <div className={cn("overflow-hidden border-y border-line", className)}>
      <div className="marquee flex w-max gap-10 py-3 pr-10">
        {[...items, ...items].map((it, i) => (
          <div key={i} className="flex shrink-0 items-center gap-10 text-xs font-medium uppercase tracking-wider text-muted">
            {it}
            <span className="h-1 w-1 bg-accent" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Hoverline ------------------------------- */

export function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.25, ease: EASE }} className={className}>
      {children}
    </motion.div>
  );
}
