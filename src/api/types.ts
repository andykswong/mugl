import { Texture } from './resources';

/**
 * RGBA color type alias.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpucolor
 */
export type Color = [r: number, g: number, b: number, a: number];

/**
 * An extent in 2D.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuextent3d
 */
export type Extent2D = [width?: number /* = 1 */, height?: number /* = 1 */];

/**
 * An extent in 3D
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuextent3d
 */
export type Extent3D = [width?: number /* = 1 */, height?: number /* = 1 */, depth?: number /* = 1 */];

/**
 * A point in 3D.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuorigin3d
 */
export type Origin3D = [x?: number /* = 0 */, y?: number /* = 0 */, z?: number /* = 0 */];

/**
 * Union type for all possible shader uniform value types.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix
 */
export type UniformValue =
  // texture
  Texture |
  // single float value
  number |
  // uniform array / buffer
  number[] | Float32Array
  ;

/**
 * Union type for all supported types for texture data.
 */
export type TextureData = ArrayBufferView | TexImageSource;

/**
 * The texture view for render pass attachment.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gputextureviewdescriptor
 */
export interface TextureView {
  /** The texture to use */
  tex: Texture;

  /** Rendering mip level. Defaults to 0 */
  mipLevel?: number;

  /** Rendering texture slice. Defaults to 0 */
  slice?: number;
}
