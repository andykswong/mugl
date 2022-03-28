import {
  Color, Extent3D, Float, ImageSource, Origin2D, Origin3D, UInt,
} from './primitive';
import {
  AddressMode, BindingType, BlendFactor, BlendOperation, BufferUsage, ColorWrite, CompareFunction, CullMode,
  FilterMode, FrontFace, IndexFormat, PrimitiveTopology, SamplerBindingType, ShaderStage, StencilOperation,
  TextureDimension, TextureFormat, TextureSampleType, TextureUsage, VertexFormat, VertexStepMode
} from './type';
import { BindGroupLayout, Buffer, Sampler, Shader, Texture } from './resource';

/**
 * Descriptor of a Buffer.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 * @see https://www.w3.org/TR/webgpu/#GPUBufferDescriptor
 */
export class BufferDescriptor {
  /** Buffer size in bytes */
  size: UInt = 0;

  /** Buffer usage */
  usage: BufferUsage = BufferUsage.Vertex;
}

/**
 * Descriptor of a Texture.
 * @see https://www.w3.org/TR/webgpu/#texture-creation
 */
export class TextureDescriptor {
  /** Size of texture. Defaults to [1, 1, 1]. */
  size: Extent3D = [1, 1, 1];

  /** The number of mipmap levels. Defaults to 1. */
  mipLevelCount: UInt = 1;

  /** The number of samples for MSAA render targets. Defaults to 1. */
  sampleCount: UInt = 1;

  /** Textue dimension. Defaults to {@link TextureDimension.D2}. */
  dimension: TextureDimension = TextureDimension.D2;

  /** Format of the texture. Defaults to {@link TextureFormat.RGBA8}. */
  format: TextureFormat = TextureFormat.RGBA8;

  /** Specifies the usage of the texture. Defaults to {@link TextureUsage.TextureBinding}. */
  usage: TextureUsage = TextureUsage.TextureBinding;
}

/**
* The texture view for render pass attachment.
* @see https://www.w3.org/TR/webgpu/#texture-view-creation
*/
export class TextureView {
  /** The texture to bind */
  texture!: Texture;

  /** Rendering mip level. Defaults to 0 */
  mipLevel: UInt = 0;

  /** Rendering texture slice. Defaults to 0 */
  slice: UInt = 0;
}

/**
* Defines the texture with origin offset for a texture write operation.
* @see https://www.w3.org/TR/webgpu/#dictdef-gpuimagecopytexture
*/
export class ImageCopyTexture {
  /** The texture to write to. */
  texture!: Texture;

  /** The texture mip level to write to. Defaults to 0 */
  mipLevel: UInt = 0;

  /** The origin offset of the texture for a write operation. Defaults to [0, 0, 0].  */
  origin: Origin3D = [0, 0, 0];
}

/**
* Defines the source image with origin offset to be copied into a texture.
* @see https://www.w3.org/TR/webgpu/#dictdef-gpuimagecopyexternalimage
*/
export class ImageCopyExternalImage {
  /** The source image. */
  src!: ImageSource;

  /** The origin offset of the image. Defaults to [0, 0].  */
  origin: Origin2D = [0, 0];
}

/**
* Defines the layout of a texture image buffer data for a texture write.
* @see https://www.w3.org/TR/webgpu/#dictdef-gpuimagedatalayout
*/
export class ImageDataLayout {
  /** The data offset in bytes. */
  offset: UInt = 0;

  /** The stride in bytes between the beginning of each block row and the subsequent block row. */
  bytesPerRow: UInt = 0;

  /**
   * Number of block rows per single image slice of the texture.
   * rowsPerImage × pixelsPerRow is the stride between image slices. Required only for depth > 1. Defaults to 0.
   */
  rowsPerImage: UInt = 0;
}

/**
 * Descriptor of a texture sampler.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 * @see https://www.w3.org/TR/webgpu/#sampler-creation
 */
