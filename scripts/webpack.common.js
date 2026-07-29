const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');                     

const resolve = (dir) => path.resolve(__dirname, '..', dir);

module.exports = {
  entry: {
    app: resolve('src/index.tsx'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': resolve('src'),
      '@components': resolve('src/components'),
      '@pages': resolve('src/pages'),
      '@store': resolve('src/store'),
      '@services': resolve('src/services'),
      '@utils': resolve('src/utils'),
      '@hooks': resolve('src/hooks'),
      '@assets': resolve('src/assets'),
      '@types': resolve('src/types'),
      '@config': resolve('src/config'),
      '@router': resolve('src/router'),
      '@mock': resolve('src/mock'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: [resolve('src')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: 'assets/images/[name].[contenthash:8][ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[contenthash:8][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('public/index.html'),
      title: 'Admin System',
      inject: true,
      minify: false,
    }),
    new CaseSensitivePathsPlugin(),
    new ForkTsCheckerPlugin({
      typescript: {
        configFile: resolve('tsconfig.json'),
      },
    }),
    // 注入环境变量
    new webpack.DefinePlugin({
      'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || '/api'),
    }),
  ],
};
