import { WebGLContextAttributeFlag, WebGLContextAttributes } from './type';

export function toWebGLContextAttributeFlag(desc: WebGLContextAttributes): WebGLContextAttributeFlag {
  let result = 0 as WebGLContextAttributeFlag;
  if (desc.alpha) { result = result | WebGLContextAttributeFlag.Alpha; }
  if (desc.antialias) { result = result | WebGLContextAttributeFlag.Antialias; }
  if (desc.depth) { result = result | WebGLContextAttributeFlag.Depth; }
  if (desc.desynchronized) { result = result | WebGLContextAttributeFlag.Desynchronized; }
  if (desc.failIfMajorPerformanceCaveat) { result = result | WebGLContextAttributeFlag.FailIfMajorPerformanceCaveat; }
  if (desc.powerPreference == 'high-performance') { result = result | WebGLContextAttributeFlag.HighPerformance; }
  if (desc.premultipliedAlpha) { result = result | WebGLContextAttributeFlag.PremultipliedAlpha; }
  if (desc.preserveDrawingBuffer) { result = result | WebGLContextAttributeFlag.PreserveDrawingBuffer; }
  if (desc.stencil) { result = result | WebGLContextAttributeFlag.Stencil; }
  return result;
}
