import { Float, Int, Vec } from 'munum';
import {
  AddressMode, BlendFactor, BlendOp, BufferType, ColorMask, CompareFunc, CullMode, FilterMode, FrontFace, IndexFormat,
  MinFilterMode, PixelFormat, PrimitiveType, ShaderType, StencilOp, TexType, UniformFormat, UniformType, Usage, VertexFormat
} from '../enums';
import { Color } from '../types';
import { Buffer, Shader, Texture } from '../resources';

/**
 * Texture image source pointer.
 */
export type TexImageSource = Int;

/**
 * Descriptor of a Buffer.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpubufferdescriptor
 */
export class BufferDescriptor {
  /** The buffer type. Defaults to {@link BufferType.Vertex} */
  type: BufferType = BufferType.Vertex;

  /** Buffer usage hint. Defaults to {@link Usage.Static} */
  usage: Usage = Usage.Static;

  /** Buffer size in bytes */
  // @ts-ignore: Valid in AssemblyScript
  size: Int;
}

export type BufferProperties = BufferDescriptor;

/**
 * Descriptor of a Texture.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gputexturedescriptor
 */
export class TextureDescriptor {
  /** Textue type. Defaults to {@link TexType.Tex2D}. */
  type: TexType = TexType.Tex2D;

  /** Pixel format of the texture. Defaults to {@link PixelFormat.RGBA8}. */
  format: PixelFormat = PixelFormat.RGBA8;

  /** Width of texture. */
  width: Int = 1;

  /** Height of texture. */
  height: Int = 1;

  /** Depth of texture. */
  depth: Int = 1;

  /** Float of mipmap levels. Defaults to 1. */
  mipLevels: Int = 1;

  /** The Float of samples for MSAA render targets. Defaults to 1. WebGL2 only. */
  samples: Int = 1;

  /**
   * Specifies if renderbuffer should be used for depth/stencil textures. Defaults to true.
   * If set to false, depth texture will be used if available.
   */
  renderTarget: boolean = true;
}

/**
 * Descriptor of a texture sampler.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 * @see https://gpuweb.github.io/gpuweb/#GPUSamplerDescriptor
 */
export class SamplerDescriptor {
  /** Texture address mode for texture width coordinates. Defaults to {@link AddressMode.Clamp} */
  wrapU: AddressMode = AddressMode.Clamp;

  /** Texture address mode for texture height coordinates. Defaults to {@link AddressMode.Clamp} */
  wrapV: AddressMode = AddressMode.Clamp;

  /** Texture address mode for texture depth coordinates. Defaults to {@link AddressMode.Clamp} */
  wrapW: AddressMode = AddressMode.Clamp;

  /** Texture filter mode for magnification. Defaults to {@link FilterMode.Nearest} */
  magFilter: FilterMode = FilterMode.Nearest;

  /** Texture filter mode for minimifaction. Defaults to {@link MinFilterMode.Nearest} */
  minFilter: MinFilterMode = MinFilterMode.Nearest;

  /** Minimum levels of detail. Defaults to 0. WebGL2 only. */
  minLOD: Float = 0;

  /** Maximum levels of detail. Defaults to Number.MAX_VALUE. WebGL2 only. */
  maxLOD: Float = f32.MAX_VALUE;

  /** Max anisotropy level. Defaults to 1. Requires EXT_texture_filter_anisotropic extension. */
  maxAniso: Float = 1;
}

/**
 * Descriptor of a Render Pass.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpassdescriptor
 */
export class RenderPassDescriptor {
  /** List of color attachments. If null, defaults to render to screen. */
  color: TextureView[] | null = null;

  /** The depth/stencil attachment. Defaults to null. */
  depth: TextureView | null = null;

  /**
   * The color load operation. Defaults to null, which does not clear the buffer.
   * If a color is specified, it represents the clear color.
   */
  clearColor: Color | null = null;

  /**
   * The depth load operation. Defaults to NaN, which does not clear the buffer.
   * If a number is specified, it represents the clear value.
   */
  clearDepth: Float = NaN;

  /**
   * The stencil load operation. Defaults to NaN, which does not clear the buffer.
   * If a number is specified, it represents the clear value.
   */
  clearStencil: Float = NaN;
}

