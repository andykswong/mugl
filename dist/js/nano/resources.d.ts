import { BufferDescriptor, BufferProperties, GLBuffer as IGLBuffer, GLPipeline as IGLPipeline, GLRenderPass as IGLRenderPass, GLShader as IGLShader, GLTexture as IGLTexture, PipelineDescriptor, PipelineState, ReadonlyExtent3D, ReadonlyOrigin3D, RenderPassDescriptor, SamplerDescriptor, SamplerProperties, ShaderDescriptor, ShaderType, TextureData, TextureDescriptor, TextureProperties } from '../device';
import { PipelineProperties, ReadonlyVertexBufferLayout } from '../../common/device/descriptor';
import { RenderPassProperties } from '../../common/device/descriptor';
export declare class GLBuffer implements IGLBuffer {
    private readonly gl;
    readonly props: BufferProperties;
    glb: WebGLBuffer | null;
    constructor(gl: WebGLRenderingContext, props: BufferDescriptor);
    data(data: ArrayBufferView, offset?: number): GLBuffer;
    destroy(): void;
}
export declare class GLTexture implements IGLTexture {
    private readonly gl;
    readonly props: TextureProperties;
    readonly sampler: SamplerProperties;
    glt: WebGLTexture | null;
    glrb: WebGLRenderbuffer | null;
    constructor(gl: WebGLRenderingContext, props: TextureDescriptor, sampler?: SamplerDescriptor);
    /**
     * Write data to the texture.
     * CAVEAT: Only writing to 2D RGBA8 texture is supported. No support for mipLevel
     */
    data(data: TextureData, [x, y]?: ReadonlyOrigin3D, [width, height]?: ReadonlyExtent3D): GLTexture;
    /**
     * Generate mipmap for a texture object. CAVEAT: no support for mipmap hint.
     */
    mipmap(): GLTexture;
    destroy(): void;
}
export declare class GLRenderPass implements IGLRenderPass {
    private readonly gl;
    readonly props: RenderPassProperties;
    glfb: WebGLFramebuffer | null;
    glrfb: readonly WebGLFramebuffer[];
    constructor(gl: WebGLRenderingContext, props: RenderPassDescriptor, drawBuffersExt?: WEBGL_draw_buffers);
    destroy(): void;
    resolve(): void;
}
export declare class GLShader implements IGLShader {
    private readonly gl;
    readonly type: ShaderType;
    readonly source: string;
    gls: WebGLShader;
    constructor(gl: WebGLRenderingContext, props: ShaderDescriptor);
    destroy(): void;
}
export declare class GLPipeline implements IGLPipeline {
    private readonly gl;
    readonly props: PipelineProperties;
    glp: WebGLProgram | null;
    /** Indicates if pipeline has instanced attribute. */
    i: boolean;
    constructor(gl: WebGLRenderingContext, props: PipelineDescriptor);
    destroy(): void;
}
export declare function applyPipelineState(gl: WebGLRenderingContext, state: PipelineState, stencilRef?: number): void;
export declare function createProgram(gl: WebGLRenderingContext, vs: IGLShader, fs: IGLShader, buffers: readonly ReadonlyVertexBufferLayout[]): WebGLProgram;
//# sourceMappingURL=resources.d.ts.map