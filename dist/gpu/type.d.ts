/**
 * Buffer usage.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://www.w3.org/TR/webgpu/#buffer-usage
 */
export declare enum BufferUsage {
    /** Index buffer */
    Index = 16,
    /** Vertex buffer */
    Vertex = 32,
    /** Uniform buffer */
    Uniform = 64,
    /** Data is updated infrequently */
    Dynamic = 4096,
    /** Data is overwritten each frame */
    Stream = 8192
}
/**
 * Texture usage.
 * @see https://www.w3.org/TR/webgpu/#typedefdef-gputextureusageflags
 */
export declare enum TextureUsage {
    /** Use as texture binding */
    TextureBinding = 4,
    /** Use as render target */
    RenderAttachment = 16
}
/**
 * A color write mask.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
 * @see https://www.w3.org/TR/webgpu/#typedefdef-gpucolorwriteflags
 */
export declare enum ColorWrite {
    Red = 1,
    Green = 2,
    Blue = 4,
    Alpha = 8,
    All = 15
}
/**
 * Texture view dimension type.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://www.w3.org/TR/webgpu/#enumdef-gputextureviewdimension
 */
export declare enum TextureDimension {
    /** 2D texture */
    D2,
    /** 2D array texture. */
    D2Array,
    /** Cube map texture */
    CubeMap,
    /** 3D texture. */
    D3
}
/**
 * Texture format.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
 * @see https://www.w3.org/TR/webgpu/#texture-formats
 */
export declare enum TextureFormat {
    R8,
    R8SNORM,
    R8UI,
    R8I,
    R16UI,
    R16I,
    RG8,
    RG8SNORM,
    RG8UI,
    RG8I,
    R32UI,
    R32I,
    RG16UI,
    RG16I,
    RGBA8,
    SRGBA8,
    RGBA8SNORM,
    RGBA8UI,
    RGBA8I,
    RGB10A2,
    RG32UI,
    RG32I,
    RGBA16UI,
    RGBA16I,
    RGBA32UI,
    RGBA32I,
    R16F,
    RG16F,
    RG11B10F,
    RGBA16F,
    R32F,
    RG32F,
    RGBA32F,
    Depth16,
    Depth24,
    Depth24Stencil8,
    Depth32F,
    Depth32FStencil8
}
/**
 * Texture addressing wrap mode (aka UV wrap).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpuaddressmode
 */
export declare enum AddressMode {
    /** Clamp texture coords to (0.0 .. 1.0) */
    ClampToEdge,
    /** Repeat texture coords within (0.0 .. 1.0) */
    Repeat,
    /** Mirror-repeat texture coords (0.0 .. 1.0 .. 0.0) */
    MirrorRepeat
}
/**
 * Texture sampler filter mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpufiltermode
 */
export declare enum FilterMode {
    /** use nearest-filtering (aka point-filtering) */
    Nearest,
    /** use linear filtering */
    Linear
}
/**
 * Comparision functions for depth and stencil checks.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpucomparefunction
 */
export declare enum CompareFunction {
    /** new value never passes comparion test */
    Never,
    /** new value passses if it is less than the existing value */
    Less,
    /** new value passes if it is equal to existing value */
    Equal,
    /** new value passes if it is less than or equal to existing value */
    LessEqual,
    /** new value passes if it is greater than existing value */
    Greater,
    /** new value passes if it is not equal to existing value */
    NotEqual,
    /** new value passes if it is greater than or equal to existing value */
    GreaterEqual,
    /** new value always passes */
    Always
}
/**
 * Shader stage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createShader
 */
export declare enum ShaderStage {
    /** Vertex shader */
    Vertex = 1,
    /** Fragment shader */
    Fragment = 2
}
/**
 * Primitive topology.
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpuprimitivetopology
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 */
export declare enum PrimitiveTopology {
    /** Point list */
    Points,
    /** Line list */
    Lines,
    /** Line strip */
    LineStrip,
    /** Triangle list */
    Triangles,
    /** Triangle strip */
    TriangleStrip
}
/**
 * Vertex index formats.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpuindexformat
 */
