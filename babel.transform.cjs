/* eslint-disable @typescript-eslint/no-var-requires */
const { types } = require('@babel/core');
const syntaxTypeScript = require('@babel/plugin-syntax-typescript').default;

/**
 * Plugin to transpile all enums into const object for inlining.
 * Inspired by babel-plugin-const-enum plugin.
 *
 * @type {() => import('@babel/core').PluginObj}
 */
module.exports = function enumToConstObject() {
  return {
    name: 'enum-to-const-object',
    inherits: syntaxTypeScript,
    visitor: {
      TSEnumDeclaration(path) {
        const [constObjectPath] = path.replaceWith(
          tsEnumDeclarationToConstObject(path)
        );
        path.scope.registerDeclaration(constObjectPath);
      },
    },
  };
};

function tsEnumDeclarationToConstObject(path) {
  return types.variableDeclaration('const', [
    types.variableDeclarator(
      path.node.id,
      types.objectExpression(
        tsEnumMembersToObjectProperties(path.get('members')),
      ),
    ),
  ]);
}

function tsEnumMembersToObjectProperties(memberPaths) {
  return memberPaths.map((path) => {
    const keyNode = path.node.id;
    const valueNode = path.node.initializer;
    return types.objectProperty(keyNode, valueNode);
  });
}
