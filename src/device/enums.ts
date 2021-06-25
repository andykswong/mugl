import { ValueOf } from 'ts-essentials';
import {
  GL_ALWAYS, GL_ARRAY_BUFFER, GL_BACK, GL_CCW, GL_CLAMP_TO_EDGE, GL_CONSTANT_COLOR, GL_CW, GL_DECR, GL_DECR_WRAP,
  GL_DONT_CARE, GL_DST_ALPHA, GL_DST_COLOR, GL_DYNAMIC_DRAW, GL_ELEMENT_ARRAY_BUFFER, GL_EQUAL, GL_FASTEST, GL_FLOAT,
  GL_FLOAT_MAT3, GL_FLOAT_MAT4, GL_FLOAT_VEC2, GL_FLOAT_VEC3, GL_FLOAT_VEC4, GL_FRONT, GL_FUNC_ADD,
  GL_FUNC_REVERSE_SUBTRACT, GL_FUNC_SUBTRACT, GL_GEQUAL, GL_GREATER, GL_INCR, GL_INCR_WRAP, GL_INVERT,
  GL_KEEP, GL_LEQUAL, GL_LESS, GL_LINEAR, GL_LINEAR_MIPMAP_LINEAR, GL_LINEAR_MIPMAP_NEAREST, GL_LINES, GL_LINE_STRIP,
  GL_MAX_EXT, GL_MIN_EXT, GL_MIRRORED_REPEAT, GL_NEAREST, GL_NEAREST_MIPMAP_LINEAR, GL_NEAREST_MIPMAP_NEAREST,
  GL_NEVER, GL_NICEST, GL_NONE, GL_NOTEQUAL, GL_ONE, GL_ONE_MINUS_CONSTANT_COLOR, GL_ONE_MINUS_DST_ALPHA,
  GL_ONE_MINUS_DST_COLOR, GL_ONE_MINUS_SRC_ALPHA, GL_ONE_MINUS_SRC_COLOR, GL_POINTS, GL_REPEAT, GL_REPLACE,
  GL_SRC_ALPHA, GL_SRC_ALPHA_SATURATE, GL_SRC_COLOR, GL_STATIC_DRAW, GL_STREAM_DRAW, GL_TEXTURE_2D,
  GL_TEXTURE_2D_ARRAY, GL_TEXTURE_3D, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_NEGATIVE_X,
  GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_X,
  GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TRIANGLES, GL_TRIANGLE_STRIP, GL_UNIFORM_BUFFER,
  GL_UNSIGNED_INT, GL_UNSIGNED_SHORT, GL_ZERO
} from './glenums';

/**
 * Texture addressing wrap mode (aka UV wrap).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpuaddressmode
 */
export const AddressMode = {
  /** Clamp texture coords to (0.0 .. 1.0) */
  Clamp: GL_CLAMP_TO_EDGE,

  /** Repeat texture coords within (0.0 .. 1.0) */
  Repeat: GL_REPEAT,

  /** Mirror-repeat texture coords (0.0 .. 1.0 .. 0.0) */
  Mirror: GL_MIRRORED_REPEAT
} as const;

/**
 * Texture addressing wrap mode (aka UV wrap).
 */
export type AddressMode = ValueOf<typeof AddressMode>;

/**
 * Alpha-blending factors.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpublendfactor
 */
export const BlendFactor = {
  /** blend factor of zero */
  Zero: GL_ZERO,

  /** blend factor of one */
  One: GL_ONE,

  /** blend factor of source color */
  SrcColor: GL_SRC_COLOR,

  /** blend factor of one minus source color */
  OneMinusSrcColor: GL_ONE_MINUS_SRC_COLOR,

  /** blend factor of source alpha */
  SrcAlpha: GL_SRC_ALPHA,

  /** blend factor of one minus source alpha */
  OneMinusSrcAlpha: GL_ONE_MINUS_SRC_ALPHA,

  /** blend factor of destination color */
  DstColor: GL_DST_COLOR,

  /** blend factor of one minus destination alpha */
  OneMinusDstColor: GL_ONE_MINUS_DST_COLOR,

  /** blend factor of destination alpha */
  DstAlpha: GL_DST_ALPHA,

  /** blend factor of one minus destination alpha */
  OneMinusDstAlpha: GL_ONE_MINUS_DST_ALPHA,

  /** blend factor of the minimum of either source alpha or one minus destination alpha */
  SrcAlphaSaturate: GL_SRC_ALPHA_SATURATE,

  /** blend factor of constant color */
  BlendColor: GL_CONSTANT_COLOR,

  /** blend factor of one minus constant color */
  OneMinusBlendColor: GL_ONE_MINUS_CONSTANT_COLOR
} as const;

