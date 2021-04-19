import { getGLDevice } from '..';
import { Example, ExampleConstructor } from './common';
import { BasicExample } from './basic';
import { CubeExample } from './cube';
import { InstancingExample } from './instancing';
import { PostprocessExample } from './postprocess';
import { MRTExample } from './mrt';
import { StencilExample } from './stencil';
import { PbrExample } from './pbr';

declare const window: Window & {
  loadExample: (url?: string) => void;
};

const EXAMPLES: Readonly<Record<string, { title: string, factory: ExampleConstructor}>> = {
  'basic': { title: 'Hello World', factory: BasicExample },
  'instancing': { title: 'Instancing', factory: InstancingExample },
  'cube': { title: 'Textures', factory: CubeExample },
  'postprocess': { title: 'Post-processing', factory: PostprocessExample },
  'mrt': { title: 'Multi Render Targets', factory: MRTExample },
  'stencil': { title: 'Stencil', factory: StencilExample },
  'pbr': { title: 'PBR Uniform Buffer', factory: PbrExample },
};

// Setup menu
const menu: HTMLElement = document.getElementById('menu')!;
for (const id in EXAMPLES) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.id = id;
  a.href = `#${id}`;
  a.innerText = EXAMPLES[id].title;
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

const device = getGLDevice(canvas, {
  stencil: true,
  powerPreference: 'low-power',
  webgl2: !!process.env.WEBGL2
})!;

let example: Example;
let raf = 0;

window.loadExample = function(hash: string = location.hash): void {
  const nextExample = EXAMPLES[hash.replace('#', '')];
  if (nextExample) {
    cancelAnimationFrame(raf);
    if (example) {
      example.destroy();
      device.reset();
    }

    example = new nextExample.factory(device);
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

location.hash = location.hash || '#basic';
window.loadExample();
