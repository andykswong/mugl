import { ASUtil } from '@assemblyscript/loader';
import { Buffer, ImageSource, Pipeline, RenderingDevice, RenderPass, RenderPassContext, Shader, Texture } from '../../common';
import { UniformBindings } from '../../common/device/descriptor';
import { Canvas, GLRenderingDeviceFactory } from '../device';
declare type Ptr = number;
declare type ImageId = Ptr;
declare type CanvasId = Ptr;
declare type RenderingDeviceId = Ptr;
declare type RenderPassContextId = Ptr;
declare type BufferId = Ptr;
declare type TextureId = Ptr;
declare type RenderPassId = Ptr;
declare type ShaderId = Ptr;
declare type PipelineId = Ptr;
/**
 * mugl-WASM binding object.
 */
export interface MuglBind {
    /**
     * Bind mugl to WASM module exports.
     * @param exports module exports
     */
    bindModule(exports: ASUtil & Record<string, unknown>): void;
    /**
     * Register a canvas for use in WASM.
     * @param id ID of the canvas
     * @param canvas the canvas
     * @returns pointer to the given canvas
     */
    addCanvas(id: string, canvas: Canvas): CanvasId;
    /**
     * Register an image for use in WASM.
     * @param id ID of the image
     * @param image the image
     * @returns pointer to the given image
     */
    addImage(id: string, image: ImageSource): ImageId;
    pinned: Record<Ptr, Ptr>;
    canvasIdMap: Record<string, CanvasId>;
    canvas: Record<CanvasId, Canvas>;
    imageIdMap: Record<string, ImageId>;
    images: Record<ImageId, ImageSource>;
    devices: Record<RenderingDeviceId, RenderingDevice>;
    renderPassContexts: Record<RenderPassContextId, RenderPassContext>;
    boundUniforms: Record<RenderPassContextId, UniformBindings>;
    buffers: Record<BufferId, Buffer>;
    textures: Record<TextureId, Texture>;
    shaders: Record<ShaderId, Shader>;
    renderPasses: Record<RenderPassId, RenderPass>;
    pipelines: Record<PipelineId, Pipeline>;
}
/**
 * Bind mugl device library to WASM module.
 */
export declare function muglBind(imports: Record<string, unknown>, deviceFactory?: GLRenderingDeviceFactory): MuglBind;
export {};
//# sourceMappingURL=bind.d.ts.map