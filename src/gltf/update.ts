/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mat4, quat, vec3 } from 'gl-matrix';
import { getAnimationDuration, getAnimationSamplerInput, getAnimationSamplerOutput, getExtras, getInverseBindMatrices } from './gltf-utils';
import { Animation, Node } from './spec/glTF2';
import { ResolvedGlTF } from './types';
import { arrayCopy } from './utils';

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
 * @param options update options
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

    if ('camera' in node) {
      updateGlTFCamera(glTF, node);
    }

    if ('skin' in node) {
      updateGlTFSkin(glTF, node);
    }
  }

  return activeNodes;
}

export function updateGlTFAnimation(glTF: ResolvedGlTF, animation: Animation, time = 0, loop = false): boolean {
  const duration = getAnimationDuration(glTF, animation);
  const currentTime = loop ? time - Math.floor(time / duration) * duration : Math.min(time, duration);

  for (const channel of animation.channels) {
    const targetNode = glTF.nodes?.[channel.target.node!];
    const sampler = animation.samplers[channel.sampler];
    if (!targetNode || !sampler) {
      continue;
    }

    const input = getAnimationSamplerInput(glTF, sampler);
    const output = getAnimationSamplerOutput(glTF, sampler);
    if (!input?.length || !output) {
      continue;
    }

    const sampleCount = input.length;
    const startTime = input[0];
    const endTime = input[sampleCount - 1];

    // Seek to the current keyframe, using the last keyframe as a reference
    let currentKeyframe: number;
    let nextKeyframe: number;
    if (currentTime <= startTime) {
      currentKeyframe = nextKeyframe = 0;
    } else if (currentTime >= endTime) {
      currentKeyframe = nextKeyframe = sampleCount - 1;
    } else {
      let lastKeyFrame = <number>getExtras(channel).lastKeyframe || 0;
      if (input[lastKeyFrame] > currentTime) {
        lastKeyFrame = 0;
      }
  
      for (
        currentKeyframe = lastKeyFrame, nextKeyframe = currentKeyframe + 1;
        nextKeyframe < sampleCount;
        ++currentKeyframe, ++nextKeyframe
      ) {
        if (input[currentKeyframe] <= currentTime && input[nextKeyframe] > currentTime) {
          break;
        }
      }
    }
    getExtras(channel).lastKeyframe = currentKeyframe;

    const previousTime = input[currentKeyframe];
    const nextTime = input[nextKeyframe];

    const path = channel.target.path;
    let componentSize = 3;  // for translation / scale
    switch (path) {
      case 'rotation':
        componentSize = 4;
        break;
      case 'weights':
        componentSize = targetNode.weights?.length || glTF.meshes?.[targetNode.mesh!]?.weights?.length || 0;
        break;
    }

    if (!componentSize) {
      continue;
    }

    let interpolation = sampler.interpolation;
    if (currentKeyframe === nextKeyframe) {
      interpolation = 'STEP';
    }

    const value = getExtras(targetNode)[path] = <number[]>getExtras(targetNode)[path] || new Array(componentSize);
    const tmp = new Array(componentSize);
    switch (interpolation) {
      case 'STEP':
        arrayCopy(value, output, 0, currentKeyframe * componentSize, componentSize);
        break;
      case 'CUBICSPLINE':
        arrayCopy(value, output, 0, currentKeyframe * 3 * componentSize + componentSize, componentSize);
        break;
      default: { // LINEAR
        const a = (currentTime - previousTime) / (nextTime - previousTime);
        if (path === 'rotation') {
          arrayCopy(value, output, 0, currentKeyframe * componentSize, componentSize);
          arrayCopy(tmp, output, 0, currentKeyframe * componentSize + componentSize, componentSize);
          quat.slerp(<quat>value, <quat>value, <quat>tmp, a);
        } else {
          for (let i = 0; i < componentSize; ++i) {
            value[i] = (1 - a) * output[currentKeyframe * componentSize + i] + a * output[nextKeyframe * componentSize + i];
          }
        }
        break;
      }
    }
  }

  return time < duration;
}

function updateGlTFNode(glTF: ResolvedGlTF, nodeId: number, origin: mat4, activeNodes: number[] | null = null): void {
  const node = glTF.nodes?.[nodeId];
  if (!node) {
    return; // Skip invalid node
  }
  activeNodes?.push(nodeId);

  const nodeExtras = getExtras(node);

  // Update local matrix
  const matrix = nodeExtras.matrix = <mat4>nodeExtras.matrix || mat4.create();
  if (node.matrix) {
    mat4.copy(matrix, node.matrix);
  } else if (
    node.rotation || node.scale || node.translation ||
    nodeExtras.rotation || nodeExtras.scale || nodeExtras.translation
  ) {
    mat4.fromRotationTranslationScale(
      matrix,
      <quat>nodeExtras.rotation || node.rotation || Iq,
      <vec3>nodeExtras.translation || node.translation || Z3,
      <vec3>nodeExtras.scale || node.scale || S3
    );
  }

  // Update model matrix
  const model = nodeExtras.model = mat4.mul(<mat4>nodeExtras.model || mat4.create(), origin, matrix);

  if (node.children) {
    for (const child of node.children) {
      updateGlTFNode(glTF, child, model, activeNodes);
    }
  }
}

function updateGlTFCamera(glTF: ResolvedGlTF, node: Node): void {
  const camera = glTF.cameras?.[node.camera!];
  if (camera) {
    const model = getExtras(node).model = <mat4>getExtras(node).model || I4;
    getExtras(camera).view = mat4.invert(<mat4>getExtras(camera).view || mat4.create(), model);
    getExtras(camera).translation = vec3.set(<vec3>getExtras(camera).translation || vec3.create(), model[12], model[13], model[14]);
  }
}

function updateGlTFSkin(glTF: ResolvedGlTF, node: Node): void {
  const skin = glTF.skins?.[node.skin!];
  if (!skin) {
    return;
  }
  const numJoints = skin.joints.length;
  const jointMatrix = getExtras(node).jointMatrix = <Float32Array>getExtras(node).jointMatrix || new Float32Array(numJoints * 16);
  const inverseBindMatrices = getInverseBindMatrices(glTF, skin);

  for (let i = 0; i < numJoints; ++i) {
    const jointNode = glTF.nodes![skin.joints[i]];
    const jointMat = new Float32Array(jointMatrix.buffer, jointMatrix.byteOffset + 16 * 4 * i, 16);

    mat4.invert(jointMat, <mat4>getExtras(node).model || I4);
    mat4.mul(jointMat, jointMat, (jointNode && <mat4>getExtras(jointNode).model) || I4);
    mat4.mul(jointMat, jointMat, new Float32Array(inverseBindMatrices.buffer, inverseBindMatrices.byteOffset + 16 * 4 * i, 16));
  }
}
