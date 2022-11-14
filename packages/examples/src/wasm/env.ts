import { memory } from 'examples.wasm';

export function abort() {
  console.error('aborted, memory:', memory);
}

export const seed = Date.now;
