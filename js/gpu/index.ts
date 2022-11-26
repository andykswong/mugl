/**
 * Minimal WebGPU-like rendering interface.
 * @packageDocumentation
 */

export * from './descriptor';
export * from './gpu';
export * from './primitive';
export * from './resource';
export * from './type';
export { vertexBufferLayouts } from './gl-util';

// WebGL implementation
export * from './gl2';
