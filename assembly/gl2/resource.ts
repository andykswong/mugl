import { Canvas } from '../dom';
import { Device } from '../gpu';
import { deleteDevice, requestWebGL2Device } from '../mugl';
import { WebGL2Feature, WebGLContextAttributes } from './type';
import { toWebGLContextAttributeFlag } from './serialize';

/**
 * A WebGL2 GPU device resource.
 */
export class WebGL2Device extends Device {
  public constructor(canvas: Canvas, desc: WebGLContextAttributes, features: WebGL2Feature = 0 as WebGL2Feature) {
    super();
    this.id = requestWebGL2Device(canvas.id, toWebGLContextAttributeFlag(desc), features);
  }

  public destroy(): void {
    deleteDevice(this.id);
  }
}
