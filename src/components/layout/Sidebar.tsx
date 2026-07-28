import React, { useMemo } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppstoreOutlined } from '@ant-design/icons';
import { useAppStore, useAuthStore } from '@/store';
import { routeConfigs } from '@/router/routes';
import { APP_CONFIG } from '@/config';
import styles from './Sidebar.module.less';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

/**
 * 将路由配置转换为 Ant Design 菜单项
 */
const getMenuItems = (
  routes: typeof routeConfigs,
  authority?: string[]
): MenuItem[] => {
  const userRole = useAuthStore.getState().userInfo?.role;
  const userPermissions = useAuthStore.getState().userInfo?.permissions || [];

  return routes
    .filter((route) => {
      if (route.hideInMenu) return false;
      if (route.authority && route.authority.length > 0) {
        return (
          userRole === 'admin' ||
          route.authority.some((auth) => userPermissions.includes(auth))
        );
      }
      return true;
    })
    .map((route): MenuItem => {
      if (route.children && route.children.length > 0 && !route.hideChildrenInMenu) {
        return {
          key: route.path,
          icon: route.icon || <AppstoreOutlined />,
          label: route.name,
          children: getMenuItems(route.children, route.authority),
        };
      }

      return {
        key: route.path,
        icon: route.icon || <AppstoreOutlined />,
        label: route.name,
      };
    });
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { siderCollapsed } = useAppStore();

  const menuItems = useMemo(() => getMenuItems(routeConfigs), []);

  const selectedKeys = [location.pathname];
  const openKeys = siderCollapsed
    ? []
    : ['/' + location.pathname.split('/').filter(Boolean)[0]];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      className={styles.sider}
      trigger={null}
      collapsible
      collapsed={siderCollapsed}
      width={220}
      collapsedWidth={80}
      theme="dark"
    >
      <div className={styles.logo}>
        {siderCollapsed ? (
          <span className={styles.logoMini}>AS</span>
        ) : (
          <span className={styles.logoFull}>{APP_CONFIG.APP_NAME}</span>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        className={styles.menu}
      />
    </Sider>
  );
};

export default Sidebar;
