
import * as mugl from 'mugl/wasm';
import { APP_CONTEXT_ID } from '../common';

/**
 * Manually init the WASM module without using Webpack.
 */
export function initExamplesWASM(): Promise<WebAssembly.Exports> {
  let memory: WebAssembly.Memory | null = null;

  const imports: WebAssembly.Imports = {
    env: {
      abort() {
        console.error('aborted, memory:', memory);
      },
      seed: Date.now,
    },
    Date: Date as unknown as WebAssembly.ModuleImports,
    Math: Math as unknown as WebAssembly.ModuleImports,
    'mugl/wasm': mugl,
  };

  return WebAssembly.instantiateStreaming(
    fetch('examples.wasm'),
    imports,
  ).then((wasm) => {
    memory = wasm.instance.exports.memory as WebAssembly.Memory;
    (mugl.set_context_memory as CallableFunction)(APP_CONTEXT_ID, memory);
    return wasm.instance.exports;
  });
}
