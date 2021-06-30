/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mat4, quat, vec3 } from 'gl-matrix';
import { getExtras, getInverseBindMatrices } from './gltf-utils';
import { Node } from './spec/glTF2';
import { ResolvedGlTF } from './types';

const I4 = mat4.create();
const Iq = quat.create();
const S3 = vec3.fromValues(1, 1, 1);
const Z3 = vec3.create();

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
 * @param options 
 * @returns GlTF node indices for the scene
 */
export function updateGlTF(glTF: ResolvedGlTF, options: UpdateGlTFOptions = {}): number[] {
  let activeNodes: number[] = [];

  const rootNodes = glTF.scenes?.[(options.scene ?? glTF.scene) || 0]?.nodes;
  if (rootNodes) {
    for (let i = 0; i < rootNodes.length; ++i) {
      updateGlTFNode(glTF, rootNodes[i], I4, activeNodes);
    }
  }

  // Sort and remove duplicates
  activeNodes = activeNodes.sort().filter((n, i, a) => (!i || n !== a[i - 1]));

  // Find and update active cameras and skinned nodes
  for (const nodeId of activeNodes) {
    const node = glTF.nodes![nodeId];

    if (glTF.cameras?.[node.camera!]) {
      updateGlTFCamera(glTF, node);
    }

    if (glTF.skins?.[node.skin!]) {
      updateGlTFSkin(glTF, node);
    }
  }

  return activeNodes;
}

function updateGlTFNode(glTF: ResolvedGlTF, nodeId: number, origin: mat4, activeNodes: number[] | null = null): void {
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
  const model = getExtras(node).model = mat4.mul(<mat4>getExtras(node).model || mat4.create(), origin, matrix);

  if (node.children) {
    for (const child of node.children) {
      updateGlTFNode(glTF, child, model, activeNodes);
    }
  }
}

function updateGlTFCamera(glTF: ResolvedGlTF, node: Node): void {
  const camera = glTF.cameras![node.camera!];
  const model = getExtras(node).model = <mat4>getExtras(node).model || I4;
  getExtras(camera).view = mat4.invert(<mat4>getExtras(camera).view || mat4.create(), model);
  getExtras(camera).translation = vec3.set(<vec3>getExtras(camera).translation || vec3.create(), model[12], model[13], model[14]);
}

function updateGlTFSkin(glTF: ResolvedGlTF, node: Node): void {
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
