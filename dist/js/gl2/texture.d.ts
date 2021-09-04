import { MipmapHint, SamplerProperties, ReadonlyExtent3D, ReadonlyOrigin3D, SamplerDescriptor, TextureData, TextureDescriptor, TextureProperties, Uint } from '../../common';
import { GLRenderingDevice, GLTexture as IGLTexture, ReadonlyExtent2D, ReadonlyOrigin2D } from '../device';
export declare class GLTexture implements IGLTexture {
    private readonly webgl2;
    readonly props: TextureProperties;
    readonly sampler: SamplerProperties;
    glt: WebGLTexture | null;
    glrb: WebGLRenderbuffer | null;
    private readonly gl;
    constructor(context: GLRenderingDevice, props?: TextureDescriptor, sampler?: SamplerDescriptor, webgl2?: boolean);
    data(data: TextureData, [x, y, z]?: ReadonlyOrigin2D | ReadonlyOrigin3D, [width, height, depth]?: ReadonlyExtent2D | ReadonlyExtent3D, mipLevel?: Uint): GLTexture;
    mipmap(type?: MipmapHint): GLTexture;
    destroy(): void;
}
//# sourceMappingURL=texture.d.ts.map