import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { routeConfigs } from './routes';
import AdminLayout from '@/components/layout/AdminLayout';
import Login from '@/pages/login';
import NotFound from '@/pages/NotFound';
import Forbidden from '@/pages/Forbidden';
import { useAuthStore } from '@/store/auth.store';
import { APP_CONFIG } from '@/config';

/**
 * 页面懒加载的 Suspense fallback
 */
const LazyFallback = (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: 200,
    }}
  >
    <Spin size="large" tip="加载中..." />
  </div>
);

/**
 * 权限校验组件（仅校验 authority，不含登录跳转逻辑）
 * 登录校验统一在父级 Route 处理
 */
const AuthorityGuard: React.FC<{ authority?: string[]; children: React.ReactNode }> = ({
  authority,
  children,
}) => {
  const { userInfo } = useAuthStore();

  if (authority && authority.length > 0) {
    const hasPermission =
      userInfo?.role === 'admin' ||
      authority.some((auth) => userInfo?.permissions?.includes(auth));

    if (!hasPermission) {
      return <Navigate to={APP_CONFIG.FORBIDDEN_PATH} replace />;
    }
  }

  return <>{children}</>;
};

/**
 * 递归将路由配置渲染为 Route 组件
 * - 叶子路由：包裹 Suspense（懒加载）+ AuthorityGuard（权限校验）
 * - 父子路由：仅用 <Outlet /> 渲染子路由出口
 */
const renderRoutes = (routes: typeof routeConfigs) => {
  return routes.map((route) => {
    // 有子路由的父级 —— 只渲染 Outlet 出口，不做 Suspense 包裹
    if (route.children && route.children.length > 0) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <AuthorityGuard authority={route.authority}>
              <Outlet />
            </AuthorityGuard>
          }
        >
          {renderRoutes(route.children)}
          {/* 子路由默认重定向到第一个子路由 */}
          {route.children[0] && (
            <Route
              index
              element={<Navigate to={route.children[0].path} replace />}
            />
          )}
        </Route>
      );
    }

    // 叶子路由 —— 懒加载 + Suspense + 权限校验
    if (route.component) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <AuthorityGuard authority={route.authority}>
              <React.Suspense fallback={LazyFallback}>
                <route.component />
              </React.Suspense>
            </AuthorityGuard>
          }
        />
      );
    }

    // 纯重定向路由
    if (route.redirect) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={<Navigate to={route.redirect} replace />}
        />
      );
    }

    return null;
  });
};

/**
 * 根路由配置
 *
 * 权限分层策略：
 * ┌─────────────────────────────────────────────────┐
 * │  父级 Route "/" → AuthGuard（登录校验）         │
 * │  ├── /dashboard  → AuthorityGuard（权限校验）    │
 * │  ├── /user/*     → AuthorityGuard              │
 * │  ├── /system/*   → AuthorityGuard（admin only） │
 * │  └── /settings   → AuthorityGuard              │
 * │                                                  │
 * │  /login          → 无需守卫                      │
 * │  /403, /404      → 无需守卫                      │
 * └─────────────────────────────────────────────────┘
 */
const AppRouter: React.FC = () => {
  const { isLoggedIn } = useAuthStore();

  return (
    <React.Suspense fallback={LazyFallback}>
      <Routes>
        {/* 登录页 —— 无需任何守卫 */}
        <Route path="/login" element={<Login />} />

        {/* 403 / 404 —— 无需登录守卫 */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />

        {/* 后台页面 —— 统一登录校验 */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <AdminLayout />
            ) : (
              <Navigate to={APP_CONFIG.LOGIN_PATH} replace />
            )
          }
        >
          {renderRoutes(routeConfigs)}
          {/* 访问 / 时默认重定向到 Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
};

export default AppRouter;
