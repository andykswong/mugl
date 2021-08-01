import { TextureDescriptor, SamplerDescriptor, RenderPassDescriptor, BufferDescriptor, PipelineDescriptor, ShaderDescriptor, UniformBindings } from '../descriptor';
import { Buffer, Pipeline, RenderPass, Shader, Texture } from '../resources';
import { RenderingDevice as IRenderingDevice, RenderPassContext as IRenderPassContext } from './device';
import { Int, ReadonlyColor, Uint } from '../types';

/**
 * The rendering device, in WebGPU API style.
 * The APIs are designed to be simplified version of WebGPU APIs, and without features unsupported by WebGL.
 * @see https://gpuweb.github.io/gpuweb/#gpudevice
 */
export abstract class RenderingDevice implements IRenderingDevice {
  abstract get width(): Uint;
  abstract get height(): Uint;

  abstract buffer(desc: BufferDescriptor): Buffer;
  abstract shader(desc: ShaderDescriptor): Shader;
  abstract pipeline(desc: PipelineDescriptor): Pipeline;
  abstract render(pass: RenderPass): RenderPassContext;
  abstract reset(): void;
  abstract feature<F>(feature: string): F;

  // @ts-ignore: Valid AssemblyScript
  abstract texture(desc: TextureDescriptor, sampler: SamplerDescriptor = {}): Texture;

  // @ts-ignore: Valid AssemblyScript
  abstract pass(desc: RenderPassDescriptor = {}): RenderPass;
}

/**
 * The render pass context object for submitting render commands.
 * @see https://gpuweb.github.io/gpuweb/#gpurenderpassencoder
 */
export abstract class RenderPassContext implements IRenderPassContext {
  abstract pipeline(pipeline: Pipeline): RenderPassContext;

  abstract index(buffer: Buffer): RenderPassContext;

  abstract vertex(slot: Uint, buffer: Buffer): RenderPassContext;

  abstract uniforms(bindings: UniformBindings): RenderPassContext;

  // @ts-ignore: Valid AssemblyScript
  abstract draw(vertexCount: Uint, instanceCount: Uint = 1, firstVertex: Uint = 0): RenderPassContext;

  // @ts-ignore: Valid AssemblyScript
  abstract drawIndexed(indexCount: Uint, instanceCount: Uint = 1, firstIndex: Uint = 0): RenderPassContext;

  // @ts-ignore: Valid AssemblyScript
  abstract viewport(x: Int, y: Int, width: Int, height: Int, minDepth: Int = 0, maxDepth: Int = 1): RenderPassContext;
  
  abstract scissor(x: Int, y: Int, width: Int, height: Int): RenderPassContext;

  abstract blendColor(color: ReadonlyColor): RenderPassContext;
 
  abstract stencilRef(ref: Uint): RenderPassContext;
 
  abstract end(): void;
}
