const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = [
  merge(common, {
    entry: {
      mugl: './src'
    },
    output: {
      library: {
        name: 'mugl',
        type: 'umd',
        umdNamedDefine: true,
      }
    }
  }),
  merge(common, {
    entry: {
      ngl: './src/nano'
    },
    output: {
      library: {
        name: 'ngl',
        type: 'umd',
        umdNamedDefine: true,
      }
    }
  }),
];
