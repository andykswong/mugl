/**
 * Minimal WebGPU_like rendering interface.
 * @packageDocumentation
 */

import {
  AddressMode, CompareFunction, CullMode, FilterMode, Float, FrontFace, FutureStatus, IndexFormat, MipmapHint,
  PrimitiveTopology, ShaderStage, StencilOperation, TextureDimension, TextureFormat, TextureUsage, UInt,
  WebGLContextAttributeFlag
} from './gpu';

/* Resource pointer */
export type ContextId = f64;
export type FutureId = f64;
export type CanvasId = f64;
export type ImageSourceId = f64;
export type DeviceId = f64;
export type BufferId = f64;
export type TextureId = f64;
export type SamplerId = f64;
export type ShaderId = f64;
export type BindGroupLayoutId = f64;
export type BindGroupId = f64;
export type RenderPipelineId = f64;
export type RenderPassId = f64;

/* DOM functions */

/**
 * Returns current status of the future.
 * @param id future pointer
 * @returns future status
 */
@external("mugl/wasm", "get_future_status")
export declare function getFutureStatus(id: FutureId): FutureStatus;

/**
 * Creates image from URI.
 * @param context unique context ID for the app
 * @param uriPtr the image URI string pointer
 * @param uriLen the image URI string length
 * @returns image pointer
 */
@external("mugl/wasm", "create_image")
export declare function createImage(context: ContextId, uriPtr: usize, uriLen: usize): ImageSourceId;

/**
 * Gets an image handle by ID.
 * @param context unique context ID for the app
 * @param idPtr the image ID string pointer
 * @param idLen the image ID string length
 * @returns image pointer
 */
@external("mugl/wasm", "get_image_by_id")
export declare function getImageById(context: ContextId, idPtr: usize, idLen: usize): ImageSourceId;

/**
 * Deletes an image.
 * @param image image pointer
 */
@external("mugl/wasm", "delete_image")
export declare function deleteImage(image: ImageSourceId): void;

/**
 * Get the width of the given image.
 * @param canvas image pointer
 * @returns image width
 */
@external("mugl/wasm", "get_image_width")
export declare function getImageWidth(image: ImageSourceId): UInt;

/**
 * Get the height of the given image.
 * @param canvas image pointer
 * @returns image height
 */
@external("mugl/wasm", "get_image_height")
export declare function getImageHeight(image: ImageSourceId): UInt;

/**
 * Get canvas by string ID.
 * @param context unique context ID for the app
 * @param idPtr the image ID string pointer
 * @param idLen the image URI ID length
 * @returns canvas pointer
 */
@external("mugl/wasm", "get_canvas_by_id")
export declare function getCanvasById(context: ContextId, idPtr: usize, idLen: usize): CanvasId;

/**
 * Get the width of given canvas.
 * @param canvas canvas pointer
 * @returns canvas width
 */
@external("mugl/wasm", "get_canvas_width")
export declare function getCanvasWidth(canvas: CanvasId): UInt;

/**
 * Get the height of given canvas.
 * @param canvas canvas pointer
 * @returns canvas height
 */
@external("mugl/wasm", "get_canvas_height")
export declare function getCanvasHeight(canvas: CanvasId): UInt;

/**
 * Requests a WebGL2 GPU device.
 * @param canvas canvas pointer
 * @param desc WebGLContextAttributeFlag
 * @param features WebGL2Feature flags
 * @returns the device pointer, or 0 if WebGL2 is unsupported
 */
@external("mugl/wasm", "webgl_request_device")
export declare function requestWebGL2Device(
  canvas: CanvasId, desc: WebGLContextAttributeFlag, features: UInt
): DeviceId;

/**
 * Generates mipmap for a WebGL texture.
 * @param device 
 * @param texture 
 * @param hint 
 */
@external("mugl/wasm", "webgl_generate_mipmap")
export declare function generateMipmap(device: DeviceId, texture: TextureId, hint: MipmapHint): void

/**
 * Resets the state of a GPU device.
 * @param device the device
 */
@external("mugl/wasm", "reset_device")
export declare function resetDevice(device: DeviceId): void;

/**
 * Deletes a device.
 * @param device the device
 */
@external("mugl/wasm", "delete_device")
export declare function deleteDevice(device: DeviceId): void;

/**
 * Checks if the device is lost.
 * @param device the device
 */
