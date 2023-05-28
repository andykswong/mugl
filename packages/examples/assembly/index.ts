import { Device as DeviceImpl } from 'mugl/assembly';
import { Device } from '../src/interop/mugl';
import { ExampleApplication } from '../src/common';
import { Apps } from '../src/apps';

let activeApp: ExampleApplication | null = null;

export function init(id: u32, deviceId: f64, useWebGPU: boolean): void {
  if (!deviceId) {
    return;
  }
  // @ts-expect-error: valid type cast
  const device = new DeviceImpl(deviceId) as Device;
  const nextApp = Apps[id].factory(device, useWebGPU);
  nextApp.init();
  activeApp = nextApp;
}

export function render(delta: f32): boolean {
  const app = activeApp;
  if (app) {
    return app.render(delta);
  }
  return false;
}

export function resize(width: u32, height: u32): void {
  const app = activeApp;
  if (app) {
    app.resize(width, height);
  }
}

export function destroy(): void {
  const app = activeApp;
  if (app) {
    app.destroy();
  }
}
