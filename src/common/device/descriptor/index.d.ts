import {
  AddressMode, BlendFactor, BlendOp, BufferType, ColorMask, CompareFunc, CullMode, FilterMode, FrontFace, IndexFormat,
  MinFilterMode, PixelFormat, PrimitiveType, StencilOp, TexType, UniformFormat, UniformType, Usage, VertexFormat
} from '../enums';
import { Buffer, Shader, Texture } from '../resources';
import { Float, FloatList, Int, ImageSource, ReadonlyColor } from '../types';

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
  size: Int;
}

/**
 * Readonly descriptor of a created Buffer. All properties are defined.
 */
export type BufferProperties = Readonly<Required<BufferDescriptor>>;

/**
 * Descriptor of a Texture.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gputexturedescriptor
 */
export interface TextureDescriptor {
  /** Textue type. Defaults to {@link TexType.Tex2D}. */
  type?: TexType;

  /** Pixel format of the texture. Defaults to {@link PixelFormat.RGBA8}. */
  format?: PixelFormat;

  /** Width of texture. Defaults to 1. */
  width?: Int;

  /** Height of texture. Defaults to 1. */
  height?: Int;

  /** Depth of texture. Defaults to 1. */
  depth?: Int;

  /** number of mipmap levels. Defaults to 1. */
  mipLevels?: Int;

  /** The number of samples for MSAA render targets. Defaults to 1. WebGL2 only. */
  samples?: Int;

  /**
   * Specifies if renderbuffer should be used for depth/stencil textures.
   * Defaults to false, which will use a depth texture.
   */
  renderTarget?: boolean;
}

/**
 * Readonly descriptor of a created texture. All properties are defined.
 */
 export type TextureProperties = Readonly<Required<TextureDescriptor>>;

/**
 * Descriptor of a texture sampler.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 * @see https://gpuweb.github.io/gpuweb/#GPUSamplerDescriptor
 */
export interface SamplerDescriptor {
  /** Texture address mode for texture width coordinates. Defaults to {@link AddressMode.Clamp} */
  wrapU?: AddressMode;

  /** Texture address mode for texture height coordinates. Defaults to {@link AddressMode.Clamp} */
  wrapV?: AddressMode;

  /** Texture address mode for texture depth coordinates. Defaults to {@link AddressMode.Clamp} */
  wrapW?: AddressMode;

  /** Texture filter mode for magnification. Defaults to {@link FilterMode.Nearest} */
  magFilter?: FilterMode;

  /** Texture filter mode for minimifaction. Defaults to {@link MinFilterMode.Nearest} */
  minFilter?: MinFilterMode;

  /** Minimum levels of detail. Defaults to -1000. WebGL2 only. */
  minLOD?: Float;

  /** Maximum levels of detail. Defaults to 1000. WebGL2 only. */
  maxLOD?: Float;

  /** Max anisotropy level. Defaults to 1. Requires EXT_texture_filter_anisotropic extension. */
  maxAniso?: Float;
}

/**
 * Readonly descriptor of a created texture sampler. All properties are defined.
 */
 export type SamplerProperties = Readonly<Required<SamplerDescriptor>>;

/**
 * Descriptor of a Render Pass.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpassdescriptor
 */
export interface RenderPassDescriptor {
  /** List of color attachments. If null or empty, defaults to render to screen. */
  color?: TextureView[];

  /** The depth/stencil attachment. Defaults to null. */
  depth?: TextureView | null;

  /**
   * The color load operation. Defaults to null, which does not clear the buffer.
   * If a color is specified, it represents the clear color.
   */
  clearColor?: ReadonlyColor | null;

  /**
   * The depth load operation. Defaults to NaN, which does not clear the buffer.
   * If a number is specified, it represents the clear value.
   */
  clearDepth?: Float;

  /**
   * The stencil load operation. Defaults to NaN, which does not clear the buffer.
   * If a number is specified, it represents the clear value.
   */
  clearStencil?: Float;
}

