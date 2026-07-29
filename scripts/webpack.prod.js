const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const dotenv = require('dotenv');
const path = require('path');

const envFile = path.resolve(__dirname, '..', `.env.${process.env.NODE_ENV || 'production'}`);
const envVars = dotenv.config({ path: envFile }).parsed || {};
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env) =>
  merge(common, {
    mode: 'production',
    devtool: 'hidden-source-map',
    output: {
      path: require('path').resolve(__dirname, '..', 'dist'),
      filename: 'js/[name].[contenthash:8].js',
      chunkFilename: 'js/[name].[contenthash:8].chunk.js',
      publicPath: '/',
      clean: true,
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        minSize: 20000,
        cacheGroups: {
          react: {
            name: 'vendor-react',
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            priority: 40,
            reuseExistingChunk: true,
          },
          antd: {
            name: 'vendor-antd',
            test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          echarts: {
            name: 'vendor-echarts',
            test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.API_BASE_URL': JSON.stringify(envVars.API_BASE_URL || process.env.API_BASE_URL || '/api'),
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].chunk.css',
      }),
      env?.analyze && new BundleAnalyzerPlugin(),
    ].filter(Boolean),
    module: {
      rules: [
        // .module.less → CSS Modules
        {
          test: /\.module\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
              modules: {
                localIdentName: '[hash:base64:8]',
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
                  modifyVars: {
                    '@primary-color': '#1890ff',
                  },
                },
              },
            },
          ],
        },
        // .less (非 module) → 全局样式
        {
          test: /\.less$/,
          exclude: [/node_modules\/antd/, /\.module\.less$/],
          use: [
            MiniCssExtractPlugin.loader,
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
                  modifyVars: {
                    '@primary-color': '#1890ff',
                  },
                },
              },
            },
          ],
        },
        // antd less → 全局
        {
          test: /\.less$/,
          include: [/node_modules\/antd/],
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                  modifyVars: {
                    '@primary-color': '#1890ff',
                  },
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
  });
