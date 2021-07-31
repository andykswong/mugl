import * as GLenum from '../gl/const';

/**
 * Texture addressing wrap mode (aka UV wrap).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpuaddressmode
 */
export enum AddressMode {
  /** Clamp texture coords to (0.0 .. 1.0) */
  Clamp = GLenum.CLAMP_TO_EDGE,

  /** Repeat texture coords within (0.0 .. 1.0) */
  Repeat = GLenum.REPEAT,

  /** Mirror-repeat texture coords (0.0 .. 1.0 .. 0.0) */
  Mirror = GLenum.MIRRORED_REPEAT
}

/**
 * Alpha-blending factors.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpublendfactor
 */
export enum BlendFactor {
  /** blend factor of zero */
  Zero = GLenum.ZERO,

  /** blend factor of one */
  One = GLenum.ONE,

  /** blend factor of source color */
  SrcColor = GLenum.SRC_COLOR,

  /** blend factor of one minus source color */
  OneMinusSrcColor = GLenum.ONE_MINUS_SRC_COLOR,

  /** blend factor of source alpha */
  SrcAlpha = GLenum.SRC_ALPHA,

  /** blend factor of one minus source alpha */
  OneMinusSrcAlpha = GLenum.ONE_MINUS_SRC_ALPHA,

  /** blend factor of destination color */
  DstColor = GLenum.DST_COLOR,

  /** blend factor of one minus destination alpha */
  OneMinusDstColor = GLenum.ONE_MINUS_DST_COLOR,

  /** blend factor of destination alpha */
  DstAlpha = GLenum.DST_ALPHA,

  /** blend factor of one minus destination alpha */
  OneMinusDstAlpha = GLenum.ONE_MINUS_DST_ALPHA,

  /** blend factor of the minimum of either source alpha or one minus destination alpha */
  SrcAlphaSaturate = GLenum.SRC_ALPHA_SATURATE,

  /** blend factor of constant color */
  BlendColor = GLenum.CONSTANT_COLOR,

  /** blend factor of one minus constant color */
  OneMinusBlendColor = GLenum.ONE_MINUS_CONSTANT_COLOR
}

/**
 * Blend operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpublendoperation
 */
export enum BlendOp {
  /** Add source and destination pixel values */
  Add = GLenum.FUNC_ADD,

  /** Subtract destination from source pixel values */
  Sub = GLenum.FUNC_SUBTRACT,

  /** Subtract source from destination pixel values */
  RevSub = GLenum.FUNC_REVERSE_SUBTRACT,

  /**
   * The minimum of the source and destination pixel values.
   * For WebGL1, this requires EXT_blend_minmax extension.
   */
  Min = GLenum.MIN_EXT,

  /**
   * The maximum of the source and destination pixel values.
   * For WebGL1, this requires EXT_blend_minmax extension.
   */
  Max = GLenum.MAX_EXT
}

/**
 * Buffer type (vertex or index buffers).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpubufferusageflags
 */
export enum BufferType {
  /** Vertex buffer */
  Vertex = GLenum.ARRAY_BUFFER,

  /** Index buffer */
  Index = GLenum.ELEMENT_ARRAY_BUFFER,

  /** Uniform buffer */
  Uniform = GLenum.UNIFORM_BUFFER
}

/**
 * A color write mask.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpucolorwriteflags
 */
export enum ColorMask {
  R = 0b0001,
  G = 0b0010,
  B = 0b0100,
  A = 0b1000,
  RGB = 0b0111,
  All = 0b1111
}

/**
 * Comparision functions for depth and stencil checks.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpucomparefunction
 */
export enum CompareFunc {
  /** new value never passes comparion test */
  Never = GLenum.NEVER,

  /** new value passses if it is less than the existing value */
  Less = GLenum.LESS,

  /** new value passes if it is equal to existing value */
  Equal = GLenum.EQUAL,

  /** new value passes if it is less than or equal to existing value */
  LEqual = GLenum.LEQUAL,

  /** new value passes if it is greater than existing value */
  Greater = GLenum.GREATER,

  /** new value passes if it is not equal to existing value */
  NotEqual = GLenum.NOTEQUAL,

  /** new value passes if it is greater than or equal to existing value */
  GEqual = GLenum.GEQUAL,

  /** new value always passes */
  Always = GLenum.ALWAYS
}

/**
 * Cube map face.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export enum CubeFace {
  /** Positive X face */
  PosX = GLenum.TEXTURE_CUBE_MAP_POSITIVE_X,

  /** Negative X face */
  NegX = GLenum.TEXTURE_CUBE_MAP_NEGATIVE_X,

  /** Positive Y face */
  PosY = GLenum.TEXTURE_CUBE_MAP_POSITIVE_Y,

  /** Negative Y face */
  NegY = GLenum.TEXTURE_CUBE_MAP_NEGATIVE_Y,

  /** Positive Z face */
  PosZ = GLenum.TEXTURE_CUBE_MAP_POSITIVE_Z,

  /** Negative Z face */
  NegZ = GLenum.TEXTURE_CUBE_MAP_NEGATIVE_Z
}

