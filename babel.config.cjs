module.exports = api => {
  const isTest = api.env('test');
  const isExamples = api.env('webpack-examples');
  const isWebpack = api.env('webpack') || isExamples;

  const config = {
    "presets": [
      ["@babel/preset-env", { "modules": false, "targets": { "node": true } }],
      ["@babel/preset-typescript"]
    ],
    "plugins": [
    ],
    "ignore": [
      "node_modules"
    ],
    "comments": false,
    "minified": true
  };

  if (!isTest) {
    config.plugins.push(
      ["./babel.transform.cjs"]
    );
  }

  if (!(isTest || isWebpack)) {
    config.plugins.push(
      ["babel-plugin-add-import-extension", { "extension": "mjs" }]
    );
  }

  return config;
};
