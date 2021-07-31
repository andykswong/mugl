/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Mat4, mat4, ortho, perspective } from 'munum';
import { GLenum } from '../../common/gl';
import { VertexFormat } from '../device';
import { Accessor, Animation, AnimationSampler, BufferView, Camera, Extras, GlTF, GlTFProperty, Node, Scene, Skin } from '../gltf-spec/glTF2';
import { KHRLightsPunctualGlTFExtension } from '../gltf-spec/KHR_lights_punctual';
import { ResolvedBuffers } from './types';

/**
 * Get the extras object of a property, creating a new object if not exist.
 */
export function getExtras(property: GlTFProperty): Extras {
  if (!property.extras) {
    property.extras = {};
  }
  return property.extras;
}

/**
 * Traverse the given node hierachy.
 */
export function traverseNode(glTF: GlTF, nodeId: number, callback: (node: Node, parent: Node | null) => boolean | void, parent: Node | null = null): void {
  const node = glTF.nodes?.[nodeId];
  if (node && !callback(node, parent) && node.children) {
    for (const childNodeId of node.children) {
      traverseNode(glTF, childNodeId, callback, node);
    }
  }
}

/**
 * Get the total duration of an animation.
 */
export function getAnimationDuration(glTF: GlTF & ResolvedBuffers, animation: Animation): number {
  let duration = (getExtras(animation).duration as number) || 0;
  for (const channel of animation.channels) {
    const targetNode = glTF.nodes?.[channel.target.node!];
    const accessor = glTF.accessors?.[animation.samplers[channel.sampler]?.input];
    if (targetNode && accessor) {
      duration = Math.max(duration, accessor.max?.[0] || 0);
    }
  }
  return (getExtras(animation).duration = duration);
}

/**
 * Get the channel input data of an animation.
 */
export function getAnimationSamplerInput(glTF: GlTF & ResolvedBuffers, sampler: AnimationSampler): Float32Array | null {
  let input = (getExtras(sampler).input as Float32Array) || null;
  if (!input) {
    const accessor = glTF.accessors?.[sampler.input];
    if (accessor) {
      const { buffer, byteOffset = 0 } = getAccessorData(glTF, accessor);
      getExtras(sampler).input = input =
        new Float32Array(buffer.buffer, byteOffset + buffer.byteOffset, (buffer.byteLength - byteOffset) / 4);
    }
  }
  return input;
}

type SamplerOutputBufferConstructor = Float32ArrayConstructor
  | Int8ArrayConstructor | Uint8ArrayConstructor
  | Int16ArrayConstructor | Uint16ArrayConstructor;

export type SamplerOutputBuffer = InstanceType<SamplerOutputBufferConstructor>

/**
 * Get the channel output data of an animation.
 */
export function getAnimationSamplerOutput(glTF: GlTF & ResolvedBuffers, sampler: AnimationSampler): SamplerOutputBuffer | null {
  let output = (getExtras(sampler).output as SamplerOutputBuffer) || null;
  if (!output) {
    const accessor = glTF.accessors?.[sampler.output];
    if (accessor) {
      const { buffer, byteOffset = 0 } = getAccessorData(glTF, accessor);
      let Type: SamplerOutputBufferConstructor = Float32Array;
      switch (accessor.componentType) {
        case GLenum.BYTE: Type = Int8Array; break;
        case GLenum.UNSIGNED_BYTE: Type = Uint8Array; break;
        case GLenum.SHORT: Type = Uint16Array; break;
        case GLenum.UNSIGNED_SHORT: Type = Uint16Array; break;
      }

      getExtras(sampler).output = output =
        new Type(buffer.buffer, byteOffset + buffer.byteOffset, (buffer.byteLength - byteOffset) / Type.BYTES_PER_ELEMENT);
    }
  }
  return output;
}

/**
 * Get the normalized animation output value from buffer.
 */
export function getAnimationOutputValue(buffer: SamplerOutputBuffer, index: number): number {
  if (buffer instanceof Int8Array) {
    return Math.max(buffer[index] / 127, -1);
  }
  if (buffer instanceof Uint8Array) {
    return buffer[index] / 255;
  }
  if (buffer instanceof Int16Array) {
    return Math.max(buffer[index] / 32767, -1);
  }
  if (buffer instanceof Uint16Array) {
    return buffer[index] / 65535;
  }
  return buffer[index];
}

