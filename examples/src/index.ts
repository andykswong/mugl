import { WebGL, WebGL2Feature } from 'mugl';
import { ExampleApplication, ExampleFactory } from './common';
import { AppDefinition, Apps } from './apps';
import { loadImages } from './images';
import { initExamplesWASM } from './wasm';

declare const window: Window & {
  loadExample: (url?: string) => void;
};

class Redirect extends ExampleApplication {
  constructor(private readonly uri: string) {
    super();
  }

  render(): boolean {
    window.location.replace(this.uri);
    return false;
  }
}

// Load WASM module
let useWASM: boolean = false;
const wasmModule = await initExamplesWASM();

class WASMExample extends ExampleApplication {
  private wasmModule: any | null = null;

  constructor(private readonly id: number) {
    super();
  }

  init(): void {
    (wasmModule.init as CallableFunction)(this.id);
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

function wasmAwareFactory(id: number, name: string, factory: ExampleFactory): ExampleFactory {
  return (device) => {
    if (useWASM) {
      console.log(`Rendering ${name} example in WASM...`);
      return new WASMExample(id);
    }
    console.log(`Rendering ${name} example in JS...`);
    return factory(device);
  };
}

const appMap: Record<string, AppDefinition> = {};
for (let i = 0; i < Apps.length; ++i) {
  appMap[Apps[i].id] = new AppDefinition(
    Apps[i].id, Apps[i].title, wasmAwareFactory(i, Apps[i].id, Apps[i].factory)
  );
}
appMap['gltf'] = new AppDefinition('gltf', 'glTF Model Viewer 🔗', () => new Redirect('./gltf.html'));
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
const canvas: HTMLCanvasElement = document.querySelector('canvas')!;

const dpr = window.devicePixelRatio || 1;
if (dpr > 1) {
  const { width, height } = canvas;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

const device = WebGL.requestWebGL2Device(
  canvas,
  { stencil: true, powerPreference: 'low-power' },
  WebGL2Feature.TextureAnisotropic |
  WebGL2Feature.TextureHalfFloatLinear |
  WebGL2Feature.TextureFloatLinear |
  WebGL2Feature.ColorBufferFloat
)!;

let example: ExampleApplication;
let raf = 0;

window.loadExample = function (hash: string = location.hash): void {
  const nextExample = appMap[hash.replace('#', '')];
  if (nextExample) {
    document.getElementById('title')!.innerText = nextExample.title;
    (document.getElementById('code') as HTMLAnchorElement).href = `https://github.com/andykswong/mugl/tree/main/examples/src/apps/${nextExample.id}.ts`;
    cancelAnimationFrame(raf);
    if (example) {
      example.destroy();
      WebGL.resetDevice(device);
    }

    example = nextExample.factory(device);
    example.init();
    example.resize(canvas.width, canvas.height);
    render();
  }
}

function render(now = 0) {
  raf = requestAnimationFrame(render);
  if (!example.render(now / 1000)) {
    cancelAnimationFrame(raf);
  }
}

// Load images
const promise = loadImages();

location.hash = location.hash || '#basic';
document.getElementById('mode')?.addEventListener('click', (event) => {
  useWASM = (event.target as HTMLInputElement).checked;
  window.loadExample();
});

// Wait for images to load before initializing the examples
promise.then(() => { window.loadExample(); });
