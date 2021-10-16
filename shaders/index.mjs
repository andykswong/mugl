import fs from 'fs';
import path from 'path';
import { glslminify } from './glslminify.mjs';

const sources = {
  'PRIMITIVE_VS_SRC': './gltf/primitive.vs.glsl',
  'PBR_FS_SRC': './gltf/pbr.fs.glsl'
};
const outputFolder = path.resolve('./dist');
const safeWords = [
  'tex', 'texCoord', 'scale'
];

for (const src in sources) {
  const input = sources[src];
  const output = input + '.ts';
  await compile(path.resolve(input), path.resolve(outputFolder, output), src);
}

async function compile(input, output, varName) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const glsl = await glslminify(input, safeWords);
  fs.writeFileSync(output, `export const ${varName} = \`${glsl}\`;\n`);
}
