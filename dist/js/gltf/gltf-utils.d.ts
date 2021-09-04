import { Mat4 } from 'munum';
import { VertexFormat } from '../device';
import { Accessor, Animation, AnimationSampler, BufferView, Camera, Extras, GlTF, GlTFProperty, Node, Scene, Skin } from '../gltf-spec/glTF2';
import { KHRLightsPunctualGlTFExtension } from '../gltf-spec/KHR_lights_punctual';
import { ResolvedBuffers } from './types';
/**
 * Get the extras object of a property, creating a new object if not exist.
 */
export declare function getExtras(property: GlTFProperty): Extras;
/**
 * Traverse the given node hierachy.
 */
export declare function traverseNode(glTF: GlTF, nodeId: number, callback: (node: Node, parent: Node | null) => boolean | void, parent?: Node | null): void;
/**
 * Get the total duration of an animation.
 */
export declare function getAnimationDuration(glTF: GlTF & ResolvedBuffers, animation: Animation): number;
/**
 * Get the channel input data of an animation.
 */
export declare function getAnimationSamplerInput(glTF: GlTF & ResolvedBuffers, sampler: AnimationSampler): Float32Array | null;
declare type SamplerOutputBufferConstructor = Float32ArrayConstructor | Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor;
export declare type SamplerOutputBuffer = InstanceType<SamplerOutputBufferConstructor>;
/**
 * Get the channel output data of an animation.
 */
export declare function getAnimationSamplerOutput(glTF: GlTF & ResolvedBuffers, sampler: AnimationSampler): SamplerOutputBuffer | null;
/**
 * Get the normalized animation output value from buffer.
 */
export declare function getAnimationOutputValue(buffer: SamplerOutputBuffer, index: number): number;
/**
 * Get the vertex format of an accessor.
 */
export declare function getAccessorVertexFormat(accessor: Accessor): VertexFormat | null;
/**
 * Get the element byte size of an accessor.
 */
export declare function getAccessorElementSize(accessor: Accessor): number;
/**
 * Get the data of an accessor.
 */
export declare function getAccessorData(glTF: GlTF & ResolvedBuffers, accessor: Accessor): {
    buffer: Uint8Array;
    byteOffset: number;
};
/**
 * Get the data of a bufferView.
 */
export declare function getBufferViewData(glTF: GlTF & ResolvedBuffers, bufferView: BufferView): Uint8Array;
/**
 * Get camera projection matrix.
 */
export declare function getCameraProjection(out: Mat4, camera: Camera | undefined, aspectRatio?: number): Mat4;
/**
 * Get the inverse bind matrices of a skin.
 */
export declare function getInverseBindMatrices(glTF: GlTF & ResolvedBuffers, skin: Skin): Float32Array;
/**
 * Get all scene lights
 */
export declare function getSceneLights(glTF: GlTF, scene: Scene): KHRLightsPunctualGlTFExtension[];
export {};
//# sourceMappingURL=gltf-utils.d.ts.map