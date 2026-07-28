import { create } from 'zustand';
import type { UserInfo } from '@/types';
import { APP_CONFIG } from '@/config';

interface AuthState {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  token: string | null;

  // Actions
  setAuthInfo: (token: string, userInfo: UserInfo) => void;
  clearAuthInfo: () => void;
  updateUserInfo: (userInfo: Partial<UserInfo>) => void;
}

/**
 * 认证 Store
 */
export const useAuthStore = create<AuthState>((set) => {
  // 初始化：从 localStorage 恢复
  const storedToken = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
  const storedUserInfo = localStorage.getItem(APP_CONFIG.USER_INFO_KEY);
  let parsedUserInfo: UserInfo | null = null;
  try {
    parsedUserInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
  } catch {
    parsedUserInfo = null;
  }

  return {
    isLoggedIn: !!storedToken && !!parsedUserInfo,
    userInfo: parsedUserInfo,
    token: storedToken,

    setAuthInfo: (token, userInfo) => {
      localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
      localStorage.setItem(APP_CONFIG.USER_INFO_KEY, JSON.stringify(userInfo));
      set({ isLoggedIn: true, token, userInfo });
    },

    clearAuthInfo: () => {
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.USER_INFO_KEY);
      localStorage.removeItem(APP_CONFIG.PERMISSION_KEY);
      set({ isLoggedIn: false, token: null, userInfo: null });
    },

    updateUserInfo: (partial) => {
      set((state) => {
        if (!state.userInfo) return state;
        const updated = { ...state.userInfo, ...partial };
        localStorage.setItem(APP_CONFIG.USER_INFO_KEY, JSON.stringify(updated));
        return { userInfo: updated };
      });
    },
  };
});

export default useAuthStore;