@external("mugl/wasm", "is_device_lost")
export declare function isDeviceLost(device: DeviceId): boolean;

/**
 * Get supported and enabled features of a device.
 * @param device the device
 */
@external("mugl/wasm", "get_device_features")
export declare function getFeatures(device: DeviceId): u32;

/**
 * Creates a GPU buffer.
 * @param device the device 
 * @param size buffer byte size
 * @param usage buffer usage flags
 */
@external("mugl/wasm", "create_buffer")
export declare function createBuffer(device: DeviceId, size: UInt, usage: UInt): BufferId;

/**
 * Deletes a GPU buffer.
 * @param device the device
 * @param buffer the buffer
 */
@external("mugl/wasm", "delete_buffer")
export declare function deleteBuffer(buffer: BufferId): void;

/**
 * Creates a GPU texture.
 * @param device
 * @param width
 * @param height 
 * @param depth 
 * @param mipLevelCount 
 * @param sampleCount 
 * @param dimension 
 * @param format 
 * @param usage 
 */
@external("mugl/wasm", "create_texture")
export declare function createTexture(
  device: DeviceId,
  width: UInt, height: UInt, depth: UInt,
  mipLevelCount: UInt,
  sampleCount: UInt,
  dimension: TextureDimension,
  format: TextureFormat,
  usage: TextureUsage,
): TextureId;

/**
 * Deletes a GPU texture.
 * @param device the device
 * @param texture the texture
 */
@external("mugl/wasm", "delete_texture")
export declare function deleteTexture(texture: TextureId): void;

/**
 * Creates a GPU sampler.
 * @param device 
 * @param addressModeU 
 * @param addressModeV 
 * @param addressModeW 
 * @param magFilter 
 * @param minFilter 
 * @param mipmapFilter 
 * @param lodMinClamp 
 * @param lodMaxClamp 
 * @param compare 
 * @param maxAnisotropy 
 */
@external("mugl/wasm", "create_sampler")
export declare function createSampler(
  device: DeviceId,
  addressModeU: AddressMode, addressModeV: AddressMode, addressModeW: AddressMode,
  magFilter: FilterMode, minFilter: FilterMode, mipmapFilter: FilterMode,
  lodMinClamp: f32, lodMaxClamp: f32,
  compare: CompareFunction,
  maxAnisotropy: UInt
): SamplerId;

/**
 * Deletes a GPU sampler.
 * @param device
 * @param sampler
 */
@external("mugl/wasm", "delete_sampler")
export declare function deleteSampler(sampler: SamplerId): void;

/**
 * Creates a GPU shader module.
 * @param device 
 * @param codePtr shader code string pointer
 * @param codeLen shader code string length
 * @param usage 
 */
@external("mugl/wasm", "create_shader")
export declare function createShader(device: DeviceId, codePtr: usize, codeLen: UInt, usage: ShaderStage): ShaderId;

/**
 * Deletes a GPU shader.
 * @param device
 * @param shader
 */
@external("mugl/wasm", "delete_shader")
export declare function deleteShader(shader: ShaderId): void;

/**
 * Creates a GPU bind group layout.
 * @param device 
 * @param entriesPtr pointer to BindGroupLayoutEntry array
 * @param entriesLen length of BindGroupLayoutEntry array
 */
@external("mugl/wasm", "create_bind_group_layout")
export declare function createBindGroupLayout(
  device: DeviceId, entriesPtr: usize, entriesLen: UInt
): BindGroupLayoutId;

/**
 * Deletes a GPU bind group layout.
 * @param device
 * @param bindGroupLayout
 */
@external("mugl/wasm", "delete_bind_group_layout")
export declare function deleteBindGroupLayout(bindGroupLayout: BindGroupLayoutId): void;

/**
 * Creates a GPU bind group.
 * @param device 
 * @param layout the BindGroupLayout
 * @param entriesPtr pointer to BindGroupEntry array
 * @param entriesLen length of BindGroupEntry array
 */
@external("mugl/wasm", "create_bind_group")
export declare function createBindGroup(
  device: DeviceId, layout: BindGroupLayoutId, entriesPtr: usize, entriesLen: UInt
): BindGroupId;

/**
 * Deletes a GPU bind group.
 * @param device
 * @param bindGroup
 */
@external("mugl/wasm", "delete_bind_group")
export declare function deleteBindGroup(bindGroup: BindGroupId): void;

