import { Readable } from 'stream';

import glslify from 'glslify';
import tokenizer from 'glsl-tokenizer/stream.js';
import parser from 'glsl-parser';
import deparser from 'glsl-deparser';
import minify from 'glsl-min-stream';

const keywords = [
  'main',
  'x', 'y', 'z', 'w', 'r', 'g', 'b', 'a', 's', 't', 'p', 'q',
];

export async function glslminify(file, safeWords = []) {
  const src = glslify.file(file)
    .replace('#define GLSLIFY 1\n', '');

  const stream = new Readable();
  stream.push(src);
  stream.push(null);

  const minStream = stream
    .pipe(tokenizer())
    .pipe(parser())
    .pipe(minify([...keywords, ...safeWords], false))
    .pipe(deparser(false));

  const minSrc = await streamToString(minStream);

  return minSrc
    .replace(/\n\s*\n/g, '\n');
}

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}
