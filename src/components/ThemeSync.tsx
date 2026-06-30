import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme";

export function ThemeSync() {
  const init = useThemeStore((s) => s.init);

  useEffect(() => init(), [init]);

  return null;
}