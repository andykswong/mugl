import { TextureData } from '../descriptor';
import { MipmapHint } from '../enums';
import { ReadonlyExtent2D, ReadonlyExtent3D, ReadonlyOrigin2D, ReadonlyOrigin3D, Uint } from '../types';
import { Buffer as BaseBuffer, Texture as BaseTexture } from './resources';

export { Resource, RenderPass, Shader, Pipeline } from './resources';

/**
 * A GPU buffer resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpubufferdescriptor
 */
export interface Buffer extends BaseBuffer {
  /**
   * Write data to the buffer.
   * @param data the data to write
   * @param offset offset into GPU buffer to begin writing from. Defaults to 0
   * @return this
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
   * @see https://gpuweb.github.io/gpuweb/#dom-gpuqueue-writebuffer
   */
  data(data: ArrayBufferView, offset?: Uint): Buffer;
}

/**
 * A GPU texture resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 * @see https://gpuweb.github.io/gpuweb/#gputexture
 */
 export interface Texture extends BaseTexture {
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
  data(data: TextureData, offset?: ReadonlyOrigin2D | ReadonlyOrigin3D, size?: ReadonlyExtent2D | ReadonlyExtent3D, mipLevel?: Uint): Texture;

  /**
   * Generate mipmap for a texture object.
   * @param hint optional mipmap hint
   * @return this
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
   */
  mipmap(hint?: MipmapHint): Texture;
}
