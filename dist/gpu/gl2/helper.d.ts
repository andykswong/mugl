import { RenderPipelineState, TextureView } from '../descriptor';
import { UInt } from '../primitive';
import { Device } from '../resource';
import { ColorWrite } from '../type';
import { WebGL2BufferAttributes, WebGL2PipelineState, WebGL2State, WebGL2Texture } from './model';
/**
 * Returns if device context is lost.
 * @param device the GPU device
 * @returns true if device context is lost
 */
export declare function isDeviceLost(device: Device): boolean;
export declare function initWebGL2State(gl: WebGL2RenderingContext): WebGL2State;
export declare function createPipelineState(desc?: RenderPipelineState): WebGL2PipelineState;
export declare function applyPipelineState(gl: WebGL2RenderingContext, extDrawBuffersi: OES_draw_buffers_indexed | null, prevState: WebGL2PipelineState, state: WebGL2PipelineState, stencilRef?: number, force?: boolean): void;
export declare function applyColorMask(gl: WebGL2RenderingContext, prevMask: ColorWrite, mask: ColorWrite, force?: boolean): void;
export declare function applyDepthMask(gl: WebGL2RenderingContext, prevMask: boolean, mask: boolean, force?: boolean): void;
export declare function applyStencilMask(gl: WebGL2RenderingContext, prevMask: UInt, mask: UInt, force?: boolean): void;
export declare function glToggle(gl: WebGL2RenderingContext, flag: GLenum, enable: boolean): void;
export declare function compileShaderProgram(device: Device, vertex: WebGLShader, fragment: WebGLShader): WebGLProgram;
export declare function framebufferTexture(gl: WebGL2RenderingContext, attachment: GLenum, { texture, slice, mipLevel }: TextureView): void;
export declare function createResolveFrameBuffer(gl: WebGL2RenderingContext, attachment: GLenum, view: TextureView): WebGLFramebuffer | null;
export declare function blitFramebuffer(gl: WebGL2RenderingContext, from: WebGLFramebuffer | null, to: WebGLFramebuffer | null, tex: WebGL2Texture, mask: number, attachment?: UInt): void;
export declare function clientWaitAsync(gl: WebGL2RenderingContext, sync: WebGLSync, flags: UInt, interval: UInt): Promise<void>;
export declare function getBufferSubData(gl: WebGL2RenderingContext, target: UInt, buffer: WebGLBuffer, srcOffset: UInt, length: UInt): Promise<Uint8Array>;
export declare function vertexAttribs(gl: WebGL2RenderingContext, buffer: WebGL2BufferAttributes, offset: UInt): void;
//# sourceMappingURL=helper.d.ts.map