/**
 * Readonly descriptor of a created render pass. All properties are defined.
 */
 export interface RenderPassProperties {
  /** List of color attachments. */
  readonly color: readonly ReadonlyTextureView[];

  /** The depth/stencil attachment. */
  readonly depth: ReadonlyTextureView | null;

  /**
   * The color load operation.
   */
  readonly clearColor: ReadonlyColor | null;

  /**
   * The depth load operation. If NaN, does not clear the buffer.
   */
  readonly clearDepth: Float;

  /**
   * The stencil load operation. If NaN, which does not clear the buffer.
   */
  readonly clearStencil: Float;
 }

/**
 * Descriptor of a shader.
 * @see https://www.w3.org/TR/webgpu/#shader-module-creation
 */
export interface ShaderDescriptor {
  /** The shader type. */
  type: ShaderType;

  /** The shader source code. */
  source: string;
}

/**
 * Descriptor of Pipeline states.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpipelinedescriptor
 */
export interface PipelineState {
  /** The rasterization states. Defaults to empty. */
  raster?: RasterizationState;

  /** The depth states. Defaults to null, which disables depth test. */
  depth?: DepthState | null;

  /** The stencil states. Defaults to null, which disables stencil test. */
  stencil?: StencilState | null;

  /** The blend states. Defaults to null, which disables blending. */
  blend?: BlendState | null;
}

/**
 * Readonly descriptor of pipeline state. All properties are defined.
 */
export interface ReadonlyPipelineState {
  /** The rasterization states. */
  readonly raster: Readonly<Required<RasterizationState>>;

  /** The depth states. */
  readonly depth: Readonly<Required<DepthState>> | null;

  /** The stencil states. */
  readonly stencil: Readonly<Required<StencilState>> | null;

  /** The blend states. */
  readonly blend: Readonly<Required<BlendState>> | null;
}

/**
 * Descriptor of a GPU pipeline resource.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpipelinedescriptor
 */
export interface PipelineDescriptor extends PipelineState {
  /** The vertex shader. */
  vert: Shader;

  /** The fragment shader. */
  frag: Shader;

  /** The index format. Defaults to {@link IndexFormat.Uint16} */
  indexFormat?: IndexFormat;

  /** The primitive rendering mode. Defaults to {@link PrimitiveType.Triangles} */
  mode?: PrimitiveType;

  /** The vertex buffer layouts. */
  buffers: VertexBufferLayout[];

  /** The uniform layouts. Defaults to empty. */
  uniforms?: UniformLayout;
}

/**
 * Readonly descriptor of a created pipeline. All properties are defined.
 */
export interface PipelineProperties extends ReadonlyPipelineState {
  /** The vertex shader. */
  readonly vert: Shader;

  /** The fragment shader. */
  readonly frag: Shader;

  /** The index format. */
  readonly indexFormat: IndexFormat;

  /** The primitive rendering mode. */
  readonly mode: PrimitiveType;

  /** The vertex buffer layouts. */
  readonly buffers: readonly ReadonlyVertexBufferLayout[];

  /** The uniform layouts. Defaults to empty. */
  readonly uniforms: readonly Readonly<Required<UniformLayoutEntry>>[];
}

/**
 * Descriptor of vertex buffer layout.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpuvertexbufferlayoutdescriptor
 */
export interface VertexBufferLayout {
  /** The attribute descriptors */
  attrs: VertexAttribute[];

  /** Stride in bytes. Defaults to be auto calculated. */
  stride?: Int;

  /** Specify if this buffer's data is instanced. Defaults to false. */
  instanced?: boolean;
}

/**
 * Readonly descriptor of vertex buffer layout. All properties are defined.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpuvertexbufferlayoutdescriptor
 */
 export interface ReadonlyVertexBufferLayout {
  /** The attribute descriptors */
  readonly attrs: readonly ReadonlyVertexAttribute[];

  /** Stride in bytes. */
  stride: Int;

  /** Specify if this buffer's data is instanced. */
  instanced: boolean;
}

/**
 * Descriptor of vertex attributes.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpuvertexattributedescriptor
 */
export interface VertexAttribute {
  /** Attribute name. */
  name: string;

