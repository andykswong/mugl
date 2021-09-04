import { PipelineDescriptor, PipelineProperties, UniformLayoutEntry } from '../../common';
import { GLPipeline as IGLPipeline, GLRenderingDevice } from '../device';
/** An entry of uniform info cache */
declare type UniformCacheEntry = UniformLayoutEntry & {
    /** Uniform location. */
    loc: WebGLUniformLocation | null;
    /** Uniform block index. */
    index: GLuint;
    /** Uniform buffer / Texture bind slot ID. */
    binding: number;
};
/** Cache of uniform info. */
declare type UniformCache = Record<string, UniformCacheEntry>;
export declare class GLPipeline implements IGLPipeline {
    readonly props: PipelineProperties;
    glp: WebGLProgram | null;
    readonly cache: UniformCache;
    readonly instanced: boolean;
    private readonly gl;
    constructor(context: GLRenderingDevice, props: PipelineDescriptor);
    destroy(): void;
}
export {};
//# sourceMappingURL=pipeline.d.ts.map