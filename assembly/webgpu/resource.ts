import { Canvas } from '../dom';
import { Device, Future } from '../gpu';
import { DeviceId, getFutureValue, requestWebGPUDevice } from '../mugl';
import { WebGPUFeature, WebGPUContextAttributes } from './type';
import { toWebGPUContextAttributeFlag } from './serialize';

/** A WebGPU device resource. */
export class WebGPUDevice extends Device {
  public constructor(id: DeviceId) {
    super(id);
  }
}

/** A future for a WebGPUDevice. */
export class WebGPUDeviceFuture extends Future<WebGPUDevice> {
  private device: WebGPUDevice | null = null;

  public constructor(canvas: Canvas, desc: WebGPUContextAttributes, features: WebGPUFeature = 0 as WebGPUFeature) {
    super(requestWebGPUDevice(canvas.id, toWebGPUContextAttributeFlag(desc), features));
  }

  /** Returns resolved value of the future. */
  public get value(): WebGPUDevice | null {
    if (!this.device) {
      const deviceId: DeviceId = getFutureValue(this.id);
      if (deviceId) {
        this.device = new WebGPUDevice(deviceId);
      }
    }
    return this.device;
  }
}