  /** Vertex format */
  format: VertexFormat;

  /** Shader location to bind to. Defaults to be auto calculated. */
  shaderLoc?: Int;

  /** Offset in buffer in bytes. Defaults to be auto calculated. */
  offset?: Int;
}

/**
 * Readonly descriptor of vertex attribute. All properties are defined.
 */
export type ReadonlyVertexAttribute = Readonly<Required<VertexAttribute>>;

/**
 * Descriptor of the rasterization state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurasterizationstatedescriptor
 */
export interface RasterizationState {
  /** The front face. Default to {@link FrontFace.CCW} */
  frontFace?: FrontFace;

  /** The face culling mode. Default to {@link CullMode.None} */
  cullMode?: CullMode;

  /** The depth bias aka polygonOffsetUnits. Defaults to 0. */
  depthBias?: Float;

  /** The depth bias slope scale aka polygonOffsetFactor. Defaults to 0. */
  depthBiasSlopeScale?: Float;

  /** Enables alpha to coverage mode. Defaults to false. */
  alphaToCoverage?: boolean;
}

/**
 * Descriptor of the depth state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpudepthstencilstatedescriptor
 */
export interface DepthState {
  /** Depth-writes enabled? Defaults to false */
  write: boolean;

  /** Depth-compare function. Defaults to {@link CompareFunc.Always} */
  compare?: CompareFunc;
}

/**
 * Descriptor of the stencil state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpudepthstencilstatedescriptor
 */
export interface StencilState {
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
  readMask?: Int;

  /** Stencil write mask. Defaults to 0xFF */
  writeMask?: Int;
}

/**
 * Descriptor of the blend state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpucolorstatedescriptor
 */
export interface BlendState {
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
 * Descriptor of the layout of a uniform.
 */
export interface UniformLayoutEntry {
  /** Uniform name. */
  // @ts-ignore: Valid in AssemblyScript
  name: string;

  /** Uniform type. Defaults to {@link UniformType.Value} */
  type?: UniformType;

  /** Texture type. Defaults to {@link TexType.Tex2D} */
  texType?: TexType;

  /** Uniform value format. Defaults to {@link UniformFormat.Float} */
  valueFormat?: UniformFormat;
}

/**
 * Descriptor of uniform layout.
 */
export type UniformLayout = UniformLayoutEntry[];

/**
* The uniform resource binding.
* @see https://gpuweb.github.io/gpuweb/#bind-group-creation
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindBufferRange
*/
export interface UniformBinding {
  /** Uniform name. */
  name: string;

  /** The uniform value to bind */
  value?: Float;

  /** The uniform array value to bind */
  values?: FloatList | null;

  /** The texture to bind */
  tex?: Texture | null;

  /** The uniform buffer to bind */
  buffer?: Buffer | null;

  /** The starting offset of the uniform buffer. Defaults to 0 */
  bufferOffset?: Int;

  /**
   * The byte size of data to read from the buffer.
   * Defaults to the range starting at offset and ending at the end of the buffer.
   */
  bufferSize?: Int;
}

/**
 * Descriptor of uniform bindings.
 */
export type UniformBindings = UniformBinding[];

/**
* Texture data type.
*/
export interface TextureData {
  /** Texture data buffer. */
  buffer?: ArrayBufferView | null;

  /** Array textures data buffer. */
  buffers?: ArrayBufferView[] | null;

  /** Texture image pointer. */
  image?: ImageSource;

  /** Array textures array image pointer. */
  images?: ImageSource[] | null;
}

/**
* The texture view for render pass attachment.
* @see https://gpuweb.github.io/gpuweb/#dictdef-gputextureviewdescriptor
*/
export interface TextureView {
  /** The texture to bind */
  tex: Texture;

  /** Rendering mip level. Defaults to 0 */
  mipLevel?: Int;

  /** Rendering texture slice. Defaults to 0 */
  slice?: Int;
}

/**
 * Readonly descriptor of a texture view. All proerties are defined.
 */
 export type ReadonlyTextureView = Readonly<Required<TextureView>>;
