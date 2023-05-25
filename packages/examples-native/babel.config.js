/** @type {import('@babel/core').ConfigFunction} */
module.exports = function(api) {
  api.cache(true);
  /** @type {import('@babel/core').TransformOptions} */
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
    ],
  };
};
