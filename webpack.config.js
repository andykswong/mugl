const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = module.exports = merge(common, {
  entry: {
    mugl: {
      import: './src',
      library: {
        type: 'commonjs2'
      }
    },
    nanogl: {
      import: './src/nano',
      library: {
        type: 'commonjs2'
      }
    }
  }
});
