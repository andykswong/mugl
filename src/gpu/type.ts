import * as GLenum from './gl-const';

/**
 * Buffer usage.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://www.w3.org/TR/webgpu/#buffer-usage
 */
export enum BufferUsage {
  /** Index buffer */
  Index = 0x0010,

  /** Vertex buffer */
  Vertex = 0x0020,

  /** Uniform buffer */
  Uniform = 0x0040,

  /** Data is updated infrequently */
  Dynamic = 0x1000,

  /** Data is overwritten each frame */
  Stream = 0x2000,
}

/**
 * Texture usage.
 * @see https://www.w3.org/TR/webgpu/#typedefdef-gputextureusageflags
 */
export enum TextureUsage {
  /** Use as texture binding */
  TextureBinding = 0x04,

  /** Use as render target */
  RenderAttachment = 0x10,
}

/**
 * A color write mask.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
 * @see https://www.w3.org/TR/webgpu/#typedefdef-gpucolorwriteflags
 */
export enum ColorWrite {
  Red = 0x1,
  Green = 0x2,
  Blue = 0x4,
  Alpha = 0x8,
  All = 0xF,
}

/**
 * Texture view dimension type.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://www.w3.org/TR/webgpu/#enumdef-gputextureviewdimension
 */
export enum TextureDimension {
  /** 2D texture */
  D2 = GLenum.TEXTURE_2D,

  /** 2D array texture. */
  D2Array = GLenum.TEXTURE_2D_ARRAY,

  /** Cube map texture */
  CubeMap = GLenum.TEXTURE_CUBE_MAP,

  /** 3D texture. */
  D3 = GLenum.TEXTURE_3D,
}

/**
 * Texture format.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
 * @see https://www.w3.org/TR/webgpu/#texture-formats
 */
export enum TextureFormat {
  // 8-bit formats
  R8 = GLenum.R8,
  R8SNORM = GLenum.R8_SNORM,
  R8UI = GLenum.R8UI,
  R8I = GLenum.R8I,

  // 16-bit formats
  R16UI = GLenum.R16UI,
  R16I = GLenum.R16I,
  RG8 = GLenum.RG8,
  RG8SNORM = GLenum.RG8_SNORM,
  RG8UI = GLenum.RG8UI,
  RG8I = GLenum.RG8I,

  // 32-bit formats
  R32UI = GLenum.R32UI,
  R32I = GLenum.R32I,
  RG16UI = GLenum.RG16UI,
  RG16I = GLenum.RG16I,
  RGBA8 = GLenum.RGBA8,
  SRGBA8 = GLenum.SRGB8_ALPHA8,
  RGBA8SNORM = GLenum.RGBA8_SNORM,
  RGBA8UI = GLenum.RGBA8UI,
  RGBA8I = GLenum.RGBA8I,
  // Packed 32-bit formats
  RGB10A2 = GLenum.RGB10_A2,

  // 64-bit formats
  RG32UI = GLenum.RG32UI,
  RG32I = GLenum.RG32I,
  RGBA16UI = GLenum.RGBA16UI,
  RGBA16I = GLenum.RGBA16I,

  // 128-bit formats
  RGBA32UI = GLenum.RGBA32UI,
  RGBA32I = GLenum.RGBA32I,

  // Float formats. Requires EXT_color_buffer_float
  R16F = GLenum.R16F,
  RG16F = GLenum.RG16F,
  RG11B10F = GLenum.R11F_G11F_B10F,
  RGBA16F = GLenum.RGBA16F,
  R32F = GLenum.R32F,
  RG32F = GLenum.RG32F,
  RGBA32F = GLenum.RGBA32F,

  // TODO: support BC / ETC2 / ASTC compressed formats

  // Depth/stencil formats
  Depth16 = GLenum.DEPTH_COMPONENT16,
  Depth24 = GLenum.DEPTH_COMPONENT24,
  Depth24Stencil8 = GLenum.DEPTH24_STENCIL8,
  Depth32F = GLenum.DEPTH_COMPONENT32F,
  Depth32FStencil8 = GLenum.DEPTH32F_STENCIL8,
}

/**
 * Texture addressing wrap mode (aka UV wrap).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpuaddressmode
 */
export enum AddressMode {
  /** Clamp texture coords to (0.0 .. 1.0) */
  ClampToEdge = GLenum.CLAMP_TO_EDGE,

