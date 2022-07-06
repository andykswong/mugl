/**
 * Global configs for mugl, which can be set via process.env for Node.js, or EnvironmentPlugin for Webpack
 * (or similar plugins for other bundlers).
 *
 * @packageDocumentation
 * @module config
 */

/**
 * True to enable debug mode. Defaults to false.
 */
export const MUGL_DEBUG = false;

/**
 * True to enable finalization registry for GPU resources. Defaults to true.
 */
export const MUGL_FINALIZER = true;
