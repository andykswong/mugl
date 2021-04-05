import { RenderPassDescriptor } from '../api';
import { GLRenderPass, GLTexture } from './resources';

/**
 * An empty texture stub.
 */
export const EMPTY_TEXTURE: GLTexture = <GLTexture>{
  glt: null,
  glrb: null,
  destroy() { /** empty */ }
};

/**
 * An empty render pass stub.
 */
export const renderPassLite = (desc?: RenderPassDescriptor): GLRenderPass =>
  <GLRenderPass><unknown>({
    ...desc,
    color: [],
    glfb: null,
    destroy() { /** empty */ }
  });
