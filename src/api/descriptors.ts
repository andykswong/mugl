import {
  AddressMode, BlendFactor, BlendOp, BufferType, ColorMask, CompareFunc, CullMode, FilterMode, FrontFace, IndexFormat,
  MinFilterMode, PixelFormat, PrimitiveType, StencilOp, TexType, UniformFormat, UniformType, Usage, VertexFormat
} from './enums';
import { Color, Extent2D, Extent3D, TextureView, UniformValue } from './types';

/**
 * Descriptor of a Buffer.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpubufferdescriptor
 */
export interface BufferDescriptor {
  /** The buffer type. Defaults to {@link BufferType.Vertex} */
  type?: BufferType;

  /** Buffer usage hint. Defaults to {@link Usage.Static} */
  usage?: Usage;

  /** Buffer size in bytes */
  size: number;
}

/**
 * Descriptor of a Texture.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gputexturedescriptor
 */
export interface TextureDescriptor {
  /** Textue type. Defaults to {@link TexType.Tex2D}. */
  type?: TexType;

  /** Pixel format of the texture. Defaults to {@link PixelFormat.RGBA8}. */
  format?: PixelFormat;

  /** Size of texture. */
  size: Readonly<Required<Extent2D> | Required<Extent3D>>;

  /** Number of mipmap levels. Defaults to 1. */
  mipLevels?: number;

  /** The number of samples for MSAA render targets. Defaults to 1. WebGL2 only. */
  samples?: number;

  /**
   * Specifies if renderbuffer should be used for depth/stencil textures. Defaults to true.
   * If set to false, depth texture will be used if available.
   */
  renderTarget?: boolean;
}

/**
 * Descriptor of a texture sampler.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 * @see https://gpuweb.github.io/gpuweb/#GPUSamplerDescriptor
 */
export interface SamplerDescriptor {
  /** Texture address mode for texture width coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  wrapU?: AddressMode;

  /** Texture address mode for texture height coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  wrapV?: AddressMode;

  /** Texture address mode for texture depth coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  wrapW?: AddressMode;

  /** Texture filter mode for magnification. Defaults to {@link FilterMode.Nearest} */
  magFilter?: FilterMode;

  /** Texture filter mode for minimifaction. Defaults to {@link MinFilterMode.Nearest} */
  minFilter?: MinFilterMode;

  /** Minimum levels of detail. Defaults to 0. WebGL2 only. */
  minLOD?: number;

  /** Maximum levels of detail. Defaults to Number.MAX_VALUE. WebGL2 only. */
  maxLOD?: number;

  /** Max anisotropy level. Defaults to 1. Requires EXT_texture_filter_anisotropic extension. */
  maxAniso?: number;
}

/**
 * Descriptor of a Render Pass.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpassdescriptor
 */
export interface RenderPassDescriptor {
  /** List of color attachments. If empty, defaults to render to screen. */
  color?: TextureView[];

  /** The depth/stencil attachment. */
  depth?: TextureView | null;

  /**
   * The color load operation. Defaults to false, which does not clear the buffer.
   * If a color is specified, it represents the clear color.
   */
  clearColor?: Color | false;

  /**
   * The depth load operation. Defaults to false, which does not clear the buffer.
   * If a number is specified, it represents the clear value.
   */
  clearDepth?: number | false;

  /**
   * The stencil load operation. Defaults to false, which does not clear the buffer.
   * If a number is specified, it represents the clear value.
   */
  clearStencil?: number | false;
}

/**
 * Descriptor of a GPU pipeline resource.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpipelinedescriptor
 */
export interface PipelineDescriptor extends PipelineStateDescriptor {
  /** The vertex shader source code */
  vert: string;

  /** The fragment shader source code */
  frag: string;

  /** The index format. Defaults to {@link IndexFormat.Uint16} */
  indexFormat?: IndexFormat;

  /** The primitive rendering mode. Defaults to {@link PrimitiveType.Triangles} */
  mode?: PrimitiveType;

  /** The vertex buffer layouts. */
  buffers: VertexBufferLayoutDescriptor[];

  /** The uniform layouts. */
  uniforms?: UniformLayoutDescriptor;
}

/**
 * Descriptor of vertex buffer layout.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpuvertexbufferlayoutdescriptor
 */
export interface VertexBufferLayoutDescriptor {
  /** The attribute descriptors */
  attrs: VertexAttributeDescriptor[];

  /** Stride in bytes. Defaults to be auto calculated. */
  stride?: number;

  /** Specify if this buffer's data is instanced. Defaults to false. */
  instanced?: boolean;
}

/**
 * Descriptor of vertex attributes.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpuvertexattributedescriptor
 */
export interface VertexAttributeDescriptor {
  /** Vertex format */
  format: VertexFormat;

  /** Attribute name. */
  name: string;

