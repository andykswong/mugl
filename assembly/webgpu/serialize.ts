import { TextureFormat } from '../gpu';
import { WebGPUContextAttributeFlag, WebGPUContextAttributes } from './type';

export function toWebGPUContextAttributeFlag(desc: WebGPUContextAttributes): WebGPUContextAttributeFlag {
  let result = 0 as WebGPUContextAttributeFlag;
  if (desc.forceFallbackAdapter) { result = result | WebGPUContextAttributeFlag.ForceFallbackAdapter; }
  if (desc.powerPreference == 'high-performance') { result = result | WebGPUContextAttributeFlag.HighPerformance; }
  if (desc.sampleCount > 1) { result = result | WebGPUContextAttributeFlag.Multisampled; }
  if (desc.premultipliedAlpha) { result = result | WebGPUContextAttributeFlag.PremultipliedAlpha; }
  switch (desc.depthStencilFormat) {
    case TextureFormat.Depth16:
    case TextureFormat.Depth24:
      result = result | WebGPUContextAttributeFlag.Depth;
      break;
    case TextureFormat.Depth32F:
      result = result | WebGPUContextAttributeFlag.Depth | WebGPUContextAttributeFlag.Depth32F;
      break;
    case TextureFormat.Depth24Stencil8:
      result = result | WebGPUContextAttributeFlag.Depth | WebGPUContextAttributeFlag.Stencil;
      break;
    case TextureFormat.Depth32FStencil8:
      result = result | WebGPUContextAttributeFlag.Depth | WebGPUContextAttributeFlag.Depth32F | WebGPUContextAttributeFlag.Stencil;
      break;
  }
  return result;
}
