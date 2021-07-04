const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const ASSET_DIR = path.resolve(__dirname, 'src/examples/assets');
const OUTPUT_DIR = path.resolve(__dirname, 'examples');

module.exports = merge(common, {
  entry: {
    examples: {
      import: './src/examples'
    },
    'gltf-viewer': {
      import: './src/examples/gltf-viewer'
    }
  },
  output: {
    path: OUTPUT_DIR,
  },
  plugins: [
    new webpack.DefinePlugin({
      'USE_WEBGL2': true,
      'VIEWER_NANO': true,
      'NGL_ENABLE_SCISSOR': false,
      'NGL_ENABLE_OFFSCREEN': false,
      'NGL_ENABLE_STENCIL': false,
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
