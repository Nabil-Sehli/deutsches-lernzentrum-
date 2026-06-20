import {
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Mail,
  MessageCircle,
  PlayCircle,
  Search,
  Shield,
  Smartphone,
  TrendingUp,
  Video,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";

import Footer from "@/components/Footer";
import GermanyMap3D from "@/components/GermanyMap3D";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTranslation } from "react-i18next";

function ContourLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="contour"
            patternUnits="userSpaceOnUse"
            width="120"
            height="80"
            patternTransform="scale(1.5)"
          >
            <path
              d="M0,40 Q30,20 60,40 T120,40"
              fill="none"
              stroke="#182E21"
              strokeWidth="0.8"
            />
            <path
              d="M0,20 Q30,0 60,20 T120,20"
              fill="none"
              stroke="#182E21"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <path
              d="M0,60 Q30,40 60,60 T120,60"
              fill="none"
              stroke="#182E21"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <path
              d="M0,0 Q30,-20 60,0 T120,0"
              fill="none"
              stroke="#182E21"
              strokeWidth="0.3"
              opacity="0.3"
            />
            <path
              d="M0,80 Q30,60 60,80 T120,80"
              fill="none"
              stroke="#182E21"
              strokeWidth="0.3"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contour)" />
      </svg>
    </div>
  );
}

function MiniSparkline({ color }: { color: string }) {
  const w = 48,
    h = 20;
  const pts = "0,16 10,12 20,14 30,6 40,8 48,4";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-[22px] h-[12px]"
      style={{ opacity: 0.7 }}
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 14,
    cx = 18,
    cy = 18,
    circ = 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;
  return (
    <svg viewBox="0 0 36 36" className="w-[22px] h-[22px] -rotate-90 shrink-0">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#E6DFD3"
        strokeWidth="2.5"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={circ}
        strokeDashoffset={off}
        strokeLinecap="round"
      />
    </svg>
  );
}

function AvatarPhoto({ src, index }: { src: string; index: number }) {
  return (
    <div
      className="w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-white shadow-sm"
      style={{ marginLeft: index === 0 ? 0 : -10, zIndex: 10 - index }}
    >
      <img src={src} alt="" className="object-cover w-full h-full" />
    </div>
  );
}

function DecorativeL({ size = 84 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 84"
      className="shrink-0"
      style={{ filter: "drop-shadow(0 2px 6px rgba(198,182,123,0.35))" }}
    >
      <defs>
        <linearGradient id="goldL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a847" />
          <stop offset="40%" stopColor="#f5d78a" />
          <stop offset="100%" stopColor="#b8862d" />
        </linearGradient>
        <linearGradient id="goldLightL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d78a" />
          <stop offset="100%" stopColor="#d4a847" />
        </linearGradient>
        <filter id="shadowL">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#182E21"
            floodOpacity="0.15"
          />
        </filter>
      </defs>
      <g filter="url(#shadowL)">
        <rect x="14" y="6" width="14" height="72" rx="3" fill="url(#goldL)" />
        <rect
          x="8"
          y="3"
          width="26"
          height="6"
          rx="1.5"
          fill="url(#goldLightL)"
        />
        <rect
          x="8"
          y="75"
          width="26"
          height="6"
          rx="1.5"
          fill="url(#goldLightL)"
        />
        <path
          d="M28,66 L28,77 Q28,78 29,78 L58,78 Q60,78 60,76 L60,68 Q60,66 58,66 Z"
          fill="url(#goldL)"
        />
        <rect
          x="58"
          y="75"
          width="6"
          height="6"
          rx="1.5"
          fill="url(#goldLightL)"
        />
        <rect
          x="48"
          y="69"
          width="6"
          height="8"
          rx="1.5"
          fill="url(#goldLightL)"
        />
        <rect
          x="17"
          y="10"
          width="2"
          height="64"
          rx="1"
          fill="#fff5d4"
          opacity="0.35"
        />
      </g>
      <g opacity="0.75">
        <path
          d="M36,70 C36,67 44,67 44,70 C44,73 36,73 36,70 Z"
          fill="none"
          stroke="#fff5d4"
          strokeWidth="0.6"
        />
        <path
          d="M34,74 C34,71 46,71 46,74 C46,77 34,77 34,74 Z"
          fill="none"
          stroke="#f5d78a"
          strokeWidth="0.6"
        />
        <ellipse
          cx="40"
          cy="72"
          rx="3.5"
          ry="1.6"
          fill="none"
          stroke="#b8862d"
          strokeWidth="0.5"
          opacity="0.5"
          transform="rotate(-10 40 72)"
        />
        <circle cx="38" cy="70" r="1" fill="#fff5d4" opacity="0.6" />
        <circle cx="38" cy="74" r="0.9" fill="#f5d78a" opacity="0.6" />
      </g>
    </svg>
  );
}

