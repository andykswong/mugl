import { mat4, vec3 } from 'gl-matrix';
import { ResolvedGlTF } from '../../gltf';
import { Scene, Accessor } from '../../gltf/spec/glTF2';

const I4 = mat4.create();

export function getDefaultCamera(glTF: ResolvedGlTF, sceneId: number, direction: vec3, aspectRatio: number): { model: mat4, proj: mat4 } {
  const camPos = vec3.normalize(vec3.create(), direction);

  const [min, max] = getSceneExtents(vec3.create(), vec3.create(), glTF, glTF.scenes![sceneId]);

  const maxAxisLength = Math.max(max[0] - min[0], max[1] - min[1]);
  const yfov = Math.PI / 4;
  const xfov = yfov * aspectRatio;

  const yZoom = maxAxisLength / 2 / Math.tan(yfov / 2);
  const xZoom = maxAxisLength / 2 / Math.tan(xfov / 2);

  const distance = Math.max(xZoom, yZoom);
  vec3.scale(camPos, camPos, distance * -1.2);

  const longestDistance = vec3.distance(min, max);
  let zFar = distance + (longestDistance * 6);
  let zNear = distance - (longestDistance * 6);
  zNear = Math.max(zNear, zFar / 10000);

  const target = vec3.create();
  vec3.add(target, min, max);
  vec3.scale(target, target, 0.5);

  return {
    model: mat4.targetTo(mat4.create(), camPos, target, vec3.fromValues(0, 1, 0)),
    proj: mat4.perspective(mat4.create(), yfov, aspectRatio, zNear, zFar)
  };
}

export function getSceneExtents(outMin: vec3, outMax: vec3, glTF: ResolvedGlTF, scene: Scene): [outMin: vec3, outMax: vec3] {
  for (let i = 0; i < 3; ++i) {
    outMin[i] = Infinity;
    outMax[i] = -Infinity;
  }

  const assetMin = vec3.create();
  const assetMax = vec3.create();
  let nodeIndices = (scene.nodes || []).slice();
  while (nodeIndices.length > 0) {
    const node = glTF.nodes?.[nodeIndices.pop()!];
    if (!node) {
      continue;
    }
    nodeIndices = nodeIndices.concat(node.children || []);

    const mesh = glTF.meshes?.[node.mesh!];
    if (mesh) {
      for (const primitive of mesh.primitives) {
        const accessor = glTF.accessors?.[primitive.attributes.POSITION];
        if (accessor) {
          getAccessorExtents(assetMin, assetMax, accessor, <mat4>node.extras?.model || I4);
  
          for (let i = 0; i < 3; ++i) {
            outMin[i] = Math.min(outMin[i], assetMin[i]);
            outMax[i] = Math.max(outMax[i], assetMax[i]);
          }
        }
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

  for (let i = 0; i < 3; ++i) {
    outMin[i] = center[i] - radius;
    outMax[i] = center[i] + radius;
  }
}
