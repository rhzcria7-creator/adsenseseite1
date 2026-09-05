import { useCallback, useEffect, useSyncExternalStore } from "react";

const PREFIX = "nexo:";
const listeners = new Map<string, Set<() => void>>();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
  listeners.get(key)?.forEach((l) => l());
}

const cache = new Map<string, { raw: string | null; value: unknown }>();

function getSnapshot<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PREFIX + key);
  } catch {
    /* ignore */
  }
  const c = cache.get(key);
  if (c && c.raw === raw) return c.value as T;
  const value = raw == null ? fallback : safeParse<T>(raw, fallback);
  cache.set(key, { raw, value });
  return value;
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === PREFIX + key) cb();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.get(key)?.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key]
  );
  const value = useSyncExternalStore(subscribe, () => getSnapshot(key, fallback), () => fallback);
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      write(key, next);
    },
    [key, fallback]
  );
  return [value, set];
}

/* ---------- Theme ---------- */
export type Theme = "light" | "dark";
const themeFallback: Theme = "light";

export function useTheme() {
  const [stored, setStored] = useLocalStorage<Theme | null>("theme", null);
  const theme: Theme =
    stored ?? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : themeFallback);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const toggle = useCallback(() => setStored(theme === "dark" ? "light" : "dark"), [theme, setStored]);
  return { theme, toggle, setTheme: setStored };
}

/* ---------- Favorites ---------- */
export interface FavItem {
  id: string;
  kind: string;
  title: string;
  path: string;
  at: number;
}
const favFallback: FavItem[] = [];

export function useFavorites() {
  const [items, setItems] = useLocalStorage<FavItem[]>("favorites", favFallback);
  const isFav = useCallback((id: string) => items.some((i) => i.id === id), [items]);
  const toggle = useCallback(
    (item: Omit<FavItem, "at">) => {
      let added = false;
      setItems((prev) => {
        if (prev.some((i) => i.id === item.id)) return prev.filter((i) => i.id !== item.id);
        added = true;
        return [{ ...item, at: Date.now() }, ...prev].slice(0, 200);
      });
      return added;
    },
    [setItems]
  );
  const clear = useCallback(() => setItems([]), [setItems]);
  return { items, isFav, toggle, clear };
}

/* ---------- History ---------- */
export interface HistoryItem {
  id: string;
  kind: string;
  title: string;
  path: string;
  at: number;
}
const histFallback: HistoryItem[] = [];

export function useHistory() {
  const [items, setItems] = useLocalStorage<HistoryItem[]>("history", histFallback);
  const push = useCallback(
    (item: Omit<HistoryItem, "at">) => {
      setItems((prev) => [{ ...item, at: Date.now() }, ...prev.filter((i) => i.id !== item.id)].slice(0, 100));
    },
    [setItems]
  );
  const clear = useCallback(() => setItems([]), [setItems]);
  return { items, push, clear };
}

export function useTrackVisit(item: Omit<HistoryItem, "at"> | null) {
  const { push } = useHistory();
  useEffect(() => {
    if (item) push(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);
}

/* ---------- Prompt history ---------- */
export interface PromptHistoryItem {
  id: string;
  title: string;
  text: string;
  at: number;
}
const promptHistFallback: PromptHistoryItem[] = [];
export function usePromptHistory() {
  const [items, setItems] = useLocalStorage<PromptHistoryItem[]>("prompt-history", promptHistFallback);
  const push = useCallback(
    (title: string, text: string) => {
      setItems((prev) => [{ id: `${Date.now()}`, title, text, at: Date.now() }, ...prev].slice(0, 50));
    },
    [setItems]
  );
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((p) => p.id !== id)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);
  return { items, push, remove, clear };
}

/* ---------- Tool usage counter (for "popular for you") ---------- */
const usageFallback: Record<string, number> = {};
export function useToolUsage() {
  const [usage, setUsage] = useLocalStorage<Record<string, number>>("tool-usage", usageFallback);
  const bump = useCallback((slug: string) => setUsage((p) => ({ ...p, [slug]: (p[slug] ?? 0) + 1 })), [setUsage]);
  return { usage, bump };
}
