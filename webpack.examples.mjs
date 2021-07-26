import * as path from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import { merge } from 'webpack-merge';
import common, { debug } from './webpack.common.mjs';

const ASSET_DIR = path.resolve('./examples/assets');
const OUTPUT_DIR = path.resolve('./dist/examples');

export default merge(common, {
  entry: {
    examples: {
      import: './examples'
    },
    'gltf-viewer': {
      import: './examples/gltf-viewer'
    }
  },
  output: {
    path: OUTPUT_DIR,
  },
  module: {
    rules: [
      {
        test: /\.(m?js|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            envName: 'webpack-examples'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'MUGL_DEBUG': debug,
      'USE_WEBGL2': true,
      'USE_NGL': true,
      'NGL_ENABLE_SCISSOR': false,
    }),
    new CopyPlugin({
      patterns: [
        { from: ASSET_DIR, to: OUTPUT_DIR }
      ],
    })
  ],
  devServer: {
    contentBase: ASSET_DIR
  }
});
