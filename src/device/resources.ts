
import { DeepReadonly, DeepRequired } from 'ts-essentials';
import {
  BufferDescriptor, TextureDescriptor, SamplerDescriptor, RenderPassDescriptor, PipelineDescriptor
} from './descriptors';
import { MipmapHint } from './enums';
import { Extent3D, Origin3D, TextureData } from './types';

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
export interface Buffer extends Resource, Readonly<Required<BufferDescriptor>> {
  /**
   * Write data to the buffer.
   * @param data the data to write
   * @param offset offset into GPU buffer to begin writing from. Defaults to 0
   * @return this
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
   * @see https://gpuweb.github.io/gpuweb/#dom-gpuqueue-writebuffer
   */
  data(data: BufferSource, offset?: number): Buffer;
}

/**
 * A GPU texture resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 * @see https://gpuweb.github.io/gpuweb/#gputexture
 */
export interface Texture extends Resource,
  Readonly<Required<TextureDescriptor>>, Readonly<Required<SamplerDescriptor>>
{
  /**
   * Write data to the texture.
   * @param data the data to write
   * @param offset the offset to the GPU texture to write data to. Defaults to [0, 0, 0].
   * @param mipLevel the mipmap level to use. Defaults to 0.
   * @param size the size of the content to write from data to view
   * @return this
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
   * @see https://gpuweb.github.io/gpuweb/#dom-gpuqueue-writetexture
   */
  data(data: TextureData | TextureData[], offset?: Origin3D, size?: Extent3D, mipLevel?: number): Texture;

  /**
   * Generate mipmap for a texture object.
   * @param hint mipmap hint
   * @return this
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
   */
  mipmap(hint?: MipmapHint): Texture;
}

/**
 * A GPU render pass object.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindFramebuffer
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpassdescriptor
 */
export interface RenderPass extends Resource, DeepReadonly<Required<RenderPassDescriptor>> {
  /**
   * Perform MSAA framebuffer resolve.
   */
  resolve(): void;
}

/**
 * A GPU render pipeline object.
 * @see https://gpuweb.github.io/gpuweb/#gpurenderpipeline
 */
export interface Pipeline extends Resource, DeepReadonly<DeepRequired<PipelineDescriptor>> {
}