function DecorativeZ({ size = 84 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 84"
      className="shrink-0"
      style={{ filter: "drop-shadow(0 2px 6px rgba(198,182,123,0.35))" }}
    >
      <defs>
        <linearGradient id="goldZ" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a847" />
          <stop offset="40%" stopColor="#f5d78a" />
          <stop offset="100%" stopColor="#b8862d" />
        </linearGradient>
        <linearGradient id="goldLightZ" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d78a" />
          <stop offset="100%" stopColor="#d4a847" />
        </linearGradient>
        <filter id="shadowZ">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#182E21"
            floodOpacity="0.15"
          />
        </filter>
      </defs>
      <g filter="url(#shadowZ)">
        <rect x="10" y="10" width="48" height="12" rx="2" fill="url(#goldZ)" />
        <rect x="6" y="9" width="6" height="14" rx="1.5" fill="url(#goldZ)" />
        <rect x="58" y="9" width="6" height="14" rx="1.5" fill="url(#goldZ)" />
        <rect x="10" y="62" width="48" height="12" rx="2" fill="url(#goldZ)" />
        <rect x="6" y="61" width="6" height="14" rx="1.5" fill="url(#goldZ)" />
        <rect x="58" y="61" width="6" height="14" rx="1.5" fill="url(#goldZ)" />
        <polygon points="62,22 50,22 10,62 22,62" fill="url(#goldZ)" />
        <rect
          x="46"
          y="12"
          width="10"
          height="3"
          rx="1.5"
          fill="url(#goldLightZ)"
        />
        <rect
          x="46"
          y="71"
          width="10"
          height="3"
          rx="1.5"
          fill="url(#goldLightZ)"
        />
        <rect
          x="14"
          y="12"
          width="2"
          height="6"
          rx="1"
          fill="#fff5d4"
          opacity="0.35"
        />
        <rect
          x="14"
          y="68"
          width="2"
          height="6"
          rx="1"
          fill="#fff5d4"
          opacity="0.35"
        />
        <rect
          x="39"
          y="32"
          width="3"
          height="20"
          rx="1"
          fill="#fff5d4"
          opacity="0.25"
          transform="rotate(-40 40 42)"
        />
      </g>
      <g opacity="0.75">
        <circle
          cx="32"
          cy="15"
          r="2"
          fill="none"
          stroke="#fff5d4"
          strokeWidth="0.5"
        />
        <circle
          cx="48"
          cy="70"
          r="2"
          fill="none"
          stroke="#f5d78a"
          strokeWidth="0.5"
        />
        <circle cx="36" cy="42" r="1.5" fill="#fff5d4" opacity="0.6" />
        <ellipse
          cx="50"
          cy="16"
          rx="4"
          ry="1.5"
          fill="none"
          stroke="#b8862d"
          strokeWidth="0.5"
          opacity="0.5"
          transform="rotate(90 50 16)"
        />
        <circle cx="28" cy="62" r="1.5" fill="#f5d78a" opacity="0.6" />
      </g>
    </svg>
  );
}

