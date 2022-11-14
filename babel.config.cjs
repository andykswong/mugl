module.exports = api => {
  const isTest = api.env('test');
  const isWebpack = api.env('webpack');

  const config = {
    assumptions: {
      setPublicClassFields: true
    },
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
    plugins: [],
    ignore: [
      'node_modules'
    ],
    comments: false,
    minified: !isTest
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
