/**
 * A resource that can be destroyed.
 */
export interface Resource {
    /**
     * Destroy the resource.
     */
    destroy(): void;
}
/**
 * A GPU device resource.
 */
export interface Device extends Resource {
    _deviceBrand: string;
}
/**
 * A GPU buffer resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 * @see https://www.w3.org/TR/webgpu/#buffer-interface
 */
export interface Buffer extends Resource {
    _bufferBrand: string;
}
/**
 * A GPU texture resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 * @see https://www.w3.org/TR/webgpu/#texture-interface
 */
export interface Texture extends Resource {
    _textureBrand: string;
}
/**
 * A GPU texture sampler resource.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 * @see https://www.w3.org/TR/webgpu/#sampler-interface
 */
export interface Sampler extends Resource {
    _samplerBrand: string;
}
/**
 * A GPU shader object.
 * @see https://www.w3.org/TR/webgpu/#shader-module
 */
export interface Shader extends Resource {
    _shaderBrand: string;
}
/**
 * A GPU render pipeline object.
 * @see https://www.w3.org/TR/webgpu/#render-pipeline-creation
 */
export interface RenderPipeline extends Resource {
    _renderPipelineBrand: string;
}
/**
 * A GPU render pass object.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindFramebuffer
 * @see https://www.w3.org/TR/webgpu/#render-pass-encoder-creation
 */
export interface RenderPass extends Resource {
    _renderPassBrand: string;
}
/**
 * A GPU bind group layout object.
 * @see https://www.w3.org/TR/webgpu/#bind-group-layout
 */
export interface BindGroupLayout extends Resource {
    _bindGroupLayoutBrand: string;
}
/**
 * A GPU bind group object.
 * @see https://www.w3.org/TR/webgpu/#gpu-bind-group
 */
export interface BindGroup extends Resource {
    _bindGroupBrand: string;
}
//# sourceMappingURL=resource.d.ts.map