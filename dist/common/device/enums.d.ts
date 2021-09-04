/**
 * Texture addressing wrap mode (aka UV wrap).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpuaddressmode
 */
export declare enum AddressMode {
    /** Clamp texture coords to (0.0 .. 1.0) */
    Clamp,
    /** Repeat texture coords within (0.0 .. 1.0) */
    Repeat,
    /** Mirror-repeat texture coords (0.0 .. 1.0 .. 0.0) */
    Mirror
}
/**
 * Alpha-blending factors.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpublendfactor
 */
export declare enum BlendFactor {
    /** blend factor of zero */
    Zero,
    /** blend factor of one */
    One,
    /** blend factor of source color */
    SrcColor,
    /** blend factor of one minus source color */
    OneMinusSrcColor,
    /** blend factor of source alpha */
    SrcAlpha,
    /** blend factor of one minus source alpha */
    OneMinusSrcAlpha,
    /** blend factor of destination color */
    DstColor,
    /** blend factor of one minus destination alpha */
    OneMinusDstColor,
    /** blend factor of destination alpha */
    DstAlpha,
    /** blend factor of one minus destination alpha */
    OneMinusDstAlpha,
    /** blend factor of the minimum of either source alpha or one minus destination alpha */
    SrcAlphaSaturate,
    /** blend factor of constant color */
    BlendColor,
    /** blend factor of one minus constant color */
    OneMinusBlendColor
}
/**
 * Blend operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpublendoperation
 */
export declare enum BlendOp {
    /** Add source and destination pixel values */
    Add,
    /** Subtract destination from source pixel values */
    Sub,
    /** Subtract source from destination pixel values */
    RevSub,
    /**
     * The minimum of the source and destination pixel values.
     * For WebGL1, this requires EXT_blend_minmax extension.
     */
    Min,
    /**
     * The maximum of the source and destination pixel values.
     * For WebGL1, this requires EXT_blend_minmax extension.
     */
    Max
}
/**
 * Buffer type (vertex or index buffers).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpubufferusageflags
 */
export declare enum BufferType {
    /** Vertex buffer */
    Vertex,
    /** Index buffer */
    Index,
    /** Uniform buffer */
    Uniform
}
/**
 * A color write mask.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpucolorwriteflags
 */
export declare enum ColorMask {
    R = 1,
    G = 2,
    B = 4,
    A = 8,
    RGB = 7,
    All = 15
}
/**
 * Comparision functions for depth and stencil checks.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpucomparefunction
 */
export declare enum CompareFunc {
    /** new value never passes comparion test */
    Never,
    /** new value passses if it is less than the existing value */
    Less,
    /** new value passes if it is equal to existing value */
    Equal,
    /** new value passes if it is less than or equal to existing value */
    LEqual,
    /** new value passes if it is greater than existing value */
    Greater,
    /** new value passes if it is not equal to existing value */
    NotEqual,
    /** new value passes if it is greater than or equal to existing value */
    GEqual,
    /** new value always passes */
    Always
}
/**
 * Cube map face.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export declare enum CubeFace {
    /** Positive X face */
    PosX,
    /** Negative X face */
    NegX,
    /** Positive Y face */
    PosY,
    /** Negative Y face */
    NegY,
    /** Positive Z face */
    PosZ,
    /** Negative Z face */
    NegZ
}
/**
 * Specify the face to cull.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 * @see https://gpuweb.github.io/gpuweb/#dom-gpurasterizationstatedescriptor-cullmode
 */
export declare enum CullMode {
    /** Disable culling */
    None,
    /** Cull front face */
    Front,
    /** Cull back face */
    Back
}
/**
 * Texture sampler filter mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufiltermode
 */
export declare enum FilterMode {
    /** use nearest-filtering (aka point-filtering) */
    Nearest,
    /** use linear filtering */
    Linear
}
/**
 * Identify which side is the front face by setting a winding orientation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufrontface
 */
export declare enum FrontFace {
    /** Counter-clockwise winding. */
    CCW,
    /** Clockwise winding. */
    CW
}
/**
 * Vertex index formats.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpuindexformat
 */
export declare enum IndexFormat {
    /** 16-bit indices */
    UInt16,
    /** 32-bit indices. For WebGL1, this requires OES_element_index_uint extension. */
    UInt32
}
/**
 * Hint for mipmap generation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/hint
 */
export declare enum MipmapHint {
    /** No preference. */
    None,
    /** The most efficient option should be chosen. */
    Fast,
    /** The most correct, or highest quality, option should be chosen. */
    Nice
}
/**
 * Texture sampler minification filter mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpufiltermode
 */