/**
 * Descriptor of a shader.
 * @see https://www.w3.org/TR/webgpu/#shader-module-creation
 */
export class ShaderDescriptor {
  /** The shader type. */
  // @ts-ignore: Valid in AssemblyScript
  type: ShaderType;

  /** The shader source code. */
  // @ts-ignore: Valid in AssemblyScript
  source: string | null;
}

/**
 * Descriptor of Pipeline states.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpipelinedescriptor
 */
export class PipelineState {
  /** The rasterization states. Defaults to empty. */
  raster: RasterizationState | null = null;

  /** The depth states. Defaults to null, which disables depth test. */
  depth: DepthState | null = null;

  /** The stencil states. Defaults to null, which disables stencil test. */
  stencil: StencilState | null = null;

  /** The blend states. Defaults to null, which disables blending. */
  blend: BlendState | null = null;
}

/**
 * Descriptor of a GPU pipeline resource.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpipelinedescriptor
 */
export class PipelineDescriptor extends PipelineState {
  /** The vertex shader source code */
  // @ts-ignore: Valid in AssemblyScript
  vert: Shader | null;

  /** The fragment shader source code */
  // @ts-ignore: Valid in AssemblyScript
  frag: Shader | null;

  /** The index format. Defaults to {@link IndexFormat.Uint16} */
  indexFormat: IndexFormat = IndexFormat.UInt16;

  /** The primitive rendering mode. Defaults to {@link PrimitiveType.Tri} */
  mode: PrimitiveType = PrimitiveType.Tri;

  /** The vertex buffer layouts. */
  // @ts-ignore: Valid in AssemblyScript
  buffers: VertexBufferLayout[] | null;

  /** The uniform layouts. */
  uniforms: UniformLayout | null = null;
}

/**
 * Descriptor of vertex buffer layout.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpuvertexbufferlayoutdescriptor
 */
export class VertexBufferLayout {
  /** The attribute descriptors */
  // @ts-ignore: Valid in AssemblyScript
  attrs: VertexAttribute[] | null;

  /** Stride in bytes. Defaults to be auto calculated. */
  stride: Int = 0;

  /** Specify if this buffer's data is instanced. Defaults to false. */
  instanced: boolean = false;
}

/**
 * Descriptor of vertex attributes.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpuvertexattributedescriptor
 */
export class VertexAttribute {
  /** Attribute name. */
  // @ts-ignore: Valid in AssemblyScript
  name: string | null;

  /** Vertex format */
  // @ts-ignore: Valid in AssemblyScript
  format: VertexFormat;

  /** Shader location to bind to. Defaults to be auto calculated. */
  shaderLoc: Int = 0;

  /** Offset in buffer in bytes. Defaults to be auto calculated. */
  offset: Int = 0;
}

/**
 * Descriptor of the rasterization state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurasterizationstatedescriptor
 */
export class RasterizationState {
  /** The front face. Default to {@link FrontFace.CCW} */
  frontFace: FrontFace = FrontFace.CCW;

  /** The face culling mode. Default to {@link CullMode.None} */
  cullMode: CullMode = CullMode.None;

  /** The depth bias aka polygonOffsetUnits. Defaults to 0. */
  depthBias: Float = 0;

  /** The depth bias slope scale aka polygonOffsetFactor. Defaults to 0. */
  depthBiasSlopeScale: Float = 0;

  /** Enables alpha to coverage mode. Defaults to false. */
  alphaToCoverage: boolean = false;
}

/**
 * Descriptor of the depth state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpudepthstencilstatedescriptor
 */
export class DepthState {
  /** Depth-writes enabled. Defaults to false */
  write: boolean = false;

  /** Depth-compare function. Defaults to {@link CompareFunc.Always} */
  compare: CompareFunc = CompareFunc.Always;
}

/**
 * Descriptor of the stencil state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpudepthstencilstatedescriptor
 */
export class StencilState {
  /** Front stencil compare function. Defaults to {@link CompareFunc.Always} */
  frontCompare: CompareFunc = CompareFunc.Always;

  /** Front stencil fail operation. Defaults to {@link StencilOp.Keep} */
  frontFailOp: StencilOp = StencilOp.Keep;

  /** Front stencil depth fail operation. Defaults to {@link StencilOp.Keep} */
  frontZFailOp: StencilOp = StencilOp.Keep;

