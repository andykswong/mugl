import { glTF2, GlTFAsset } from '@muds/gltf';
import { Mat4, mat, mat4, Quat, quat, transform, Vec3, vec3 } from 'munum';
import { getAnimationDuration, getAnimationSamplerInput, getAnimationSamplerOutput, getExtras, getInverseBindMatrices, SamplerOutputBuffer } from './utils';

const I4 = mat4.create();
const Iq = quat.create();
const S3 = vec3.create(1, 1, 1);
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
 */
export function updateGlTF(asset: GlTFAsset, options: UpdateGlTFOptions = {}): number[] {
  let activeNodes: number[] = [];

  const rootNodes = asset.glTF.scenes?.[(options.scene ?? asset.glTF.scene) || 0]?.nodes;
  if (rootNodes) {
    for (let i = 0; i < rootNodes.length; ++i) {
      updateGlTFNode(asset.glTF, rootNodes[i], I4, activeNodes);
    }
  }

  // Sort and remove duplicates
  activeNodes = activeNodes.sort().filter((n, i, a) => (!i || n !== a[i - 1]));

  // Find and update active cameras and skinned nodes
  for (const nodeId of activeNodes) {
    const node = asset.glTF.nodes![nodeId];

    if ('camera' in node) {
      updateGlTFCamera(asset.glTF, node);
    }

    if ('skin' in node) {
      updateGlTFSkin(asset, node);
    }
  }

  return activeNodes;
}

export function updateGlTFAnimation(asset: GlTFAsset, animation: glTF2.Animation, time = 0, loop = false): boolean {
  const duration = getAnimationDuration(asset.glTF, animation);
  const currentTime = loop ? time - Math.floor(time / duration) * duration : Math.min(time, duration);

  for (const channel of animation.channels) {
    const targetNode = asset.glTF.nodes?.[channel.target.node!];
    const sampler = animation.samplers[channel.sampler];
    if (!targetNode || !sampler) {
      continue;
    }

    const input = getAnimationSamplerInput(asset, sampler);
    const output = getAnimationSamplerOutput(asset, sampler);
    if (!input?.length || !output) {
      continue;
    }

    const sampleCount = input.length;
    const startTime = input[0];
    const endTime = input[sampleCount - 1];

    const lastKeyFrame = (getExtras(channel).lastKeyframe as number) || 0;
    const [currentKeyframe, nextKeyframe] =
      seekKeyFrame(input, startTime, endTime, currentTime, lastKeyFrame);
    getExtras(channel).lastKeyframe = currentKeyframe;

    const path = channel.target.path;
    let componentSize = 3;  // for translation / scale
    let useSlerp = false;
    switch (path) {
      case 'rotation':
        componentSize = 4;
        useSlerp = true;
        break;
      case 'weights':
        componentSize = targetNode.weights?.length || asset.glTF.meshes?.[targetNode.mesh!]?.weights?.length || 0;
        break;
    }
    const value = getExtras(targetNode)[path] = (getExtras(targetNode)[path] as number[]) || new Array(componentSize);

    interpolate(
      value, input, output,
      currentKeyframe, nextKeyframe, currentTime,
      sampler.interpolation || 'LINEAR',
      useSlerp
    );
  }

  return time < duration;
}

function updateGlTFNode(glTF: glTF2.GlTF, nodeId: number, origin: Mat4, activeNodes: number[] | null = null): void {
  const node = glTF.nodes?.[nodeId];
  if (!node) {
    return; // Skip invalid node
  }
  activeNodes?.push(nodeId);

  const nodeExtras = getExtras(node);

  // Update local matrix
  const matrix = nodeExtras.matrix = (nodeExtras.matrix as Mat4) || mat4.create();
  if (node.matrix) {
    mat4.copy(node.matrix, matrix);
  } else if (
    node.rotation || node.scale || node.translation ||
    nodeExtras.rotation || nodeExtras.scale || nodeExtras.translation
  ) {
    transform(
      (nodeExtras.translation as Vec3) || node.translation || Z3,
      (nodeExtras.rotation as Quat) || node.rotation || Iq,
      (nodeExtras.scale as Vec3) || node.scale || S3,
      matrix
    );
  }

  // Update model matrix
  const model = nodeExtras.model = mat4.mul(origin, matrix, (nodeExtras.model as Mat4) || mat4.create());

  if (node.children) {
    for (const child of node.children) {
      updateGlTFNode(glTF, child, model, activeNodes);
    }
  }
}

