/** @type {import('@babel/core').ConfigFunction} */
module.exports = api => {
  const isTest = api.env('test');
  const isWebpack = api.env('webpack');

  /** @type {import('@babel/core').TransformOptions} */
  const config = {
    assumptions: {
      noDocumentAll: true,
      noNewArrows: true,
      objectRestNoSymbols: true,
      privateFieldsAsProperties: true,
      setPublicClassFields: true,
      setSpreadProperties: true,
    },
    babelrcRoots: [
      './',
      'packages/**',
    ],
    comments: false,
    minified: !isTest,
    sourceMaps: 'inline',
    ignore: [
      'node_modules'
    ],
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: {
            node: true
          }
        }
      ],
      ['@babel/preset-typescript']
    ],
    plugins: []
  };

  if (!isTest) {
    config.plugins.push(
      ['./babel.transform.cjs']
    );
    config.ignore.push('**/__tests__/**');
  }

  if (!(isTest || isWebpack)) {
    config.plugins.push(
      ['babel-plugin-add-import-extension', { extension: 'js' }]
    );
  }

  return config;
};
