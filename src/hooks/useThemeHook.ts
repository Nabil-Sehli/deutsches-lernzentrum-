import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme";

export function useThemeInit() {
  const init = useThemeStore((s) => s.init);
  useEffect(() => init(), [init]);
}

export function useTheme() {
  return useThemeStore();
}