export class SamplerDescriptor {
  /** Texture address mode for texture width coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  addressModeU: AddressMode = AddressMode.ClampToEdge;

  /** Texture address mode for texture height coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  addressModeV: AddressMode = AddressMode.ClampToEdge;

  /** Texture address mode for texture depth coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  addressModeW: AddressMode = AddressMode.ClampToEdge;

  /** Texture filter mode for magnification. Defaults to {@link FilterMode.Nearest} */
  magFilter: FilterMode = FilterMode.Nearest;

  /** Texture filter mode for minimifaction. Defaults to {@link FilterMode.Nearest} */
  minFilter: FilterMode = FilterMode.Nearest;

  /** Texture filter mode for sampling between two mipmap levels. Defaults to {@link FilterMode.Nearest} */
  mipmapFilter: FilterMode = FilterMode.Nearest;

  /** Minimum levels of detail. Defaults to 0. */
  lodMinClamp: Float = 0;

  /** Maximum levels of detail. Defaults to 32. */
  lodMaxClamp: Float = 32;

  /** Specifies the behavior of a comparison sampler. Defaults to null. */
  compare: CompareFunction = 0;

  /** Max anisotropy level. Defaults to 1. Requires EXT_texture_filter_anisotropic extension. */
  maxAnisotropy: UInt = 1;
}

/**
 * Descriptor of a shader.
 * @see https://www.w3.org/TR/webgpu/#shader-module-creation
 */
export class ShaderDescriptor {
  /** The shader source code. */
  code: string = '';

  /** The stage of the shader. */
  usage: ShaderStage = ShaderStage.Vertex;
}

/**
 * Descriptor of render pipeline states.
 * @see https://www.w3.org/TR/webgpu/#render-pipeline-creation
 */
export class RenderPipelineState {
  /** The color target states. Defaults to null, which disables blending. */
  targets: ColorTargetStates | null = null;

  /** The primitive states. Defaults to empty. */
  primitive: PrimitiveState = {} as PrimitiveState;

  /** The depth stencil states. Defaults to null, which disables depth/stencil test. */
  depthStencil: DepthStencilState | null = null;

  /** The multisample states. Defaults to empty. */
  multisample: MultisampleState = {} as MultisampleState;
}

/**
 * Descriptor of a GPU render pipeline resource.
 * @see https://www.w3.org/TR/webgpu/#render-pipeline-creation
 */
export class RenderPipelineDescriptor extends RenderPipelineState {
  /** The vertex shader. */
  vertex!: Shader;

  /** The fragment shader. */
  fragment!: Shader;

  /** The vertex buffer layouts. */
  buffers: VertexBufferLayout[] = [];

  /** The bind group layouts. Defaults to empty. */
  bindGroups: BindGroupLayout[] = [];
}

/**
 * Descriptor of render pipeline mutlisample state.
 * @see https://www.w3.org/TR/webgpu/#multisample-state
 */
export class MultisampleState {
  /** The number of samples for MSAA render targets. Defaults to 1. */
  sampleCount: UInt = 1;

  /** Enables alpha to coverage mode. Defaults to false. */
  alphaToCoverage: boolean = false;
}

/**
 * Descriptor of the primitive state of a render pipeline.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpuprimitivestate
 */
export class PrimitiveState {
  /** The primitive topology. Defaults to {@link PrimitiveTopology.Triangles} */
  topology: PrimitiveTopology = PrimitiveTopology.Triangles;

  /** The index format. Defaults to {@link IndexFormat.UInt16} */
  indexFormat: IndexFormat = IndexFormat.UInt16;

  /** The front face. Default to {@link FrontFace.CCW} */
  frontFace: FrontFace = FrontFace.CCW;

  /** The face culling mode. Default to {@link CullMode.None} */
  cullMode: CullMode = CullMode.None;
}

/**
 * Descriptor of vertex buffer layout.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpuvertexbufferlayout
 */
export class VertexBufferLayout {
  /** The attribute descriptors */
  attributes: VertexAttribute[] = [];

