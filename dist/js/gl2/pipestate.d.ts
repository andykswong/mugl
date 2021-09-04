import { Writable } from 'ts-essentials';
import { ColorMask, BlendState, DepthState, RasterizationState, StencilState, ReadonlyPipelineState } from '../../common';
/**
 * WebGL pipeline state.
 */
export declare type GLPipelineState = Writable<ReadonlyPipelineState> & {
    /** Specify if blend state is enabled. */
    blendOn: boolean;
    /** Specify if depth state is enabled. */
    depthOn: boolean;
    /** Specify if stencil state is enabled. */
    stencilOn: boolean;
};
export declare const DEFAULT_RASTER_STATE: Readonly<Required<RasterizationState>>;
export declare const DEFAULT_DEPTH_STATE: Readonly<Required<DepthState>>;
export declare const DEFAULT_STENCIL_STATE: Readonly<Required<StencilState>>;
export declare const DEFAULT_BLEND_STATE: Readonly<Required<BlendState>>;
export declare const newGLPipelineState: () => GLPipelineState;
export declare function applyPipelineState(gl: WebGLRenderingContext, prevState: GLPipelineState, state: ReadonlyPipelineState, stencilRef?: number, force?: boolean): void;
export declare function mergePipelineState(prevState: GLPipelineState, state: ReadonlyPipelineState): void;
export declare function applyColorMask(gl: WebGLRenderingContext, prevMask: ColorMask, mask: ColorMask, force?: boolean): void;
export declare function applyDepthMask(gl: WebGLRenderingContext, prevMask: boolean, mask: boolean, force?: boolean): void;
export declare function applyStencilMask(gl: WebGLRenderingContext, prevMask: number, mask: number, force?: boolean): void;
//# sourceMappingURL=pipestate.d.ts.map