/**
 * Specify the face to cull.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 * @see https://gpuweb.github.io/gpuweb/#dom-gpurasterizationstatedescriptor-cullmode
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
 * Texture sampler filter mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufiltermode
 */
export enum FilterMode {
  /** use nearest-filtering (aka point-filtering) */
  Nearest = GLenum.NEAREST,

  /** use linear filtering */
  Linear = GLenum.LINEAR
}

/**
 * Identify which side is the front face by setting a winding orientation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufrontface
 */
export enum FrontFace {
  /** Counter-clockwise winding. */
  CCW = GLenum.CCW,

  /** Clockwise winding. */
  CW = GLenum.CW
}

/**
 * Vertex index formats.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpuindexformat
 */
export enum IndexFormat {
  /** 16-bit indices */
  UInt16 = GLenum.UNSIGNED_SHORT,

  /** 32-bit indices. For WebGL1, this requires OES_element_index_uint extension. */
  UInt32 = GLenum.UNSIGNED_INT
}

/**
 * Hint for mipmap generation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/hint
 */
export enum MipmapHint {
  /** No preference. */
  None = GLenum.DONT_CARE,

  /** The most efficient option should be chosen. */
  Fast = GLenum.FASTEST,

  /** The most correct, or highest quality, option should be chosen. */
  Nice = GLenum.NICEST
}

/**
 * Texture sampler minification filter mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufiltermode
 */
export enum MinFilterMode {
  /** use nearest-filtering (aka point-filtering) */
  Nearest = GLenum.NEAREST,

  /** use linear filtering */
  Linear = GLenum.LINEAR,

  /** nearest within mipmap and between mipmaps */
  NearestMipmapNearest = GLenum.NEAREST_MIPMAP_NEAREST,

  /** nearest within mipmap, linear between mipmaps */
  NearestMipmapLinear = GLenum.NEAREST_MIPMAP_LINEAR,

  /** linear within mipmap, nearest between mipmaps */
  LinearMipmapNearest = GLenum.LINEAR_MIPMAP_NEAREST,

  /** linear within and between mipmaps */
  LinearMipmapLinear = GLenum.LINEAR_MIPMAP_LINEAR
}

/**
 * Texture pixel format.
 * Lower 8 bits of the enum values encode the distinct size types;
 * Bits 8-15 encode the distinct formats;
 * Bits 16-23 encode the distinct internal formats;
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gputextureformat
 */
export enum PixelFormat {
  /** 16-32 bits depth */
  Depth = 0x01_01_04,

  /** 8-bit stencil. */
  Stencil = 0x02_02_05,

  /** 16-24 bits depth with 8-bit stencil */
  DepthStencil = 0x03_03_05,

  /** RGBA with 8 bits per channel */
  RGBA8 = 0x04_04_01,

  /**
   * RGBA with 32-bit floating point channels.
   * For WebGL1, this requires OES_texture_float extension.
   */
  RGBA32F = 0x05_04_02,

  /**
   * RGBA with 16-bit floating point channels.
   * For WebGL1, this requires OES_texture_half_float extension.
   */
  RGBA16F = 0x06_04_03,

  /**
   * R component only, 32-bit floating point. WebGL2 only.
   */
  R32F = 0x07_05_02,

  /**
   * R component only, 16-bit floating point. WebGL2 only.
   */
  R16F = 0x08_05_03,

  /**
   * RG component only, 32-bit floating point. WebGL2 only.
   */
  RG32F = 0x09_06_02,

  /**
   * RG component only, 16-bit floating point. WebGL2 only.
   */
  RG16F = 0x0A_06_03,
}

/**
 * Primitive topology.
 * @see https://gpuweb.github.io/gpuweb/#primitive-topology
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 */
export enum PrimitiveType {
  /** Point list */
  Points = GLenum.POINTS,

  /** Line list */
  Lines = GLenum.LINES,

  /** Line strip */
  LineStrip = GLenum.LINE_STRIP,

  /** Triangle list */
  Tri = GLenum.TRIANGLES,

  /** Triangle strip */
  TriStrip = GLenum.TRIANGLE_STRIP
}

export enum ShaderType {
  /** Vertex shader */
  Vertex = GLenum.VERTEX_SHADER,

  /** Fragment shader */
  Fragment = GLenum.FRAGMENT_SHADER
}

/**
 * Stencil-buffer operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOpSeparate
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpustenciloperation
 */
export enum StencilOp {
  /** keep the current stencil value */
  Keep = GLenum.KEEP,

  /** set the stencil value to zero */
  Zero = GLenum.ZERO,

  /** replace the stencil value with stencil reference value */
  Replace = GLenum.REPLACE,

  /** increment the current stencil value, clamp to max */
  Incr = GLenum.INCR,

