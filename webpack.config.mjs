import { merge } from 'webpack-merge';
import common from './webpack.common.mjs';

export default [
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
  merge(common, {
    entry: {
      mugltf: './src/gltf'
    },
    output: {
      library: {
        name: 'mugltf',
        type: 'umd',
        umdNamedDefine: true,
      }
    }
  }),
  merge(common, {
    entry: {
      muglsc: './src/scene'
    },
    output: {
      library: {
        name: 'muglsc',
        type: 'umd',
        umdNamedDefine: true,
      }
    }
  }),
];
