import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ContentKind } from "./types";

/* Camada de persistência — troque por uma API depois mantendo get/set/remove. */
const PREFIX = "nexo:";
export const storage = {
  get<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(PREFIX + key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; } },
  set<T>(key: string, value: T) { try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* quota */ } },
  remove(key: string) { try { localStorage.removeItem(PREFIX + key); } catch { /* noop */ } },
};

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => storage.get(key, initial));
  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => { const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v; storage.set(key, next); return next; });
  }, [key]);
  return [value, set];
}

export interface FavoriteRef { id: string; kind: ContentKind; slug: string; title: string; path: string; addedAt: number }
export interface HistoryEntry { id: string; kind: ContentKind; slug: string; title: string; path: string; visitedAt: number }
export interface PromptHistoryEntry { id: string; title: string; prompt: string; createdAt: number }
export interface Toast { id: string; title: string; description?: string; tone?: "default" | "success" | "error" }
type Theme = "light" | "dark";

interface StoreValue {
  theme: Theme; toggleTheme: () => void;
  favorites: FavoriteRef[]; isFavorite: (id: string) => boolean; toggleFavorite: (ref: Omit<FavoriteRef, "id" | "addedAt">) => void;
  history: HistoryEntry[]; pushHistory: (entry: Omit<HistoryEntry, "id" | "visitedAt">) => void; clearHistory: () => void;
  searchHistory: string[]; pushSearch: (q: string) => void; clearSearchHistory: () => void;
  promptHistory: PromptHistoryEntry[]; pushPrompt: (title: string, prompt: string) => void; clearPromptHistory: () => void;
  toasts: Toast[]; toast: (t: Omit<Toast, "id">) => void; dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = storage.get<Theme | null>("theme", null);
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    storage.set("theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0b0b0a" : "#fbfbf9");
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const [favorites, setFavorites] = useLocalStorage<FavoriteRef[]>("favorites", []);
  const isFavorite = useCallback((id: string) => favorites.some((f) => f.id === id), [favorites]);
  const toggleFavorite = useCallback((ref: Omit<FavoriteRef, "id" | "addedAt">) => {
    const id = `${ref.kind}:${ref.slug}`;
    setFavorites((prev) => (prev.some((f) => f.id === id) ? prev.filter((f) => f.id !== id) : [{ ...ref, id, addedAt: Date.now() }, ...prev]));
  }, [setFavorites]);

  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("history", []);
  const pushHistory = useCallback((entry: Omit<HistoryEntry, "id" | "visitedAt">) => {
    const id = `${entry.kind}:${entry.slug}`;
    setHistory((prev) => [{ ...entry, id, visitedAt: Date.now() }, ...prev.filter((h) => h.id !== id)].slice(0, 60));
  }, [setHistory]);
  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>("search-history", []);
  const pushSearch = useCallback((q: string) => {
    const t = q.trim(); if (t.length < 2) return;
    setSearchHistory((prev) => [t, ...prev.filter((p) => p.toLowerCase() !== t.toLowerCase())].slice(0, 10));
  }, [setSearchHistory]);
  const clearSearchHistory = useCallback(() => setSearchHistory([]), [setSearchHistory]);

  const [promptHistory, setPromptHistory] = useLocalStorage<PromptHistoryEntry[]>("prompt-history", []);
  const pushPrompt = useCallback((title: string, prompt: string) => {
    setPromptHistory((prev) => [{ id: Math.random().toString(36).slice(2), title, prompt, createdAt: Date.now() }, ...prev].slice(0, 40));
  }, [setPromptHistory]);
  const clearPromptHistory = useCallback(() => setPromptHistory([]), [setPromptHistory]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    window.setTimeout(() => dismissToast(id), 3000);
  }, [dismissToast]);

  const value = useMemo(() => ({ theme, toggleTheme, favorites, isFavorite, toggleFavorite, history, pushHistory, clearHistory, searchHistory, pushSearch, clearSearchHistory, promptHistory, pushPrompt, clearPromptHistory, toasts, toast, dismissToast }),
    [theme, toggleTheme, favorites, isFavorite, toggleFavorite, history, pushHistory, clearHistory, searchHistory, pushSearch, clearSearchHistory, promptHistory, pushPrompt, clearPromptHistory, toasts, toast, dismissToast]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