/**
 * Creates a GPU render pipeline.
 * @param device 
 * @param vertex 
 * @param fragment 
 * @param attributesPtr pointer to VertexAttribute array
 * @param attributesLen length of VertexAttribute array
 * @param buffersPtr pointer to VertexBufferLayout array
 * @param buffersLen length of VertexBufferLayout array
 * @param bindGroupsPtr pointer to BindGroupLayout array
 * @param bindGroupsLen length of BindGroupLayout array
 * @param topology 
 * @param indexFormat 
 * @param frontFace 
 * @param cullMode 
 * @param sampleCount 
 * @param alphaToCoverage 
 * @param hasDepthStencil 
 * @param depthStencilFormat 
 * @param depthWrite 
 * @param depthCompare 
 * @param stencilFrontCompare 
 * @param stencilFrontFailOp 
 * @param stencilFrontDepthFailOp 
 * @param stencilFrontPassOp 
 * @param stencilBackCompare 
 * @param stencilBackFailOp 
 * @param stencilBackDepthFailOp 
 * @param stencilBackPassOp 
 * @param stencilReadMask 
 * @param stencilWriteMask 
 * @param depthBias 
 * @param depthBiasSlopeScale 
 * @param depthBiasClamp 
 * @param colorsPtr pointer to ColorTargetState array
 * @param colorsLen length of ColorTargetState array
 * @param colorWriteMask 
 * @param blendColorOperation 
 * @param blendColorSrcFactor 
 * @param blendColorDstFactor 
 * @param blendAlphaOperation 
 * @param blendAlphaSrcFactor 
 * @param blendAlphaDstFactor 
 */
@external("mugl/wasm", "create_render_pipeline")
export declare function createRenderPipeline(
  device: DeviceId,
  vertex: ShaderId,
  fragment: ShaderId,
  attributesPtr: usize, attributesLen: UInt,
  buffersPtr: usize, buffersLen: UInt,
  bindGroupsPtr: usize, bindGroupsLen: UInt,
  topology: PrimitiveTopology, indexFormat: IndexFormat, frontFace: FrontFace, cullMode: CullMode,
  sampleCount: UInt, alphaToCoverage: boolean,
  hasDepthStencil: boolean, depthStencilFormat: TextureFormat, depthWrite: boolean, depthCompare: CompareFunction,
  stencilFrontCompare: CompareFunction, stencilFrontFailOp: StencilOperation, stencilFrontDepthFailOp: StencilOperation, stencilFrontPassOp: StencilOperation,
  stencilBackCompare: CompareFunction, stencilBackFailOp: StencilOperation, stencilBackDepthFailOp: StencilOperation, stencilBackPassOp: StencilOperation,
  stencilReadMask: UInt, stencilWriteMask: UInt, depthBias: Float, depthBiasSlopeScale: Float, depthBiasClamp: Float,
  colorsPtr: usize, colorsLen: UInt,
  colorWriteMask: UInt,
  blendColorOperation: UInt, blendColorSrcFactor: UInt, blendColorDstFactor: UInt,
  blendAlphaOperation: UInt, blendAlphaSrcFactor: UInt, blendAlphaDstFactor: UInt
): RenderPipelineId;

/**
 * Deletes a GPU render pipeline.
 * @param device
 * @param renderPipeline
 */
@external("mugl/wasm", "delete_render_pipeline")
export declare function deleteRenderPipeline(renderPipeline: RenderPipelineId): void;

/**
 * Creates a GPU render pass.
 * @param device 
 * @param clearDepth 
 * @param clearStencil 
 * @param clearColorRed 
 * @param clearColorGreen 
 * @param clearColorBlue 
 * @param clearColorAlpha 
 * @param isOffscreen 
 * @param depthStencilTexture 
 * @param depthStecilMipLevel 
 * @param depthStecilSlice 
 * @param colorsPtr pointer to ColorAttachment array 
 * @param colorsLen ength of ColorAttachment array 
 */
@external("mugl/wasm", "create_render_pass")
export declare function createRenderPass(
  device: DeviceId,
  clearDepth: Float, clearStencil: Float,
  clearColorRed: Float, clearColorGreen: Float, clearColorBlue: Float, clearColorAlpha: Float,
  isOffscreen: boolean,
  depthStencilTexture: TextureId, depthStecilMipLevel: UInt, depthStecilSlice: UInt,
  colorsPtr: usize, colorsLen: UInt
): RenderPassId;

