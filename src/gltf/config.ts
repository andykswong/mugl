/**
 * Features that can be selectively disabled by setting the corresponding flags to false.
 * Use Webpack DefinePlugin to set these flags to reduce code size after treeshaking.
 * @packageDocumentation
 */

/**
* Support for sparse accessor.
*/
export const MUGL_GLTF_ACCESSOR_SPARSE = true;

/**
* Support for morph targets.
*/
export const MUGL_GLTF_MORPH = true;

/**
* Support for Uint8 indices.
*/
export const MUGL_GLTF_UINT8_INDEX = true;
