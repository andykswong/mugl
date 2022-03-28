import { BindGroupDescriptor, BindGroupLayoutDescriptor, BufferDescriptor, DefaultRenderPassDescriptor, ImageCopyExternalImage, ImageCopyTexture, ImageDataLayout, RenderPassDescriptor, RenderPipelineDescriptor, SamplerDescriptor, ShaderDescriptor, TextureDescriptor } from './descriptor';
import { BindGroup, BindGroupLayout, Device, Buffer, RenderPass, RenderPipeline, Sampler, Shader, Texture } from './resource';
import { Color, Extent2D, Extent3D, Future, UInt, UIntArray } from './primitive';
/**
 * Minimal WebGPU-like rendering interface.
 */
export interface GPU {
    /**
     * Resets the device state.
     * @param device the GPU device
     */
    resetDevice(device: Device): void;
    /**
     * Returns if device context is lost.
     * @param device the GPU device
     * @returns true if device context is lost
     */
    isDeviceLost(device: Device): boolean;
    /**
     * Gets the enabled features of the device.
     * @param device the GPU device
     * @returns enabled features bitflag
     */
    getDeviceFeatures(device: Device): UInt;
    /**
     * Creates a new buffer object.
     * @param device the GPU device
     * @param desc the buffer descriptor
     * @returns new buffer object
     */
    createBuffer(device: Device, desc: BufferDescriptor): Buffer;
    /**
     * Creates a new texture object.
     * @param device the GPU device
     * @param desc the texture descriptor
     * @returns new texture object
     */
    createTexture(device: Device, desc: TextureDescriptor): Texture;
    /**
     * Creates a new sampler object.
     * @param device the GPU device
     * @param desc the sampler descriptor
     * @returns new sampler object
     */
    createSampler(device: Device, desc: SamplerDescriptor): Sampler;
    /**
     * Creates a new shader module object.
     * @param device the GPU device
     * @param desc the shader descriptor
     * @returns new shader object
     */
    createShader(device: Device, desc: ShaderDescriptor): Shader;
    /**
     * Creates a new pipeline bind group layout object.
     * @param device the GPU device
     * @param desc the bind group layout descriptor
     * @returns new bind group layout object
     */
    createBindGroupLayout(device: Device, desc: BindGroupLayoutDescriptor): BindGroupLayout;
    /**
     * Creates a new pipeline bind group object.
     * @param device the GPU device
     * @param desc the bind group descriptor
     * @returns new bind group object
     */
    createBindGroup(device: Device, desc: BindGroupDescriptor): BindGroup;
    /**
     * Creates a new render pipeline state object.
     * @param device the GPU device
     * @param desc the pipeline descriptor
     * @returns new render pipeline object
     */
    createRenderPipeline(device: Device, desc: RenderPipelineDescriptor): RenderPipeline;
    /**
     * Creates a new render pass object.
     * @param device the GPU device
     * @param desc the render pass descriptor.
     * @returns new render pass
     */
    createRenderPass(device: Device, desc: RenderPassDescriptor): RenderPass;
    /**
     * Reads data from a buffer.
     * @param device the GPU device
     * @param buffer the GPU buffer to read from
     * @param out the output CPU buffer
     * @param offset othe byte offset into GPU buffer to begin reading from. Defaults to 0
     * @returns a future
     */
    readBuffer(device: Device, buffer: Buffer, out: Uint8Array, offset?: UInt): Future;
    /**
     * Writes data to a buffer.
     * @param device the GPU device
     * @param buffer the buffer to write to
     * @param data the buffer data
     * @param offset the byte offset into GPU buffer to begin writing to. Defaults to 0
     */
    writeBuffer(device: Device, buffer: Buffer, data: ArrayBufferView, offset?: UInt): void;
    /**
     * Copies data from a buffer to another buffer.
     * @param device the GPU device
     * @param src the buffer to read from
     * @param dst the buffer to write to
     * @param size the byte size of the GPU buffer to read. Defaults to the whole buffer
     * @param srcOffset the byte offset into src buffer to begin reading from. Defaults to 0
     * @param dstOffset the byte offset into dst buffer to begin writing to. Defaults to 0
     */
    copyBuffer(device: Device, src: Buffer, dst: Buffer, size?: UInt, srcOffset?: UInt, dstOffset?: UInt): void;
    /**
     * Writes subregion of data array to a texture.
     * @param device the GPU device
     * @param texture the texture subregion to write to.
     * @param data the texture data
     * @param layout the data layout
     * @param size the size of the data subregion to write
     */
    writeTexture(device: Device, texture: ImageCopyTexture, data: ArrayBufferView, layout: ImageDataLayout, size?: Extent3D): void;
    /**
     * Uploads an image subregion to a texture.
     * @param device the GPU device
     * @param src the image subregion to write
     * @param dst the texture subregion to write to.
     * @param size the size of image subregion to write
     */
    copyExternalImageToTexture(device: Device, src: ImageCopyExternalImage, dst: ImageCopyTexture, size?: Extent2D): void;
    /**
     * Copies subregion of a texture to another texture.
     * @param device the GPU device
     * @param src the texture subregion to read from.
     * @param dst the texture subregion to write to.
     * @param size the size of the texture subregion to copy
     */
    copyTexture(device: Device, src: ImageCopyTexture, dst: ImageCopyTexture, size?: Extent3D): void;
    /**
     * Copies subregion of a texture to a buffer.
     * @param device the GPU device
     * @param src the texture subregion to read from.
     * @param dst the buffer to write to
     * @param layout the buffer data layout to use for storing the texture
     * @param size the size of the texture subregion to copy
     */
    copyTextureToBuffer(device: Device, src: ImageCopyTexture, dst: Buffer, layout: ImageDataLayout, size?: Extent3D): void;
    /**
     * Starts a render pass.
     * @param device the GPU device
     * @param pass the render pass
     */
    beginRenderPass(device: Device, pass: RenderPass): void;
    /**
     * Convenient method to start a default render pass.
     * @param device the GPU device
     * @param desc the render pass descriptor
     */
    beginDefaultPass(device: Device, desc?: DefaultRenderPassDescriptor): void;
    /**
     * Submits the current render pass.
     * @param device the GPU device
     */
    submitRenderPass(device: Device): void;
    /**
     * Binds a RenderPipeline to the current render pass.
     * @param device the GPU device
     * @param pipeline the pipeline to bind
     */
    setRenderPipeline(device: Device, pipeline: RenderPipeline): void;
    /**
     * Binds an index buffer to the current render pass.
     * @param device the GPU device
     * @param buffer the buffer to bind
     */
    setIndex(device: Device, buffer: Buffer): void;
    /**
     * Binds a vertex buffer to a slot in the current render pass.
     * @param device the GPU device
     * @param slot the vertex slot to bind to
     * @param buffer the buffer to bind
     */
    setVertex(device: Device, slot: UInt, buffer: Buffer, offset?: UInt): void;
    /**
     * Binds a bind group to the current render pass.
     * @param device the GPU device
     * @param slot the bind group slot to bind to
     * @param bindGorup the bind group to use
     * @param offsets the dynamic offsets for dynamic buffers in this bind group
     */
    setBindGroup(device: Device, slot: UInt, bindGroup: BindGroup, offsets?: UIntArray): void;
    /**
     * Submits a draw call in the current render pass.
     * @param device the GPU device
     * @param vertexCount the number of vertices to draw
     * @param instanceCount the number of instances to draw. Defaults to 1
     * @param firstVertex the offset to the first vertex to draw. Defaults to 0
     * @param firstInstance the offset to the first instance to draw. Defaults to 0
     */
    draw(device: Device, vertexCount: UInt, instanceCount?: UInt, firstVertex?: UInt, firstInstance?: UInt): void;
    /**
     * Submits an indexed draw call in the current render pass.
     * @param device the GPU device
     * @param indexCount the number of vertices to draw
     * @param instanceCount the number of instances to draw. Defaults to 1
     * @param firstVertex the offset to the first vertex to draw. Defaults to 0
     * @param firstInstance the offset to the first instance to draw. Defaults to 0
     */
    drawIndexed(device: Device, indexCount: UInt, instanceCount?: UInt, firstIndex?: UInt, firstInstance?: UInt): void;
    /**
     * Sets the 3D viewport area for the current render pass.
     * @param device the GPU device
     * @param x x offset
     * @param y y offset
     * @param width width
     * @param height height
     * @param minDepth min depth. Defaults to 0
     * @param maxDepth max depth. Defaults to 1
     */
    setViewport(device: Device, x: UInt, y: UInt, width: UInt, height: UInt, minDepth?: UInt, maxDepth?: UInt): void;
    /**
     * Sets the scissor rectangle for the current render pass.
     * @param device the GPU device
     * @param x x offset
     * @param y y offset
     * @param width width
     * @param height height
     */
    setScissorRect(device: Device, x: UInt, y: UInt, width: UInt, height: UInt): void;
    /**
     * Sets the blend-constant color for the current render pass.
     * @param device the GPU device
     * @param color the blend color
     */
    setBlendConst(device: Device, color: Color): void;
    /**
     * Sets the stencil reference value for the current render pass.
     * @param device the GPU device
     * @param ref the stencil reference value.
     */
    setStencilRef(device: Device, ref: UInt): void;
}
//# sourceMappingURL=gpu.d.ts.map