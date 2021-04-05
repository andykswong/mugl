const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const ASSET_DIR =  path.resolve(__dirname, 'src/examples/assets');
const OUTPUT_DIR = path.resolve(__dirname, 'examples');

module.exports = module.exports = merge(common, {
  entry: {
    examples: {
      import: './src/examples'
    }
  },
  output: {
    path: OUTPUT_DIR,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      'WEBGL2': true
    }),
    new CopyPlugin({
      patterns: [
        { from: ASSET_DIR, to: OUTPUT_DIR }
      ],
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'src/examples/assets')
  }
});
