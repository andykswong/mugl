/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mat4, vec3 } from 'gl-matrix';
import { GL_BYTE, GL_FLOAT, GL_SHORT, GL_UNSIGNED_BYTE, GL_UNSIGNED_INT, GL_UNSIGNED_SHORT, VertexFormat } from '../device';
import { Accessor, Camera, Extras, GlTF, GlTFProperty, Skin } from './spec/glTF2';
import { ResolvedGlTF } from './types';

const I4 = mat4.create();

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
 * Get camera projection matrix.
 */
export function getCameraProjection(out: mat4, camera: Camera | undefined, aspectRatio?: number): mat4 {
  if (camera?.orthographic) {
    mat4.ortho(out,
      -camera.orthographic.xmag, camera.orthographic.xmag,
      -camera.orthographic.xmag / (aspectRatio || 1), camera.orthographic.xmag / (aspectRatio || 1),
      camera.orthographic.znear, camera.orthographic.zfar);
  } else if (camera?.perspective) {
    mat4.perspective(out,
      camera.perspective.yfov, aspectRatio || camera.perspective.aspectRatio || 1,
      camera.perspective.znear, camera.perspective.zfar || Infinity);
  } else {
    mat4.identity(out);
  }
  return out;
}

/** Get the vertex format of an accessor. */
export function getAccessorVertexFormat(accessor: Accessor): VertexFormat | null {
  switch (accessor.type) {
    case 'VEC2':
      if (accessor.componentType === GL_FLOAT) {
        return VertexFormat.Float2;
      } else if (accessor.componentType === GL_UNSIGNED_SHORT) {
        return accessor.normalized ? VertexFormat.UShort2N : VertexFormat.UShort2;
      }
      // TODO: Unsupported UNSIGNED_BYTE 2/2
      break;
    case 'VEC3':
      if (accessor.componentType === GL_FLOAT) {
        return VertexFormat.Float3;
      }
      // TODO: Unsupported UChar/UShort 3
      break;
    case 'VEC4':
      if (accessor.componentType === GL_FLOAT) {
        return VertexFormat.Float4;
      } else if (accessor.componentType === GL_UNSIGNED_BYTE) {
        return accessor.normalized ? VertexFormat.UChar4N : VertexFormat.UChar4;
      } else if (accessor.componentType === GL_UNSIGNED_SHORT) {
        return accessor.normalized ? VertexFormat.UShort4N : VertexFormat.UShort4;
      }
      break;
  }
  return null;
}

/** Get the element byte size of an accessor. */
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
    case GL_BYTE:
    case GL_UNSIGNED_BYTE: size = 1; break;
    case GL_SHORT:
    case GL_UNSIGNED_SHORT: size = 2; break;
    case GL_UNSIGNED_INT:
    case GL_FLOAT: size = 4; break;
  }

  return length * size;
}

/**
 * Get the inverse bind matrices of a skin.
 */
export function getInverseBindMatrices(glTF: ResolvedGlTF, skin: Skin): Float32Array {
  let matrices = <Float32Array>getExtras(skin).inverseBindMatrices;
  if (!matrices) {
    const accessor = glTF.accessors?.[skin.inverseBindMatrices!];
    if (accessor) {
      // TODO: handle accessor sparse storage
      const bufferView = glTF.bufferViews?.[accessor.bufferView!];
      if (bufferView) {
        const data = <Uint8Array>getExtras(bufferView).buffer;
        matrices = new Float32Array(data.buffer, data.byteOffset + (accessor.byteOffset || 0), accessor.count * 16);
      }
    }
    if (!matrices) {
      matrices = new Float32Array(16 * skin.joints.length);
    }
    getExtras(skin).inverseBindMatrices = matrices;
  }
  return matrices;
}

/**
 * Get the extents of a scene. Requires updateGlTFNodes to be called on the model first.
 */
export function getSceneExtents(outMin: vec3, outMax: vec3, glTF: GlTF, sceneId: number): [outMin: vec3, outMax: vec3] {
  for (let i = 0; i < 3; ++i) {
    outMin[i] = Infinity;
    outMax[i] = -Infinity;
  }

  const scene = glTF.scenes?.[sceneId];
  if (!scene) {
    return [outMin, outMax];
  }

  let nodeIndices = (scene.nodes || []).slice();
  while (nodeIndices.length > 0) {
    const node = glTF.nodes?.[nodeIndices.pop()!];
    if (!node) {
      continue;
    }
    nodeIndices = nodeIndices.concat(node.children || []);

    const mesh = glTF.meshes?.[node.mesh!];
    if (!mesh || !mesh.primitives) {
      continue;
    }

    for (const primitive of mesh.primitives) {
      const accessor = glTF.accessors?.[primitive.attributes.POSITION];
      if (!accessor) {
        continue;
      }

      const assetMin = vec3.create();
      const assetMax = vec3.create();
      getAccessorExtents(assetMin, assetMax, accessor, <mat4>getExtras(node).model || I4);

      for (const i of [0, 1, 2]) {
        outMin[i] = Math.min(outMin[i], assetMin[i]);
        outMax[i] = Math.max(outMax[i], assetMax[i]);
      }
    }
  }

  return [outMin, outMax];
}

const boxMin = vec3.create();
const boxMax = vec3.create();
const center = vec3.create();
const centerToSurface = vec3.create();

function getAccessorExtents(outMin: vec3, outMax: vec3, accessor: Accessor, model: mat4) {
  vec3.transformMat4(boxMin, <vec3>accessor.min, model);
  vec3.transformMat4(boxMax, <vec3>accessor.max, model);

  vec3.add(center, boxMax, boxMin);
  vec3.scale(center, center, 0.5);

  vec3.sub(centerToSurface, boxMax, center);

  const radius = vec3.length(centerToSurface);

  for (const i of [0, 1, 2]) {
    outMin[i] = center[i] - radius;
    outMax[i] = center[i] + radius;
  }
}