/**
 * Alpha-blending factors.
 */
export type BlendFactor = ValueOf<typeof BlendFactor>;

/**
 * Blend operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpublendoperation
 */
export const BlendOp = {
  /** Add source and destination pixel values */
  Add: GL_FUNC_ADD,

  /** Subtract destination from source pixel values */
  Sub: GL_FUNC_SUBTRACT,

  /** Subtract source from destination pixel values */
  RevSub: GL_FUNC_REVERSE_SUBTRACT,

  /**
   * The minimum of the source and destination pixel values.
   * For WebGL1, this requires EXT_blend_minmax extension.
   */
  Min: GL_MIN_EXT,

  /**
   * The maximum of the source and destination pixel values.
   * For WebGL1, this requires EXT_blend_minmax extension.
   */
  Max: GL_MAX_EXT
} as const;

/**
 * Blend operation.
 */
export type BlendOp = ValueOf<typeof BlendOp>;

/**
 * Buffer type (vertex or index buffers).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpubufferusageflags
 */
export const BufferType = {
  /** Vertex buffer */
  Vertex: GL_ARRAY_BUFFER,

  /** Index buffer */
  Index: GL_ELEMENT_ARRAY_BUFFER,

  /** Uniform buffer */
  Uniform: GL_UNIFORM_BUFFER
} as const;

/**
 * Buffer type (vertex or index buffers).
 */
export type BufferType = ValueOf<typeof BufferType>;

/**
 * A color write mask.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpucolorwriteflags
 */
export const ColorMask = {
  R: 0b0001,
  G: 0b0010,
  B: 0b0100,
  A: 0b1000,
  RGB: 0b0111,
  All: 0b1111
} as const;

/**
 * A color write mask.
 */
export type ColorMask = ValueOf<typeof ColorMask>;

/**
 * Comparision functions for depth and stencil checks.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpucomparefunction
 */
export const CompareFunc = {
  /** new value never passes comparion test */
  Never: GL_NEVER,

  /** new value passses if it is less than the existing value */
  Less: GL_LESS,

  /** new value passes if it is equal to existing value */
  Equal: GL_EQUAL,

  /** new value passes if it is less than or equal to existing value */
  LEqual: GL_LEQUAL,

  /** new value passes if it is greater than existing value */
  Greater: GL_GREATER,

  /** new value passes if it is not equal to existing value */
  NotEqual: GL_NOTEQUAL,

  /** new value passes if it is greater than or equal to existing value */
  GEqual: GL_GEQUAL,

  /** new value always passes */
  Always: GL_ALWAYS
} as const;

/**
 * Comparision functions for depth and stencil checks.
 */
export type CompareFunc = ValueOf<typeof CompareFunc>;

/**
 * Cube map face.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export const CubeFace = {
  /** Positive X face */
  PosX: GL_TEXTURE_CUBE_MAP_POSITIVE_X,

  /** Negative X face */
  NegX: GL_TEXTURE_CUBE_MAP_NEGATIVE_X,

  /** Positive Y face */
  PosY: GL_TEXTURE_CUBE_MAP_POSITIVE_Y,

  /** Negative Y face */
  NegY: GL_TEXTURE_CUBE_MAP_NEGATIVE_Y,

  /** Positive Z face */
  PosZ: GL_TEXTURE_CUBE_MAP_POSITIVE_Z,

  /** Negative Z face */
  NegZ: GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
} as const;

/**
 * Cube map face.
 */
export type CubeFace = ValueOf<typeof CubeFace>;

/**
 * Specify the face to cull.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 * @see https://gpuweb.github.io/gpuweb/#dom-gpurasterizationstatedescriptor-cullmode
 */
export const CullMode = {
  /** Disable culling */
  None: GL_NONE,

  /** Cull front face */
  Front: GL_FRONT,

  /** Cull back face */
  Back: GL_BACK
} as const;

/**
 * Specify the face to cull.
 */
export type CullMode = ValueOf<typeof CullMode>;

/**
 * Texture sampler filter mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufiltermode
 */
export const FilterMode = {
  /** use nearest-filtering (aka point-filtering) */
  Nearest: GL_NEAREST,

  /** use linear filtering */
  Linear: GL_LINEAR
} as const;

/**
 * Texture sampler filter mode.
 */
export type FilterMode = ValueOf<typeof FilterMode>;

/**
 * Identify which side is the front face by setting a winding orientation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufrontface
 */
export const FrontFace = {
  /** Counter-clockwise winding. */
  CCW: GL_CCW,

  /** Clockwise winding. */
  CW: GL_CW
} as const;

