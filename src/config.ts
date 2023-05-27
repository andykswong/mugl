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
export const MUGL_DEBUG = process.env.MUGL_DEBUG || process.env.NODE_ENV === 'development';

/**
 * True to enable finalization registry for GPU resources. Defaults to false.
 */
export const MUGL_FINALIZER = process.env.MUGL_FINALIZER || false;
