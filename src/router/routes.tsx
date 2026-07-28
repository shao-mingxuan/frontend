import React from 'react';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LockOutlined,
  TeamOutlined,
  ProfileOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  MenuOutlined,
  FileSearchOutlined,
  AuditOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import type { RouteConfig } from '@/types';

/**
 * 路由配置表
 * - authority: 允许访问的角色/权限标识数组
 * - hideInMenu: 是否在菜单中隐藏
 * - icon: 菜单图标
 */
export const routeConfigs: RouteConfig[] = [
  {
    path: '/dashboard',
    name: '仪表盘',
    icon: React.createElement(DashboardOutlined),
    component: React.lazy(() => import('@/pages/dashboard')),
  },
  {
    path: '/user',
    name: '用户管理',
    icon: React.createElement(UserOutlined),
    children: [
      {
        path: '/user/list',
        name: '用户列表',
        icon: React.createElement(TeamOutlined),
        component: React.lazy(() => import('@/pages/user-management')),
      },
      {
        path: '/user/profile',
        name: '个人中心',
        icon: React.createElement(ProfileOutlined),
        component: React.lazy(() => import('@/pages/user-management/Profile')),
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/business',
    name: '业务管理',
    icon: React.createElement(ShopOutlined),
    children: [
      {
        path: '/business/order',
        name: '订单管理',
        icon: React.createElement(ShoppingCartOutlined),
        component: React.lazy(() => import('@/pages/order')),
      },
      {
        path: '/business/content',
        name: '内容管理',
        icon: React.createElement(FileTextOutlined),
        component: React.lazy(() => import('@/pages/content')),
      },
      {
        path: '/business/customer',
        name: '客户管理',
        icon: React.createElement(TeamOutlined),
        component: React.lazy(() => import('@/pages/customer')),
      },
    ],
  },
  {
    path: '/system',
    name: '系统管理',
    icon: React.createElement(SettingOutlined),
    authority: ['admin'],
    children: [
      {
        path: '/system/role',
        name: '角色管理',
        icon: React.createElement(SafetyOutlined),
        component: React.lazy(() => import('@/pages/system-settings/Role')),
        authority: ['admin'],
      },
      {
        path: '/system/permission',
        name: '权限管理',
        icon: React.createElement(LockOutlined),
        component: React.lazy(() => import('@/pages/system-settings/Permission')),
        authority: ['admin'],
      },
      {
        path: '/system/dict',
        name: '字典管理',
        icon: React.createElement(AppstoreOutlined),
        component: React.lazy(() => import('@/pages/system-settings/Dict')),
        authority: ['admin'],
      },
      {
        path: '/system/dept',
        name: '部门管理',
        icon: React.createElement(ApartmentOutlined),
        component: React.lazy(() => import('@/pages/department')),
        authority: ['admin'],
      },
      {
        path: '/system/menu',
        name: '菜单管理',
        icon: React.createElement(MenuOutlined),
        component: React.lazy(() => import('@/pages/menu-management')),
        authority: ['admin'],
      },
    ],
  },
  {
    path: '/log',
    name: '日志管理',
    icon: React.createElement(FileSearchOutlined),
    authority: ['admin', 'log:read'],
    children: [
      {
        path: '/log/operation',
        name: '操作日志',
        icon: React.createElement(AuditOutlined),
        component: React.lazy(() => import('@/pages/log/OperationLog')),
        authority: ['admin', 'log:read'],
      },
      {
        path: '/log/login',
        name: '登录日志',
        icon: React.createElement(LoginOutlined),
        component: React.lazy(() => import('@/pages/log/LoginLog')),
        authority: ['admin', 'log:read'],
      },
    ],
  },
  {
    path: '/settings',
    name: '系统设置',
    icon: React.createElement(SettingOutlined),
    component: React.lazy(() => import('@/pages/system-settings')),
  },
];

export default routeConfigs;
