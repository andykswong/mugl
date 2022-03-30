
import * as mugl from 'mugl/wasm';
import { init, render, resize, destroy, memory } from 'examples.wasm';
import { APP_CONTEXT_ID } from '../common';

export async function initExamplesWASM(): Promise<WebAssembly.Exports> {
  mugl.set_context_memory(APP_CONTEXT_ID as mugl.ContextId, memory);
  return { init, render, resize, destroy };
}

/**
 * Manually init the WASM module without using Webpack.
 */
export function manualInitExamplesWASM(): Promise<WebAssembly.Exports> {
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