/**
 * Identify which side is the front face by setting a winding orientation.
 */
export type FrontFace = ValueOf<typeof FrontFace>;

/**
 * Vertex index formats.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpuindexformat
 */
export const IndexFormat = {
  /** 16-bit indices */
  UInt16: GL_UNSIGNED_SHORT,

  /** 32-bit indices. For WebGL1, this requires OES_element_index_uint extension. */
  UInt32: GL_UNSIGNED_INT
} as const;

/**
 * Vertex index formats.
 */
export type IndexFormat = ValueOf<typeof IndexFormat>;

/**
 * Hint for mipmap generation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/hint
 */
export const MipmapHint = {
  /** No preference. */
  None: GL_DONT_CARE,

  /** The most efficient option should be chosen. */
  Fast: GL_FASTEST,

  /** The most correct, or highest quality, option should be chosen. */
  Nice: GL_NICEST
} as const;

/**
 * Texture sampler minification filter mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufiltermode
 */
export const MinFilterMode = {
  ...FilterMode,

  /** nearest within mipmap and between mipmaps */
  NearestMipmapNearest: GL_NEAREST_MIPMAP_NEAREST,

  /** nearest within mipmap, linear between mipmaps */
  NearestMipmapLinear: GL_NEAREST_MIPMAP_LINEAR,

  /** linear within mipmap, nearest between mipmaps */
  LinearMipmapNearest: GL_LINEAR_MIPMAP_NEAREST,

  /** linear within and between mipmaps */
  LinearMipmapLinear: GL_LINEAR_MIPMAP_LINEAR
} as const;

/**
 * Texture sampler minification filter mode.
 */
export type MinFilterMode = ValueOf<typeof MinFilterMode>;

/**
 * Hint for mipmap generation.
 */
export type MipmapHint = ValueOf<typeof MipmapHint>;

/**
 * Texture pixel format.
 * Lower 8 bits of the enum values encode the distinct size types;
 * Bits 8-15 encode the distinct formats;
 * Bits 16-23 encode the distinct internal formats;
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gputextureformat
 */
export const PixelFormat = {
  /** 16-32 bits depth */
  Depth: 0x01_01_04,

  /** 8-bit stencil. */
  Stencil: 0x02_02_05,

  /** 16-24 bits depth with 8-bit stencil */
  DepthStencil: 0x03_03_05,

  /** RGBA with 8 bits per channel */
  RGBA8: 0x04_04_01,

  /**
   * RGBA with 32-bit floating point channels.
   * For WebGL1, this requires OES_texture_float extension.
   */
  RGBA32F: 0x05_04_02,

  /**
   * RGBA with 16-bit floating point channels.
   * For WebGL1, this requires OES_texture_half_float extension.
   */
  RGBA16F: 0x06_04_03,

  /**
   * R component only, 32-bit floating point. WebGL2 only.
   */
  R32F: 0x07_05_02,

  /**
   * R component only, 16-bit floating point. WebGL2 only.
   */
  R16F: 0x08_05_03,

  /**
   * RG component only, 32-bit floating point. WebGL2 only.
   */
  RG32F: 0x09_06_02,

  /**
   * RG component only, 16-bit floating point. WebGL2 only.
   */
  RG16F: 0x0A_06_03,
} as const;

/**
 * Texture pixel format.
 */
export type PixelFormat = ValueOf<typeof PixelFormat>;

/**
 * Primitive topology.
 * @see https://gpuweb.github.io/gpuweb/#primitive-topology
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 */
export const PrimitiveType = {
  /** Point list */
  Points: GL_POINTS,

  /** Line list */
  Lines: GL_LINES,

  /** Line strip */
  LineStrip: GL_LINE_STRIP,

  /** Triangle list */
  Tri: GL_TRIANGLES,

  /** Triangle strip */
  TriStrip: GL_TRIANGLE_STRIP
} as const;

/**
 * Primitive topology.
 */
export type PrimitiveType = ValueOf<typeof PrimitiveType>;

/**
 * Stencil-buffer operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOpSeparate
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpustenciloperation
 */
export const StencilOp = {
  /** keep the current stencil value */
  Keep: GL_KEEP,

  /** set the stencil value to zero */
  Zero: GL_ZERO,

  /** replace the stencil value with stencil reference value */
  Replace: GL_REPLACE,

  /** increment the current stencil value, clamp to max */
  Incr: GL_INCR,

  /** decrement the current stencil value, clamp to zero */
  Decr: GL_DECR,

  /** perform a logical bitwise invert operation on the stencil value */
  Invert: GL_INVERT,

  /** increment the current stencil value, with wrap-around */
  IncrWrap: GL_INCR_WRAP,

  /** decrement the current stencil value, with wrap-around */
  DecrWrap: GL_DECR_WRAP
} as const;

