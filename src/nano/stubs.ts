import { RenderPassDescriptor } from '../device';
import { GLRenderPass, GLTexture } from './resources';

/**
 * An empty texture stub.
 */
export const EMPTY_TEXTURE: GLTexture = {
  glt: null,
  glrb: null,
  destroy() { /** empty */ }
} as GLTexture;

/**
 * An empty render pass stub.
 */
export const renderPassLite = (desc?: RenderPassDescriptor): GLRenderPass =>
  ({
    ...desc,
    color: [],
    glfb: null,
    destroy() { /** empty */ }
  }) as unknown as GLRenderPass;