  /** Repeat texture coords within (0.0 .. 1.0) */
  Repeat = GLenum.REPEAT,

  /** Mirror-repeat texture coords (0.0 .. 1.0 .. 0.0) */
  MirrorRepeat = GLenum.MIRRORED_REPEAT,
}

/**
 * Texture sampler filter mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpufiltermode
 */
export enum FilterMode {
  /** use nearest-filtering (aka point-filtering) */
  Nearest = GLenum.NEAREST,

  /** use linear filtering */
  Linear = GLenum.LINEAR,
}

/**
 * Comparision functions for depth and stencil checks.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpucomparefunction
 */
export enum CompareFunction {
  /** new value never passes comparion test */
  Never = GLenum.NEVER,

  /** new value passses if it is less than the existing value */
  Less = GLenum.LESS,

  /** new value passes if it is equal to existing value */
  Equal = GLenum.EQUAL,

  /** new value passes if it is less than or equal to existing value */
  LessEqual = GLenum.LEQUAL,

  /** new value passes if it is greater than existing value */
  Greater = GLenum.GREATER,

  /** new value passes if it is not equal to existing value */
  NotEqual = GLenum.NOTEQUAL,

  /** new value passes if it is greater than or equal to existing value */
  GreaterEqual = GLenum.GEQUAL,

  /** new value always passes */
  Always = GLenum.ALWAYS
}

/**
 * Shader stage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createShader
 */
export enum ShaderStage {
  /** Vertex shader */
  Vertex = 0x01,

  /** Fragment shader */
  Fragment = 0x02
}

/**
 * Primitive topology.
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpuprimitivetopology
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 */
export enum PrimitiveTopology {
  /** Point list */
  Points = GLenum.POINTS,

  /** Line list */
  Lines = GLenum.LINES,

  /** Line strip */
  LineStrip = GLenum.LINE_STRIP,

  /** Triangle list */
  Triangles = GLenum.TRIANGLES,

  /** Triangle strip */
  TriangleStrip = GLenum.TRIANGLE_STRIP
}

/**
 * Vertex index formats.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpuindexformat
 */
export enum IndexFormat {
  /** 16-bit indices */
  UInt16 = GLenum.UNSIGNED_SHORT,

  /** 32-bit indices. */
  UInt32 = GLenum.UNSIGNED_INT
}

/**
 * Identify which side is the front face by setting a winding orientation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpufrontface
 */
export enum FrontFace {
  /** Counter-clockwise winding. */
  CCW = GLenum.CCW,

  /** Clockwise winding. */
  CW = GLenum.CW
}

/**
 * Specify the face to cull.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpucullmode
 */
export enum CullMode {
  /** Disable culling */
  None = GLenum.NONE,

  /** Cull front face */
  Front = GLenum.FRONT,

  /** Cull back face */
  Back = GLenum.BACK
}

/**
 * Stencil-buffer operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOpSeparate
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpustenciloperation
 */
export enum StencilOperation {
  /** keep the current stencil value */
  Keep = GLenum.KEEP,

  /** set the stencil value to zero */
  Zero = GLenum.ZERO,

  /** replace the stencil value with stencil reference value */
  Replace = GLenum.REPLACE,

  /** perform a logical bitwise invert operation on the stencil value */
  Invert = GLenum.INVERT,

  /** increment the current stencil value, clamp to max */
  Increment = GLenum.INCR,

  /** decrement the current stencil value, clamp to zero */
  Decrement = GLenum.DECR,

  /** increment the current stencil value, with wrap-around */
  IncrementWrap = GLenum.INCR_WRAP,

  /** decrement the current stencil value, with wrap-around */
  DecrementWrap = GLenum.DECR_WRAP
}

/**
 * Alpha-blending factors.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpublendfactor
 */
export enum BlendFactor {
  /** blend factor of zero */
  Zero = GLenum.ZERO,

  /** blend factor of one */
  One = GLenum.ONE,

  /** blend factor of source color */
  Src = GLenum.SRC_COLOR,

  /** blend factor of one minus source color */
  OneMinusSrc = GLenum.ONE_MINUS_SRC_COLOR,

  /** blend factor of source alpha */
  SrcAlpha = GLenum.SRC_ALPHA,

  /** blend factor of one minus source alpha */
  OneMinusSrcAlpha = GLenum.ONE_MINUS_SRC_ALPHA,

  /** blend factor of destination color */
  Dst = GLenum.DST_COLOR,