/**
 * Get the vertex format of an accessor.
 */
export function getAccessorVertexFormat(accessor: Accessor): VertexFormat | null {
  switch (accessor.type) {
    case 'VEC2':
      if (accessor.componentType === GLenum.FLOAT) {
        return VertexFormat.Float2;
      } else if (accessor.componentType === GLenum.UNSIGNED_SHORT) {
        return accessor.normalized ? VertexFormat.UShort2N : VertexFormat.UShort2;
      } else if (accessor.componentType === GLenum.UNSIGNED_BYTE) {
        return accessor.normalized ? VertexFormat.UChar2N : VertexFormat.UChar2;
      }
      break;
    case 'VEC3':
      if (accessor.componentType === GLenum.FLOAT) {
        return VertexFormat.Float3;
      }
      // TODO: UChar3N/UShort3N can be used for vertex color, but unsupported by WebGPU. Widen to UChar4N/UShort4N instead
      break;
    case 'VEC4':
      if (accessor.componentType === GLenum.FLOAT) {
        return VertexFormat.Float4;
      } else if (accessor.componentType === GLenum.UNSIGNED_BYTE) {
        return accessor.normalized ? VertexFormat.UChar4N : VertexFormat.UChar4;
      } else if (accessor.componentType === GLenum.UNSIGNED_SHORT) {
        return accessor.normalized ? VertexFormat.UShort4N : VertexFormat.UShort4;
      }
      break;
  }
  return null;
}

/**
 * Get the element byte size of an accessor.
 */
export function getAccessorElementSize(accessor: Accessor): number {
  let length = 0;
  switch (accessor.type) {
    case 'SCALAR': length = 1; break;
    case 'VEC2': length = 2; break;
    case 'VEC3': length = 3; break;
    case 'VEC4':
    case 'MAT2': length = 4; break;
    case 'MAT3': length = 9; break;
    case 'MAT4': length = 16; break;
  }

  let size = 0;
  switch (accessor.componentType) {
    case GLenum.BYTE:
    case GLenum.UNSIGNED_BYTE: size = 1; break;
    case GLenum.SHORT:
    case GLenum.UNSIGNED_SHORT: size = 2; break;
    case GLenum.UNSIGNED_INT:
    case GLenum.FLOAT: size = 4; break;
  }

  return length * size;
}

/**
 * Get the data of an accessor.
 */
export function getAccessorData(glTF: GlTF & ResolvedBuffers, accessor: Accessor): { buffer: Uint8Array, byteOffset: number } {
  let buffer: Uint8Array | undefined = getExtras(accessor).buffer as Uint8Array | undefined;
  let byteOffset = (getExtras(accessor).byteOffset as number) || 0;
  if (buffer) {
    return { buffer, byteOffset };
  }

  const elementSize = getAccessorElementSize(accessor);
  let bufferLength = accessor.count * elementSize;

  // Resolve buffer from bufferView
  const bufferView = glTF.bufferViews?.[accessor.bufferView!];
  if (bufferView) {
    const bufferViewData = getBufferViewData(glTF, bufferView);
    const alignment = bufferView.byteStride || 1;

    byteOffset = (accessor.byteOffset || 0) % alignment;
    bufferLength = accessor.count * (bufferView.byteStride || elementSize);

    const bufferOffset = (accessor.byteOffset || 0) - byteOffset;

    buffer = new Uint8Array(bufferViewData.buffer, bufferViewData.byteOffset + bufferOffset, bufferLength);
  }

  // Resolve sparse accessor
  if (accessor.sparse) {
    const {
      count,
      indices: { bufferView: indexViewId, byteOffset: indexViewOffset = 0, componentType },
      values: { bufferView: valueViewId, byteOffset: valueViewOffset = 0 }
    } = accessor.sparse;
    const indexView = glTF.bufferViews?.[indexViewId!];
    const valueView = glTF.bufferViews?.[valueViewId!];

    if (indexView && valueView) {
      const sparseBuffer = new Uint8Array(bufferLength);
      if (buffer) {
        sparseBuffer.set(buffer, byteOffset);
      }

      const indexBuffer = getBufferViewData(glTF, indexView);
      const valueBuffer = getBufferViewData(glTF, valueView);
      const IndexBufferType = componentType === GLenum.UNSIGNED_BYTE ? Uint8Array : componentType === GLenum.UNSIGNED_SHORT ? Uint16Array : Uint32Array;
      const indices = new IndexBufferType(indexBuffer.buffer, indexBuffer.byteOffset + indexViewOffset, count);
      const values = new Uint8Array(valueBuffer.buffer, valueBuffer.byteOffset + valueViewOffset, count * elementSize);
      for (let j = 0; j < count; ++j) {
        const index = indices[j] * elementSize;
        for (let k = 0; k < elementSize; ++k) {
          sparseBuffer[index + k] = values[j * elementSize + k];
        }
      }

      // Use the sparse buffer instead of underlying buffer view
      byteOffset = 0;
      buffer = sparseBuffer;
    }
  }

  if (buffer) {
    getExtras(accessor).buffer = buffer;
    getExtras(accessor).byteOffset = byteOffset;
  } else {
    buffer = new Uint8Array();
  }

  return { buffer, byteOffset };
}