  /** Front stencil pass operation. Defaults to {@link StencilOp.Keep} */
  frontPassOp: StencilOp = StencilOp.Keep;

  /** Back stencil compare function. Defaults to {@link CompareFunc.Always} */
  backCompare: CompareFunc = CompareFunc.Always;

  /** Back stencil fail operation. Defaults to {@link StencilOp.Keep} */
  backFailOp: StencilOp = StencilOp.Keep;

  /** Back stencil depth fail operation. Defaults to {@link StencilOp.Keep} */
  backZFailOp: StencilOp = StencilOp.Keep;

  /** Back stencil pass operation. Defaults to {@link StencilOp.Keep} */
  backPassOp: StencilOp = StencilOp.Keep;

  /** Stencil read mask. Defaults to 0xFF */
  readMask: Int = 0xFF;

  /** Stencil write mask. Defaults to 0xFF */
  writeMask: Int = 0xFF;
}

/**
 * Descriptor of the blend state.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpucolorstatedescriptor
 */
export class BlendState {
  /** Blend source factor for RGB color. Defaults to {@link BlendFactor.One} */
  srcFactorRGB: BlendFactor = BlendFactor.One;

  /** Blend destination factor for RGB color. Defaults to {@link BlendFactor.Zero} */
  dstFactorRGB: BlendFactor = BlendFactor.Zero;

  /** Blend operation for alpha channel. Defaults to {@link BlendOp.Add} */
  opRGB: BlendOp = BlendOp.Add;

  /** Blend source factor for alpha channel. Defaults to {@link BlendFactor.One} */
  srcFactorAlpha: BlendFactor = BlendFactor.One;

  /** Blend destination factor for alpha channel. Defaults to {@link BlendFactor.Zero} */
  dstFactorAlpha: BlendFactor = BlendFactor.Zero;

  /** Blend operation for alpha channel. Defaults to {@link BlendOp.Add} */
  opAlpha: BlendOp = BlendOp.Add;

  /** Color-channels to write. Defaults to {@link ColorMask.All} */
  colorMask: ColorMask = ColorMask.All;
}

/**
 * Descriptor of the layout of a uniform.
 */
export class UniformLayoutEntry {
  /** Uniform name. */
  // @ts-ignore: Valid in AssemblyScript
  name: string | null;

  /** Uniform type. Defaults to {@link UniformType.Value} */
  type: UniformType = UniformType.Value;

  /** Texture type. Defaults to {@link TexType.Tex2D} */
  texType: TexType = TexType.Tex2D;

  /** Uniform value format. Defaults to {@link UniformFormat.Float} */
  valueFormat: UniformFormat = UniformFormat.Float;
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
export class UniformBinding {
  /** Uniform name. */
  // @ts-ignore: Valid in AssemblyScript
  name: string | null;

  /** The uniform value to bind */
  value: Float = 0;

  /** The uniform array value to bind */
  values: Vec | null = null;

  /** The texture to bind */
  tex: Texture | null = null;

  /** The uniform buffer to bind */
  buffer: Buffer | null = null;

  /** The starting offset of the uniform buffer. Defaults to 0 */
  bufferOffset: Int = 0;

  /**
   * The byte size of data to read from the buffer.
   * Defaults to the range starting at offset and ending at the end of the buffer.
   */
  bufferSize: Int = 0;
}

/**
 * Descriptor of uniform bindings.
 */
export type UniformBindings = UniformBinding[];

/**
* Texture data type.
*/
export class TextureData {
  /** Texture data buffer. */
  buffer: ArrayBufferView | null = null;

  /** Texture array data buffer. */
  buffers: ArrayBufferView[] | null = null;

  /** Texture image pointer. */
  image: TexImageSource = 0;

  /** Texture array image pointer. */
  images: TexImageSource[] | null = null;
}

/**
* The texture view for render pass attachment.
* @see https://gpuweb.github.io/gpuweb/#dictdef-gputextureviewdescriptor
*/
export class TextureView {
  /** The texture to bind */
  // @ts-ignore: Valid in AssemblyScript
  tex: Texture | null;

  /** Rendering mip level. Defaults to 0 */
  mipLevel: Int = 0;

  /** Rendering texture slice. Defaults to 0 */
  slice: Int = 0;
}
