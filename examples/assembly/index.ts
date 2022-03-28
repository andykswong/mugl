import { getCanvasById, WebGL, WebGL2Device } from 'mugl';
import { ExampleApplication } from '../src/common';
import { Apps } from '../src/apps';

let activeApp: ExampleApplication | null = null;
let device: WebGL2Device | null = null;

export function init(id: u32): void {
  if (!device) {
    device = WebGL.requestWebGL2Device(getCanvasById('canvas'), {
      stencil: true,
    });
  }

  if (device) {
    WebGL.resetDevice(device!);
    const nextApp = Apps[id].factory(device!);
    nextApp.init();
    activeApp = nextApp;
  }
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
