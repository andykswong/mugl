/**
 * Features that can be selectively disabled by setting the corresponding flags to false.
 * Use Webpack DefinePlugin to set these flags to reduce code size after treeshaking.
 * @packageDocumentation
 */

/**
* Support for sparse accessor.
*/
export const MUGL_TF_ACCESSOR_SPARSE = true;

/**
* Max number of morph targets supported.
*/
export const MUGL_TF_MORPH_TARGETS = 8;

/**
* Support for Uint8 indices.
*/
export const MUGL_TF_UINT8_INDEX = true;
