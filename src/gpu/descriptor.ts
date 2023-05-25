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
export interface BufferDescriptor {
  /** Buffer size in bytes */
  size: UInt;

  /** Buffer usage */
  usage: BufferUsage;
}

/**
 * Descriptor of a Texture.
 * @see https://www.w3.org/TR/webgpu/#texture-creation
 */
export interface TextureDescriptor {
  /** Size of texture. Defaults to [1, 1, 1]. */
  size?: Extent3D;

  /** The number of mipmap levels. Defaults to 1. */
  mipLevelCount?: UInt;

  /** The number of samples for MSAA render targets. Defaults to 1. */
  sampleCount?: UInt;

  /** Textue dimension. Defaults to {@link TextureDimension.D2}. */
  dimension?: TextureDimension;

  /** Format of the texture. Defaults to {@link TextureFormat.RGBA8}. */
  format?: TextureFormat;

  /** Specifies the usage of the texture. Defaults to {@link TextureUsage.TextureBinding}. */
  usage?: TextureUsage;
}

/**
* The texture view for render pass attachment.
* @see https://www.w3.org/TR/webgpu/#texture-view-creation
*/
export interface TextureView {
  /** The texture to bind */
  texture: Texture;

  /** Rendering mip level. Defaults to 0 */
  mipLevel?: UInt;

  /** Rendering texture slice. Defaults to 0 */
  slice?: UInt;
}

/**
* Defines the texture with origin offset for a texture write operation.
* @see https://www.w3.org/TR/webgpu/#dictdef-gpuimagecopytexture
*/
export interface ImageCopyTexture {
  /** The texture to write to. */
  texture: Texture;

  /** The texture mip level to write to. Defaults to 0 */
  mipLevel?: UInt;

  /** The origin offset of the texture for a write operation. Defaults to [0, 0, 0].  */
  origin?: Origin3D;
}

/**
* Defines the source image with origin offset to be copied into a texture.
* @see https://www.w3.org/TR/webgpu/#dictdef-gpuimagecopyexternalimage
*/
export interface ImageCopyExternalImage {
  /** The source image. */
  src: ImageSource;

  /** The origin offset of the image. Defaults to [0, 0].  */
  origin?: Origin2D;
}

/**
* Defines the layout of a texture image buffer data for a texture write.
* @see https://www.w3.org/TR/webgpu/#dictdef-gpuimagedatalayout
*/
export interface ImageDataLayout {
  /** The data offset in bytes. Defaults to 0. */
  offset?: UInt;

  /** The stride in bytes between the beginning of each block row and the subsequent block row. */
  bytesPerRow: UInt;

  /**
   * Number of block rows per single image slice of the texture.
   * rowsPerImage × pixelsPerRow is the stride between image slices. Required only for depth > 1. Defaults to 0.
   */
  rowsPerImage?: UInt;
}

/**
 * Descriptor of a texture sampler.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 * @see https://www.w3.org/TR/webgpu/#sampler-creation
 */
export interface SamplerDescriptor {
  /** Texture address mode for texture width coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  addressModeU?: AddressMode;

  /** Texture address mode for texture height coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  addressModeV?: AddressMode;

  /** Texture address mode for texture depth coordinates. Defaults to {@link AddressMode.ClampToEdge} */
  addressModeW?: AddressMode;

  /** Texture filter mode for magnification. Defaults to {@link FilterMode.Nearest} */
  magFilter?: FilterMode;

  /** Texture filter mode for minimifaction. Defaults to {@link FilterMode.Nearest} */
  minFilter?: FilterMode;

  /** Texture filter mode for sampling between two mipmap levels. Defaults to {@link FilterMode.Nearest} */
  mipmapFilter?: FilterMode;

  /** Minimum levels of detail. Defaults to 0. */
  lodMinClamp?: Float;

  /** Maximum levels of detail. Defaults to 32. */
  lodMaxClamp?: Float;

  /** Specifies the behavior of a comparison sampler. Defaults to null. */
  compare?: CompareFunction | null;

  /** Max anisotropy level. Defaults to 1. Requires EXT_texture_filter_anisotropic extension. */
  maxAnisotropy?: UInt;
}

/**
 * Descriptor of a shader.
 * @see https://www.w3.org/TR/webgpu/#shader-module-creation
 */
export interface ShaderDescriptor {
  /** The shader source code. */
  code: string;

  /** The stage of the shader. */
  usage: ShaderStage;
}

/**
 * Descriptor of render pipeline states.
 * @see https://www.w3.org/TR/webgpu/#render-pipeline-creation
 */
export interface RenderPipelineState {
  /** The color target states. Defaults to null, which disables blending. */
  targets?: ColorTargetStates | null;

