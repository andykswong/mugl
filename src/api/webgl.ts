import { ValueOf } from 'ts-essentials';
import {
  BufferDescriptor, TextureDescriptor, SamplerDescriptor, PipelineDescriptor, RenderPassDescriptor
} from './descriptors';
import { Canvas, RenderingDevice, RenderPassContext } from './device';
import { Buffer, Pipeline, RenderPass, Texture } from './resources';

const GLCommonFeatures = {
  Aniso: 'EXT_texture_filter_anisotropic',
  TexFP16Lin: 'OES_texture_half_float_linear',
  TexFPLin: 'OES_texture_float_linear'
};

/**
 * Supported WebGL1 feature values.
 */
export const GL1Feature = {
  DFfx: 'OES_standard_derivatives',
  Instancing: 'ANGLE_instanced_arrays',
  UintIndex: 'OES_element_index_uint',
  BlendMinMax: 'EXT_blend_minmax',
  DrawBuffers: 'WEBGL_draw_buffers',
  DepthTex: 'WEBGL_depth_texture',
  TexFP16: 'OES_texture_half_float',
  TexFP: 'OES_texture_float',
  ...GLCommonFeatures
} as const;

/**
 * Supported WebGL1 feature type.
 */
export type GL1Feature = ValueOf<typeof GL1Feature>;

/**
 * Supported WebGL2 feature values.
 */
export const GL2Feature = {
  BufFP: 'EXT_color_buffer_float',

  // TODO: [Feature] Implement multiview
  /*
  Multiview: 'OVR_multiview2',
  OculusMV: 'OCULUS_multiview',
  */

  ...GLCommonFeatures
} as const;

/**
 * Supported WebGL2 feature type.
 */
export type GL2Feature = ValueOf<typeof GL2Feature>;

/**
 * A WebGL buffer resource.
 */
 export interface GLBuffer extends Buffer {
  /** The underlying WebGL buffer object. null if destroyed. */
  readonly glb: WebGLBuffer | null;
}

/**
 * A WebGL texture resource.
 */
export interface GLTexture extends Texture
{
  /** The underlying WebGL texture object. null if destroyed. */
  readonly glt: WebGLTexture | null;

  /** The underlying WebGL renderbuffer for depth/stencil, if applicable. */
  readonly glrb: WebGLRenderbuffer | null;
}

/**
 * WebGL render pass object.
 */
export interface GLRenderPass extends RenderPass {
  /** The underlying WebGL framebuffer for offscreen pass. null if destroyed. */
  readonly glfb: WebGLFramebuffer | null;

  /** The underlying WebGL MSAA resolve framebuffers for offscreen pass. */
  readonly glrfb: readonly (WebGLFramebuffer | null)[];
}

/**
 * WebGL render pipeline object.
 */
export interface GLPipeline extends Pipeline {
  /** The underlying WebGL shader program object. null if destroyed. */
  readonly glp: WebGLProgram | null;
}

/**
 * WebGL-based rendering device.
 * WebGL2 can optionally be used if available.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
 */
export interface GLRenderingDevice extends RenderingDevice<GL1Feature | GL2Feature> {
  /** WebGL context */
  readonly gl: WebGLRenderingContext;

  /** Indicates if WebGL2 context is used */
  readonly webgl2: boolean;

  /**
   * Creates a new buffer object.
   * @param desc the buffer descriptor
   * @returns new buffer object
   */
   buffer(desc: BufferDescriptor): GLBuffer;

   /**
    * Creates a new texture object.
    * @param desc the texture descriptor
    * @param sampler the sampler descriptor
    * @returns new texture object
    */
   texture(desc: TextureDescriptor, sampler?: SamplerDescriptor): GLTexture;
 
   /**
    * Creates a new Pipeline state object.
    * @param desc the pipeline descriptor
    * @returns new pipeline state object
    */
   pipeline(desc: PipelineDescriptor): GLPipeline;
 
   /**
    * Creates a new render pass object.
    * @param desc the render pass descriptor.
    * @returns new render pass
    */
   pass(desc?: RenderPassDescriptor): GLRenderPass;
 
   /**
    * Start a render pass.
    * @param pass the render pass
    * @returns the pass rendering context.
    */
   render(pass: GLRenderPass): RenderPassContext;
}

/**
 * Options for creating a {@link GLRenderingDevice}.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
 */
export interface GLRenderingDeviceOptions extends WebGLContextAttributes {
  /**
   * Specify whether WebGL2 should be used if available. Defaults to false.
   */
  webgl2?: boolean;
}

/**
 * Factory of {@link WebGLRenderingDevice}.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
 */
export interface GLRenderingDeviceFactory {
  /**
   * Factory method to create a {@link GLRenderingDevice}.
   * @param canvas the canvas to be used
   * @param options context initialization options
   * @returns Context instance, or null if WebGL is not supported
   */
  (canvas: Canvas, options?: GLRenderingDeviceOptions): GLRenderingDevice | null;
}