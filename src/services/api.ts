import request from './request';
import type { LoginParams, LoginResult, UserInfo } from '@/types';

/**
 * 认证相关 API
 */
export const authApi = {
  /** 登录 */
  login(params: LoginParams) {
    return request.post<LoginResult>('/auth/login', params);
  },

  /** 登出 */
  logout() {
    return request.post('/auth/logout');
  },

  /** 获取当前用户信息 */
  getUserInfo() {
    return request.get<UserInfo>('/auth/user-info');
  },

  /** 刷新 Token */
  refreshToken(refreshToken: string) {
    return request.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  },
};

/**
 * 用户管理 API
 */
export const userApi = {
  /** 获取用户列表 */
  getList(params?: Record<string, unknown>) {
    return request.get('/users', { params });
  },

  /** 获取用户详情 */
  getDetail(id: string) {
    return request.get(`/users/${id}`);
  },

  /** 创建用户 */
  create(data: Record<string, unknown>) {
    return request.post('/users', data);
  },

  /** 更新用户 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/users/${id}`, data);
  },

  /** 删除用户 */
  remove(id: string) {
    return request.delete(`/users/${id}`);
  },
};

/**
 * 角色管理 API
 */
export const roleApi = {
  /** 获取角色列表 */
  getList(params?: Record<string, unknown>) {
    return request.get('/system/roles', { params });
  },

  /** 创建角色 */
  create(data: Record<string, unknown>) {
    return request.post('/system/roles', data);
  },

  /** 更新角色 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/system/roles/${id}`, data);
  },

  /** 删除角色 */
  remove(id: string) {
    return request.delete(`/system/roles/${id}`);
  },
};

/**
 * 权限管理 API
 */
export const permissionApi = {
  /** 获取权限列表 */
  getList() {
    return request.get('/system/permissions');
  },

  /** 创建权限 */
  create(data: Record<string, unknown>) {
    return request.post('/system/permissions', data);
  },

  /** 更新权限 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/system/permissions/${id}`, data);
  },

  /** 删除权限 */
  remove(id: string) {
    return request.delete(`/system/permissions/${id}`);
  },
};

/**
 * 字典管理 API
 */
export const dictApi = {
  /** 获取字典列表 */
  getList(params?: Record<string, unknown>) {
    return request.get('/system/dicts', { params });
  },

  /** 获取字典详情（按 code） */
  getDetail(code: string) {
    return request.get(`/system/dicts/${code}`);
  },

  /** 创建字典 */
  create(data: Record<string, unknown>) {
    return request.post('/system/dicts', data);
  },

  /** 更新字典 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/system/dicts/${id}`, data);
  },

  /** 删除字典 */
  remove(id: string) {
    return request.delete(`/system/dicts/${id}`);
  },
};

/**
 * 部门管理 API
 */
export const deptApi = {
  /** 获取部门树 */
  getTree() {
    return request.get('/system/departments');
  },

  /** 获取部门列表（平铺） */
  getList() {
    return request.get('/system/departments/list');
  },

  /** 创建部门 */
  create(data: Record<string, unknown>) {
    return request.post('/system/departments', data);
  },

  /** 更新部门 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/system/departments/${id}`, data);
  },

  /** 删除部门 */
  remove(id: string) {
    return request.delete(`/system/departments/${id}`);
  },
};

/**
 * 菜单管理 API
 */
export const menuApi = {
  /** 获取菜单树 */
  getTree() {
    return request.get('/system/menus');
  },

  /** 获取菜单列表（平铺） */
  getList() {
    return request.get('/system/menus/list');
  },

  /** 创建菜单 */
  create(data: Record<string, unknown>) {
    return request.post('/system/menus', data);
  },

  /** 更新菜单 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/system/menus/${id}`, data);
  },

  /** 删除菜单 */
  remove(id: string) {
    return request.delete(`/system/menus/${id}`);
  },
};

/**
 * Dashboard API
 */
export const dashboardApi = {
  /** 获取概览数据 */
  getOverview() {
    return request.get('/dashboard/overview');
  },

  /** 获取趋势数据 */
  getTrends(params?: Record<string, unknown>) {
    return request.get('/dashboard/trends', { params });
  },

  /** 获取饼图数据 */
  getPie() {
    return request.get('/dashboard/pie');
  },

  /** 获取排行数据 */
  getRanking() {
    return request.get('/dashboard/ranking');
  },
};

/**
 * 订单管理 API
 */
export const orderApi = {
  /** 获取订单列表 */
  getList(params?: Record<string, unknown>) {
    return request.get('/orders', { params });
  },

  /** 获取订单详情 */
  getDetail(id: string) {
    return request.get(`/orders/${id}`);
  },

  /** 创建订单 */
  create(data: Record<string, unknown>) {
    return request.post('/orders', data);
  },

  /** 更新订单 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/orders/${id}`, data);
  },

  /** 删除订单 */
  remove(id: string) {
    return request.delete(`/orders/${id}`);
  },
};

/**
 * 内容(文章)管理 API
 */
export const articleApi = {
  /** 获取文章列表 */
  getList(params?: Record<string, unknown>) {
    return request.get('/articles', { params });
  },

  /** 获取文章详情 */
  getDetail(id: string) {
    return request.get(`/articles/${id}`);
  },

  /** 创建文章 */
  create(data: Record<string, unknown>) {
    return request.post('/articles', data);
  },

  /** 更新文章 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/articles/${id}`, data);
  },

  /** 删除文章 */
  remove(id: string) {
    return request.delete(`/articles/${id}`);
  },
};

/**
 * 客户管理 API
 */
export const customerApi = {
  /** 获取客户列表 */
  getList(params?: Record<string, unknown>) {
    return request.get('/customers', { params });
  },

  /** 获取客户详情 */
  getDetail(id: string) {
    return request.get(`/customers/${id}`);
  },

  /** 创建客户 */
  create(data: Record<string, unknown>) {
    return request.post('/customers', data);
  },

  /** 更新客户 */
  update(id: string, data: Record<string, unknown>) {
    return request.put(`/customers/${id}`, data);
  },

  /** 删除客户 */
  remove(id: string) {
    return request.delete(`/customers/${id}`);
  },
};

/**
 * 日志 API
 */
export const logApi = {
  /** 获取操作日志 */
  getOperationLogs(params?: Record<string, unknown>) {
    return request.get('/logs/operation', { params });
  },

  /** 清空操作日志 */
  clearOperationLogs() {
    return request.delete('/logs/operation');
  },

  /** 获取登录日志 */
  getLoginLogs(params?: Record<string, unknown>) {
    return request.get('/logs/login', { params });
  },

  /** 清空登录日志 */
  clearLoginLogs() {
    return request.delete('/logs/login');
  },
};
