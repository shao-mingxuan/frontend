import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAppStore } from '@/store';
import styles from './AdminLayout.module.less';

const { Content } = Layout;

const AdminLayout: React.FC = () => {
  const { siderCollapsed } = useAppStore();

  return (
    <Layout className={styles.adminLayout}>
      <Sidebar />
      <Layout
        className={styles.mainLayout}
        style={{ marginLeft: siderCollapsed ? 80 : 220, transition: 'margin-left 0.2s' }}
      >
        <Header />
        <Content className={styles.content}>
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
