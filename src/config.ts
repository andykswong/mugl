/**
 * Global configs for mugl, which can be set via process.env for Node.js, or EnvironmentPlugin for Webpack
 * (or similar plugins for other bundlers).
 *
 * @packageDocumentation
 */

/**
 * True to enable debug mode. Defaults to false.
 */
export const MUGL_DEBUG = (typeof process !== 'undefined' && !!process.env.MUGL_DEBUG) || false;