/**
 * Get the data of a bufferView.
 */
export function getBufferViewData(glTF: GlTF & ResolvedBuffers, bufferView: BufferView): Uint8Array {
  let bufferViewData = getExtras(bufferView).buffer as Uint8Array | undefined;
  if (!bufferViewData) {
    const buffer = glTF.buffers?.[bufferView.buffer];
    if (buffer) {
      const bufferData = buffer.extras.buffer;
      bufferViewData = new Uint8Array(
        bufferData.buffer, bufferData.byteOffset + (bufferView.byteOffset || 0), bufferView.byteLength);
    } else {
      bufferViewData = new Uint8Array();
    }
    getExtras(bufferView).buffer = bufferViewData;
  }
  return bufferViewData;
}

/**
 * Get camera projection matrix.
 */
export function getCameraProjection(out: Mat4, camera: Camera | undefined, aspectRatio?: number): Mat4 {
  if (camera?.orthographic) {
    ortho(
      -camera.orthographic.xmag, camera.orthographic.xmag,
      -camera.orthographic.xmag / (aspectRatio || 1), camera.orthographic.xmag / (aspectRatio || 1),
      camera.orthographic.znear, camera.orthographic.zfar,
      out);
  } else if (camera?.perspective) {
    perspective(
      aspectRatio || camera.perspective.aspectRatio || 1, camera.perspective.yfov, 
      camera.perspective.znear, camera.perspective.zfar || Infinity,
      out);
  } else {
    mat4.id(out);
  }
  return out;
}

/**
 * Get the inverse bind matrices of a skin.
 */
export function getInverseBindMatrices(glTF: GlTF & ResolvedBuffers, skin: Skin): Float32Array {
  let matrices = getExtras(skin).inverseBindMatrices as Float32Array;
  if (!matrices) {
    const accessor = glTF.accessors?.[skin.inverseBindMatrices!];
    if (accessor) {
      const { buffer, byteOffset } = getAccessorData(glTF, accessor);
      matrices = new Float32Array(buffer.buffer, buffer.byteOffset + byteOffset, 16 * skin.joints.length);
    } else {
      matrices = new Float32Array(16 * skin.joints.length);
    }
    getExtras(skin).inverseBindMatrices = matrices;
  }
  return matrices;
}

/**
 * Get all scene lights
 */
export function getSceneLights(glTF: GlTF, scene: Scene): KHRLightsPunctualGlTFExtension[] {
  const lights: KHRLightsPunctualGlTFExtension[] = [];
  if (scene.nodes) {
    for (const nodeId of scene.nodes) {
      traverseNode(glTF, nodeId, (node) => {
        const light = node.extensions?.KHR_lights_punctual as KHRLightsPunctualGlTFExtension;
        if (light) {
          lights.push(light);
        }
      });
    }
  }
  return lights;
}
