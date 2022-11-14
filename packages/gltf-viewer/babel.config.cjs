module.exports = api => {
  const isTest = api.env('test');

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

  return config;
};
