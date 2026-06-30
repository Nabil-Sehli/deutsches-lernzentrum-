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

function computeResolvedTheme(theme: Theme, systemTheme: ResolvedTheme): ResolvedTheme {
  return theme === "system" ? systemTheme : (theme as ResolvedTheme);
}

interface ThemeStore {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  init: () => () => void;
}

function createInitialState(): Pick<ThemeStore, "theme" | "systemTheme" | "resolvedTheme"> {
  const theme = readStoredTheme();
  const systemTheme = getSystemTheme();
  const resolvedTheme = computeResolvedTheme(theme, systemTheme);
  
  // Apply immediately for SSR/pre-hydration sync
  if (typeof window !== "undefined") {
    applyTheme(resolvedTheme);
  }
  
  return { theme, systemTheme, resolvedTheme };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...createInitialState(),

  setTheme: (theme) => {
    const { systemTheme } = get();
    const resolved = computeResolvedTheme(theme, systemTheme);
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  cycleTheme: () => {
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(get().theme) + 1) % order.length];
    get().setTheme(next);
  },

  init: () => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const newSystemTheme = mediaQuery.matches ? "dark" : "light";
      const { theme } = get();
      const resolved = computeResolvedTheme(theme, newSystemTheme);
      applyTheme(resolved);
      set({ systemTheme: newSystemTheme, resolvedTheme: resolved });
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  },
}));
