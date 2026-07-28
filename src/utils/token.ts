import { APP_CONFIG } from '@/config';

/**
 * Token 管理工具
 */
export const tokenUtil = {
  get(): string | null {
    return localStorage.getItem(APP_CONFIG.TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
  },

  getRefresh(): string | null {
    return localStorage.getItem(APP_CONFIG.REFRESH_TOKEN_KEY);
  },

  setRefresh(token: string): void {
    localStorage.setItem(APP_CONFIG.REFRESH_TOKEN_KEY, token);
  },

  clear(): void {
    localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
  },
};

export default tokenUtil;
