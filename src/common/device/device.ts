import { Float, Int } from 'munum';
import { ShaderDescriptor } from './descriptor';
import {
  BufferDescriptor, PipelineDescriptor, RenderPassDescriptor, SamplerDescriptor, TextureDescriptor, UniformBindings
} from './descriptor';
import { Buffer, Pipeline, RenderPass, Shader, Texture } from './resources';
import { Color } from './types';

/**
 * Opaque canvas object.
 */
export interface AbstractCanvas {
  /**
   * Width of the canvas.
   */
  readonly width: Int;

  /**
   * Height of the canvas.
   */
  readonly height: Int;
}

/**
 * The rendering device, in WebGPU API style.
 * The APIs are designed to be simplified version of WebGPU APIs, and without features unsupported by WebGL.
 * @see https://gpuweb.github.io/gpuweb/#gpudevice
 */
export interface RenderingDevice {
  /**
   * The canvas that this device renders to.
   */
  readonly canvas: AbstractCanvas;

  /**
   * Creates a new buffer object.
   * @param desc the buffer descriptor
   * @returns new buffer object
   */
  buffer(desc: BufferDescriptor): Buffer;

  /**
   * Creates a new texture object.
   * @param desc the texture descriptor
   * @param sampler the sampler descriptor
   * @returns new texture object
   */
  texture(desc: TextureDescriptor, sampler?: SamplerDescriptor): Texture;

  /**
   * Creates a new shader module object.
   * @param desc the shader descriptor
   * @returns new shader object
   */
  shader(desc: ShaderDescriptor): Shader;

  /**
   * Creates a new pipeline state object.
   * @param desc the pipeline descriptor
   * @returns new pipeline state object
   */
  pipeline(desc: PipelineDescriptor): Pipeline;

  /**
   * Creates a new render pass object.
   * @param desc the render pass descriptor.
   * @returns new render pass
   */
  pass(desc?: RenderPassDescriptor): RenderPass;

  /**
   * Start a render pass.
   * @param pass the render pass
   * @returns the pass rendering context.
   */
  render(pass: RenderPass): RenderPassContext;

  /**
   * Reset the state of the rendering context.
   */
  reset(): void;

  /**
   * Query the availability of optional features.
   * @param feature feature type
   * @returns the feature object, or null if not supported
   */
  feature<F>(feature: string): F | null;
}

/**
 * The render pass context object for submitting render commands.
 * @see https://gpuweb.github.io/gpuweb/#gpurenderpassencoder
 */
export interface RenderPassContext {
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
  vertex(slot: Int, buffer: Buffer): RenderPassContext;

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
  draw(vertexCount: Int, instanceCount?: Int, firstVertex?: Int): RenderPassContext;

  /**
   * Submite an indexed draw call.
   * @param indexCount the number of vertices to draw
   * @param instanceCount the number of instances to draw. Defaults to 1
   * @param firstVertex the offset to the first vertex to draw. Defaults to 0
   * @returns this context for chaining
   */
  drawIndexed(
    indexCount: Int, instanceCount?: Int, firstIndex?: Int): RenderPassContext;

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
  blendColor(color: Color): RenderPassContext;

  /**
   * Set the stencil reference value.
   * @param ref the stencil reference value.
   * @returns this context for chaining
   */
  stencilRef(ref: Float): RenderPassContext;

  /**
   * End the render pass.
   */
  end(): void;
}
