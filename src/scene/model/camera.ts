import { mat4, ReadonlyMat4, vec3 } from 'gl-matrix';
import { I4 } from '../const';

/**
 * A camera, which defines the view and projection matrices that transform from world to clip coordinates.
 */
export class Camera {
  /** Optional name of the camera.  */
  public name?: string;

  /** The position of the camera derived from model matrix. */
  public readonly position: vec3 = vec3.create();

  /** The view matrix, which is the inverse of camera model matrix. */
  public readonly view: mat4 = mat4.create();

  /** The view-projection matrix derived from view and projection matrices. */
  public readonly viewProj: mat4 = mat4.create();

  public constructor(
    /** The projection matrix. */
    public readonly proj: mat4 = mat4.create()
  ) {
    mat4.copy(this.viewProj, proj);
  }

  /**
   * Update the camera view matrix from camera model matrix.
   */
  public updateModel(model: ReadonlyMat4 = I4): void {
    mat4.getTranslation(this.position, model);
    mat4.invert(this.view, model);
    mat4.mul(this.viewProj, this.proj, this.view);
  }
}
