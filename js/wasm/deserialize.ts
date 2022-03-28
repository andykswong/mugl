import { Num, UInt } from '../gpu';

export const UTF8_DECODER = new TextDecoder('utf-8');

let DATA_VIEW = new DataView(new ArrayBuffer(0));

export function dataView(mem: WebAssembly.Memory): DataView {
  if (DATA_VIEW.buffer !== mem.buffer) {
    DATA_VIEW = new DataView(mem.buffer);
  }
  return DATA_VIEW;
}

export function decodeStr(mem: WebAssembly.Memory, ptr: number, len: number): string {
  return UTF8_DECODER.decode(new Uint8Array(mem.buffer, ptr, len));
}

export function toWebGLContextAttributes(flags: Num): WebGLContextAttributes {
  return {
    alpha: !!((flags as UInt) & 1),
    antialias: !!((flags as UInt) & (1 << 1)),
    depth: !!((flags as UInt) & (1 << 2)),
    desynchronized: !!((flags as UInt) & (1 << 3)),
    failIfMajorPerformanceCaveat: !!((flags as UInt) & (1 << 4)),
    powerPreference: ((flags as UInt) & (1 << 5)) ? 'high-performance' : 'low-power',
    premultipliedAlpha: !!((flags as UInt) & (1 << 6)),
    preserveDrawingBuffer: !!((flags as UInt) & (1 << 7)),
    stencil: !!((flags as UInt) & (1 << 8)),
  };
}
