import { Canvas } from '../dom';
import { BaseGPU, Device, GPU, MipmapHint, Texture } from '../gpu';
import { generateMipmap } from '../mugl';
import { WebGL2Device } from './resource';
import { WebGLContextAttributes, WebGL2Feature } from './type';

/**
 * WebGL2 implementation of the GPU interface.
 */
export class WebGL2GPU extends BaseGPU implements GPU {
  /**
   * Requests a WebGL2 {@link Device}.
   * @param canvas the canvas to be used
   * @param desc WebGL context initialization options
   * @param features WebGL features to be enabled
   * @returns WebGL2 GPU device instance, or null if WebGL2 is not supported
   */
  public requestWebGL2Device(
    canvas: Canvas,
    desc: WebGLContextAttributes = {} as WebGLContextAttributes,
    features: WebGL2Feature = 0 as WebGL2Feature
  ): WebGL2Device | null {
    const device = new WebGL2Device(canvas, desc, features);
    return device.id ? device : null;
  }

  /**
   * Generates mipmap for a texture.
   * @param device the GPU device
   * @param texture the texture
   * @param hint mipmap quality hint
   */
  public generateMipmap(device: Device, texture: Texture, hint: MipmapHint = MipmapHint.Fast): void {
    generateMipmap(device.id, texture.id, hint);
  }
}

/*
 * WebGL implementation of the GPU interface.
 */
export const WebGL = new WebGL2GPU();
