/**
* A canvas element from which a WebGL2RenderingContext can be retrieved.
*/
export type Canvas = HTMLCanvasElement | WebGL2RenderingContextProvider;
/**
 * Interface for a provider of WebGL2RenderingContext provider.
 * Useful for non-Web environments where HTML Canvas element does not exist.
 */
export interface WebGL2RenderingContextProvider {
    /**
     * Gets a WebGLRenderingContext.
     *
     * @param type WebGL version. Must be 'webgl2'
     * @param options optional WebGL rendering context attributes
     * @returns a WebGL2RenderingContext, or null if unsupported.
     */
    getContext(type: 'webgl2', options?: WebGLContextAttributes): WebGL2RenderingContext | null;
    /**
     * @returns the canvas width.
     */
    get width(): number;
    /**
     * @returns the canvas height.
     */
    get height(): number;
}
/**
 * Supported WebGL2 features.
 */
export declare enum WebGL2Feature {
    /** EXT_texture_filter_anisotropic */
    TextureAnisotropic,
    /** OES_texture_half_float_linear */
    TextureHalfFloatLinear,
    /** OES_texture_float_linear */
    TextureFloatLinear,
    /** EXT_color_buffer_float */
    ColorBufferFloat,
    /** OES_draw_buffers_indexed */
    DrawBuffersIndexed
}
export declare const WebGL2FeatureNames: Record<WebGL2Feature, string>;
//# sourceMappingURL=type.d.ts.map