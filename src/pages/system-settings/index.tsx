import React from 'react';
import { Card, Tabs, Typography } from 'antd';
import { SettingOutlined, BellOutlined, SafetyOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const { Title, Paragraph } = Typography;

const SystemSettings: React.FC = () => {
  const items = [
    {
      key: 'basic',
      label: '基本设置',
      icon: <SettingOutlined />,
      children: (
        <Card>
          <Title level={5}>系统基本配置</Title>
          <Paragraph>在此配置系统的基本信息、参数和偏好设置。</Paragraph>
        </Card>
      ),
    },
    {
      key: 'notification',
      label: '通知设置',
      icon: <BellOutlined />,
      children: (
        <Card>
          <Title level={5}>通知偏好</Title>
          <Paragraph>配置邮件、短信、站内信等通知方式的开关和规则。</Paragraph>
        </Card>
      ),
    },
    {
      key: 'security',
      label: '安全设置',
      icon: <SafetyOutlined />,
      children: (
        <Card>
          <Title level={5}>安全策略</Title>
          <Paragraph>配置密码策略、登录限制、IP 白名单等安全相关设置。</Paragraph>
        </Card>
      ),
    },
  ];

  return (
    <div className={styles.systemSettings}>
      <Tabs items={items} tabPosition="left" />
    </div>
  );
};

export default SystemSettings;