  /** Stride in bytes. */
  stride: UInt = 0;

  /** Specify if this buffer's data is instanced. Defaults to {@link VertexStepMode.Vertex}. */
  stepMode: VertexStepMode = VertexStepMode.Vertex;
}

/**
 * Descriptor of vertex buffer attribute formats.
 */
export class VertexBufferFormats {
  /** The vertex attribute format. */
  attributes: VertexFormat[] = [];

  /** Specify if this buffer's data is instanced. Defaults to false. */
  instanced: bool = false;
}

/**
 * Descriptor of vertex attributes.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpuvertexbufferlayout
 */
export class VertexAttribute {
  /** Vertex format */
  format: VertexFormat = VertexFormat.F32x3;

  /** Offset in buffer in bytes. */
  offset: UInt = 0;

  /** Shader location to bind to. */
  shaderLocation: UInt = 0;
}

/**
 * Descriptor of the depth stencil state.
 * @see https://www.w3.org/TR/webgpu/#depth-stencil-state
 */
export class DepthStencilState {
  /** The depth-stencil format. Defaults to {@link TextureFormat.Depth16} */
  format: TextureFormat = TextureFormat.Depth16;

  /** Depth-writes enabled? Defaults to false */
  depthWrite: boolean = false;

  /** Depth-compare function. Defaults to {@link CompareFunction.Always} */
  depthCompare: CompareFunction = CompareFunction.Always;

  /** Stencil front face state. */
  stencilFront: StencilFaceState = {} as StencilFaceState;

  /** Stencil back face state. */
  stencilBack: StencilFaceState = {} as StencilFaceState;

  /** Stencil read mask. Defaults to 0xFFFFFFFF */
  stencilReadMask: UInt = 0xFFFFFFFF;

  /** Stencil write mask. Defaults to 0xFFFFFFFF */
  stencilWriteMask: UInt = 0xFFFFFFFF;

  /** The depth bias aka polygonOffsetUnits. Defaults to 0. */
  depthBias: Float = 0;

  /** The depth bias slope scale aka polygonOffsetFactor. Defaults to 0. */
  depthBiasSlopeScale: Float = 0;

  /** The depth bias clamp value. Defaults to 0. */
  depthBiasClamp: Float = 0;
}

/**
 * Descriptor of the stencil face state.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpudepthstencilstate
 */
export class StencilFaceState {
  /** Stencil compare function. Defaults to {@link CompareFunction.Always} */
  compare: CompareFunction = CompareFunction.Always;

  /** Stencil fail operation. Defaults to {@link StencilOperation.Keep} */
  failOp: StencilOperation = StencilOperation.Keep;

  /** Stencil depth fail operation. Defaults to {@link StencilOperation.Keep} */
  depthFailOp: StencilOperation = StencilOperation.Keep;

  /** Stencil pass operation. Defaults to {@link StencilOperation.Keep} */
  passOp: StencilOperation = StencilOperation.Keep;
}

/**
 * Descriptor of the color target states.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpucolortargetstate
 */
export class ColorTargetStates {
  /** The render targets for offscreen pass. Defaults to null. */
  targets: ColorTargetState[] | null = null;

  /** Color-channels to write. Defaults to {@link ColorWrite.All} */
  writeMask: ColorWrite = ColorWrite.All;

  /** Blend component for RGB color. */
  blendColor: BlendComponent = {} as BlendComponent;

  /** Blend component for RGB color. */
  blendAlpha: BlendComponent = {} as BlendComponent;
}

/**
 * Descriptor of the color states of a target.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpucolortargetstate
 */
export class ColorTargetState {
  /** The texture format for this render target. */
  format: TextureFormat = TextureFormat.RGBA8;

  /** Color-channels to write. Defaults to {@link ColorWrite.All} */
  writeMask: ColorWrite = ColorWrite.All;

  /** Blend component for RGB color. */
  blendColor: BlendComponent = {} as BlendComponent;

