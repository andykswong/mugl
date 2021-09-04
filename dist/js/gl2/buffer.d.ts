import { BufferDescriptor, BufferProperties, Uint } from '../../common';
import { GLBuffer as IGLBuffer, GLRenderingDevice } from '../device';
export declare class GLBuffer implements IGLBuffer {
    readonly props: BufferProperties;
    glb: WebGLBuffer | null;
    private readonly gl;
    constructor(context: GLRenderingDevice, props: BufferDescriptor);
    data(data: ArrayBufferView, offset?: Uint): GLBuffer;
    destroy(): void;
}
//# sourceMappingURL=buffer.d.ts.map