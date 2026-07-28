import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { themeConfig } from '@/config';
import AppRouter from '@/router';
import '@/assets/styles/global.less';

// 移除首屏 loading
const removeLoading = () => {
  const loadingEl = document.getElementById('app-loading');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(() => loadingEl.remove(), 300);
  }
};

const RootApp: React.FC = () => {
  React.useEffect(() => {
    removeLoading();
  }, []);

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <App>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </App>
    </ConfigProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<RootApp />);
