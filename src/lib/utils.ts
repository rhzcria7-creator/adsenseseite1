export { cn } from "@/utils/cn";

export const SITE = {
  name: "Nexo",
  tagline: "IA, tecnologia e ferramentas para quem constrói o futuro",
  url: "https://nexo-ia.vercel.app",
  adsenseClient: "ca-pub-6438481907721951",
  email: "contato@nexo.app",
};

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) {
  try {
    return new Intl.DateTimeFormat("pt-BR", opts).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(1, m)} min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} d atrás`;
  return formatDate(iso);
}

export const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
export const fmtNum = (n: number, d = 2) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: d }).format(n);
export const fmtPct = (n: number, d = 2) => `${fmtNum(n, d)}%`;

export function parseNum(v: string | number): number {
  if (typeof v === "number") return v;
  const raw = String(v).trim();
  const s = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/** Deterministic pseudo-random based on a string seed (used for daily rotations). */
export function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function shuffleSeeded<T>(arr: T[], seed: string): T[] {
  const rnd = seeded(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

export function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const gradients: Record<string, string> = {
  ink: "from-slate-900 via-slate-800 to-slate-700",
  blue: "from-blue-700 via-indigo-700 to-slate-900",
  teal: "from-teal-700 via-cyan-800 to-slate-900",
  amber: "from-amber-600 via-orange-700 to-slate-900",
  rose: "from-rose-700 via-pink-800 to-slate-900",
  violet: "from-violet-700 via-purple-800 to-slate-900",
  green: "from-emerald-700 via-green-800 to-slate-900",
};

export function coverClass(key?: string) {
  return gradients[key ?? "ink"] ?? gradients.ink;
}
