import { Animation } from '../gltf-spec/glTF2';
import { ResolvedGlTF } from './types';
/**
 * Options to update a GlTF model.
 */
export interface UpdateGlTFOptions {
    /** The scene to scene. Defaults to the active scene specified by the model. */
    scene?: number;
}
/**
 * Update a GlTF scene and returns all active nodes of the scene.
 * @param glTF Resolve GlTF model
 * @param options update options
 * @returns GlTF node indices for the scene
 */
export declare function updateGlTF(glTF: ResolvedGlTF, options?: UpdateGlTFOptions): number[];
export declare function updateGlTFAnimation(glTF: ResolvedGlTF, animation: Animation, time?: number, loop?: boolean): boolean;
//# sourceMappingURL=update.d.ts.map