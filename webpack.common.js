const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const InlineConstantExportsPlugin = require('@automattic/webpack-inline-constant-exports-plugin');

const PRODUCTION = 'production';

const mode = process.env.NODE_ENV || PRODUCTION;
const isProd = mode === PRODUCTION;
const debug = process.env.DEBUG || !isProd;

module.exports = {
  mode,
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: 'source-map-loader',
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.jsx', '.js' ],
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2015,
          module: true,
          toplevel: true,
          compress: {
            passes: 5,
            drop_console: !debug
          },
          mangle: {
            properties: false
          }
        },
      }),
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      'DEBUG': debug
    }),
    new InlineConstantExportsPlugin([
      /src\/api\/glenums\.ts/
    ])
  ],
  devtool: isProd ? false : 'source-map'
};
