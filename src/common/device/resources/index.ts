import { BufferProperties, PipelineProperties, RenderPassProperties, SamplerProperties, TextureData, TextureProperties } from '../descriptor';
import { MipmapHint, ShaderType } from '../enums';
import { ReadonlyExtent3D, ReadonlyOrigin3D, Uint } from '../types';
import {
  Buffer as IBuffer, Pipeline as IPipeline, RenderPass as IRenderPass, Resource as IResource, Shader as IShader,
  Texture as ITexture
} from './resources';

/**
 * A resource that can be destroyed.
 */
export abstract class Resource implements IResource {
  abstract destroy(): void;
}

/**
 * A GPU buffer resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpubufferdescriptor
 */
export abstract class Buffer extends Resource implements IBuffer {
  abstract get props(): BufferProperties;

  // @ts-ignore: Valid AssemblyScript
  abstract data(data: ArrayBufferView, offset: Uint = 0): Buffer;
}

/**
 * A GPU texture resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 * @see https://gpuweb.github.io/gpuweb/#gputexture
 */
export abstract class Texture extends Resource implements ITexture {
  abstract get props(): TextureProperties;

  abstract get sampler(): SamplerProperties;

  // @ts-ignore: Valid AssemblyScript
  abstract data(data: TextureData, offset: ReadonlyOrigin3D = [0, 0, 0], size: ReadonlyExtent3D = [0, 0, 0], mipLevel: Uint = 0): Texture;

  // @ts-ignore: Valid AssemblyScript
  abstract mipmap(hint: MipmapHint = MipmapHint.None): Texture;
}

/**
 * A GPU render pass object.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindFramebuffer
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpurenderpassdescriptor
 */
export abstract class RenderPass extends Resource implements IRenderPass {
  abstract get props(): RenderPassProperties;

  abstract resolve(): void;
}

/**
 * A GPU shader object.
 * @see https://www.w3.org/TR/webgpu/#shader-module-creation
 */
export abstract class Shader extends Resource implements IShader {
  abstract get type(): ShaderType;
  abstract get source(): string;
}

/**
 * A GPU render pipeline object.
 * @see https://gpuweb.github.io/gpuweb/#gpurenderpipeline
 */
export abstract class Pipeline extends Resource implements IPipeline {
  abstract get props(): PipelineProperties;
}