  /** blend factor of one minus destination alpha */
  OneMinusDst = GLenum.ONE_MINUS_DST_COLOR,

  /** blend factor of destination alpha */
  DstAlpha = GLenum.DST_ALPHA,

  /** blend factor of one minus destination alpha */
  OneMinusDstAlpha = GLenum.ONE_MINUS_DST_ALPHA,

  /** blend factor of the minimum of either source alpha or one minus destination alpha */
  SrcAlphaSaturated = GLenum.SRC_ALPHA_SATURATE,

  /** blend factor of constant color */
  Constant = GLenum.CONSTANT_COLOR,

  /** blend factor of one minus constant color */
  OneMinusConstant = GLenum.ONE_MINUS_CONSTANT_COLOR
}

/**
 * Blend operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpublendoperation
 */
export enum BlendOperation {
  /** Add source and destination pixel values */
  Add = GLenum.FUNC_ADD,

  /** Subtract destination from source pixel values */
  Subtract = GLenum.FUNC_SUBTRACT,

  /** Subtract source from destination pixel values */
  ReverseSubtract = GLenum.FUNC_REVERSE_SUBTRACT,

  /** The minimum of the source and destination pixel values. */
  Min = GLenum.MIN,

  /** The maximum of the source and destination pixel values. */
  Max = GLenum.MAX
}

/// Vertex step mode.
/// @see https://www.w3.org/TR/webgpu/#enumdef-gpuvertexstepmode
export enum VertexStepMode {
  /** Per vertex */
  Vertex = 0,

  /** Instanced */
  Instance = 1,
}

/**
 * Vertex component format.
 * Enum values encode the properties of the formats:
 * - bits 0-3 encodes the number of components (1, 2, 3 or 4)
 * - bits 4-7 encodes the number of bytes per component (1, 2 or 4)
 * - bits 8-11 encodes the data type (1 = int, 2 = float)
 * - bits 12-13 encodes the signedness and normalization for int (0 = unsigned, 1 = signed, 2 = unsigned normalized, 3 = signed normalized)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpuvertexformat
 */
export enum VertexFormat {
  UI8x2 = 0x01_1_2,
  UI8x4 = 0x01_1_4,
  I8x2 = 0x11_1_2,
  I8x4 = 0x11_1_4,
  UNORM8x2 = 0x21_1_2,
  UNORM8x4 = 0x21_1_4,
  SNORM8x2 = 0x31_1_2,
  SNORM8x4 = 0x31_1_4,

  UI16x2 = 0x01_2_2,
  UI16x4 = 0x01_2_4,
  I16x2 = 0x11_2_2,
  I16x4 = 0x11_2_4,
  UNORM16x2 = 0x21_2_2,
  UNORM16x4 = 0x21_2_4,
  SNORM16x2 = 0x31_2_2,
  SNORM16x4 = 0x31_2_4,

  F16x2 = 0x02_2_2,
  F16x4 = 0x02_2_4,
  F32 = 0x02_4_1,
  F32x2 = 0x02_4_2,
  F32x3 = 0x02_4_3,
  F32x4 = 0x02_4_4,
}

/**
 * Binding type.
 */
export enum BindingType {
  /** Uniform buffer type */
  Buffer = 0x0,

  /** Sampler type */
  Sampler = 0x1,

  /** Texture type */
  Texture = 0x2,
}

/**
 * Sampler binding type.
 */
export enum SamplerBindingType {
  Filtering = 0x0,

  NonFiltering = 0x1,

  Comparison = 0x2,
}

/**
 * Texture sample type
 */
export enum TextureSampleType {
  Float = 0x0,

  Depth = 0x1,

  Int = 0x2,

  UInt = 0x3,
}

/**
 * Cube map face.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export enum CubeMapFace {
  /** Positive X face */
  X = /* GLenum.TEXTURE_CUBE_MAP_POSITIVE_X + */ 0,

  /** Negative X face */
  NegativeX = 1,

  /** Positive Y face */
  Y = 2,

  /** Negative Y face */
  NegativeY = 3,

  /** Positive Z face */
  Z = 4,

  /** Negative Z face */
  NegativeZ = 5
}

/**
 * Hint for mipmap generation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/hint
 */
export enum MipmapHint {
  /** The most efficient option should be chosen. */
  Fast = GLenum.FASTEST,

  /** The most correct, or highest quality, option should be chosen. */
  Nice = GLenum.NICEST
}
