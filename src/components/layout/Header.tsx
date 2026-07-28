import React from 'react';
import { Layout, Dropdown, Avatar, Space, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore, useAuthStore } from '@/store';
import { authApi } from '@/services/api';
import { APP_CONFIG } from '@/config';
import styles from './Header.module.less';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { siderCollapsed, toggleSider } = useAppStore();
  const { userInfo, clearAuthInfo } = useAuthStore();
  const { token: themeToken } = theme.useToken();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 即使 API 失败也清除本地状态
    }
    clearAuthInfo();
    navigate(APP_CONFIG.LOGIN_PATH);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/user/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      className={styles.header}
      style={{ background: themeToken.colorBgContainer }}
    >
      <div className={styles.headerLeft}>
        <span className={styles.trigger} onClick={toggleSider}>
          {siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
      </div>

      <div className={styles.headerRight}>
        {/* 通知 */}
        <span className={styles.actionItem}>
          <BellOutlined style={{ fontSize: 18 }} />
        </span>

        {/* 用户信息 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <span className={styles.actionItem}>
            <Space>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                src={userInfo?.avatar}
              />
              <span className={styles.username}>
                {userInfo?.nickname || userInfo?.username || '管理员'}
              </span>
            </Space>
          </span>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
