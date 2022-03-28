
import { WebAssemblyGL } from 'mugl';

export function loadExamplesWASM(): Promise<WebAssembly.Exports> {
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
    mugl: WebAssemblyGL(),
  };

  return WebAssembly.instantiateStreaming(
    fetch('examples.wasm'),
    imports,
  ).then((wasm) => {
    imports.mugl.memory = memory = wasm.instance.exports.memory as WebAssembly.Memory;
    return wasm.instance.exports;
  });
}
