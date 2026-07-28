/**
 * Ant Design 主题变量覆盖
 * 文档: https://ant.design/docs/react/customize-theme-cn
 */
export const themeConfig = {
  token: {
    // 品牌色
    colorPrimary: '#1890ff',
    colorInfo: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',

    // 字体
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    fontSize: 14,

    // 圆角
    borderRadius: 6,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  components: {
    Layout: {
      headerPadding: '0 24px',
      headerHeight: 56,
      siderWidth: 220,
    },
    Menu: {
      itemHeight: 44,
      iconSize: 16,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#333',
      rowHoverBg: '#f5f5f5',
    },
  },
};

export default themeConfig;
