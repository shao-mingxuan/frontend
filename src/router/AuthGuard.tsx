import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { APP_CONFIG } from '@/config';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 登录守卫组件
 * - 未登录 → 跳转登录页
 * - 已登录 → 渲染子组件
 *
 * 注意：纯权限校验（authority）已移到 AuthorityGuard，
 * 本组件只负责"是否登录"这一层守卫
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to={APP_CONFIG.LOGIN_PATH} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
