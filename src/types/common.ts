/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role: string;
  permissions: string[];
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string;
  password: string;
  captcha?: string;
}

/**
 * 登录结果
 */
export interface LoginResult {
  token: string;
  refreshToken: string;
  userInfo: UserInfo;
}

/**
 * 菜单项类型
 */
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  path?: string;
  hideInMenu?: boolean;
  hideChildrenInMenu?: boolean;
  authority?: string[];
  parentKey?: string;
}

/**
 * 路由配置类型
 */
export interface RouteConfig {
  path: string;
  component?: React.LazyExoticComponent<React.ComponentType> | React.ComponentType;
  name?: string;
  icon?: React.ReactNode;
  redirect?: string;
  children?: RouteConfig[];
  authority?: string[];
  hideInMenu?: boolean;
  hideChildrenInMenu?: boolean;
  exact?: boolean;
}

/**
 * API 通用响应类型
 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  current: number;
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginatedData<T> {
  list: T[];
  total: number;
  current: number;
  pageSize: number;
}

/**
 * 表格查询参数
 */
export interface TableQueryParams extends PaginationParams {
  sortField?: string;
  sortOrder?: string;
  [key: string]: unknown;
}
