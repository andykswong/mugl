import { array, Mat4, mat4, perspective, targetTo, Vec3, vec3, Vec4, vec4 } from 'munum';
import { Scene, Accessor, GlTF } from '../../src/js/gltf-spec/glTF2';

const I4 = mat4.create();

export function getDefaultCamera(glTF: GlTF, sceneId: number, direction: Vec3, aspectRatio: number): { model: Mat4, proj: Mat4 } {
  const camPos = vec3.norm(direction);

  const [min, max] = getSceneExtents(vec3.create(), vec3.create(), glTF, glTF.scenes![sceneId]);

  const maxAxisLength = Math.max(max[0] - min[0], max[1] - min[1]);
  const yfov = Math.PI / 4;
  const xfov = yfov * aspectRatio;

  const yZoom = maxAxisLength / 2 / Math.tan(yfov / 2);
  const xZoom = maxAxisLength / 2 / Math.tan(xfov / 2);

  const distance = Math.max(xZoom, yZoom);
  vec3.scale(camPos, distance * -1.2, camPos);

  const longestDistance = vec3.len(vec3.sub(min, max));
  let zFar = distance + (longestDistance * 6);
  let zNear = distance - (longestDistance * 6);
  zNear = Math.max(zNear, zFar / 10000);

  const target = vec3.create();
  vec3.add(min, max, target);
  vec3.scale(target, 0.5, target);

  return {
    model: targetTo(camPos, target),
    proj: perspective(aspectRatio, yfov, zNear, zFar)
  };
}

export function getSceneExtents(outMin: Vec3, outMax: Vec3, glTF: GlTF, scene: Scene): [outMin: Vec3, outMax: Vec3] {
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
          getAccessorExtents(assetMin, assetMax, accessor, (node.extras?.model as Mat4) || I4);
  
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

function getAccessorExtents(outMin: Vec3, outMax: Vec3, accessor: Accessor, model: Mat4) {
  const min: Vec4 = [...(accessor.min as Vec3), 1];
  const max: Vec4 = [...(accessor.max as Vec3), 1];
  vec4.mmul(model, min, min);
  vec4.mmul(model, max, max);
  array.copy(min, boxMin, 0, 0, 3);
  array.copy(max, boxMax, 0, 0, 3);

  vec3.add(boxMax, boxMin, center);
  vec3.scale(center, 0.5, center);

  vec3.sub(boxMax, center, centerToSurface);

  const radius = vec3.len(centerToSurface);

  for (let i = 0; i < 3; ++i) {
    outMin[i] = center[i] - radius;
    outMax[i] = center[i] + radius;
  }
}
