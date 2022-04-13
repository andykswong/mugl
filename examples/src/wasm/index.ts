
import { ContextId, set_context_memory } from 'mugl/wasm';
import { init, render, resize, destroy, memory } from 'examples.wasm';
import { APP_CONTEXT_ID } from '../common';

export async function initExamplesWASM(): Promise<WebAssembly.Exports> {
  set_context_memory(APP_CONTEXT_ID as ContextId, memory);
  return { init, render, resize, destroy };
}
