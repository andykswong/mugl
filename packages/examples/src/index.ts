import { TextureFormat, WebGL, WebGL2Feature, WebGPU } from 'mugl';
import { ContextId, set_device } from 'mugl/wasm';
import { APP_CONTEXT_ID, ExampleApplication, ExampleFactory } from './common';
import { AppDefinition, Apps } from './apps';
import { loadImages } from './images';
import { initExamplesWASM } from './wasm';

declare global {
  interface Window {
    loadExample: (url?: string) => void;
  }
}

//#region states

// Options flags
let useWebGPU = false;
let useWASM = false;

// App states
let example: ExampleApplication;
let raf = 0;

// Device IDs
let gpuDeviceId = 0;
let glDeviceId = 0;

//#region states

// WASM module
const wasmModule = await initExamplesWASM();

function wasmAwareFactory(id: number, name: string, factory: ExampleFactory): ExampleFactory {
  return (device, useWebGPU) => {
    if (useWASM) {
      console.log(`Rendering ${name} example in WASM using ${useWebGPU ? 'WebGPU' : 'WebGL'}...`);
      return new WASMExample(id, useWebGPU ? gpuDeviceId : glDeviceId);
    }
    console.log(`Rendering ${name} example in JS using ${useWebGPU ? 'WebGPU' : 'WebGL'}...`);
    return factory(device, useWebGPU);
  };
}

const appMap: Record<string, AppDefinition> = {};
for (let i = 0; i < Apps.length; ++i) {
  appMap[Apps[i].id] = new AppDefinition(
    Apps[i].id, Apps[i].title, wasmAwareFactory(i, Apps[i].id, Apps[i].factory)
  );
}
appMap['gltf'] = new AppDefinition('gltf', 'glTF Model Viewer 🔗', () => new Redirect('../gltf-viewer'));
appMap['docs'] = new AppDefinition('docs', 'API Documentation 🔗', () => new Redirect('../docs'));

// Setup menu
const menu: HTMLElement = document.getElementById('menu')!;
for (const id in appMap) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.id = appMap[id].id;
  a.href = `#${appMap[id].id}`;
  a.innerText = appMap[id].title;
  li.appendChild(a);
  menu.appendChild(li);
}

// Setup Canvas
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const canvas2 = document.getElementById('canvas2') as HTMLCanvasElement;
function setCanvasSize(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  if (dpr > 1) {
    const { width, height } = canvas;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
}
setCanvasSize(canvas);
setCanvasSize(canvas2);

const glDevice = WebGL.requestWebGL2Device(
  canvas,
  { stencil: true, powerPreference: 'low-power' },
  WebGL2Feature.TextureAnisotropic |
  WebGL2Feature.TextureHalfFloatLinear |
  WebGL2Feature.TextureFloatLinear |
  WebGL2Feature.ColorBufferFloat
)!;
glDeviceId = set_device(APP_CONTEXT_ID as ContextId, glDevice, 'canvas', WebGL);

const gpuDeviceFuture = WebGPU.requestWebGPUDevice(
  canvas2,
  { powerPreference: 'low-power', depthStencilFormat: TextureFormat.Depth24Stencil8 }
);
gpuDeviceFuture.then((gpuDevice) => {
  if (gpuDevice) {
    gpuDeviceId = set_device(APP_CONTEXT_ID as ContextId, gpuDevice, 'canvas2', WebGPU);
  }
});

window.loadExample = async function (hash: string = location.hash): Promise<void> {
  const nextExample = appMap[hash.replace('#', '')];
  if (nextExample) {
    document.getElementById('title')!.innerText = nextExample.title;
    (document.getElementById('code') as HTMLAnchorElement).href = `https://github.com/andykswong/mugl/tree/main/examples/src/apps/${nextExample.id}.ts`;
    cancelAnimationFrame(raf);
    if (example) {
      example.destroy();
      useWebGPU ? WebGPU.resetDevice((await gpuDeviceFuture)!) : WebGL.resetDevice(glDevice);
    }

    example = nextExample.factory(
      useWebGPU ? (await gpuDeviceFuture)! : glDevice,
      useWebGPU
    );
    example.init();
    const targetCanvas = useWebGPU ? canvas2 : canvas;
    example.resize(targetCanvas.width, targetCanvas.height);
    render();
  }
}

function render(now = 0) {
  raf = requestAnimationFrame(render);
  if (!example.render(now / 1000)) {
    cancelAnimationFrame(raf);
  }
}

// Wait for images to load before initializing the examples
loadImages().then(() => { window.loadExample(); });

location.hash = location.hash || '#basic';
document.getElementById('envMode')?.addEventListener('click', (event) => {
  useWASM = (event.target as HTMLInputElement).checked;
  window.loadExample();
});
document.getElementById('gpuMode')?.addEventListener('click', (event) => {
  useWebGPU = (event.target as HTMLInputElement).checked;
  canvas.style.display = useWebGPU ? 'none' : 'block';
  canvas2.style.display = !useWebGPU ? 'none' : 'block';
  window.loadExample();
});

class Redirect extends ExampleApplication {
  constructor(private readonly uri: string) {
    super();
  }

  render(): boolean {
    window.location.replace(this.uri);
    return false;
  }
}

class WASMExample extends ExampleApplication {
  constructor(
    private readonly id: number,
    private readonly deviceId: number,
  ) {
    super();
  }

  init(): void {
    (wasmModule.init as CallableFunction)(this.id, this.deviceId, useWebGPU);
  }

  render(delta: number): boolean {
    return (wasmModule.render as CallableFunction)(delta);
  }

  resize(width: number, height: number): void {
    (wasmModule.resize as CallableFunction)(width, height);
  }

  destroy(): void {
    (wasmModule.destroy as CallableFunction)();
  }
}
