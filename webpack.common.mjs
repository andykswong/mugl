import * as path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

const PRODUCTION = 'production';

const mode = process.env.NODE_ENV || PRODUCTION;
const isProd = mode === PRODUCTION;
export const debug = process.env.DEBUG || !isProd;

/** @type {import('webpack').Configuration} */
export default {
  mode,
  output: {
    filename: '[name].min.js',
    path: path.resolve('./dist'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        enforce: 'pre',
        use: 'source-map-loader',
      },
      {
        test: /\.(m?js|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            envName: 'webpack'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.js', '.mjs', '.ts' ],
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
  plugins: [],
  devtool: isProd ? false : 'source-map'
};
