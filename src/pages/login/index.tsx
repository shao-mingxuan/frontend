import React, { useState } from 'react';
import { Form, Input, Button, Card, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { authApi } from '@/services/api';
import { APP_CONFIG } from '@/config';
import styles from './index.module.less';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthInfo } = useAuthStore();

  const handleLogin = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    try {
      const res = await authApi.login({ username: values.username, password: values.password });
      if (res.success && res.data) {
        const { token, refreshToken, userInfo } = res.data;
        // 存储 refresh token
        if (refreshToken) {
          localStorage.setItem(APP_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
        }
        setAuthInfo(token, userInfo);
        message.success('登录成功');
        navigate(APP_CONFIG.HOME_PATH);
      } else {
        message.error(res.message || '登录失败');
      }
    } catch {
      message.error('登录请求失败，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <h1 className={styles.title}>{APP_CONFIG.APP_NAME}</h1>
          <p className={styles.subtitle}>中大型后台管理系统</p>
        </div>
        <Card className={styles.loginCard}>
          <Form
            initialValues={{ username: 'admin', password: 'admin', remember: true }}
            onFinish={handleLogin}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名: admin" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码: admin" />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登 录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