/**
 * Deletes a GPU render pass.
 * @param device
 * @param renderPipeline
 */
@external("mugl/wasm", "delete_render_pass")
export declare function deleteRenderPass(renderPass: RenderPassId): void;

/**
 * Reads data from a GPU buffer.
 * @param device 
 * @param buffer 
 * @param offset offset into the GPU buffer to read from
 * @param outPtr pointer to the output buffer
 * @param size byte size of the output
 */
@external("mugl/wasm", "read_buffer")
export declare function readBuffer(
  device: DeviceId, buffer: BufferId, offset: UInt, outPtr: usize, size: UInt
): FutureId;

/**
 * Writes data to a GPU buffer.
 * @param device 
 * @param buffer 
 * @param dataPtr pointer to the data buffer to read from
 * @param size byte size of the data
 * @param offset offset into the GPU buffer to write to
 */
@external("mugl/wasm", "write_buffer")
export declare function writeBuffer(
  device: DeviceId, buffer: BufferId, dataPtr: usize, size: UInt, offset: UInt
): void;

/**
 * Copies data from a GPU buffer to another buffer.
 * @param device 
 * @param src 
 * @param dst 
 * @param size data byte size to copy
 * @param srcOffset 
 * @param dstOffset 
 */
@external("mugl/wasm", "copy_buffer")
export declare function copyBuffer(
  device: DeviceId, src: BufferId, dst: BufferId, size: UInt, srcOffset: UInt, dstOffset: UInt
): void;

/**
 * Writes subregion of data array to a GPU texture.
 * @param device 
 * @param texture 
 * @param mipLevel 
 * @param x 
 * @param y 
 * @param z 
 * @param dataPtr pointer to the data buffer to read from
 * @param dataLen byte size of the data
 * @param offset
 * @param bytesPerRow 
 * @param rowsPerImage 
 * @param width 
 * @param height 
 * @param depth 
 */
@external("mugl/wasm", "write_texture")
export declare function writeTexture(
  device: DeviceId,
  texture: TextureId, mipLevel: UInt, x: UInt, y: UInt, z: UInt,
  dataPtr: usize, dataLen: UInt,
  offset: UInt, bytesPerRow: UInt, rowsPerImage: UInt,
  width: UInt, height: UInt, depth: UInt
): void;

/**
 * Uploads an image subregion to a GPU texture.
 * @param device 
 * @param src 
 * @param srcX 
 * @param srcY 
 * @param dst 
 * @param mipLevel 
 * @param dstX 
 * @param dstY 
 * @param dstZ 
 * @param width 
 * @param height 
 */
@external("mugl/wasm", "copy_external_image_to_texture")
export declare function copyExternalImageToTexture(
  device: DeviceId,
  src: ImageSourceId, srcX: UInt, srcY: UInt,
  dst: TextureId, mipLevel: UInt, dstX: UInt, dstY: UInt, dstZ: UInt,
  width: UInt, height: UInt
): void;

/**
 * Copies subregion of a GPU texture to another texture.
 * @param device 
 * @param src 
 * @param srcMipLevel 
 * @param srcX 
 * @param srcY 
 * @param srcZ 
 * @param dst 
 * @param dstMipLevel 
 * @param dstX 
 * @param dstY 
 * @param dstZ 
 * @param width 
 * @param height 
 * @param depth 
 */
@external("mugl/wasm", "copy_texture")
export declare function copyTexture(
  device: DeviceId,
  src: TextureId, srcMipLevel: UInt, srcX: UInt, srcY: UInt, srcZ: UInt,
  dst: TextureId, dstMipLevel: UInt, dstX: UInt, dstY: UInt, dstZ: UInt,
  width: UInt, height: UInt, depth: UInt
): void;

/**
 * Copies subregion of a GPU texture to a GPU buffer.
 * @param device 
 * @param src 
 * @param srcMipLevel 
 * @param srcX 
 * @param srcY 
 * @param srcZ 
 * @param dst 
 * @param offset 
 * @param bytesPerRow 
 * @param rowsPerImage 
 * @param width 
 * @param height 
 * @param depth 
 */
@external("mugl/wasm", "copy_texture_to_buffer")
export declare function copyTextureToBuffer(
  device: DeviceId,
  src: TextureId, srcMipLevel: UInt, srcX: UInt, srcY: UInt, srcZ: UInt,
  dst: BufferId,
  offset: UInt, bytesPerRow: UInt, rowsPerImage: UInt,
  width: UInt, height: UInt, depth: UInt
): void;

