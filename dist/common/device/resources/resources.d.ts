import { BufferProperties, PipelineProperties, RenderPassProperties, SamplerProperties, TextureData, TextureProperties } from '../descriptor';
import { MipmapHint, ShaderType } from '../enums';
import { ReadonlyExtent3D, ReadonlyOrigin3D, Uint } from '../types';
/**
 * A resource that can be destroyed.
 */
export interface Resource {
    /**
     * Destroy the resource.
     */
    destroy(): void;
}
/**
 * A GPU buffer resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpubufferdescriptor
 */
export interface Buffer {
    /** The buffer properties. */
    readonly props: BufferProperties;
    /**
     * Write data to the buffer.
     * @param data the data to write
     * @param offset offset into GPU buffer to begin writing from. Defaults to 0
     * @return this
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
     * @see https://gpuweb.github.io/gpuweb/#dom-gpuqueue-writebuffer
     */
    data(data: ArrayBufferView, offset: Uint): Buffer;
}
/**
 * A GPU texture resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 * @see https://gpuweb.github.io/gpuweb/#gputexture
 */
export interface Texture {
    /** The texture descriptor */
    readonly props: TextureProperties;
    /** The sampler descriptor */
    readonly sampler: SamplerProperties;
    /**
     * Write data to the texture.
     * @param data the data to write
     * @param offset the offset to the GPU texture to write data to. Defaults to [0, 0, 0].
     * @param size the size of the content to write from data to texture
     * @param mipLevel the mipmap level to use. Defaults to 0.
     * @return this
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
     * @see https://gpuweb.github.io/gpuweb/#dom-gpuqueue-writetexture
     */
    data(data: TextureData, offset: ReadonlyOrigin3D, size: ReadonlyExtent3D, mipLevel: Uint): Texture;
    /**
     * Generate mipmap for a texture object.
     * @param hint mipmap hint
     * @return this
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
     */
    mipmap(hint: MipmapHint): Texture;
}
/**
 * A GPU render pass object.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindFramebuffer
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpassdescriptor
 */
export interface RenderPass {
    /** The render pass descriptor. */
    readonly props: RenderPassProperties;
    /**
     * Perform MSAA framebuffer resolve.
     */
    resolve(): void;
}
/**
 * A GPU shader object.
 * @see https://www.w3.org/TR/webgpu/#shader-module-creation
 */
export interface Shader {
    /** The shader type. */
    readonly type: ShaderType;
    /** The shader source code. */
    readonly source: string;
}
/**
 * A GPU render pipeline object.
 * @see https://gpuweb.github.io/gpuweb/#gpurenderpipeline
 */
export interface Pipeline {
    /** The pipeline descriptor. */
    readonly props: PipelineProperties;
}
//# sourceMappingURL=resources.d.ts.map