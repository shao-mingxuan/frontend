import React from 'react';
import { Layout } from 'antd';
import styles from './Footer.module.less';

const Footer: React.FC = () => {
  return (
    <Layout.Footer className={styles.footer}>
      Admin System ©{new Date().getFullYear()} Created with React + Ant Design
    </Layout.Footer>
  );
};

export default Footer;