  /** Shader location to bind to. Defaults to be auto calculated. */
  shaderLoc?: number;

  /** Offset in buffer in bytes. Defaults to be auto calculated. */
  offset?: number;
}

/**
 * Descriptor of Pipeline states.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpipelinedescriptor
 */
export interface PipelineStateDescriptor {
  /** The rasterization states. Defaults to empty. */
  raster?: RasterizationStateDescriptor;

  /** The depth states. Defaults to false, which disables depth test. */
  depth?: DepthStateDescriptor | false;

  /** The stencil states. Defaults to false, which disables stencil test. */
  stencil?: StencilStateDescriptor | false;

  /** The blend states. Defaults to false, which disables blending. */
  blend?: BlendStateDescriptor | false;
}

/**
 * Descriptor of the rasterization state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurasterizationstatedescriptor
 */
export interface RasterizationStateDescriptor {
  /** The front face. Default to {@link FrontFace.CCW} */
  frontFace?: FrontFace;

  /** The face culling mode. Default to {@link CullMode.None} */
  cullMode?: CullMode;

  /** The depth bias aka polygonOffsetUnits. Defaults to 0. */
  depthBias?: number;

  /** The depth bias slope scale aka polygonOffsetFactor. Defaults to 0. */
  depthBiasSlopeScale?: number;

  /** Enables alpha to coverage mode. Defaults to false. */
  alphaToCoverage?: boolean;
}

/**
 * Descriptor of the depth state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpudepthstencilstatedescriptor
 */
export interface DepthStateDescriptor {
  /** Depth-writes enabled? Defaults to false */
  writeEnabled?: boolean;

  /** Depth-compare function. Defaults to {@link CompareFunc.Always} */
  compare?: CompareFunc;
}

/**
 * Descriptor of the stencil state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpudepthstencilstatedescriptor
 */
export interface StencilStateDescriptor {
  /** Front stencil compare function. Defaults to {@link CompareFunc.Always} */
  frontCompare?: CompareFunc;

  /** Front stencil fail operation. Defaults to {@link StencilOp.Keep} */
  frontFailOp?: StencilOp;

  /** Front stencil depth fail operation. Defaults to {@link StencilOp.Keep} */
  frontZFailOp?: StencilOp;

  /** Front stencil pass operation. Defaults to {@link StencilOp.Keep} */
  frontPassOp?: StencilOp;

  /** Back stencil compare function. Defaults to {@link CompareFunc.Always} */
  backCompare?: CompareFunc;

  /** Back stencil fail operation. Defaults to {@link StencilOp.Keep} */
  backFailOp?: StencilOp;

  /** Back stencil depth fail operation. Defaults to {@link StencilOp.Keep} */
  backZFailOp?: StencilOp;

  /** Back stencil pass operation. Defaults to {@link StencilOp.Keep} */
  backPassOp?: StencilOp;

  /** Stencil read mask. Defaults to 0xFF */
  readMask?: number;

  /** Stencil write mask. Defaults to 0xFF */
  writeMask?: number;
}

/**
 * Descriptor of the blend state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpucolorstatedescriptor
 */
export interface BlendStateDescriptor {
  /** Blend source factor for RGB color. Defaults to {@link BlendFactor.One} */
  srcFactorRGB?: BlendFactor;

  /** Blend destination factor for RGB color. Defaults to {@link BlendFactor.Zero} */
  dstFactorRGB?: BlendFactor;

  /** Blend operation for alpha channel. Defaults to {@link BlendOp.Add} */
  opRGB?: BlendOp;

  /** Blend source factor for alpha channel. Defaults to {@link BlendFactor.One} */
  srcFactorAlpha?: BlendFactor;

  /** Blend destination factor for alpha channel. Defaults to {@link BlendFactor.Zero} */
  dstFactorAlpha?: BlendFactor;

  /** Blend operation for alpha channel. Defaults to {@link BlendOp.Add} */
  opAlpha?: BlendOp;

  /** Color-channels to write. Defaults to {@link ColorMask.All} */
  colorMask?: ColorMask;
}

/**
 * Descriptor of a uniform texture.
 */
 export type UniformTexDescriptor = {
  /** Uniform type */
  type: typeof UniformType.Tex;

  /** Texture type */
  format: TexType;
}

/**
 * Descriptor of a uniform value.
 */
export type UniformValueDescriptor = {
  /** Uniform type */
  type: typeof UniformType.Value;

  /** Uniform value format */
  format: UniformFormat;
}

/**
 * Descriptor of uniform layout.
 */
export type UniformLayoutDescriptor = {
  [name: string]: UniformTexDescriptor | UniformValueDescriptor;
}

/**
 * Descriptor of uniform name and values.
 */
export type UniformValuesDescriptor = {
  [name: string]: UniformValue;
}