function DecorativeD({ size = 84 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 84"
      className="shrink-0"
      style={{ filter: "drop-shadow(0 2px 6px rgba(198,182,123,0.35))" }}
    >
      <defs>
        <linearGradient id="goldD" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a847" />
          <stop offset="40%" stopColor="#f5d78a" />
          <stop offset="100%" stopColor="#b8862d" />
        </linearGradient>
        <linearGradient id="goldLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d78a" />
          <stop offset="100%" stopColor="#d4a847" />
        </linearGradient>
        <filter id="shadowD">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#182E21"
            floodOpacity="0.15"
          />
        </filter>
      </defs>
      <g filter="url(#shadowD)">
        <rect x="14" y="6" width="14" height="72" rx="3" fill="url(#goldD)" />
        <rect
          x="8"
          y="3"
          width="26"
          height="6"
          rx="1.5"
          fill="url(#goldLight)"
        />
        <rect
          x="8"
          y="75"
          width="26"
          height="6"
          rx="1.5"
          fill="url(#goldLight)"
        />
        <path
          d="M28,10 L28,20 Q44,20 44,42 Q44,64 28,64 L28,74 Q56,74 56,42 Q56,10 28,10 Z"
          fill="url(#goldD)"
        />
        <rect
          x="46"
          y="8"
          width="6"
          height="10"
          rx="1.5"
          fill="url(#goldLight)"
        />
        <rect
          x="46"
          y="66"
          width="6"
          height="10"
          rx="1.5"
          fill="url(#goldLight)"
        />
        <rect
          x="17"
          y="10"
          width="2"
          height="64"
          rx="1"
          fill="#fff5d4"
          opacity="0.35"
        />
      </g>
      <g opacity="0.75">
        <path
          d="M34,32 C34,28 42,28 42,32 C42,36 34,36 34,32 Z"
          fill="none"
          stroke="#fff5d4"
          strokeWidth="0.6"
        />
        <path
          d="M32,42 C32,38 44,38 44,42 C44,46 32,46 32,42 Z"
          fill="none"
          stroke="#f5d78a"
          strokeWidth="0.6"
        />
        <path
          d="M34,52 C34,48 42,48 42,52 C42,56 34,56 34,52 Z"
          fill="none"
          stroke="#fff5d4"
          strokeWidth="0.6"
        />
        <ellipse
          cx="38"
          cy="34"
          rx="5"
          ry="2.2"
          fill="none"
          stroke="#b8862d"
          strokeWidth="0.5"
          opacity="0.5"
          transform="rotate(-15 38 34)"
        />
        <ellipse
          cx="38"
          cy="50"
          rx="5"
          ry="2.2"
          fill="none"
          stroke="#b8862d"
          strokeWidth="0.5"
          opacity="0.5"
          transform="rotate(15 38 50)"
        />
        <ellipse
          cx="42"
          cy="42"
          rx="4.5"
          ry="2"
          fill="none"
          stroke="#b8862d"
          strokeWidth="0.5"
          opacity="0.5"
          transform="rotate(90 42 42)"
        />
        <circle cx="38" cy="36" r="1.2" fill="#fff5d4" opacity="0.6" />
        <circle cx="38" cy="48" r="1.2" fill="#fff5d4" opacity="0.6" />
        <circle cx="42" cy="42" r="1" fill="#f5d78a" opacity="0.6" />
      </g>
    </svg>
  );
}

function useCountUp(end: number, duration = 1500, start = 0) {
  const [count, setCount] = useState(start);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered]);

  useEffect(() => {
    if (!triggered) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(start + (end - start) * progress));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [triggered, end, duration, start]);

  return { ref, count };
}

function SectionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`section-reveal ${isRevealed ? "revealed" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const canGoToDashboard = isAuthenticated && (user?.role !== "teacher" || user?.centerId);
  const isTeacher = user?.role === "teacher";

  const stat1 = useCountUp(120, 1500);
  const stat2 = useCountUp(5000, 1500);
  const stat3 = useCountUp(98, 1500);

  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        headingRef.current &&
        !headingRef.current.contains(e.target as Node)
      ) {
        setActiveLetter(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F4EB]">
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-screen pt-16 grid grid-cols-1 lg:grid-cols-[45%_55%] items-center relative overflow-hidden">
        <ContourLines />

        <div className="relative z-10 order-2 px-8 py-12 md:px-16 lg:py-0 lg:order-1">
          <div className="max-w-[540px] ml-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#182E21]/8 border border-[#182E21]/12 text-[13px] font-medium text-[#445E5D] mb-8 animate-pulse">
              {t("home.newBadge")}
            </div>

            <div className="relative mb-6" ref={headingRef}>
              <div
                className="absolute"
                style={{ left: "-150px", top: "-15px", zIndex: 20 }}
              >
                <div
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    setActiveLetter(activeLetter === "D" ? null : "D");
                  }}
                >
                  <DecorativeD size={150} />
                </div>
                {activeLetter === "D" && (
                  <div className="tooltip-label">
                    Deutsches
                    <div className="tooltip-arrow" />
                  </div>
                )}
              </div>
              <div
                className="absolute flex flex-col"
                style={{
                  left: "-150px",
                  top: "153px",
                  gap: "18px",
                  zIndex: 20,
                }}
              >
                <div className="relative">
                  <div
                    className="cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveLetter(activeLetter === "L" ? null : "L");
                    }}
                  >
                    <DecorativeL size={150} />
                  </div>
                  {activeLetter === "L" && (
                    <div className="tooltip-label">
                      Lern
                      <div className="tooltip-arrow" />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div
                    className="cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveLetter(activeLetter === "Z" ? null : "Z");
                    }}
                  >
                    <DecorativeZ size={150} />
                  </div>
                  {activeLetter === "Z" && (
                    <div className="tooltip-label">
                      Zentrum
                      <div className="tooltip-arrow" />
                    </div>
                  )}
                </div>
              </div>
              <h1
                className="font-bold tracking-wide"
                style={{
                  fontFamily: "'Avenir Next',-apple-system,sans-serif",
                  fontWeight: 700,
                  fontSize: "48pt",
                  color: "#182E21",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {t("home.heroTitle")}
              </h1>
            </div>

            <p className="text-lg text-[#4A5D5A] leading-relaxed max-w-[460px] mb-10">
              {t("home.heroDesc")}
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              {isAuthenticated ? (
                <Link
                  to={isTeacher ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 px-8 py-3 text-base pill-button-primary"
                >
                  {t("home.goToDashboard")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-8 py-3 text-base pill-button-primary"
                  >
                    {t("home.getStarted")}
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-full px-8 py-3 bg-white border border-[#2D423D]/30 text-[#2D423D] font-semibold text-base hover:bg-white/90 hover:border-[#2D423D]/50 transition-all"
                  >
                    {t("home.watchDemo")}
                  </Link>
                </>
              )}
            </div>

            <div className="flex gap-12">
              <div ref={stat1.ref}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#182E21]">
                    {stat1.count}+
                  </span>
                  <MiniSparkline color="#73A87E" />
                </div>
                <p className="text-[13px] text-[#8A9D99] mt-0.5">
                  {t("home.certifiedCenters")}
                </p>
                <div className="flex items-center mt-2">
                  <AvatarPhoto
                    src="https://i.pravatar.cc/100?img=1"
                    index={0}
                  />
                  <AvatarPhoto
                    src="https://i.pravatar.cc/100?img=2"
                    index={1}
                  />
                  <AvatarPhoto
                    src="https://i.pravatar.cc/100?img=3"
                    index={2}
                  />
                  <AvatarPhoto
                    src="https://i.pravatar.cc/100?img=4"
                    index={3}
                  />
                  <AvatarPhoto
                    src="https://i.pravatar.cc/100?img=5"
                    index={4}
                  />
                </div>
              </div>
              <div ref={stat2.ref}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#182E21]">
                    {stat2.count.toLocaleString()}+
                  </span>
                  <MiniSparkline color="#5E8487" />
                </div>
                <p className="text-[13px] text-[#8A9D99] mt-0.5">
                  {t("home.activeStudents")}
                </p>
              </div>
              <div ref={stat3.ref}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#182E21]">
                    {stat3.count}%
                  </span>
                  <ProgressRing pct={98} color="#73A87E" />
                </div>
                <p className="text-[13px] text-[#8A9D99] mt-0.5">
                  {t("home.satisfactionRate")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[450px] lg:h-screen order-1 lg:order-2 relative z-10">
          <GermanyMap3D onSelectState={() => navigate("/map")} />
        </div>

        <div className="absolute z-10 hidden -translate-x-1/2 bottom-6 left-1/2 animate-bounce lg:block">
          <ChevronDown className="w-5 h-5 text-[#8A9D99]" />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionReveal className="mb-16 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#8A9D99] mb-2">
              {t("home.howItWorksLabel")}
            </p>
            <h2 className="text-3xl font-semibold text-[#182E21]">
              {t("home.howItWorksTitle")}
            </h2>
          </SectionReveal>

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: t("home.step1Title"),
                desc: t("home.step1Desc"),
                num: "01",
              },
              {
                icon: Mail,
                title: t("home.step2Title"),
                desc: t("home.step2Desc"),
                num: "02",
              },
              {
                icon: GraduationCap,
                title: t("home.step3Title"),
                desc: t("home.step3Desc"),
                num: "03",
              },
            ].map((step, i) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <div className="relative h-full p-8 clay-card clay-card-hover">
                  <span className="absolute top-4 right-4 text-xs font-semibold text-[#445E5D] bg-[#445E5D]/6 rounded-lg px-2.5 py-1">
                    {step.num}
                  </span>
                  <div className="w-14 h-14 rounded-full bg-[#445E5D]/8 flex items-center justify-center mb-5">
                    <step.icon className="w-7 h-7 text-[#445E5D]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#182E21] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base text-[#8A9D99] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </SectionReveal>
            ))}

            <div className="hidden md:block absolute top-1/2 left-[33%] right-[33%] h-px bg-[#445E5D]/12 -translate-y-1/2" />
          </div>
        </div>
      </section>

      {/* For Teaching Centers */}
      <section className="bg-[#445E5D] py-20">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
          <SectionReveal>
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-white/60 mb-2">
              {t("home.forCentersLabel")}
            </p>
            <h2 className="mb-4 text-3xl font-semibold text-white">
              {t("home.forCentersTitle")}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-white/85">
              {t("home.forCentersDesc")}
            </p>
            <div className="flex flex-col gap-4 mb-8">
              {[
                t("home.feature1"),
                t("home.feature2"),
                t("home.feature3"),
                t("home.feature4"),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full w-7 h-7 bg-white/15 shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base text-white">{item}</span>
                </div>
              ))}
            </div>
            <Link
              to={canGoToDashboard ? "/dashboard" : "/register-center"}
              className="inline-flex items-center px-7 py-3 rounded-full bg-white text-[#445E5D] font-semibold hover:bg-[#F8F4EB] transition-all hover:scale-[1.02]"
            >
              {canGoToDashboard ? t("home.goToDashboard") : t("home.registerYourCenter")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <div
              className="w-full max-w-[400px] mx-auto aspect-[4/3] rounded-3xl p-6 flex flex-col gap-4"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/12 rounded-2xl">
                  <p className="text-2xl font-bold text-white">47</p>
                  <p className="text-xs text-white/70">
                    {t("home.activeStudentsCard")}
                  </p>
                </div>
                <div className="p-4 bg-white/12 rounded-2xl">
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-xs text-white/70">{t("home.published")}</p>
                </div>
              </div>
              <div className="flex-1 p-4 bg-white/12 rounded-2xl">
                <p className="mb-3 text-xs text-white/70">
                  {t("home.recentQuizScores")}
                </p>
                <div className="flex items-end h-16 gap-2">
                  {[40, 65, 85, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-[#B1D4CD]"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#F8F4EB] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionReveal className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#8A9D99] mb-2">
              {t("home.featuresLabel")}
            </p>
            <h2 className="text-3xl font-semibold text-[#182E21]">
              {t("home.featuresTitle")}
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: PlayCircle,
                title: t("home.featVideoLessons"),
                desc: t("home.featVideoLessonsDesc"),
              },
              {
                icon: ClipboardCheck,
                title: t("home.featInteractiveQuizzes"),
                desc: t("home.featInteractiveQuizzesDesc"),
              },
              {
                icon: TrendingUp,
                title: t("home.featProgressTracking"),
                desc: t("home.featProgressTrackingDesc"),
              },
              {
                icon: Shield,
                title: t("home.featPrivatePortals"),
                desc: t("home.featPrivatePortalsDesc"),
              },
              {
                icon: MessageCircle,
                title: t("home.featCommunityChat"),
                desc: t("home.featCommunityChatDesc"),
              },
              {
                icon: Video,
                title: t("home.featMeetingRooms"),
                desc: t("home.featMeetingRoomsDesc"),
              },
              {
                icon: Smartphone,
                title: t("home.featMobileFriendly"),
                desc: t("home.featMobileFriendlyDesc"),
              },
              {
                icon: Award,
                title: t("home.featCertifiedCenters"),
                desc: t("home.featCertifiedCentersDesc"),
              },
            ].map((feat, i) => (
              <SectionReveal key={i} delay={i * 0.08}>
                <div className="h-full clay-card clay-card-hover p-7">
                  <div className="w-12 h-12 rounded-full bg-[#445E5D]/8 flex items-center justify-center mb-4">
                    <feat.icon className="w-6 h-6 text-[#445E5D]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#182E21] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[#8A9D99] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionReveal className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#8A9D99] mb-2">
              {t("home.testimonialsLabel")}
            </p>
            <h2 className="text-3xl font-semibold text-[#182E21]">
              {t("home.testimonialsTitle")}
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                quote: t("home.testimonial1Quote"),
                name: t("home.testimonial1Name"),
                role: t("home.testimonial1Role"),
                initials: "LK",
                bg: "#B1D4CD",
              },
              {
                quote: t("home.testimonial2Quote"),
                name: t("home.testimonial2Name"),
                role: t("home.testimonial2Role"),
                initials: "MT",
                bg: "#445E5D",
              },
              {
                quote: t("home.testimonial3Quote"),
                name: t("home.testimonial3Name"),
                role: t("home.testimonial3Role"),
                initials: "SR",
                bg: "#8A9D99",
              },
            ].map((t, i) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <div className="relative p-8 clay-card clay-card-hover">
                  <span className="text-5xl font-bold text-[#445E5D]/15 absolute top-4 left-4">
                    &ldquo;
                  </span>
                  <p className="text-lg text-[#182E21] italic leading-relaxed mt-6 mb-6">
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-11 h-11"
                      style={{ background: t.bg }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#182E21]">
                        {t.name}
                      </p>
                      <p className="text-[13px] text-[#8A9D99]">{t.role}</p>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#F8F4EB] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionReveal className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#8A9D99] mb-2">
              {t("home.pricingLabel")}
            </p>
            <h2 className="text-3xl font-semibold text-[#182E21]">
              {t("home.pricingTitle")}
            </h2>
          </SectionReveal>

          <div className="grid max-w-4xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
            {/* Free */}
            <SectionReveal delay={0}>
              <div className="flex flex-col h-full p-8 clay-card">
                <h3 className="text-xl font-semibold text-[#182E21] mb-2">
                  {t("home.planFree")}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#445E5D]">
                    {t("home.planFreePrice")}
                  </span>
                  <span className="text-base text-[#8A9D99]">
                    {t("home.planFreePerMonth")}
                  </span>
                </div>
                <ul className="flex flex-col flex-1 gap-3 mb-8">
                  {[
                    t("home.planFreeFeature1"),
                    t("home.planFreeFeature2"),
                    t("home.planFreeFeature3"),
                    t("home.planFreeFeature4"),
                    t("home.planFreeFeature5"),
                  ].map(f => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-[15px] text-[#4A5D5A]"
                    >
                      <Check className="w-4 h-4 text-[#B1D4CD] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="block w-full py-2.5 rounded-full bg-[#F8F4EB] text-[#445E5D] font-semibold hover:bg-[#445E5D] hover:text-white transition-all text-center"
                >
                  {t("home.getStartedBtn")}
                </Link>
              </div>
            </SectionReveal>

            {/* Monthly */}
            <SectionReveal delay={0.1}>
              <div
                className="p-8 h-full flex flex-col bg-[#445E5D] relative rounded-3xl"
                style={{
                  boxShadow:
                    "0 4px 24px rgba(0, 105, 92, 0.08), 0 1px 4px rgba(0, 105, 92, 0.04)",
                }}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B1D4CD] text-[#182E21] text-[11px] font-semibold px-4 py-1 rounded-xl">
                  {t("home.planMonthlyPopular")}
                </span>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {t("home.planMonthly")}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {t("home.planMonthlyPrice")}
                  </span>
                  <span className="text-base text-white/70">
                    {t("home.planMonthlyPerMonth")}
                  </span>
                </div>
                <ul className="flex flex-col flex-1 gap-3 mb-8">
                  {[
                    t("home.planMonthlyFeature1"),
                    t("home.planMonthlyFeature2"),
                    t("home.planMonthlyFeature3"),
                    t("home.planMonthlyFeature4"),
                    t("home.planMonthlyFeature5"),
                    t("home.planMonthlyFeature6"),
                    t("home.planMonthlyFeature7"),
                    t("home.planMonthlyFeature8"),
                  ].map(f => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-[15px] text-white"
                    >
                      <Check className="w-4 h-4 text-[#B1D4CD] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="block w-full py-2.5 rounded-full bg-white text-[#445E5D] font-semibold hover:bg-[#F8F4EB] transition-all text-center"
                >
                  {t("home.startProTrial")}
                </Link>
              </div>
            </SectionReveal>

            {/* Yearly */}
            <SectionReveal delay={0.2}>
              <div className="flex flex-col h-full p-8 clay-card relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#445E5D] text-white text-[11px] font-semibold px-4 py-1 rounded-xl">
                  {t("home.planYearlyPopular")}
                </span>
                <h3 className="text-xl font-semibold text-[#182E21] mb-2">
                  {t("home.planYearly")}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#445E5D]">
                    {t("home.planYearlyPrice")}
                  </span>
                  <span className="text-base text-[#8A9D99]">
                    {t("home.planYearlyPerMonth")}
                  </span>
                </div>
                <ul className="flex flex-col flex-1 gap-3 mb-8">
                  {[
                    t("home.planYearlyFeature1"),
                    t("home.planYearlyFeature2"),
                    t("home.planYearlyFeature3"),
                    t("home.planYearlyFeature4"),
                    t("home.planYearlyFeature5"),
                    t("home.planYearlyFeature6"),
                  ].map(f => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-[15px] text-[#4A5D5A]"
                    >
                      <Check className="w-4 h-4 text-[#B1D4CD] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={canGoToDashboard ? "/dashboard" : "/register-center"}
                  className="block w-full py-2.5 rounded-full bg-[#F8F4EB] text-[#445E5D] font-semibold hover:bg-[#445E5D] hover:text-white transition-all text-center"
                >
                  {canGoToDashboard ? t("home.goToDashboard") : t("home.registerCenterBtn")}
                </Link>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#182E21] py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[60, 100, 150, 200].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/[0.04]"
              style={{
                width: size,
                height: size,
                left: `${15 + i * 22}%`,
                top: `${20 + (i % 2) * 40}%`,
                animation: `drift${i} ${18 + i * 4}s linear infinite`,
              }}
            />
          ))}
        </div>
        <div className="max-w-[640px] mx-auto px-6 text-center relative z-10">
          <h2 className="mb-4 text-3xl font-semibold text-white">
            {t("home.ctaTitle")}
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/80">
            {t("home.ctaDesc")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="px-7 py-3 rounded-full bg-white text-[#445E5D] font-semibold hover:bg-[#F8F4EB] transition-all"
            >
              {t("home.ctaGetStarted")}
            </Link>
            <Link
              to={canGoToDashboard ? "/dashboard" : "/register-center"}
              className="py-3 font-semibold text-white transition-all border rounded-full px-7 bg-white/12 border-white/30 hover:bg-white/20"
            >
              {canGoToDashboard ? t("home.goToDashboard") : t("home.ctaRegisterCenter")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(-6px); }
          50% { transform: translateY(6px); }
        }
        @keyframes drift0 {
          from { transform: translate(0, 0); }
          to { transform: translate(30px, -20px); }
        }
        @keyframes drift1 {
          from { transform: translate(0, 0); }
          to { transform: translate(-25px, 15px); }
        }
        @keyframes drift2 {
          from { transform: translate(0, 0); }
          to { transform: translate(20px, 25px); }
        }
        @keyframes drift3 {
          from { transform: translate(0, 0); }
          to { transform: translate(-30px, -15px); }
        }
        .tooltip-label {
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          padding: 8px 20px;
          margin-right: -20px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-radius: 100px;
          border: 1px solid rgba(212,168,71,0.2);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          color: #182E21;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Avenir Next',-apple-system,sans-serif;
          letter-spacing: 0.02em;
          pointer-events: none;
          animation: tooltipFade 0.25s ease forwards;
        }
        .tooltip-arrow {
          position: absolute;
          left: calc(100% + 20px);
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-left: 7px solid rgba(255,255,255,0.95);
        }
        @keyframes tooltipFade {
          from { opacity: 0; transform: translateY(-50%) translateX(-8px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>
    </div>
  );
}