/**
 * Stencil-buffer operation.
 */
export type StencilOp = ValueOf<typeof StencilOp>;

/**
 * Texture view dimension type.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gputextureviewdimension
 */
export const TexType = {
  /** 2D texture */
  Tex2D: GL_TEXTURE_2D,

  /** Cube map texture */
  Cube: GL_TEXTURE_CUBE_MAP,

  /** 3D texture. WebGL2 only. */
  Tex3D: GL_TEXTURE_3D,

  /** 2D array texture. WebGL2 only. */
  Array: GL_TEXTURE_2D_ARRAY
} as const;

/**
 * Texture view dimension type.
 */
export type TexType = ValueOf<typeof TexType>;

/**
 * Uniform value format.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix
 */
export const UniformFormat = {
  /** float type */
  Float: GL_FLOAT,

  /** 2D vector */
  Vec2: GL_FLOAT_VEC2,

  /** 3D vector */
  Vec3: GL_FLOAT_VEC3,

  /** 4D vector */
  Vec4: GL_FLOAT_VEC4,

  /** 3x3 matrix */
  Mat3: GL_FLOAT_MAT3,

  /** 4x4 matrix */
  Mat4: GL_FLOAT_MAT4
} as const;

/**
 * Uniform value format.
 */
export type UniformFormat = ValueOf<typeof UniformFormat>;

/**
 * Uniform type (uniform value or texture).
 * TODO: [Feature] Support uniform buffer object
 */
export const UniformType = {
  /** Uniform value type */
  Value: 0b0001,

  /** Uniform texture type */
  Tex: 0b0010,

  /** Uniform buffer type */
  Buffer: 0b0100
} as const;

/**
 * Uniform type (uniform value or texture).
 */
export type UniformType = ValueOf<typeof UniformType>;

/**
 * Buffer data usage hint.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
export const Usage = {
  /** Data is static, cannot be modified after creation */
  Static: GL_STATIC_DRAW,

  /** Data is updated infrequently */
  Dynamic: GL_DYNAMIC_DRAW,

  /** Data is overwritten each frame */
  Stream: GL_STREAM_DRAW
} as const;

/**
 * Buffer data usage hint.
 */
export type Usage = ValueOf<typeof Usage>;

/**
 * Vertex component format.
 * Enum values encode the properties of the formats:
 *  - bits 0 - 7 encodes the data type
 *  - bits 8 - 15 encodes the number of components
 *  - bits 16 encodes if the type is normalized (1 for normalized, 0 otherwise)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpuvertexformat
 */
export const VertexFormat = {
  /** 32-bit float, single component in X */
  Float: 0x0_01_00,

  /** 32-bit floats, 2 components in XY */
  Float2: 0x0_02_00,

  /** 32-bit floats, 3 components in XYZ */
  Float3: 0x0_03_00,

  /** 32-bit floats, 4 components in XYZW */
  Float4: 0x0_04_00,

  /** 4 packed bytes, signed (-128 .. 127) */
  Char4: 0x0_04_01,

  /** 4 packed bytes, signed, normalized (-1.0 .. +1.0) */
  Char4N: 0x1_04_01,

  /** 4 packed bytes, unsigned (0 .. 255) */
  UChar4: 0x0_04_02,

  /** 4 packed bytes, unsigned, normalized (0.0 .. +1.0) */
  UChar4N: 0x1_04_02,

  /** 2 packed 16-bit shorts, signed (-32767 .. +32768) */
  Short2: 0x0_02_03,

  /** 2 packed 16-bit shorts, signed, normalized (-1.0 .. +1.0) */
  Short2N: 0x1_02_03,

  /** 4 packed 16-bit shorts, signed (-32767 .. +32768) */
  Short4: 0x0_04_03,

  /** 4 packed 16-bit shorts, signed, normalized (-1.0 .. +1.0) */
  Short4N: 0x1_04_03,

  /** 2 packed 16-bit shorts, unsigned (0 .. +65535) */
  UShort2: 0x0_02_04,

  /** 2 packed 16-bit shorts, unsigned, normalized (0.0 .. +1.0) */
  UShort2N: 0x1_02_04,

  /** 4 packed 16-bit shorts, unsigned (0 .. +65535) */
  UShort4: 0x0_04_04,

  /** 4 packed 16-bit shorts, unsigned, normalized (0.0 .. +1.0) */
  UShort4N: 0x1_04_04
} as const;

/**
 * Vertex component format.
 */
export type VertexFormat = ValueOf<typeof VertexFormat>;
