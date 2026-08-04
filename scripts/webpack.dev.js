const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const themeConfig = require('./theme.config');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  devServer: {
    port: 3000,
    hot: true,
    open: true,
    compress: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3001',
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' },
      },
    ],
  },
  module: {
    rules: [
      // ──────────────────────────────────────────────
      // .module.less → CSS Modules（带 hash 类名，组件级隔离）
      // ──────────────────────────────────────────────
      {
        test: /\.module\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                exportLocalsConvention: 'camelCase',
                namedExport: false,
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['postcss-preset-env', { autoprefixer: { flexbox: 'no-2009' } }],
                ],
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: themeConfig.modifyVars,
              },
            },
          },
        ],
      },
      // ──────────────────────────────────────────────
      // .less (非 module) → 全局样式（不 hash 类名）
      // ──────────────────────────────────────────────
      {
        test: /\.less$/,
        exclude: [/node_modules\/antd/, /\.module\.less$/],
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['postcss-preset-env', { autoprefixer: { flexbox: 'no-2009' } }],
                ],
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: themeConfig.modifyVars,
              },
            },
          },
        ],
      },
      // ──────────────────────────────────────────────
      // antd 的 less → 全局（不开 CSS Modules）
      // ──────────────────────────────────────────────
      {
        test: /\.less$/,
        include: [/node_modules\/antd/],
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: themeConfig.modifyVars,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
