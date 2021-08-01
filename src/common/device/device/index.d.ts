import { TextureDescriptor, SamplerDescriptor, RenderPassDescriptor, UniformBindings } from '../descriptor';
import { Buffer, Pipeline, RenderPass, Texture } from '../resources';
import { RenderingDevice as BaseRenderingDevice, RenderPassContext as BaseRenderPassContext } from './device';
import { Int, ReadonlyColor, Uint } from '../types';

/**
 * The rendering device, in WebGPU API style.
 * The APIs are designed to be simplified version of WebGPU APIs, and without features unsupported by WebGL.
 * @see https://gpuweb.github.io/gpuweb/#gpudevice
 */
export interface RenderingDevice extends BaseRenderingDevice {
  /**
   * Creates a new texture object.
   * @param desc the texture descriptor
   * @param sampler optional sampler descriptor
   * @returns new texture object
   */
  texture(desc: TextureDescriptor, sampler?: SamplerDescriptor): Texture;

  /**
   * Creates a new render pass object.
   * @param desc optional render pass descriptor.
   * @returns new render pass
   */
  pass(desc?: RenderPassDescriptor): RenderPass;

  /**
   * Start a render pass.
   * @param pass the render pass
   * @returns the pass rendering context.
   */
  render(pass: RenderPass): RenderPassContext;
}

/**
 * The render pass context object for submitting render commands.
 * @see https://gpuweb.github.io/gpuweb/#gpurenderpassencoder
 */
export interface RenderPassContext extends BaseRenderPassContext {
  /**
   * Bind a pipeline.
   * @param pipeline the pipeline to bind
   * @returns this context for chaining
   */
  pipeline(pipeline: Pipeline): RenderPassContext;

  /**
   * Bind an index buffer.
   * @param buffer the buffer to bind
   * @returns this context for chaining
   */
  index(buffer: Buffer): RenderPassContext;

  /**
   * Bind a vertex buffer to a slot.
   * @param slot the vertex slot to bind to
   * @param buffer the buffer to bind
   * @returns this context for chaining
   */
  vertex(slot: Uint, buffer: Buffer): RenderPassContext;

  /**
   * Set the shader uniforms.
   * @param desc descriptor of the uniforms
   * @returns this context for chaining
   */
  uniforms(bindings: UniformBindings): RenderPassContext;

  /**
   * Submite a draw call.
   * @param vertexCount the number of vertices to draw
   * @param instanceCount the number of instances to draw. Defaults to 1
   * @param firstVertex the offset to the first vertex to draw. Defaults to 0
   * @returns this context for chaining
   */
  draw(vertexCount: Uint, instanceCount?: Uint, firstVertex?: Uint): RenderPassContext;

  /**
   * Submite an indexed draw call.
   * @param indexCount the number of vertices to draw
   * @param instanceCount the number of instances to draw. Defaults to 1
   * @param firstVertex the offset to the first vertex to draw. Defaults to 0
   * @returns this context for chaining
   */
  drawIndexed(
    indexCount: Uint, instanceCount?: Uint, firstIndex?: Uint): RenderPassContext;

  /**
   * Set the 3D viewport area.
   * @param x x offset
   * @param y y offset
   * @param width width
   * @param height height
   * @param minDepth min depth. Defaults to 0
   * @param maxDepth max depth. Defaults to 1
   * @returns this context for chaining
   */
  viewport(
    x: Int, y: Int, width: Int, height: Int, minDepth?: Int, maxDepth?: Int): RenderPassContext;

  /**
   * Set the scissor rectangle.
   * @param x x offset
   * @param y y offset
   * @param width width
   * @param height height
   * @returns this context for chaining
   */
  scissor(x: Int, y: Int, width: Int, height: Int): RenderPassContext;

  /**
   * Set the blend-constant color.
   * @param color the blend color
   * @returns this context for chaining
   */
  blendColor(color: ReadonlyColor): RenderPassContext;

  /**
   * Set the stencil reference value.
   * @param ref the stencil reference value.
   * @returns this context for chaining
   */
  stencilRef(ref: Uint): RenderPassContext;

  /**
   * End the render pass.
   */
  end(): void;
}
