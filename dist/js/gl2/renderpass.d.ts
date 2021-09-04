import { RenderPassDescriptor, RenderPassProperties } from '../../common';
import { GLRenderPass as IGLRenderPass, GLRenderingDevice } from '../device';
export declare class GLRenderPass implements IGLRenderPass {
    readonly props: RenderPassProperties;
    glfb: WebGLFramebuffer | null;
    glrfb: (WebGLFramebuffer | null)[];
    private readonly gl;
    constructor(context: GLRenderingDevice, props?: RenderPassDescriptor);
    destroy(): void;
    resolve(): void;
}
//# sourceMappingURL=renderpass.d.ts.map