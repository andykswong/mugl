import { BaseGPU } from '../gpu/base-gpu';
import { Canvas } from '../dom';
import { GPU, Texture } from '../gpu';
import { WebGPUContextAttributes, WebGPUFeature } from './type';
import { WebGPUDevice, WebGPUDeviceFuture } from './resource';
import { createWebGPUSurfaceDepthTexture, createWebGPUSurfaceTexture } from '../mugl';
import { toWebGPUContextAttributeFlag } from './serialize';

/**
 * WebGPU implementation of the GPU interface.
 */
export class WebGPUGPU extends BaseGPU implements GPU {
  /**
   * Requests a WebGPU device.
   * @param canvas the canvas to be used
   * @param desc WebGPU context initialization options
   * @param features WebGPU features to be enabled
   * @returns future to WebGPU device instance, or null if WebGPU is not supported
   */
  public requestWebGPUDevice(
    canvas: Canvas,
    desc: WebGPUContextAttributes = {} as WebGPUContextAttributes,
    features: WebGPUFeature = 0 as WebGPUFeature
  ): WebGPUDeviceFuture {
    return new WebGPUDeviceFuture(canvas, desc, features);
  }

  /**
   * Creates a new texture object from a canvas surface.
   * @param device the GPU device
   * @param canvas the canvas to be used. Defaults to the device default canvas.
   * @param desc WebGPU canvas surface options
   * @returns new texture object
   */
  public createSurfaceTexture(
    device: WebGPUDevice,
    canvas: Canvas | null = null,
    desc: WebGPUContextAttributes = {} as WebGPUContextAttributes
  ): Texture {
    return new Texture(createWebGPUSurfaceTexture(
      device.id,
      canvas ? canvas.id : 0,
      toWebGPUContextAttributeFlag(desc)
    ));
  }

  /**
   * Creates a new depth-stencil texture object from a canvas surface.
   * @param device the GPU device
   * @param canvas the canvas to be used. Defaults to the device default canvas.
   * @param desc WebGPU canvas surface options
   * @returns new texture object
   */
  public createSurfaceDepthTexture(
    device: WebGPUDevice,
    canvas: Canvas | null = null,
    desc: WebGPUContextAttributes = {} as WebGPUContextAttributes
  ): Texture {
    return new Texture(createWebGPUSurfaceDepthTexture(
      device.id,
      canvas ? canvas.id : 0,
      toWebGPUContextAttributeFlag(desc)
    ));
  }
}

/*
 * WebGPU implementation of the GPU interface.
 */
export const WebGPU = new WebGPUGPU();
