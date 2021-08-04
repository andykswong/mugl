module.exports = api => {
  const isTest = api.env('test');
  const isWebpack = api.env('webpack');

  const config = {
    "assumptions": {
      "setPublicClassFields": true
    },
    "presets": [
      [
        "@babel/preset-env",
        {
          "modules": false,
          "targets": {
            "node": "12"
          },
          "include": [
            "@babel/plugin-proposal-class-properties"
          ]
        }
      ],
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
