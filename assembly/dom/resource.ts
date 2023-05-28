import { CanvasId, deleteImage, getCanvasWidth, getCanvasHeight, getImageWidth, getImageHeight, ImageSourceId, deleteCanvas } from '../mugl';
import { Resource, UInt } from '../gpu';

/**
* A canvas element from which a WebGL2RenderingContext can be retrieved.
*/
export class Canvas extends Resource {
  public constructor(
    public readonly id: CanvasId
  ) {
    super();
  }

  /**
   * @returns the canvas width.
   */
  get width(): UInt {
    return getCanvasWidth(this.id);
  }

  /**
   * @returns the canvas height.
   */
  get height(): UInt {
    return getCanvasHeight(this.id);
  }

  public destroy(): void {
    deleteCanvas(this.id);
  }
}

/**
 * An image source element
 */
export class ImageSource extends Resource {
  public constructor(
    public readonly id: ImageSourceId
  ) {
    super();
  }

  /**
   * @returns the image width.
   */
  get width(): UInt {
    return getImageWidth(this.id);
  }

  /**
   * @returns the image height.
   */
  get height(): UInt {
    return getImageHeight(this.id);
  }

  public destroy(): void {
    deleteImage(this.id);
  }
}