  /** The primitive states. Defaults to empty. */
  primitive?: PrimitiveState;

  /** The depth stencil states. Defaults to null, which disables depth/stencil test. */
  depthStencil?: DepthStencilState | null;

  /** The multisample states. Defaults to empty. */
  multisample?: MultisampleState;
}

/**
 * Descriptor of a GPU render pipeline resource.
 * @see https://www.w3.org/TR/webgpu/#render-pipeline-creation
 */
export interface RenderPipelineDescriptor extends RenderPipelineState {
  /** The vertex shader. */
  vertex: Shader;

  /** The fragment shader. */
  fragment: Shader;

  /** The vertex buffer layouts. */
  buffers: VertexBufferLayout[];

  /** The bind group layouts. Defaults to empty. */
  bindGroups?: BindGroupLayout[];
}

/**
 * Descriptor of render pipeline mutlisample state.
 * @see https://www.w3.org/TR/webgpu/#multisample-state
 */
export interface MultisampleState {
  /** The number of samples for MSAA render targets. Defaults to 1. */
  sampleCount?: UInt;

  /** Enables alpha to coverage mode. Defaults to false. */
  alphaToCoverage?: boolean;
}

/**
 * Descriptor of the primitive state of a render pipeline.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpuprimitivestate
 */
export interface PrimitiveState {
  /** The primitive topology. Defaults to {@link PrimitiveTopology.Triangles} */
  topology?: PrimitiveTopology;

  /** The index format. Defaults to {@link IndexFormat.UInt16} */
  indexFormat?: IndexFormat;

  /** The front face. Default to {@link FrontFace.CCW} */
  frontFace?: FrontFace;

  /** The face culling mode. Default to {@link CullMode.None} */
  cullMode?: CullMode;
}

/**
 * Descriptor of vertex buffer layout.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpuvertexbufferlayout
 */
export interface VertexBufferLayout {
  /** The attribute descriptors */
  attributes: VertexAttribute[];

  /** Stride in bytes. */
  stride: UInt;

  /** Specify if this buffer's data is instanced. Defaults to {@link VertexStepMode.Vertex}. */
  stepMode?: VertexStepMode;
}

/**
 * Descriptor of vertex buffer attribute formats.
 */
export interface VertexBufferFormats {
  /** The vertex attribute format. */
  attributes: VertexFormat[];

  /** Specify if this buffer's data is instanced. Defaults to false. */
  instanced?: boolean;
}

/**
 * Descriptor of vertex attributes.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpuvertexbufferlayout
 */
export interface VertexAttribute {
  /** Vertex format */
  format: VertexFormat;

  /** Offset in buffer in bytes. */
  offset: UInt;

  /** Shader location to bind to. */
  shaderLocation: UInt;
}

/**
 * Descriptor of the depth stencil state.
 * @see https://www.w3.org/TR/webgpu/#depth-stencil-state
 */
export interface DepthStencilState {
  /** The depth-stencil format. Defaults to {@link TextureFormat.Depth16} */
  format?: TextureFormat;

  /** Depth-writes enabled? Defaults to false */
  depthWrite?: boolean;

  /** Depth-compare function. Defaults to {@link CompareFunction.Always} */
  depthCompare?: CompareFunction;

  /** Stencil front face state. */
  stencilFront?: StencilFaceState;

  /** Stencil back face state. */
  stencilBack?: StencilFaceState;

  /** Stencil read mask. Defaults to 0xFFFFFFFF */
  stencilReadMask?: UInt;

  /** Stencil write mask. Defaults to 0xFFFFFFFF */
  stencilWriteMask?: UInt;

  /** The depth bias aka polygonOffsetUnits. Defaults to 0. */
  depthBias?: Float;

  /** The depth bias slope scale aka polygonOffsetFactor. Defaults to 0. */
  depthBiasSlopeScale?: Float;

  /** The depth bias clamp value. Defaults to 0. */
  depthBiasClamp?: Float;
}

/**
 * Descriptor of the stencil face state.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpudepthstencilstate
 */
export interface StencilFaceState {
  /** Stencil compare function. Defaults to {@link CompareFunction.Always} */
  compare?: CompareFunction;

  /** Stencil fail operation. Defaults to {@link StencilOperation.Keep} */
  failOp?: StencilOperation;

  /** Stencil depth fail operation. Defaults to {@link StencilOperation.Keep} */
  depthFailOp?: StencilOperation;

  /** Stencil pass operation. Defaults to {@link StencilOperation.Keep} */
  passOp?: StencilOperation;
}

/**
 * Descriptor of the color target states.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpucolortargetstate
 */
export interface ColorTargetStates {
  /** The render targets for offscreen pass. Defaults to null. */
  targets?: ColorTargetState[] | null;

