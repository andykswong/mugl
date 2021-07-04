/**
 * Features that can be selectively disabled by setting the corresponding flags to false.
 * Use Webpack DefinePlugin to set these flags to reduce code size after treeshaking.
 * @packageDocumentation
 */

 /**
 * No transparency for you!
 */
export const NGL_ENABLE_BLEND = true;

/**
 * What the heck is stencil?
 */
export const NGL_ENABLE_STENCIL = true;

/**
 * Rasterization is the devil!
 */
export const NGL_ENABLE_RASTER = true;

/**
 * No no no, nothing too fancy!
 */
export const NGL_ENABLE_OFFSCREEN = true;

/**
 * Missing textures. Missing textures everywhere!
 */
export const NGL_ENABLE_TEXTURE = true;

/**
 * Here are some scissors!
 */
export const NGL_ENABLE_SCISSOR = true;
