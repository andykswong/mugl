/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mat4, quat, vec3 } from 'gl-matrix';
import { Accessor, Camera, Extras, GlTF, GlTFProperty, Node, Skin } from './spec/glTF2';

const I4 = mat4.create();
const Iq = quat.create();
const S3 = vec3.fromValues(1, 1, 1);
const Z3 = vec3.create();

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

/**
 * Update model matrices for a GlTF scene and returns the active nodes.
 */
export function updateGlTFNodes(glTF: GlTF, sceneId = glTF.scene || 0): number[] {
  let activeNodes: number[] = [];
  const rootNodes = glTF.scenes?.[sceneId]?.nodes;
  if (rootNodes) {
    for (let i = 0; i < rootNodes.length; ++i) {
      updateGlTFNode(glTF, rootNodes[i], I4, activeNodes);
    }
  }
  activeNodes = activeNodes.sort().filter((n, i, a) => (i === a.indexOf(n)));

  // Update Skin
  const activeSkinned: Node[] = [];
  for (const nodeId of activeNodes) {
    const node = glTF.nodes![nodeId];
    if (glTF.skins?.[node.skin!]) {
      activeSkinned.push(node);
    }
  }
  for (const node of activeSkinned) {
    const skin = glTF.skins![node.skin!];
    const numJoints = skin.joints.length;
    const jointMatrix = getExtras(node).jointMatrix = <Float32Array>getExtras(node).jointMatrix || new Float32Array(numJoints * 16);
    const inverseBindMatrices = getInverseBindMatrices(glTF, skin);
    for (let i = 0; i < numJoints; ++i) {
      const jointNode = glTF.nodes![skin.joints[i]];
      const jointModel = (jointNode && <mat4>getExtras(jointNode).model) || I4;
      const jointMat = new Float32Array(jointMatrix.buffer, jointMatrix.byteOffset + 16 * 4 * i, 16);

      mat4.invert(jointMat, <mat4>getExtras(node).model || I4);
      mat4.mul(jointMat, jointMat, jointModel);
      mat4.mul(jointMat, jointMat, new Float32Array(inverseBindMatrices.buffer, inverseBindMatrices.byteOffset + 16 * 4 * i, 16));
    }
  }

  return activeNodes;
}

function updateGlTFNode(glTF: GlTF, nodeId: number, origin: mat4, activeNodes: number[] | null = null): void {
  const node = glTF.nodes?.[nodeId];
  if (!node) {
    return; // Skip invalid node
  }
  activeNodes?.push(nodeId);

  // Update local matrix
  const matrix = getExtras(node).matrix = <mat4>getExtras(node).matrix || mat4.create();
  if (node.matrix) {
    mat4.copy(matrix, node.matrix);
  } else if (node.rotation || node.scale || node.translation) {
    mat4.fromRotationTranslationScale(matrix, node.rotation || Iq, node.translation || Z3, node.scale || S3);
  }

  // Update model matrix
  const model = getExtras(node).model = <mat4>getExtras(node).model || mat4.create();
  mat4.mul(model, origin, matrix);

  // Update camera view
  const camera = glTF.cameras?.[node.camera!];
  if (camera) {
    const view = getExtras(camera).view = <mat4>getExtras(camera).view || mat4.create();
    mat4.invert(view, model);
    const translation = getExtras(camera).translation = <vec3>getExtras(camera).translation || vec3.create();
    vec3.set(translation, model[12], model[13], model[14]);
  }

  if (node.children) {
    for (const child of node.children) {
      updateGlTFNode(glTF, child, model, activeNodes);
    }
  }
}

function getInverseBindMatrices(glTF: GlTF, skin: Skin): Float32Array {
  let matrices = <Float32Array>getExtras(skin).inverseBindMatrices;
  if (!matrices) {
    const accessor = glTF.accessors?.[skin.inverseBindMatrices!];
    if (accessor) {
      // TODO: handle accessor sparse storage
      const bufferView = glTF.bufferViews?.[accessor.bufferView!];
      if (bufferView) {
        const data = <Uint8Array>getExtras(bufferView).bufferView;
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

function getAccessorExtents(outMin: vec3, outMax: vec3, accessor: Accessor, model: mat4) {
  const boxMin = vec3.create();
  vec3.transformMat4(boxMin, <vec3>accessor.min, model);

  const boxMax = vec3.create();
  vec3.transformMat4(boxMax, <vec3>accessor.max, model);

  const center = vec3.create();
  vec3.add(center, boxMax, boxMin);
  vec3.scale(center, center, 0.5);

  const centerToSurface = vec3.create();
  vec3.sub(centerToSurface, boxMax, center);

  const radius = vec3.length(centerToSurface);

  for (const i of [0, 1, 2]) {
    outMin[i] = center[i] - radius;
    outMax[i] = center[i] + radius;
  }
}
