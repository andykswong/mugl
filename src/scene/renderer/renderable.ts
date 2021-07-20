import { mat4, vec3 } from 'gl-matrix';
import { I4 } from '../const';
import { AlphaMode, Camera, Material, Node, Primitive } from '../model';

const tmpV3: vec3 = vec3.create();

/**
 * A renderable object.
 */
export interface Renderable {
  /** The mesh primitive to render. */
  primitive: Primitive;

  /** The node of the primitive. */
  node?: Node;

  /** Material override to use for rendering the primitive. */
  material?: Material;

  /** The pipeline ID to use for rendering the primitive. */
  pipelineId?: number;

  /** z-depth from camera for draw call sorting. */
  depth?: number;
}

/**
 * A draw call sorting function.
 */
export type RenderableSorter = (renderables: Renderable[], camera: Camera) => void;

/**
 * Default primitive sorting function.
 */
 export const defaultSorter: RenderableSorter = (renderables, camera) => {
  for (const renderable of renderables) {
    mat4.getTranslation(tmpV3, renderable.node?.transform?.model || I4);
    renderable.depth = vec3.transformMat4(tmpV3, tmpV3, camera.viewProj)[2];
  }
  renderables.sort(comparePrimitive);
};

/**
 * Creates a compare function for primitives.
 */
function comparePrimitive(p1: Renderable, p2: Renderable): number {
  const m1 = p1.material || p1.primitive.material;
  const m2 = p2.material || p2.primitive.material;

  let order = (m2.renderOrder || 0) - (m1.renderOrder || 0);
  if (order) {
    return order;
  }

  const transparent1 = m1.alphaMode === AlphaMode.Blend;
  const transparent2 = m2.alphaMode === AlphaMode.Blend;
  if (transparent1 !== transparent2) {
    return transparent1 ? 1 : -1; // Render opaque meshes before transparent meshes
  }

  // If meshes are both opaque, sort by material first
  if (!transparent1) {
    if ((order = m1.type.localeCompare(m2.type))) {
      return order;
    }
    if ((order = (p1.pipelineId || 0) - (p2.pipelineId || 0))) {
      return order;
    }
  }

  // Sort by depth at last, from front to back for opaque objects, and back to front for transparent objects.
  return (transparent1 ? -1 : 1) * ((p1.depth || 0) - (p2.depth || 0));
}
