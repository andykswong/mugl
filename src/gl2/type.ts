/**
 * Interface for a provider of WebGL2RenderingContext.
 * Useful for non-Web environments where HTML Canvas element does not exist.
 */
export interface WebGL2RenderingContextProvider {
  /**
   * Gets a WebGLRenderingContext.
   *
   * @param type WebGL version. Must be 'webgl2'
   * @param options optional WebGL rendering context attributes
   * @returns a WebGL2RenderingContext, or null if unsupported.
   */
  getContext(type: 'webgl2', options?: WebGLContextAttributes): WebGL2RenderingContext | null;

  /**
   * @returns the canvas width.
   */
  get width(): number;

  /**
   * @returns the canvas height.
   */
  get height(): number;
}

const EXT_texture_filter_anisotropic = 0x1;
const OES_texture_half_float_linear = 0x2;
const OES_texture_float_linear = 0x4;
const EXT_color_buffer_float = 0x8;
const OES_draw_buffers_indexed = 0x10;

/**
 * Supported WebGL2 features.
 */
export enum WebGL2Feature {
  /** EXT_texture_filter_anisotropic */
  TextureAnisotropic = EXT_texture_filter_anisotropic,

  /** OES_texture_half_float_linear */
  TextureHalfFloatLinear = OES_texture_half_float_linear,

  /** OES_texture_float_linear */
  TextureFloatLinear = OES_texture_float_linear,

  /** EXT_color_buffer_float */
  ColorBufferFloat = EXT_color_buffer_float,

  /** OES_draw_buffers_indexed */
  DrawBuffersIndexed = OES_draw_buffers_indexed,
}

export const WebGL2FeatureNames: Record<WebGL2Feature, string> = {
  [EXT_texture_filter_anisotropic]: 'EXT_texture_filter_anisotropic',
  [OES_texture_half_float_linear]: 'OES_texture_half_float_linear',
  [OES_texture_float_linear]: 'OES_texture_float_linear',
  [EXT_color_buffer_float]: 'EXT_color_buffer_float',
  [OES_draw_buffers_indexed]: 'OES_draw_buffers_indexed',
};
