import { useState, useEffect, useRef } from "react";
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
  Bell,
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
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const myRequest = trpc.centerRequest.myRequest.useQuery(undefined, {
    enabled: isTeacher,
  });
  const myCenter = trpc.center.myCenter.useQuery(undefined, {
    enabled: isTeacher,
  });
  const centerSlug = myRequest.data?.status === "approved"
    ? myRequest.data.slug
    : (myCenter.data?.slug ?? null);

  const utils = trpc.useUtils();
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const { data: notifications } = trpc.notifications.list.useQuery({ limit: 5 }, {
    enabled: isAuthenticated,
  });
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.invalidate(),
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.invalidate(),
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
                    {t("nav.requestCenter")}
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
                  <a
                    href={`/c/${centerSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm font-medium text-[#00695c] rounded-lg hover:bg-[#00695c]/6 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t("nav.viewMyCenter")}
                  </a>
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
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-[#445E5D] rounded-lg hover:bg-[#445E5D]/6 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {(unreadCount ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[18px] min-h-[18px]">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E6DFD3] overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6DFD3]">
                      <span className="text-sm font-semibold text-[#2c3e2d]">Notifications</span>
                      {(unreadCount ?? 0) > 0 && (
                        <button
                          onClick={() => markAllRead.mutate()}
                          className="text-xs text-[#00695c] font-medium hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {!notifications || notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-[#78909c]">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              if (!n.read) markRead.mutate({ id: n.id });
                              setNotifOpen(false);
                              const role = user?.role;
                              let path = n.link ?? "/dashboard";
                              if (n.type === "new_message") {
                                path = role === "teacher" ? "/admin?tab=chat" : "/dashboard";
                              } else if (n.type === "upcoming_meeting") {
                                path = role === "teacher" ? "/admin?tab=meetingRooms" : "/dashboard";
                              }
                              navigate(path);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-[#445E5D]/4 transition-colors border-b border-[#E6DFD3]/50 last:border-b-0 ${!n.read ? "bg-[#B1D4CD]/10" : ""}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && (
                                <span className="w-2 h-2 mt-1.5 rounded-full bg-[#00695c] flex-shrink-0" />
                              )}
                              <div className={!n.read ? "" : "ml-4"}>
                                <p className="text-sm font-medium text-[#2c3e2d]">{n.title}</p>
                                {n.body && (
                                  <p className="text-xs text-[#78909c] mt-0.5 line-clamp-2">{n.body}</p>
                                )}
                                <p className="text-[10px] text-[#aab7b7] mt-1">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#445E5D]/8">
                  <User className="w-4 h-4 text-[#445E5D]" />
                  <span className="text-sm font-medium text-[#445E5D]">
                    {user?.title ? `${user.title}. ` : ""}{user?.name ?? "User"}
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
                      {t("nav.requestCenter")}
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
                    <a
                      href={`/c/${centerSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#00695c] font-medium hover:bg-[#00695c]/6 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      {t("nav.viewMyCenter")}
                    </a>
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