  /** Blend component for RGB color. */
  blendAlpha: BlendComponent = {} as BlendComponent;
}

/**
 * Descriptor of the blend component state of a color target.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpublendcomponent
 */
export class BlendComponent {
  /** Blend operation. Defaults to {@link BlendOperation.Add} */
  operation: BlendOperation = BlendOperation.Add;

  /** Blend source factor. Defaults to {@link BlendFactor.One} */
  srcFactor: BlendFactor = BlendFactor.One;

  /** Blend destination factor. Defaults to {@link BlendFactor.Zero} */
  dstFactor: BlendFactor = BlendFactor.Zero;
}

/**
 * Descriptor of a default Render Pass.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpurenderpassdescriptor
 */
export class DefaultRenderPassDescriptor {
  /**
   * The color load operation. Only applicale to a default pass. Defaults to null, which does not clear the buffers.
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
 * Descriptor of a Render Pass.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpurenderpassdescriptor
 */
export class RenderPassDescriptor extends DefaultRenderPassDescriptor {
  /** List of color attachments. If null or empty, defaults to render to screen. */
  colors: ColorAttachment[] | null = null;

  /** The depth/stencil attachment. Defaults to null. */
  depthStencil: TextureView | null = null;
}

/**
 * Descriptor of a color attachment in a render pass.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpurenderpassdescriptor
 */
export class ColorAttachment {
  /** The color attachment. */
  view!: TextureView;

  /**
   * The color load operation for this attachment. Defaults to null, which does not clear the buffers.
   * If a color is specified, it represents the clear color.
   */
  clear: Color | null = null;
}

/**
 * Descriptor of a bind group layout object.
 */
export class BindGroupLayoutDescriptor {
  /** The layouts of entries of a bind group. */
  entries: BindGroupLayoutEntry[] = [];
}

/**
 * Descriptor of a bind group layout entry.
 */
export class BindGroupLayoutEntry {
  /** Bind group entry name. */
  label: string = '';

  /** The type of binding. */
  type: BindingType = BindingType.Buffer;

  /** Binding location. Defaults to the position of the entry. */
  binding: UInt = 0;

  /** The stages that this resource is visible. Defaults to {@link ShaderStage.Vertex} | {@link ShaderStage.Fragment} */
  visibility: ShaderStage = ShaderStage.Vertex | ShaderStage.Fragment;

  /** Whether buffer has dynamic offset. Defaults to false. */
  bufferDynamicOffset: boolean = false;

  /** Type of sampler. Not used currently */
  samplerType: SamplerBindingType = SamplerBindingType.Filtering;

  /** Type of texture sample. Not used currently */
  textureSampleType: TextureSampleType = TextureSampleType.Float;

  /** Dimension of texture. Defaults to {@link TextureDimension.D2}. */
  textureDimension: TextureDimension = TextureDimension.D2;

  /** Whether texture is multisampled. Defaults to false. */
  textureMultisampled: bool = false;
}

/**
 * Descriptor of a bind group object.
 */
export class BindGroupDescriptor {
  /** Layout of the bind group */
  layout!: BindGroupLayout;

  /** The entries of a bind group. */
  entries: BindGroupEntry[] = [];
}

/**
* A resource binding.
* @see https://www.w3.org/TR/webgpu/#bind-group-creation
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindBufferRange
*/
export class BindGroupEntry {
  /** Uniform binding location. Defaults to the position of the entry. */
  binding: UInt = 0;

  /** The texture to bind */
  texture: Texture | null = null;

  /** The texture sampler to bind */
  sampler: Sampler | null = null;

  /** The buffer to bind */
  buffer: Buffer | null = null;

  /** The starting offset of the buffer. Defaults to 0 */
  bufferOffset: UInt = 0;

  /**
   * The byte size of data to read from the buffer.
   * Defaults to the range starting at offset and ending at the end of the buffer.
   */
  bufferSize: UInt = 0;
}