  /** decrement the current stencil value, clamp to zero */
  Decr = GLenum.DECR,

  /** perform a logical bitwise invert operation on the stencil value */
  Invert = GLenum.INVERT,

  /** increment the current stencil value, with wrap-around */
  IncrWrap = GLenum.INCR_WRAP,

  /** decrement the current stencil value, with wrap-around */
  DecrWrap = GLenum.DECR_WRAP
}

/**
 * Texture view dimension type.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gputextureviewdimension
 */
export enum TexType {
  /** 2D texture */
  Tex2D = GLenum.TEXTURE_2D,

  /** Cube map texture */
  Cube = GLenum.TEXTURE_CUBE_MAP,

  /** 3D texture. WebGL2 only. */
  Tex3D = GLenum.TEXTURE_3D,

  /** 2D array texture. WebGL2 only. */
  Array = GLenum.TEXTURE_2D_ARRAY
}

/**
 * Uniform value format.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix
 */
export enum UniformFormat {
  /** float type */
  Float = GLenum.FLOAT,

  /** 2D vector */
  Vec2 = GLenum.FLOAT_VEC2,

  /** 3D vector */
  Vec3 = GLenum.FLOAT_VEC3,

  /** 4D vector */
  Vec4 = GLenum.FLOAT_VEC4,

  /** 2x2 matrix */
  Mat2 = GLenum.FLOAT_MAT3,

  /** 3x3 matrix */
  Mat3 = GLenum.FLOAT_MAT3,

  /** 4x4 matrix */
  Mat4 = GLenum.FLOAT_MAT4
}

/**
 * Uniform type (uniform value or texture).
 * TODO = [Feature] Support uniform buffer object
 */
export enum UniformType {
  /** Uniform value type */
  Value = 0b0001,

  /** Uniform texture type */
  Tex = 0b0010,

  /** Uniform buffer type */
  Buffer = 0b0100
}

/**
 * Buffer data usage hint.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
export enum Usage {
  /** Data is static, cannot be modified after creation */
  Static = GLenum.STATIC_DRAW,

  /** Data is updated infrequently */
  Dynamic = GLenum.DYNAMIC_DRAW,

  /** Data is overwritten each frame */
  Stream = GLenum.STREAM_DRAW
}

/**
 * Vertex component format.
 * Enum values encode the properties of the formats:
 *  - bits 0 - 7 encodes the data type
 *  - bits 8 - 15 encodes the number of components
 *  - bits 16 encodes if the type is normalized (1 for normalized, 0 otherwise)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpuvertexformat
 */
export enum VertexFormat {
  /** 32-bit float, single component in X */
  Float = 0x0_01_00,

  /** 32-bit floats, 2 components in XY */
  Float2 = 0x0_02_00,

  /** 32-bit floats, 3 components in XYZ */
  Float3 = 0x0_03_00,

  /** 32-bit floats, 4 components in XYZW */
  Float4 = 0x0_04_00,

  /** 2 packed bytes, signed (-128 .. 127) */
  Char2 = 0x0_02_01,

  /** 2 packed bytes, signed, normalized (-1.0 .. +1.0) */
  Char2N = 0x1_02_01,

  /** 2 packed bytes, unsigned (0 .. 255) */
  UChar2 = 0x0_02_02,

  /** 2 packed bytes, unsigned, normalized (0.0 .. +1.0) */
  UChar2N = 0x1_02_02,

  /** 4 packed bytes, signed (-128 .. 127) */
  Char4 = 0x0_04_01,

  /** 4 packed bytes, signed, normalized (-1.0 .. +1.0) */
  Char4N = 0x1_04_01,

  /** 4 packed bytes, unsigned (0 .. 255) */
  UChar4 = 0x0_04_02,

  /** 4 packed bytes, unsigned, normalized (0.0 .. +1.0) */
  UChar4N = 0x1_04_02,

  /** 2 packed 16-bit shorts, signed (-32767 .. +32768) */
  Short2 = 0x0_02_03,

  /** 2 packed 16-bit shorts, signed, normalized (-1.0 .. +1.0) */
  Short2N = 0x1_02_03,

  /** 4 packed 16-bit shorts, signed (-32767 .. +32768) */
  Short4 = 0x0_04_03,

  /** 4 packed 16-bit shorts, signed, normalized (-1.0 .. +1.0) */
  Short4N = 0x1_04_03,

  /** 2 packed 16-bit shorts, unsigned (0 .. +65535) */
  UShort2 = 0x0_02_04,

  /** 2 packed 16-bit shorts, unsigned, normalized (0.0 .. +1.0) */
  UShort2N = 0x1_02_04,

  /** 4 packed 16-bit shorts, unsigned (0 .. +65535) */
  UShort4 = 0x0_04_04,

  /** 4 packed 16-bit shorts, unsigned, normalized (0.0 .. +1.0) */
  UShort4N = 0x1_04_04
}