/**
 * Begins a render pass.
 * @param device 
 * @param pass 
 */
@external("mugl/wasm", "begin_render_pass")
export declare function beginRenderPass(device: DeviceId, pass: RenderPassId): void;

/**
 * Convenient method to begin a default render pass.
 * @param device 
 * @param clearDepth 
 * @param clearStencil 
 * @param clearColorRed 
 * @param clearColorGreen 
 * @param clearColorBlue 
 * @param clearColorAlpha 
 */
@external("mugl/wasm", "begin_default_pass")
export declare function beginDefaultPass(
  device: DeviceId,
  clearDepth: Float, clearStencil: Float,
  clearColorRed: Float, clearColorGreen: Float, clearColorBlue: Float, clearColorAlpha: Float
): void;

/**
 * Submits the current render pass.
 * @param device 
 */
@external("mugl/wasm", "submit_render_pass")
export declare function submitRenderPass(device: DeviceId): void;

/**
 * Binds a render pipeline to the current render pass.
 * @param device 
 * @param pipeline 
 */
@external("mugl/wasm", "set_render_pipeline")
export declare function setRenderPipeline(device: DeviceId, pipeline: RenderPipelineId): void;

/**
 * Binds an index buffer to the current render pass.
 * @param device 
 * @param buffer 
 */
@external("mugl/wasm", "set_index")
export declare function setIndex(device: DeviceId, buffer: BufferId): void;

/**
 * Binds a vertex buffer to a slot in the current render pass.
 * @param device 
 * @param slot 
 * @param buffer 
 * @param offset 
 */
@external("mugl/wasm", "set_vertex")
export declare function setVertex(device: DeviceId, slot: UInt, buffer: BufferId, offset: UInt): void;

/**
 * Binds a bind group to the current render pass.
 * @param device 
 * @param slot 
 * @param bindGroup 
 * @param offsetsPtr pointer to the dynamic offset array
 * @param offsetsLen length of the dynamic offset array
 */
@external("mugl/wasm", "set_bind_group")
export declare function setBindGroup(
  device: DeviceId, slot: UInt, bindGroup: BindGroupId, offsetsPtr: usize, offsetsLen: UInt
): void;

/**
 * Submits a draw call in the current render pass.
 * @param device 
 * @param vertexCount 
 * @param instanceCount 
 * @param firstVertex 
 * @param firstInstance 
 */
@external("mugl/wasm", "draw")
export declare function draw(
  device: DeviceId, vertexCount: UInt, instanceCount: UInt, firstVertex: UInt, firstInstance: UInt
): void;

/**
 * Submits an indexed draw call in the current render pass.
 * @param device 
 * @param indexCount 
 * @param instanceCount 
 * @param firstIndex 
 * @param firstInstance 
 */
@external("mugl/wasm", "draw_indexed")
export declare function drawIndexed(
  device: DeviceId, indexCount: UInt, instanceCount: UInt, firstIndex: UInt, firstInstance: UInt
): void;

/**
 * Sets the 3D viewport area for the current render pass.
 * @param device 
 * @param x 
 * @param y 
 * @param width 
 * @param height 
 * @param minDepth 
 * @param maxDepth 
 */
@external("mugl/wasm", "set_viewport")
export declare function setViewport(
  device: DeviceId, x: UInt, y: UInt, width: UInt, height: UInt, minDepth: Float, maxDepth: Float
): void;

/**
 * Sets the scissor rectangle for the current render pass.
 * @param device 
 * @param x 
 * @param y 
 * @param width 
 * @param height 
 */
@external("mugl/wasm", "set_scissor_rect")
export declare function setScissorRect(device: DeviceId, x: UInt, y: UInt, width: UInt, height: UInt): void;

/**
 * Sets the blend_constant color for the current render pass.
 * @param device 
 * @param red 
 * @param green 
 * @param blue 
 * @param alpha 
 */
@external("mugl/wasm", "set_blend_const")
export declare function setBlendConst(device: DeviceId, red: Float, green: Float, blue: Float, alpha: Float): void;

/**
 * Sets the stencil reference value for the current render pass.
 * @param device 
 * @param ref 
 */
@external("mugl/wasm", "set_stencil_ref")
export declare function setStencilRef(device: DeviceId, ref: UInt): void;