export declare enum MinFilterMode {
    /** use nearest-filtering (aka point-filtering) */
    Nearest,
    /** use linear filtering */
    Linear,
    /** nearest within mipmap and between mipmaps */
    NearestMipmapNearest,
    /** nearest within mipmap, linear between mipmaps */
    NearestMipmapLinear,
    /** linear within mipmap, nearest between mipmaps */
    LinearMipmapNearest,
    /** linear within and between mipmaps */
    LinearMipmapLinear
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
export declare enum PixelFormat {
    /** 16-32 bits depth */
    Depth = 65796,
    /** 8-bit stencil. */
    Stencil = 131589,
    /** 16-24 bits depth with 8-bit stencil */
    DepthStencil = 197381,
    /** RGBA with 8 bits per channel */
    RGBA8 = 263169,
    /**
     * RGBA with 32-bit floating point channels.
     * For WebGL1, this requires OES_texture_float extension.
     */
    RGBA32F = 328706,
    /**
     * RGBA with 16-bit floating point channels.
     * For WebGL1, this requires OES_texture_half_float extension.
     */
    RGBA16F = 394243,
    /**
     * R component only, 32-bit floating point. WebGL2 only.
     */
    R32F = 460034,
    /**
     * R component only, 16-bit floating point. WebGL2 only.
     */
    R16F = 525571,
    /**
     * RG component only, 32-bit floating point. WebGL2 only.
     */
    RG32F = 591362,
    /**
     * RG component only, 16-bit floating point. WebGL2 only.
     */
    RG16F = 656899
}
/**
 * Primitive topology.
 * @see https://gpuweb.github.io/gpuweb/#primitive-topology
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 */
export declare enum PrimitiveType {
    /** Point list */
    Points,
    /** Line list */
    Lines,
    /** Line strip */
    LineStrip,
    /** Triangle list */
    Tri,
    /** Triangle strip */
    TriStrip
}
export declare enum ShaderType {
    /** Vertex shader */
    Vertex,
    /** Fragment shader */
    Fragment
}
/**
 * Stencil-buffer operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOpSeparate
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gpustenciloperation
 */
export declare enum StencilOp {
    /** keep the current stencil value */
    Keep,
    /** set the stencil value to zero */
    Zero,
    /** replace the stencil value with stencil reference value */
    Replace,
    /** increment the current stencil value, clamp to max */
    Incr,
    /** decrement the current stencil value, clamp to zero */
    Decr,
    /** perform a logical bitwise invert operation on the stencil value */
    Invert,
    /** increment the current stencil value, with wrap-around */
    IncrWrap,
    /** decrement the current stencil value, with wrap-around */
    DecrWrap
}
/**
 * Texture view dimension type.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://gpuweb.github.io/gpuweb/#enumdef-gputextureviewdimension
 */
export declare enum TexType {
    /** 2D texture */
    Tex2D,
    /** Cube map texture */
    Cube,
    /** 3D texture. WebGL2 only. */
    Tex3D,
    /** 2D array texture. WebGL2 only. */
    Array
}
/**
 * Uniform value format.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix
 */
export declare enum UniformFormat {
    /** float type */
    Float,
    /** 2D vector */
    Vec2,
    /** 3D vector */
    Vec3,
    /** 4D vector */
    Vec4,
    /** 2x2 matrix */
    Mat2,
    /** 3x3 matrix */
    Mat3,
    /** 4x4 matrix */
    Mat4
}
/**
 * Uniform type (uniform value or texture).
 * TODO = [Feature] Support uniform buffer object
 */
export declare enum UniformType {
    /** Uniform value type */
    Value = 1,
    /** Uniform texture type */
    Tex = 2,
    /** Uniform buffer type */
    Buffer = 4
}
/**
 * Buffer data usage hint.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
export declare enum Usage {
    /** Data is static, cannot be modified after creation */
    Static,
    /** Data is updated infrequently */
    Dynamic,
    /** Data is overwritten each frame */
    Stream
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
export declare enum VertexFormat {
    /** 32-bit float, single component in X */
    Float = 256,
    /** 32-bit floats, 2 components in XY */
    Float2 = 512,
    /** 32-bit floats, 3 components in XYZ */
    Float3 = 768,
    /** 32-bit floats, 4 components in XYZW */
    Float4 = 1024,
    /** 2 packed bytes, signed (-128 .. 127) */
    Char2 = 513,
    /** 2 packed bytes, signed, normalized (-1.0 .. +1.0) */
    Char2N = 66049,
    /** 2 packed bytes, unsigned (0 .. 255) */
    UChar2 = 514,
    /** 2 packed bytes, unsigned, normalized (0.0 .. +1.0) */
    UChar2N = 66050,
    /** 4 packed bytes, signed (-128 .. 127) */
    Char4 = 1025,
    /** 4 packed bytes, signed, normalized (-1.0 .. +1.0) */
    Char4N = 66561,
    /** 4 packed bytes, unsigned (0 .. 255) */
    UChar4 = 1026,
    /** 4 packed bytes, unsigned, normalized (0.0 .. +1.0) */
    UChar4N = 66562,
    /** 2 packed 16-bit shorts, signed (-32767 .. +32768) */
    Short2 = 515,
    /** 2 packed 16-bit shorts, signed, normalized (-1.0 .. +1.0) */
    Short2N = 66051,
    /** 4 packed 16-bit shorts, signed (-32767 .. +32768) */
    Short4 = 1027,
    /** 4 packed 16-bit shorts, signed, normalized (-1.0 .. +1.0) */
    Short4N = 66563,
    /** 2 packed 16-bit shorts, unsigned (0 .. +65535) */
    UShort2 = 516,
    /** 2 packed 16-bit shorts, unsigned, normalized (0.0 .. +1.0) */
    UShort2N = 66052,
    /** 4 packed 16-bit shorts, unsigned (0 .. +65535) */
    UShort4 = 1028,
    /** 4 packed 16-bit shorts, unsigned, normalized (0.0 .. +1.0) */
    UShort4N = 66564
}
//# sourceMappingURL=enums.d.ts.map