  /** Color-channels to write. Defaults to {@link ColorWrite.All} */
  writeMask?: ColorWrite;

  /** Blend component for RGB color. */
  blendColor?: BlendComponent;

  /** Blend component for RGB color. */
  blendAlpha?: BlendComponent;
}

/**
 * Descriptor of the color states of a target.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpucolortargetstate
 */
export interface ColorTargetState {
  /** The texture format for this render target. */
  format: TextureFormat;

  /** Color-channels to write. Defaults to {@link ColorWrite.All} */
  writeMask?: ColorWrite;

  /** Blend component for RGB color. */
  blendColor?: BlendComponent;

  /** Blend component for RGB color. */
  blendAlpha?: BlendComponent;
}

/**
 * Descriptor of the blend component state of a color target.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpublendcomponent
 */
export interface BlendComponent {
  /** Blend operation. Defaults to {@link BlendOperation.Add} */
  operation?: BlendOperation;

  /** Blend source factor. Defaults to {@link BlendFactor.One} */
  srcFactor?: BlendFactor;

  /** Blend destination factor. Defaults to {@link BlendFactor.Zero} */
  dstFactor?: BlendFactor;
}

/**
 * Descriptor of a default Render Pass.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpurenderpassdescriptor
 */
export interface DefaultRenderPassDescriptor {
  /**
   * The color load operation. Only applicale to a default pass. Defaults to null, which does not clear the buffers.
   * If a color is specified, it represents the clear color.
   */
  clearColor?: Color | null;

  /**
   * The depth load operation. Defaults to NaN, which does not clear the buffer.
   * If a number is specified, it represents the clear value.
   */
  clearDepth?: Float;

  /**
   * The stencil load operation. Defaults to NaN, which does not clear the buffer.
   * If a number is specified, it represents the clear value.
   */
  clearStencil?: UInt;
}

/**
 * Descriptor of a Render Pass.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpurenderpassdescriptor
 */
export interface RenderPassDescriptor extends DefaultRenderPassDescriptor {
  /** List of color attachments. If null or empty, defaults to render to screen. */
  colors?: ColorAttachment[] | null;

  /** The depth/stencil attachment. Defaults to null. */
  depthStencil?: TextureView | null;
}

/**
 * Descriptor of a color attachment in a render pass.
 * @see https://www.w3.org/TR/webgpu/#dictdef-gpurenderpassdescriptor
 */
export interface ColorAttachment {
  /** The color attachment. */
  view: TextureView;

  /**
   * The color load operation for this attachment. Defaults to null, which does not clear the buffers.
   * If a color is specified, it represents the clear color.
   */
  clear?: Color | null;
}

/**
 * Descriptor of a bind group layout object.
 */
export interface BindGroupLayoutDescriptor {
  /** The layouts of entries of a bind group. */
  entries: BindGroupLayoutEntry[];
}

/**
 * Descriptor of a bind group layout entry.
 */
export interface BindGroupLayoutEntry {
  /** Bind group entry name. */
  label: string;

  /** Binding location. Defaults to the position of the entry. */
  binding?: UInt;

  /** The stages that this resource is visible. Defaults to {@link ShaderStage.Vertex} | {@link ShaderStage.Fragment} */
  visibility?: ShaderStage;

  /** The type of binding. */
  type: BindingType;

  /** Whether buffer has dynamic offset. Defaults to false. */
  bufferDynamicOffset?: boolean;

  /** Type of sampler. Not used currently */
  samplerType?: SamplerBindingType;

  /** Type of texture sample. Not used currently */
  textureSampleType?: TextureSampleType;

  /** Dimension of texture. Defaults to {@link TextureDimension.D2}. */
  textureDimension?: TextureDimension;

  /** Whether texture is multisampled. Defaults to false. */
  textureMultisampled?: boolean;
}

/**
 * Descriptor of a bind group object.
 */
export interface BindGroupDescriptor {
  /** Layout of the bind group */
  layout: BindGroupLayout;

  /** The entries of a bind group. */
  entries: BindGroupEntry[];
}

/**
* A resource binding.
* @see https://www.w3.org/TR/webgpu/#bind-group-creation
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindBufferRange
*/
export interface BindGroupEntry {
  /** Uniform binding location. Defaults to the position of the entry. */
  binding?: UInt;

  /** The buffer to bind */
  buffer?: Buffer | null;

  /** The starting offset of the buffer. Defaults to 0 */
  bufferOffset?: UInt;

  /**
   * The byte size of data to read from the buffer.
   * Defaults to the range starting at offset and ending at the end of the buffer.
   */
  bufferSize?: UInt;

  /** The texture sampler to bind */
  sampler?: Sampler | null;

  /** The texture to bind */
  texture?: Texture | null;
}
