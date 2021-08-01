import { BufferProperties, TextureData, TextureProperties } from '../descriptor';
import { MipmapHint } from '../enums';
import { ReadonlyExtent3D, ReadonlyOrigin3D, Uint } from '../types';
import { Buffer as BaseBuffer, Texture as BaseTexture } from './resources';

// @ts-ignore: Valid AssemblyScript export
export { Resource, RenderPass, Shader, Pipeline } from './resources';

/**
 * A GPU buffer resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpubufferdescriptor
 */
export abstract class Buffer implements BaseBuffer {
  abstract get props(): BufferProperties;

  // @ts-ignore: Valid AssemblyScript
  abstract data(data: ArrayBufferView, offset: Uint = 0): Buffer;

  abstract destroy(): void;
}

/**
 * A GPU texture resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 * @see https://gpuweb.github.io/gpuweb/#gputexture
 */
export abstract class Texture implements BaseTexture {
  abstract get props(): TextureProperties;

  // @ts-ignore: Valid AssemblyScript
  abstract data(data: TextureData, offset: ReadonlyOrigin3D = [0, 0, 0], size: ReadonlyExtent3D = [0, 0, 0], mipLevel: Uint = 0): Texture;

  // @ts-ignore: Valid AssemblyScript
  abstract mipmap(hint: MipmapHint = MipmapHint.None): Texture;

  abstract destroy(): void;
}
