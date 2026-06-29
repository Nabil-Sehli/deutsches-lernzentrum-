import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/providers/theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const icon =
    theme === "light" ? <Sun className="w-4 h-4" /> :
    theme === "dark" ? <Moon className="w-4 h-4" /> :
    <Monitor className="w-4 h-4" />;

  const label =
    theme === "light" ? "Light" :
    theme === "dark" ? "Dark" :
    "System";

  return (
    <button
      onClick={cycle}
      title={`Theme: ${label} (click to change)`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#2c3e2d] dark:text-[#e8f5e9] bg-white/60 dark:bg-[#1a2e2c] hover:bg-white dark:hover:bg-[#243d3a] border border-[#2c3e2d]/10 dark:border-white/10 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
