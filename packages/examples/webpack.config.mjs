import * as path from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const PRODUCTION = 'production';

const mode = process.env.NODE_ENV || PRODUCTION;
const isProd = mode === PRODUCTION;
export const debug = process.env.DEBUG || !isProd;

const ASSET_DIR = path.resolve('./assets');
const OUTPUT_DIR = path.resolve('./dist');
const WASM_FILES = '*.{wasm,wasm.map}';

/** @type {import('webpack').Configuration} */
export default {
  mode,
  entry: {
    examples: {
      import: './src/index.ts'
    }
  },
  output: {
    filename: '[name].min.js',
    path: OUTPUT_DIR,
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
            envName: 'webpack',
            rootMode: 'upward'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.js', '.mjs', '.ts' ],
    alias: {
      'env': path.resolve('./src/wasm/env'),
      'examples.wasm': path.resolve(OUTPUT_DIR, 'examples.wasm'),
      'munum/assembly': path.resolve('./src/interop/munum'),
    },
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
    new CopyPlugin({
      patterns: [
        { from: WASM_FILES, context: OUTPUT_DIR },
        { from: ASSET_DIR, to: OUTPUT_DIR }
      ],
    }),
    new webpack.EnvironmentPlugin({
      'NODE_ENV': mode,
      'MUGL_DEBUG': false,
      'MUGL_FINALIZER': false,
    }),
    new webpack.DefinePlugin({
      'MUGL_DEBUG': debug,
      'MUGL_FINALIZER': false,
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
  devtool: isProd ? false : 'source-map',
  devServer: {
    static: ASSET_DIR
  }
};
