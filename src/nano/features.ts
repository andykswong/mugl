/**
 * Features that can be selectively disabled by setting the corresponding flags to false.
 * Use Webpack DefinePlugin to set these flags to reduce code size after treeshaking.
 * @packageDocumentation
 */

 /**
 * I can haz WebGL2?
 */
export const NANOGL_ENABLE_WEBGL2 = false;

 /**
 * No transparency for you!
 */
export const NANOGL_ENABLE_BLEND = true;

/**
 * What the heck is stencil?
 */
export const NANOGL_ENABLE_STENCIL = true;

/**
 * Rasterization is the devil!
 */
export const NANOGL_ENABLE_RASTER = true;

/**
 * No no no, nothing too fancy!
 */
export const NANOGL_ENABLE_OFFSCREEN = true;

/**
 * Missing textures. Missing textures everywhere!
 */
export const NANOGL_ENABLE_TEXTURE = true;

/**
 * Here are some scissors!
 */
export const NANOGL_ENABLE_SCISSOR = true;
