import { create } from 'zustand';
import { APP_CONFIG } from '@/config';

interface AppState {
  // 侧边栏
  siderCollapsed: boolean;
  toggleSider: () => void;
  setSiderCollapsed: (collapsed: boolean) => void;

  // 全局 Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // 面包屑
  breadcrumbs: Array<{ title: string; path?: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ title: string; path?: string }>) => void;

  // 主题
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // 标签页
  openTabs: Array<{ key: string; title: string; path: string }>;
  addTab: (tab: { key: string; title: string; path: string }) => void;
  removeTab: (key: string) => void;
  activeTab: string;
  setActiveTab: (key: string) => void;
}

/**
 * 全局应用 Store
 */
export const useAppStore = create<AppState>((set) => {
  const storedCollapsed = localStorage.getItem(APP_CONFIG.COLLAPSED_KEY);
  const initialCollapsed = storedCollapsed === 'true';

  return {
    siderCollapsed: initialCollapsed,
    toggleSider: () => {
      set((state) => {
        const collapsed = !state.siderCollapsed;
        localStorage.setItem(APP_CONFIG.COLLAPSED_KEY, String(collapsed));
        return { siderCollapsed: collapsed };
      });
    },
    setSiderCollapsed: (collapsed) => {
      localStorage.setItem(APP_CONFIG.COLLAPSED_KEY, String(collapsed));
      set({ siderCollapsed: collapsed });
    },

    globalLoading: false,
    setGlobalLoading: (loading) => set({ globalLoading: loading }),

    breadcrumbs: [],
    setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

    theme: 'light',
    toggleTheme: () =>
      set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

    openTabs: [],
    addTab: (tab) =>
      set((state) => {
        const exists = state.openTabs.some((t) => t.key === tab.key);
        if (exists) {
          return { openTabs: state.openTabs, activeTab: tab.key };
        }
        return { openTabs: [...state.openTabs, tab], activeTab: tab.key };
      }),
    removeTab: (key) =>
      set((state) => {
        const filtered = state.openTabs.filter((t) => t.key !== key);
        const newActive =
          state.activeTab === key
            ? filtered[filtered.length - 1]?.key || '/dashboard'
            : state.activeTab;
        return { openTabs: filtered, activeTab: newActive };
      }),
    activeTab: '/dashboard',
    setActiveTab: (key) => set({ activeTab: key }),
  };
});

export default useAppStore;
