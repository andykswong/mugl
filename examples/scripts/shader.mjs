import fs from 'fs';
import path from 'path';
import { execSync } from'child_process';

const sources = {
  'PRIMITIVE_VERTEX_CODE': 'primitive.vs.glsl',
  'PBR_FRAGMENT_CODE': 'pbr.fs.glsl'
};
const inputFolder = path.resolve('./shader/');
const outputFolder = path.resolve('./src/shader/');

const nomangle = [
  'std140',
  'texture',
  'texelFetch',
  'ng',
  'nn',
  't',
  'b'
].join(' ');

for (const src in sources) {
  const input = sources[src];
  const output = path.basename(input);
  compile(path.resolve(inputFolder, input), path.resolve(outputFolder, output), src);
}

function compile(input, output, varName) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  execSync(`npx glslify ${input} -o ${output}`, {stdio: 'inherit'});
  execSync(
    `npx webpack-glsl-minify ${output} -e .ts --output sourceOnly --preserveDefines --preserveUniforms --nomangle ${nomangle}`,
    {stdio: 'inherit'}
  );

  const outputTs = `${output}.ts`;
  let glsl = fs.readFileSync(outputTs, { encoding: 'utf-8' });
  glsl = glsl.replace(/#define GLSLIFY\s+1\n/, '');

  fs.writeFileSync(outputTs, `export const ${varName} = \`${glsl}\`;\n`);
  fs.unlinkSync(output);
}
