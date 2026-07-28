import React from 'react';
import { Card, Descriptions, Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store';
import styles from './Profile.module.less';

const Profile: React.FC = () => {
  const { userInfo } = useAuthStore();

  return (
    <div className={styles.profile}>
      <Card title="个人信息">
        <div className={styles.avatarSection}>
          <Avatar size={80} icon={<UserOutlined />} src={userInfo?.avatar} />
          <h3>{userInfo?.nickname || '管理员'}</h3>
          <Tag color="blue">{userInfo?.role === 'admin' ? '管理员' : userInfo?.role}</Tag>
        </div>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="用户名">{userInfo?.username}</Descriptions.Item>
          <Descriptions.Item label="昵称">{userInfo?.nickname}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{userInfo?.email}</Descriptions.Item>
          <Descriptions.Item label="手机号">{userInfo?.phone}</Descriptions.Item>
          <Descriptions.Item label="角色">{userInfo?.role}</Descriptions.Item>
          <Descriptions.Item label="权限">
            {(userInfo?.permissions || []).map((p) => (
              <Tag key={p}>{p}</Tag>
            ))}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile;
