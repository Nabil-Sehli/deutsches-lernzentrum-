import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Award,
  ClipboardList,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Video,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: typeof GraduationCap;
  visible: boolean;
}

interface Props {
  items: NavItem[];
}

export default function DashboardNav({ items }: Props) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const visible = items.filter((i) => i.visible).map((i) => i.id);
    if (visible.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    for (const id of visible) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const visibleItems = items.filter((i) => i.visible);

  if (visibleItems.length === 0) return null;

  return (
    <nav className="sticky top-24 w-48 shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <p className="text-xs font-semibold text-[#78909c] uppercase tracking-wider mb-3">
        Jump to
      </p>
      <div className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-all ${
                isActive
                  ? "bg-[#00695c]/10 text-[#00695c] font-medium"
                  : "text-[#78909c] hover:text-[#2c3e2d] hover:bg-[#00695c]/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