export declare enum IndexFormat {
    /** 16-bit indices */
    UInt16,
    /** 32-bit indices. */
    UInt32
}
/**
 * Identify which side is the front face by setting a winding orientation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpufrontface
 */
export declare enum FrontFace {
    /** Counter-clockwise winding. */
    CCW,
    /** Clockwise winding. */
    CW
}
/**
 * Specify the face to cull.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpucullmode
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
 * Stencil-buffer operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOpSeparate
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpustenciloperation
 */
export declare enum StencilOperation {
    /** keep the current stencil value */
    Keep,
    /** set the stencil value to zero */
    Zero,
    /** replace the stencil value with stencil reference value */
    Replace,
    /** perform a logical bitwise invert operation on the stencil value */
    Invert,
    /** increment the current stencil value, clamp to max */
    Increment,
    /** decrement the current stencil value, clamp to zero */
    Decrement,
    /** increment the current stencil value, with wrap-around */
    IncrementWrap,
    /** decrement the current stencil value, with wrap-around */
    DecrementWrap
}
/**
 * Alpha-blending factors.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpublendfactor
 */
export declare enum BlendFactor {
    /** blend factor of zero */
    Zero,
    /** blend factor of one */
    One,
    /** blend factor of source color */
    Src,
    /** blend factor of one minus source color */
    OneMinusSrc,
    /** blend factor of source alpha */
    SrcAlpha,
    /** blend factor of one minus source alpha */
    OneMinusSrcAlpha,
    /** blend factor of destination color */
    Dst,
    /** blend factor of one minus destination alpha */
    OneMinusDst,
    /** blend factor of destination alpha */
    DstAlpha,
    /** blend factor of one minus destination alpha */
    OneMinusDstAlpha,
    /** blend factor of the minimum of either source alpha or one minus destination alpha */
    SrcAlphaSaturated,
    /** blend factor of constant color */
    Constant,
    /** blend factor of one minus constant color */
    OneMinusConstant
}
/**
 * Blend operation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 * @see https://www.w3.org/TR/webgpu/#enumdef-gpublendoperation
 */
export declare enum BlendOperation {
    /** Add source and destination pixel values */
    Add,
    /** Subtract destination from source pixel values */
    Subtract,
    /** Subtract source from destination pixel values */
    ReverseSubtract,
    /** The minimum of the source and destination pixel values. */
    Min,
    /** The maximum of the source and destination pixel values. */
    Max
}
export declare enum VertexStepMode {
    /** Per vertex */
    Vertex = 0,
    /** Instanced */
    Instance = 1
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
export declare enum VertexFormat {
    UI8x2 = 274,
    UI8x4 = 276,
    I8x2 = 4370,
    I8x4 = 4372,
    UNORM8x2 = 8466,
    UNORM8x4 = 8468,
    SNORM8x2 = 12562,
    SNORM8x4 = 12564,
    UI16x2 = 290,
    UI16x4 = 292,
    I16x2 = 4386,
    I16x4 = 4388,
    UNORM16x2 = 8482,
    UNORM16x4 = 8484,
    SNORM16x2 = 12578,
    SNORM16x4 = 12580,
    F16x2 = 546,
    F16x4 = 548,
    F32 = 577,
    F32x2 = 578,
    F32x3 = 579,
    F32x4 = 580
}
/**
 * Binding type.
 */
export declare enum BindingType {
    /** Uniform buffer type */
    Buffer = 0,
    /** Sampler type */
    Sampler = 1,
    /** Texture type */
    Texture = 2
}
/**
 * Sampler binding type.
 */
export declare enum SamplerBindingType {
    Filtering = 0,
    NonFiltering = 1,
    Comparison = 2
}
/**
 * Texture sample type
 */
export declare enum TextureSampleType {
    Float = 0,
    Depth = 1,
    Int = 2,
    UInt = 3
}
/**
 * Cube map face.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export declare enum CubeMapFace {
    /** Positive X face */
    X = 0,
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
export declare enum MipmapHint {
    /** The most efficient option should be chosen. */
    Fast,
    /** The most correct, or highest quality, option should be chosen. */
    Nice
}
//# sourceMappingURL=type.d.ts.map