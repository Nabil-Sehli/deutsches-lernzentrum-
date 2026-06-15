import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import CenterRequestForm from "./CenterRequestForm";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Settings,
  User,
  MapPin,
  Building2,
  Shield,
  ExternalLink,
} from "lucide-react";

function DZLogo() {
  return (
    <span className="font-serif text-[#182E21] font-bold text-base tracking-tight" style={{ fontFamily: "'Times New Roman',serif" }}>
      DLZ
    </span>
  );
}

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";
  const [requestFormOpen, setRequestFormOpen] = useState(false);

  const myRequest = trpc.centerRequest.myRequest.useQuery(undefined, {
    enabled: isTeacher,
  });
  const centerSlug = myRequest.data?.status === "approved" ? myRequest.data.slug : null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#F8F4EB]/90 backdrop-blur-xl border-b border-[#E6DFD3] shadow-sm"
            : "bg-[#F8F4EB]/70 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1 no-underline"
          >
            <DZLogo />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-1.5 text-sm font-medium text-[#445E5D] rounded-lg hover:bg-[#445E5D]/6 transition-colors"
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/map"
              className="px-3 py-1.5 text-sm font-medium text-[#445E5D] rounded-lg hover:bg-[#445E5D]/6 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              Map
            </Link>
            {isAuthenticated && (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin-portal"
                    className="px-3 py-1.5 text-sm font-medium text-[#445E5D] rounded-lg hover:bg-[#445E5D]/6 transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </Link>
                ) : (
                  <Link
                    to={isTeacher ? "/admin" : "/dashboard"}
                    className="px-3 py-1.5 text-sm font-medium text-[#445E5D] rounded-lg hover:bg-[#445E5D]/6 transition-colors flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {isTeacher ? t("nav.admin") : t("nav.dashboard")}
                  </Link>
                )}
                {isTeacher && !user?.centerId && (
                  <button
                    onClick={() => setRequestFormOpen(true)}
                    className="px-3 py-1.5 text-sm font-medium text-[#445E5D] rounded-lg hover:bg-[#445E5D]/6 transition-colors flex items-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4" />
                    Request Center
                  </button>
                )}
                {isTeacher && user?.centerId && (
                  <Link
                    to="/admin?tab=settings"
                    className="px-3 py-1.5 text-sm font-medium text-[#445E5D] rounded-lg hover:bg-[#445E5D]/6 transition-colors flex items-center gap-1.5"
                  >
                    <Settings className="w-4 h-4" />
                    {t("nav.manageCenter")}
                  </Link>
                )}
                {centerSlug && (
                  <Link
                    to={`/c/${centerSlug}`}
                    className="px-3 py-1.5 text-sm font-medium text-[#00695c] rounded-lg hover:bg-[#00695c]/6 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View My Center
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="px-3 py-1.5 text-sm font-medium text-[#445E5D] rounded-lg hover:bg-[#445E5D]/6 transition-colors flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  {t("nav.profile")}
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#445E5D]/8">
                  <User className="w-4 h-4 text-[#445E5D]" />
                  <span className="text-sm font-medium text-[#445E5D]">
                    {user?.name ?? "User"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-full border border-[#445E5D]/30 text-[#445E5D] text-sm font-semibold hover:bg-[#445E5D]/8 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t("nav.signOut")}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-5 h-9 rounded-full bg-[#B1D4CD] text-[#182E21] text-sm font-semibold hover:bg-[#9FC4BC] transition-all"
              >
                {t("nav.signIn")}
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-[#445E5D]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-6 pt-20"
            style={{ borderRadius: "24px 0 0 24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#445E5D] font-medium hover:bg-[#445E5D]/6 transition-colors"
              >
                <User className="w-5 h-5" />
                {t("nav.home")}
              </Link>
              <Link
                to="/map"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#445E5D] font-medium hover:bg-[#445E5D]/6 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <MapPin className="w-5 h-5" />
                Map
              </Link>
              {isAuthenticated && (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin-portal"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#445E5D] font-medium hover:bg-[#445E5D]/6 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Shield className="w-5 h-5" />
                      Admin Portal
                    </Link>
                  ) : (
                    <Link
                      to={isTeacher ? "/admin" : "/dashboard"}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#445E5D] font-medium hover:bg-[#445E5D]/6 transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      {isTeacher ? t("nav.admin") : t("nav.dashboard")}
                    </Link>
                  )}
                  {isTeacher && !user?.centerId && (
                    <button
                      onClick={() => { setRequestFormOpen(true); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#445E5D] font-medium hover:bg-[#445E5D]/6 transition-colors w-full"
                    >
                      <Building2 className="w-5 h-5" />
                      Request Center
                    </button>
                  )}
                  {isTeacher && user?.centerId && (
                    <Link
                      to="/admin?tab=settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#445E5D] font-medium hover:bg-[#445E5D]/6 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      {t("nav.manageCenter")}
                    </Link>
                  )}
                  {centerSlug && (
                    <Link
                      to={`/c/${centerSlug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#00695c] font-medium hover:bg-[#00695c]/6 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <ExternalLink className="w-5 h-5" />
                      View My Center
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#445E5D] font-medium hover:bg-[#445E5D]/6 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    {t("nav.profile")}
                  </Link>
                  <div className="px-4">
                    <LanguageSwitcher />
                  </div>
                  <hr className="border-[#E6DFD3] my-2" />
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    {t("nav.signOut")}
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#B1D4CD] text-[#182E21] font-semibold mt-4"
                >
                  {t("nav.signIn")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <CenterRequestForm open={requestFormOpen} onOpenChange={setRequestFormOpen} />
    </>
  );
}
