/**
 * WebGL bindings.
 * @see https://github.com/KhronosGroup/WebGL/blob/main/specs/latest/1.0/webgl.idl
 * @see https://github.com/KhronosGroup/WebGL/blob/main/specs/latest/2.0/webgl.idl
 * @see https://github.com/KhronosGroup/WebGL/tree/main/extensions
 * @packageDocumentation
 */

import {
  AddressMode, BlendFactor, BlendOp, BufferType, ColorMask, CompareFunc, CullMode, FilterMode, Float, FloatList, FrontFace,
  ImageSource, IndexFormat, Int, MinFilterMode, MipmapHint, PixelFormat, PrimitiveType, ReadonlyColor, ReadonlyExtent3D,
  ReadonlyOrigin3D, ShaderType, StencilOp, TexType, Uint, UniformType, Usage, VertexFormat
} from './common';

/* Resource pointer */
export type Canvas = u32;
export type RenderingDeviceId = u32;
export type BufferId = u32;
export type TextureId = u32;
export type ShaderId = u32;
export type PipelineId = u32;

// Render pass may be created once per frame. Use f64 to be safe from overflow
export type RenderPassId = f64;
export type RenderPassContextId = f64;

/* Image functions */
export declare function createImage(uri: string): ImageSource;
export declare function getImageById(id: string): ImageSource;
export declare function deleteImage(image: ImageSource): void;

/**
 * Get canvas by ID.
 * @param id canvas ID
 * @returns canvas pointer
 */
export declare function getCanvasById(id: string): Canvas;

/**
 * Get a WebGL rendering context from canvas.
 * @param canvas the canvas
 * @param options GLRenderingDeviceOptions bit field
 * @returns the context
 */
export declare function getGLDevice(canvas: Canvas, options: u32): RenderingDeviceId;

export declare function getCanvasWidth(device: RenderingDeviceId): Uint;
export declare function getCanvasHeight(device: RenderingDeviceId): Uint;
export declare function resetDevice(device: RenderingDeviceId): void;
// @ts-ignore: Valid AssemblyScript
@external('deviceFeature') export declare function deviceFeature<F>(device: RenderingDeviceId, feature: string): F;

export declare function createBuffer(device: RenderingDeviceId, type: BufferType, size: Uint, usage: Usage): BufferId;
export declare function deleteBuffer(buffer: BufferId): void;
export declare function bufferData(buffer: BufferId, data: ArrayBufferView, offset: Uint): void;

export declare function createTexture(
  device: RenderingDeviceId,
  type: TexType, format: PixelFormat, width: Uint, height: Uint, depth: Uint, mipLevels: Uint, samples: Uint, renderTarget: boolean,
  wrapU: AddressMode, wrapV: AddressMode, wrapW: AddressMode, magFilter: FilterMode, minFilter: MinFilterMode, minLOD: Float, maxLOD: Float, maxAniso: Float
): TextureId;
export declare function deleteTexture(texture: TextureId): void;
export declare function textureBuffer(texture: TextureId, buffers: ArrayBufferView, origin: ReadonlyOrigin3D, extent: ReadonlyExtent3D, mipLevel: Uint): void;
export declare function textureImages(texture: TextureId, images: ImageSource[], origin: ReadonlyOrigin3D, extent: ReadonlyExtent3D, mipLevel: Uint): void;
export declare function mipmap(texture: TextureId, hint: MipmapHint): void;

export declare function createShader(device: RenderingDeviceId, type: ShaderType, source: string): ShaderId;
export declare function deleteShader(shader: ShaderId): void;

export declare function createRenderPass(
  device: RenderingDeviceId,
  colorTex: TextureId[] | null, colorMipLevel: Uint[] | null, colorSlice: Uint[] | null, 
  depthTex: TextureId, depthMipLevel: Uint, depthSlice: Uint,
  clearColor: ReadonlyColor | null, clearDepth: Float, clearStencil: Float
): RenderPassId;
export declare function deleteRenderPass(renderPass: RenderPassId): void;
export declare function resolveRenderPass(renderPass: RenderPassId): void;

export declare function createPipeline(
  device: RenderingDeviceId,
  vert: ShaderId, frag: ShaderId, indexFormat: IndexFormat, mode: PrimitiveType,
  bufferInstStrides: Uint[],
  attrNames: string[], attrBufferIds: Uint[], attrFormats: VertexFormat[], attrShaderLoc: Uint[], attrOffsets: Uint[],
  uniformNames: string[] | null, uniformTypes: UniformType[] | null, uniformFormats: Uint[] | null,
  frontFace: FrontFace, cullMode: CullMode, depthBias: Float, depthBiasSlopeScale: Float, alphaToCoverage: boolean,
  depthEnabled: boolean, depthWrite: boolean, depthCompare: CompareFunc,
  stencilEnabled: boolean,
  stencilFrontCompare: CompareFunc, stencilFrontFailOp: StencilOp, stencilFrontZFailOp: StencilOp, stencilFrontPassOp: StencilOp,
  stencilBackCompare: CompareFunc, stencilBackFailOp: StencilOp, stencilBackZFailOp: StencilOp, stencilBackPassOp: StencilOp,
  stencilReadMask: Uint, stencilWriteMask: Uint,
  blendEnabled: boolean,
  srcFactorRGB: BlendFactor, dstFactorRGB: BlendFactor, opRGB: BlendOp,
  srcFactorAlpha: BlendFactor, dstFactorAlpha: BlendFactor, opAlpha: BlendOp, colorMask: ColorMask
): PipelineId;
export declare function deletePipeline(pipeline: PipelineId): void;

export declare function render(device: RenderingDeviceId, pass: RenderPassId): RenderPassContextId;
export declare function endRender(context: RenderPassContextId): void;
export declare function bindPipeline(context: RenderPassContextId, pipeline: PipelineId): void;
export declare function bindVertexBuffer(context: RenderPassContextId, slot: Uint, buffer: BufferId): void;
export declare function bindIndexBuffer(context: RenderPassContextId, buffer: BufferId): void;
export declare function bindUniform(
  context: RenderPassContextId,
  name: string, value: Float, values: FloatList | null, tex: TextureId, buffer: BufferId, bufferOffset: Uint, bufferSize: Uint
): void;
export declare function draw(context: RenderPassContextId, indexed: boolean, count: Uint, instanceCount: Uint, first: Uint): void;
export declare function viewport(context: RenderPassContextId, x: Int, y: Int, width: Int, height: Int, minDepth: Int, maxDepth: Int): void;
export declare function scissor(context: RenderPassContextId, x: Int, y: Int, width: Int, height: Int): void;
export declare function blendColor(context: RenderPassContextId, color: ReadonlyColor): void;
export declare function stencilRef(context: RenderPassContextId, ref: Uint): void;
