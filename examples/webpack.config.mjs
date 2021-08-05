import * as path from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';

const PRODUCTION = 'production';

const mode = process.env.NODE_ENV || PRODUCTION;
const isProd = mode === PRODUCTION;
export const debug = process.env.DEBUG || !isProd;

const ASSET_DIR = path.resolve('./assets');
const OUTPUT_DIR = path.resolve('./dist');
const WASM_FILES = '*.{wasm,wasm.map}';

export default {
  mode,
  entry: {
    examples: {
      import: './src/index.ts'
    },
    'gltf-viewer': {
      import: './src/gltf-viewer'
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
    minimize: isProd
  },
  plugins: [
    new webpack.DefinePlugin({
      'MUGL_DEBUG': debug,
      'USE_WEBGL2': false,
      'USE_NGL': false,
      'NGL_ENABLE_SCISSOR': false,
    }),
    new CopyPlugin({
      patterns: [
        { from: WASM_FILES, context: OUTPUT_DIR },
        { from: ASSET_DIR, to: OUTPUT_DIR }
      ],
    })
  ],
  devtool: isProd ? false : 'source-map',
  devServer: {
    contentBase: ASSET_DIR
  }
};