function updateGlTFCamera(glTF: glTF2.GlTF, node: glTF2.Node): void {
  const camera = glTF.cameras?.[node.camera!];
  if (camera) {
    const model = getExtras(node).model = (getExtras(node).model as Mat4) || I4;
    getExtras(camera).view = mat4.invert(model, (getExtras(camera).view as Mat4) || mat4.create());
    getExtras(camera).translation = [model[12], model[13], model[14]];
  }
}

function updateGlTFSkin(asset: GlTFAsset, node: glTF2.Node): void {
  const skin = asset.glTF.skins?.[node.skin!];
  if (skin) {
    const numJoints = skin.joints.length;
    const jointMatrix = getExtras(node).jointMatrix = (getExtras(node).jointMatrix as Float32Array) || new Float32Array(numJoints * 16);
    const inverseBindMatrices = getInverseBindMatrices(asset, skin);

    for (let i = 0; i < numJoints; ++i) {
      const jointNode = asset.glTF.nodes![skin.joints[i]];
      const jointMat = new Float32Array(jointMatrix.buffer, jointMatrix.byteOffset + 16 * 4 * i, 16) as unknown as Mat4;
      const invBind = new Float32Array(inverseBindMatrices.buffer, inverseBindMatrices.byteOffset + 16 * 4 * i, 16) as unknown as Mat4;

      mat4.invert((getExtras(node).model as Mat4) || I4, jointMat);
      mat4.mul(jointMat, (jointNode && (getExtras(jointNode).model as Mat4)) || I4, jointMat);
      mat4.mul(jointMat, invBind, jointMat);
    }
  }
}

/** Seek to the current keyframe, using the last keyframe as a reference  */
function seekKeyFrame(
  input: Float32Array, startTime: number, endTime: number, currentTime: number, lastKeyFrame = 0
): [currentKeyframe: number, nextKeyframe: number] {
  const sampleCount = input.length;
  let currentKeyframe: number, nextKeyframe: number;

  if (currentTime <= startTime) {
    currentKeyframe = nextKeyframe = 0;
  } else if (currentTime >= endTime) {
    currentKeyframe = nextKeyframe = sampleCount - 1;
  } else {
    if (lastKeyFrame >= sampleCount || input[lastKeyFrame] > currentTime) {
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

    nextKeyframe = Math.min(nextKeyframe, sampleCount - 1);
  }

  return [currentKeyframe, nextKeyframe];
}

function interpolate(
  output: Float32List,
  samplerInput: Float32Array,
  samplerOutput: SamplerOutputBuffer,
  currentKeyframe: number, nextKeyframe: number, currentTime: number,
  interpolation: string, useSlerp: boolean
) {
  const previousTime = samplerInput[currentKeyframe];
  const nextTime = samplerInput[nextKeyframe];
  const t = (currentTime - previousTime) / (nextTime - previousTime);
  const componentSize = output.length;
  const tmp = new Array(componentSize);

  interpolation = (currentKeyframe === nextKeyframe) ? 'STEP' : interpolation;
  switch (interpolation) {
    case 'STEP':
      mat.copy(samplerOutput, output, currentKeyframe * componentSize, 0, componentSize);
      break;
    case 'CUBICSPLINE': {
      const deltaTime = nextTime - previousTime;
      const t2 = t * t, t3 = t * t2;
      for (let i = 0; i < componentSize; ++i) {
        output[i] = (2 * t3 - 3 * t2 + 1) * samplerOutput[(currentKeyframe * 3 + 1) * componentSize + i] // previousPoint
          + (t3 - 2 * t2 + t) * deltaTime * samplerOutput[(currentKeyframe * 3 + 2) * componentSize + i] // previousOutputTangent
          + (-2 * t3 + 3 * t2) * samplerOutput[(nextKeyframe * 3 + 1) * componentSize + i] //nextPoint
          + (t3 - t2) * deltaTime * samplerOutput[nextKeyframe * 3 * componentSize + i] // nextInputTangent
      }
      break;
    }
    default: { // LINEAR
      if (useSlerp) {
        mat.copy(samplerOutput, output, currentKeyframe * componentSize, 0, componentSize);
        mat.copy(samplerOutput, tmp, nextKeyframe * componentSize, 0, componentSize);
        quat.slerp(output as Quat, tmp as Quat, t, output as Quat);
      } else {
        for (let i = 0; i < componentSize; ++i) {
          output[i] = (1 - t) * samplerOutput[currentKeyframe * componentSize + i] + t * samplerOutput[nextKeyframe * componentSize + i];
        }
      }
      break;
    }
  }
}
