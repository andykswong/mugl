import type { PixelFormat } from '../device';

export const MAX_VERTEX_ATTRIBS = 16;

export const GL_EXT_INSTANCING = 'ANGLE_instanced_arrays';

export const GL_EXT_DRAW_BUFFERS = 'WEBGL_draw_buffers';

export const COLOR_PIXEL_FORMAT: typeof PixelFormat.RGBA8 = 0x04_04_01;

export const DEPTH_PIXEL_FORMAT: typeof PixelFormat.DepthStencil = 0x03_03_05;

export const VERTEX_FLOAT_BYTES = 4;
