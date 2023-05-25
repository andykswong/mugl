import { merge } from 'webpack-merge';
import common from './webpack.common.mjs';

export default [
  merge(common, {
    entry: {
      mugl: './src',
      wasm: './src/wasm',
    },
    output: {
      library: {
        name: 'mugl',
        type: 'umd',
        umdNamedDefine: true,
      }
    }
  }),
];
