import { TextureFormat, UInt } from '../gpu';

/**
 * Interface for a provider of GPUCanvasContext.
 * Useful for non-Web environments where HTML Canvas element does not exist.
 */
export interface WebGPUCanvasContextProvider {
  /**
   * Gets a WebGLRenderingContext.
   *
   * @param type context type. Must be 'webgpu'
   * @returns a GPUCanvasContext, or null if unsupported.
   */
  getContext(type: 'webgpu'): GPUCanvasContext | null;

  /**
   * @returns the canvas width.
   */
  get width(): UInt;

  /**
   * @returns the canvas height.
   */
  get height(): UInt;
}

/**
 * Options for configuring a canvas surface for WebGPU.
 */
export interface WebGPUCanvasOptions {
  /** Determines if premultiplied alpha will be used for surface texture, or opaque color. Defaults to false. */
  premultipliedAlpha?: boolean;

  /** The default surface depth-stencil texture format. Defaults to no depth-stencil texture. */
  depthStencilFormat?: TextureFormat;

  /** The number of samples for MSAA render targets. Defaults to 1. */
  sampleCount?: UInt;
}

const depth32float_stencil8 = 0x1;
const shader_f16 = 0x2;
const rg11b10ufloat_renderable = 0x4;
const float32_filterable = 0x8;

/**
 * Supported WebGPU features.
 */
export enum WebGPUFeature {
  /** depth32float-stencil8 */
  Depth32FStencil8 = depth32float_stencil8,

  /** shader-f16 */
  ShaderF16 = shader_f16,

  /** rg11b10ufloat-renderable */
  RG11B10FRenderable = rg11b10ufloat_renderable,

  /** float32-filterable */
  F32Filterable = float32_filterable,
}

export const WebGPUFeatureNames: Record<WebGPUFeature, GPUFeatureName> = {
  [depth32float_stencil8]: 'depth32float-stencil8',
  [shader_f16]: 'shader-f16',
  [rg11b10ufloat_renderable]: 'rg11b10ufloat-renderable',
  [float32_filterable]: 'float32-filterable',
};
