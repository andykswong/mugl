import { Mat4 } from 'munum';
import { RenderingDevice } from '../device';
import { ResolvedGlTF } from './types';
/**
 * Options to render a GlTF model.
 */
export interface RenderGlTFOptions {
    /** Specifies the camera to use. Defaults to the first camera, or an identity camera if model does not contain a camera. */
    camera?: {
        /** The camera index to use. */
        index?: number;
        /** Override the model matrix of the camera. */
        model?: Mat4;
        /** Override the projection matrix of the camera. */
        proj?: Mat4;
    };
    /** The scene to render. Defaults to the active scene specified by the model. */
    scene?: number;
}
/**
 * Render a resolved GlTF model.
 * @param device the rendering device
 * @param glTF the GlTF model resolved via resolveGlTF function
 * @param options optional rendering options
 */
export declare function renderGlTF(device: RenderingDevice, glTF: ResolvedGlTF, options?: RenderGlTFOptions): void;
//# sourceMappingURL=render.d.ts.map