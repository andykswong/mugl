import { mat4, quat, ReadonlyMat4, vec3 } from 'gl-matrix';
import { I4, Q1, VI3, Z3 } from '../const';

/**
 * Defines a local space transformation.
 * TRS properties are converted to matrices and postmultiplied in the T * R * S order to
 * compose the transformation matrix.
 */
export class Transform {
  /** A floating-point 4x4 model (world) transformation matrix. Derived from parent and local transformation. */
  public model?: mat4;

  /** A floating-point 4x4 local transformation matrix stored in column-major order. */
  public matrix?: mat4;

  /** The node's translation along the x, y, and z axes. */
  public translation?: vec3;

  /** The node's unit quaternion rotation. */
  public rotation?: quat;

  /** The node's scale, given as the scaling factors along the x, y, and z axes. */
  public scale?: vec3;

  /**
   * Set to true to indicate that the local transform matrix needs to be updated from TRS matrices in the next update.
   */
  public needUpdate?: boolean;

  /**
   * Update the local transformation matrix from TRS properties.
   * @param immediate Defaults to false, which defers the matrix calculation until the next model update
   */
  public updateMatrix(immediate = false): void {
    if (!(this.needUpdate = !immediate)) {
      mat4.fromRotationTranslationScale(
        this.matrix || (this.matrix = mat4.create()),
        this.rotation || Q1,
        this.translation || Z3,
        this.scale || VI3
      );
    }
  }

  /**
   * Update the model matrix from a world transform matrix and local matrix.
   * @param world the world transform matrix
   */
  public updateModel(world: ReadonlyMat4 = I4): void {
    if (this.needUpdate) {
      this.updateMatrix(true);
    }
    mat4.mul(this.model || (this.model = mat4.create()), world, this.matrix || I4);
  }
}
