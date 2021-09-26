import { getGLDevice, getNGLDevice } from 'mugl';
import { ExampleApplication, USE_WEBGL2, USE_NGL, ExampleFactory } from './common';
import { AppDefinition, Apps } from './apps';
import { loadExamplesWASM } from './wasm';
import { loadImages } from './images';

declare const window: Window & {
  loadExample: (url?: string) => void;
};

class Redirect implements ExampleApplication {
  constructor(private readonly uri: string) {
  }
  init(): void {
  }
  render(): boolean {
    window.location.replace(this.uri);
    return false;
  }
  destroy(): void {
  }
}

class WASMExample implements ExampleApplication {
  constructor(private readonly id: number) {
  }

  init(): void {
    wasmPromise.then(m => m.init(this.id, USE_WEBGL2));
  }

  render(delta: number): boolean {
    wasmModule?.render(delta);
    return true;
  }

  destroy(): void {
    wasmModule?.destroy();
  }
}

// Load WASM module
let useWASM: boolean = false;
let wasmModule: any = null;
const wasmPromise = loadExamplesWASM().then(m => {
  return (wasmModule = m);
});

function wasmAwareFactory(id: number, name: string, factory: ExampleFactory): ExampleFactory {
  return (device) => {
    if (useWASM) {
      console.log(`Rendering ${name} example in WASM...`);
      return new WASMExample(id);
    }
    console.log(`Rendering ${name} example in JS...`);
    return factory(device, USE_WEBGL2);
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

const getDevice = (USE_NGL ? getNGLDevice : getGLDevice);
const device = getDevice(canvas, {
  stencil: true,
  powerPreference: 'low-power',
  webgl2: USE_WEBGL2
})!;

let example: ExampleApplication;
let raf = 0;

window.loadExample = function(hash: string = location.hash): void {
  const nextExample = appMap[hash.replace('#', '')];
  if (nextExample) {
    document.getElementById('title')!.innerText = nextExample.title;
    (document.getElementById('code') as HTMLAnchorElement).href = `https://github.com/andykswong/mugl/tree/main/examples/src/apps/${nextExample.id}.ts`;
    cancelAnimationFrame(raf);
    if (example) {
      example.destroy();
      device.reset();
    }

    example = nextExample.factory(device, device.webgl2);
    example.init();
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
