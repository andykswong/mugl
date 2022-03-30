import { AddressMode, BufferUsage, CompareFunction, CullMode, FilterMode, Float, FrontFace, IndexFormat, MipmapHint, PrimitiveTopology, ShaderStage, StencilOperation, TextureDimension, TextureFormat, TextureUsage, UInt } from '../gpu';
import { Id } from './id';
export declare type ContextId = Id<'Context'>;
export declare type FutureId = Id<'Future'>;
export declare type ImageSourceId = Id<'Image'>;
export declare type CanvasId = Id<'Canvas'>;
export declare type ResourceId = Id<'GPUResource'>;
declare function deleteResource(id: ResourceId): void;
export declare function set_context_memory(context: ContextId, memory: WebAssembly.Memory): void;
export declare function free_context(context: ContextId): void;
export declare function is_future_done(future: FutureId): boolean;
export declare function create_image(context: ContextId, ptr: UInt, len: UInt): ImageSourceId;
export declare function get_image_by_id(context: ContextId, ptr: UInt, len: UInt): ImageSourceId;
export declare function delete_image(img: ImageSourceId): void;
export declare function get_image_width(img: ImageSourceId): UInt;
export declare function get_image_height(img: ImageSourceId): UInt;
export declare function get_canvas_by_id(context: ContextId, ptr: UInt, len: UInt): CanvasId;
export declare function get_canvas_width(canvas: CanvasId): UInt;
export declare function get_canvas_height(canvas: CanvasId): UInt;
export declare function webgl_request_device(canvasId: CanvasId, attrs: UInt, features: UInt): ResourceId;
export declare function webgl_generate_mipmap(device: ResourceId, tex: ResourceId, hint: MipmapHint): void;
export declare function reset_device(device: ResourceId): void;
export declare function delete_device(device: ResourceId): void;
export declare function is_device_lost(device: ResourceId): boolean;
export declare function get_device_features(device: ResourceId): UInt;
export declare function create_buffer(device: ResourceId, size: UInt, usage: BufferUsage): ResourceId;
export { deleteResource as delete_buffer };
export declare function create_texture(device: ResourceId, width: UInt, height: UInt, depth: UInt, mipLevelCount: UInt, sampleCount: UInt, dimension: TextureDimension, format: TextureFormat, usage: TextureUsage): ResourceId;
export { deleteResource as delete_texture };
export declare function create_sampler(device: ResourceId, addressModeU: AddressMode, addressModeV: AddressMode, addressModeW: AddressMode, magFilter: FilterMode, minFilter: FilterMode, mipmapFilter: FilterMode, lodMinClamp: Float, lodMaxClamp: Float, compare: CompareFunction, maxAnisotropy: UInt): ResourceId;
export { deleteResource as delete_sampler };
export declare function create_shader(device: ResourceId, codePtr: UInt, codeLen: UInt, usage: ShaderStage): ResourceId;
export { deleteResource as delete_shader };
export declare function create_bind_group_layout(device: ResourceId, entriesPtr: UInt, entriesLen: UInt): ResourceId;
export { deleteResource as delete_bind_group_layout };
export declare function create_bind_group(device: ResourceId, layout: ResourceId, entriesPtr: UInt, entriesLen: UInt): ResourceId;
export { deleteResource as delete_bind_group };
export declare function create_render_pipeline(device: ResourceId, vertex: ResourceId, fragment: ResourceId, attributesPtr: UInt, attributesLen: UInt, buffersPtr: UInt, buffersLen: UInt, bindGroupsPtr: UInt, bindGroupsLen: UInt, topology: PrimitiveTopology, indexFormat: IndexFormat, frontFace: FrontFace, cullMode: CullMode, sampleCount: UInt, alphaToCoverage: UInt, hasDepthStencil: UInt, depthStencilFormat: TextureFormat, depthWrite: UInt, depthCompare: CompareFunction, stencilFrontCompare: CompareFunction, stencilFrontFailOp: StencilOperation, stencilFrontDepthFailOp: StencilOperation, stencilFrontPassOp: StencilOperation, stencilBackCompare: CompareFunction, stencilBackFailOp: StencilOperation, stencilBackDepthFailOp: StencilOperation, stencilBackPassOp: StencilOperation, stencilReadMask: UInt, stencilWriteMask: UInt, depthBias: Float, depthBiasSlopeScale: Float, depthBiasClamp: Float, colorsPtr: UInt, colorsLen: UInt, colorWriteMask: UInt, blendColorOperation: UInt, blendColorSrcFactor: UInt, blendColorDstFactor: UInt, blendAlphaOperation: UInt, blendAlphaSrcFactor: UInt, blendAlphaDstFactor: UInt): ResourceId;
export { deleteResource as delete_render_pipeline };
export declare function create_render_pass(device: ResourceId, clearDepth: Float, clearStencil: Float, clearColorRed: Float, clearColorGreen: Float, clearColorBlue: Float, clearColorAlpha: Float, isOffscreen: UInt, depthStencilTexture: ResourceId, depthStecilMipLevel: UInt, depthStecilSlice: UInt, colorsPtr: UInt, colorsLen: UInt): ResourceId;
export { deleteResource as delete_render_pass };
export declare function read_buffer(device: ResourceId, buffer: ResourceId, offset: UInt, outPtr: UInt, size: UInt): FutureId;
export declare function write_buffer(device: ResourceId, buffer: ResourceId, dataPtr: UInt, size: UInt, offset: UInt): void;
export declare function copy_buffer(device: ResourceId, src: ResourceId, dst: ResourceId, size: UInt, srcOffset: UInt, dstOffset: UInt): void;
export declare function write_texture(device: ResourceId, texture: ResourceId, mipLevel: UInt, x: UInt, y: UInt, z: UInt, dataPtr: UInt, dataLen: UInt, offset: UInt, bytesPerRow: UInt, rowsPerImage: UInt, width: UInt, height: UInt, depth: UInt): void;
export declare function copy_external_image_to_texture(device: ResourceId, src: ImageSourceId, srcX: UInt, srcY: UInt, dst: ResourceId, mipLevel: UInt, dstX: UInt, dstY: UInt, dstZ: UInt, width: UInt, height: UInt): void;
export declare function copy_texture(device: ResourceId, src: ResourceId, srcMipLevel: UInt, srcX: UInt, srcY: UInt, srcZ: UInt, dst: ResourceId, dstMipLevel: UInt, dstX: UInt, dstY: UInt, dstZ: UInt, width: UInt, height: UInt, depth: UInt): void;
export declare function copy_texture_to_buffer(device: ResourceId, src: ResourceId, srcMipLevel: UInt, srcX: UInt, srcY: UInt, srcZ: UInt, dst: ResourceId, offset: UInt, bytesPerRow: UInt, rowsPerImage: UInt, width: UInt, height: UInt, depth: UInt): void;
export declare function begin_render_pass(device: ResourceId, pass: ResourceId): void;
export declare function begin_default_pass(device: ResourceId, clearDepth: Float, clearStencil: Float, clearColorRed: Float, clearColorGreen: Float, clearColorBlue: Float, clearColorAlpha: Float): void;
export declare function submit_render_pass(device: ResourceId): void;
export declare function set_render_pipeline(device: ResourceId, pipeline: ResourceId): void;
export declare function set_index(device: ResourceId, index: ResourceId): void;
export declare function set_vertex(device: ResourceId, slot: UInt, vertex: ResourceId, offset: UInt): void;
export declare function set_bind_group(device: ResourceId, slot: UInt, bindGroup: ResourceId, offsetsPtr: UInt, offsetsLen: UInt): void;
export declare function draw(device: ResourceId, vertexCount: UInt, instanceCount: UInt, firstVertex: UInt, firstInstance: UInt): void;
export declare function draw_indexed(device: ResourceId, indexCount: UInt, instanceCount: UInt, firstIndex: UInt, firstInstance: UInt): void;
export declare function set_viewport(device: ResourceId, x: UInt, y: UInt, width: UInt, height: UInt, minDepth: UInt, maxDepth: UInt): void;
export declare function set_scissor_rect(device: ResourceId, x: UInt, y: UInt, width: UInt, height: UInt): void;
export declare function set_blend_const(device: ResourceId, red: Float, green: Float, blue: Float, alpha: Float): void;
export declare function set_stencil_ref(device: ResourceId, ref: UInt): void;
//# sourceMappingURL=wasm.d.ts.map