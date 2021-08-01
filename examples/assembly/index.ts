import { getGLDevice, getCanvasById, RenderingDevice } from 'mugl';
import { ExampleApplication } from '../src/common';
import { Apps } from '../src/apps';

let activeApp: ExampleApplication | null = null;
let device: RenderingDevice | null = null;

export function init(id: u32, webgl2: boolean): void {
  if (!device) {
    device = getGLDevice(getCanvasById('canvas'), {
      stencil: true,
      powerPreference: 'low-power',
      webgl2
    });
  }

  const d = device;
  if (d) {
    d.reset();
    const nextApp = Apps[id].factory(d, webgl2);
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

export function destroy(): void {
  const app = activeApp;
  if (app) {
    app.destroy();
  }
}
