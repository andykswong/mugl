import { TextureDescriptor, SamplerDescriptor, RenderPassDescriptor, BufferDescriptor, PipelineDescriptor, ShaderDescriptor, UniformBindings } from '../descriptor';
import { Buffer, Pipeline, RenderPass, Shader, Texture } from '../resources';
import { RenderingDevice as BaseRenderingDevice, RenderPassContext as BaseRenderPassContext } from './device';
import { Float, Int, ReadonlyColor, Uint } from '../types';

/**
 * The rendering device, in WebGPU API style.
 * The APIs are designed to be simplified version of WebGPU APIs, and without features unsupported by WebGL.
 * @see https://gpuweb.github.io/gpuweb/#gpudevice
 */
export abstract class RenderingDevice implements BaseRenderingDevice {
  abstract get width(): number;
  abstract get height(): number;

  abstract buffer(desc: BufferDescriptor): Buffer;
  abstract shader(desc: ShaderDescriptor): Shader;
  abstract pipeline(desc: PipelineDescriptor): Pipeline;
  abstract render(pass: RenderPass): BaseRenderPassContext;
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
export abstract class RenderPassContext implements BaseRenderPassContext {
  abstract pipeline(pipeline: Pipeline): BaseRenderPassContext;

  abstract index(buffer: Buffer): BaseRenderPassContext;

  abstract vertex(slot: Uint, buffer: Buffer): BaseRenderPassContext;

  abstract uniforms(bindings: UniformBindings): BaseRenderPassContext;

  // @ts-ignore: Valid AssemblyScript
  abstract draw(vertexCount: Uint, instanceCount: Uint = 1, firstVertex: Uint = 0): BaseRenderPassContext;

  // @ts-ignore: Valid AssemblyScript
  abstract drawIndexed(indexCount: Uint, instanceCount: Uint = 1, firstIndex: Uint = 0): BaseRenderPassContext;

  // @ts-ignore: Valid AssemblyScript
  abstract viewport(x: Int, y: Int, width: Int, height: Int, minDepth: Int = 0, maxDepth: Int = 1): BaseRenderPassContext;
  
  abstract scissor(x: Int, y: Int, width: Int, height: Int): RenderPassContext;

  abstract blendColor(color: ReadonlyColor): RenderPassContext;
 
  abstract stencilRef(ref: Float): RenderPassContext;
 
  abstract end(): void;
}
