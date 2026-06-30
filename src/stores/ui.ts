import { create } from "zustand";

interface UIStore {
  mobileNavOpen: boolean;
  notificationOpen: boolean;
  requestCenterOpen: boolean;
  sidebarCollapsed: boolean;

  setMobileNavOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
  setRequestCenterOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  toggleMobileNav: () => void;
  toggleNotification: () => void;
  toggleRequestCenter: () => void;
  toggleSidebar: () => void;

  closeAll: () => void;
}

const STORAGE_KEY = "dlz-ui";

function readStoredCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "collapsed";
}

export const useUIStore = create<UIStore>((set, get) => ({
  mobileNavOpen: false,
  notificationOpen: false,
  requestCenterOpen: false,
  sidebarCollapsed: readStoredCollapsed(),

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setNotificationOpen: (open) => set({ notificationOpen: open }),
  setRequestCenterOpen: (open) => set({ requestCenterOpen: open }),
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    localStorage.setItem(STORAGE_KEY, collapsed ? "collapsed" : "expanded");
  },

  toggleMobileNav: () => set({ mobileNavOpen: !get().mobileNavOpen }),
  toggleNotification: () => set({ notificationOpen: !get().notificationOpen }),
  toggleRequestCenter: () => set({ requestCenterOpen: !get().requestCenterOpen }),
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
    localStorage.setItem(STORAGE_KEY, next ? "collapsed" : "expanded");
  },

  closeAll: () => set({ mobileNavOpen: false, notificationOpen: false, requestCenterOpen: false }),
}));
