import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { useLocation } from "react-router";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useThemeStore();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin");

  if (!isDashboard) return null;

  const toggle = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#2c3e2d] dark:text-[#e8f5e9] bg-white/60 dark:bg-[#1a2e2c] hover:bg-white dark:hover:bg-[#243d3a] border border-[#2c3e2d]/10 dark:border-white/10 transition-colors z-50"
      style={{ pointerEvents: "auto" }}
    >
      {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span>{resolvedTheme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
