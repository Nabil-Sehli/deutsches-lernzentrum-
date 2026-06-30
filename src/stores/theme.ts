import { create } from "zustand";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

const STORAGE_KEY = "dlz-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light" || stored === "system") return stored;
  return "system";
}

interface ThemeStore {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  init: () => () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: readStoredTheme(),
  resolvedTheme: typeof window === "undefined" ? "light" : (getSystemTheme() === "dark" && readStoredTheme() === "dark") ? "dark" : "light",
  systemTheme: typeof window === "undefined" ? "light" : getSystemTheme(),

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem(STORAGE_KEY, theme);
  },

  cycleTheme: () => {
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(get().theme) + 1) % order.length];
    get().setTheme(next);
  },

  init: () => {
    const apply = () => {
      const { theme, systemTheme } = get();
      const resolved = theme === "system" ? systemTheme : (theme as ResolvedTheme);
      applyTheme(resolved);
      set({ resolvedTheme: resolved });
    };

    apply();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      set({ systemTheme: mediaQuery.matches ? "dark" : "light" });
      apply();
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  },
}));
