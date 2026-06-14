import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("de") ? "de" : "en";

  const toggle = () => {
    const next = current === "en" ? "de" : "en";
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[#445E5D] bg-[#F9F9F1] hover:bg-[#F0F0E6] transition-all"
      title={current === "en" ? "Switch to German" : "Zu Englisch wechseln"}
    >
      <Languages className="w-3.5 h-3.5" />
      <span className="uppercase tracking-wider text-xs font-bold">{current}</span>
    </button>
  );
}
