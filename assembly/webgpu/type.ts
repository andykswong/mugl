import { TextureFormat } from '../gpu';

const depth32float_stencil8 = 0x1;
const shader_f16 = 0x2;
const rg11b10ufloat_renderable = 0x4;
const float32_filterable = 0x8;

/** Supported WebGPU features. */
export enum WebGPUFeature {
  Depth32FStencil8 = depth32float_stencil8,
  ShaderF16 = shader_f16,
  RG11B10FRenderable = rg11b10ufloat_renderable,
  F32Filterable = float32_filterable,
}

/** Descriptor for a WebGPU context. */
export class WebGPUContextAttributes {
  powerPreference: string = 'high-performance';
  forceFallbackAdapter: boolean = false;
  premultipliedAlpha: boolean = false;
  depthStencilFormat: TextureFormat = TextureFormat.Depth24Stencil8;
  sampleCount: u32 = 1;
}

/** Attribute flags for a WebGPU context. */
export enum WebGPUContextAttributeFlag {
  Depth = 0x0001,
  Depth32F = 0x0002,
  ForceFallbackAdapter = 0x0004,
  HighPerformance = 0x0008,
  Multisampled = 0x0010,
  PremultipliedAlpha = 0x0020,
  Stencil = 0x0040,
}
