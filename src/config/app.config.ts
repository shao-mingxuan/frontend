/**
 * 应用全局常量配置
 */
export const APP_CONFIG = {
  APP_NAME: 'Admin System',
  APP_VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'zh-CN',

  // API
  API_BASE_URL: '/api',
  API_TIMEOUT: 15000,

  // Token
  TOKEN_KEY: 'admin_token',
  REFRESH_TOKEN_KEY: 'admin_refresh_token',

  // 分页
  PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

  // 路由
  LOGIN_PATH: '/login',
  HOME_PATH: '/dashboard',
  NOT_FOUND_PATH: '/404',
  FORBIDDEN_PATH: '/403',

  // 本地存储
  USER_INFO_KEY: 'admin_user_info',
  PERMISSION_KEY: 'admin_permissions',
  COLLAPSED_KEY: 'admin_sidebar_collapsed',
};

export default APP_CONFIG;
