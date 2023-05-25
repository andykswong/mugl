import { loadGlTF, GlTFAsset } from '@muds/gltf';
import { vec3 } from 'munum';
import { WebGL } from 'mugl';
import { renderGlTF } from './render';
import { updateGlTFAnimation } from './update';
import { getDefaultCamera } from './utils';

const camDir = vec3.create(-1, -2, -2);

const urlParams = new URLSearchParams(window.location.search);
const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
const canvasContainer = canvas.parentElement!;
let asset: GlTFAsset | null = null;
let startTime = 0;
let curAnimation = 0;

const device = WebGL.requestWebGL2Device(canvas, { powerPreference: 'low-power' })!;

const GLTF_SAMPLE_PATH = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/63f026b2aa957d3e8207f6dd798608993e33fb0d/2.0';

interface GlTFModelDescriptor {
  name: string;
  screenshot: string;
  variants: Record<string, string>;
}

async function load(): Promise<void> {
  let uri = urlParams.get('url');
  if (!uri) {
    const models: GlTFModelDescriptor[] = await (await fetch(`${GLTF_SAMPLE_PATH}/model-index.json`)).json();
    const modelName = urlParams.get('model') || 'BrainStem';
    const modelVariant = urlParams.get('variant') || 'glTF';
    const model = models.find(desc => desc.name === modelName)!;
    uri = `${GLTF_SAMPLE_PATH}/${modelName}/${modelVariant}/${model.variants[modelVariant]}`;
  }

  asset = await loadGlTF(uri, true);
  console.log(uri, asset.glTF);

  render();
}

function render(timestamp = 0): void {
  window.requestAnimationFrame(render);

  if (!asset) {
    return;
  }

  if (!startTime) {
    startTime = timestamp;
  }
  const elapsed = timestamp - startTime;

  const glTF = asset.glTF;
  const cameraParam = urlParams.get('camera');
  const sceneParam = urlParams.get('scene');
  const scene = ((sceneParam !== null && parseInt(sceneParam)) ?? glTF.scene) || 0

  if (glTF.animations?.length) {
    if (!updateGlTFAnimation(asset, glTF.animations[curAnimation], elapsed / 1000)) {
      startTime = timestamp;
      curAnimation = (curAnimation + 1) % glTF.animations.length;
    }
  }

  renderGlTF(canvas, device, asset, {
    scene,
    camera: glTF.cameras ? {
      index: parseInt(cameraParam!) || 0
    } : getDefaultCamera(glTF, scene, camDir, canvas.width / canvas.height)
  });
}

function resizeCanvas(): void {
  const dpr = window.devicePixelRatio || 1;
  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

load();
