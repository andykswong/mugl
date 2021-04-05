import {
  BufferDescriptor, PipelineDescriptor, RenderPassDescriptor, SamplerDescriptor, TextureDescriptor,
  UniformValuesDescriptor
} from './descriptors';
import { Buffer, Pipeline, RenderPass, Texture } from './resources';
import { Color } from './types';

export type Canvas = HTMLCanvasElement | OffscreenCanvas;

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
  vertex(slot: number, buffer: Buffer): RenderPassContext;

  /**
   * Set the shader uniforms.
   * @param desc descriptor of the uniforms
   * @returns this context for chaining
   */
  uniforms(desc: UniformValuesDescriptor): RenderPassContext;

  /**
   * Submite a draw call.
   * @param vertexCount the number of vertices to draw
   * @param instanceCount the number of instances to draw. Defaults to 1
   * @param firstVertex the offset to the first vertex to draw. Defaults to 0
   * @returns this context for chaining
   */
  draw(vertexCount: number, instanceCount?: number, firstVertex?: number): RenderPassContext;

  /**
   * Submite an indexed draw call.
   * @param indexCount the number of vertices to draw
   * @param instanceCount the number of instances to draw. Defaults to 1
   * @param firstVertex the offset to the first vertex to draw. Defaults to 0
   * @returns this context for chaining
   */
  drawIndexed(
    indexCount: number, instanceCount?: number, firstIndex?: number): RenderPassContext;

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
    x: number, y: number, width: number, height: number, minDepth?: number, maxDepth?: number): RenderPassContext;

  /**
   * Set the scissor rectangle.
   * @param x x offset
   * @param y y offset
   * @param width width
   * @param height height
   * @returns this context for chaining
   */
  scissor(x: number, y: number, width: number, height: number): RenderPassContext;

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
  stencilRef(ref: number): RenderPassContext;

  /**
   * End the render pass.
   */
  end(): void;
}

/**
 * The rendering device, in WebGPU API style.
 * The APIs are designed to be simplified version of WebGPU APIs, and without features unsupported by WebGL.
 * @see https://gpuweb.github.io/gpuweb/#gpudevice
 */
export interface RenderingDevice<FeatureType = never> {
  /** The canvas */
  readonly canvas: Canvas;

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
   * Creates a new Pipeline state object.
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
   feature<F>(feature: FeatureType): F | null;
}
