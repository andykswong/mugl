import { ShaderDescriptor, ShaderType, VertexBufferLayout } from '../../common';
import { GLRenderingDevice, GLShader as IGLShader } from '../device';
export declare class GLShader implements IGLShader {
    readonly type: ShaderType;
    readonly source: string;
    gls: WebGLShader | null;
    private readonly gl;
    constructor(context: GLRenderingDevice, props: ShaderDescriptor);
    destroy(): void;
}
export declare function createProgram(gl: WebGLRenderingContext, vert: GLShader, frag: GLShader, buffers: VertexBufferLayout[]): WebGLProgram;
//# sourceMappingURL=shader.d.ts.map