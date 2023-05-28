const EXT_texture_filter_anisotropic = 0x1;
const OES_texture_half_float_linear = 0x2;
const OES_texture_float_linear = 0x4;
const EXT_color_buffer_float = 0x8;
const OES_draw_buffers_indexed = 0x10;


/** Supported WebGL2 features. */
export enum WebGL2Feature {
  TextureAnisotropic = EXT_texture_filter_anisotropic,
  TextureHalfFloatLinear = OES_texture_half_float_linear,
  TextureFloatLinear = OES_texture_float_linear,
  ColorBufferFloat = EXT_color_buffer_float,
  DrawBuffersIndexed = OES_draw_buffers_indexed,
}

/** Descriptor to create a WebGL2 device. */
export class WebGLContextAttributes {
  alpha: boolean = true;
  antialias: boolean = true;
  depth: boolean = true;
  desynchronized: boolean = false;
  failIfMajorPerformanceCaveat: boolean = false;
  powerPreference: string = 'high-performance';
  premultipliedAlpha: boolean = true;
  preserveDrawingBuffer: boolean = false;
  stencil: boolean = false;
}

/** Attribute flags to create a WebGL2 device. */
export enum WebGLContextAttributeFlag {
  Alpha = 0x0001,
  Antialias = 0x0002,
  Depth = 0x0004,
  Desynchronized = 0x0008,
  FailIfMajorPerformanceCaveat = 0x0010,
  HighPerformance = 0x0020,
  PremultipliedAlpha = 0x0040,
  PreserveDrawingBuffer = 0x0080,
  Stencil = 0x0100,
}
