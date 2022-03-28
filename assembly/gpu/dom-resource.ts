import { CanvasId, deleteImage, getCanvasWidth, getCanvasHeight, getImageWidth, getImageHeight, ImageSourceId } from '../mugl';
import { UInt } from './primitive';
import { Resource } from './resource';

/**
* A canvas element from which a WebGL2RenderingContext can be retrieved.
*/
export class Canvas {
  public constructor(
    public readonly id: CanvasId
  ) { }

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
