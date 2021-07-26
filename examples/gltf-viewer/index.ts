import { vec3 } from 'munum';
import { getNGLDevice } from '../../n';
import { ResolvedGlTF, renderGlTF, resolveGlTF, updateGlTFAnimation } from '../../tf';
import { getDefaultCamera } from './utils';

const camDir = vec3.create(-1, -2, -2);

const urlParams = new URLSearchParams(window.location.search);
const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
const canvasContainer = canvas.parentElement!;
let glTF: ResolvedGlTF | null = null;
let startTime = 0;
let curAnimation = 0;

const device = 
  getNGLDevice(canvas, {
    powerPreference: 'low-power',
    webgl2: false
  })!;

// Features required by PBR shader
device.feature('OES_standard_derivatives');
device.feature('OES_element_index_uint');

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

  const data = await resolveGlTF({ uri });

  console.log(uri, data);
  glTF = data;
  render();
}

function render(timestamp = 0): void {
  window.requestAnimationFrame(render);

  if (!glTF) {
    return;
  }

  if (!startTime) {
    startTime = timestamp;
  }
  const elapsed = timestamp - startTime;

  const cameraParam = urlParams.get('camera');
  const sceneParam = urlParams.get('scene');
  const scene = ((sceneParam !== null && parseInt(sceneParam)) ?? glTF.scene) || 0

  if (glTF.animations?.length) {
    if (!updateGlTFAnimation(glTF, glTF.animations[curAnimation], elapsed / 1000)) {
      startTime = timestamp;
      curAnimation = (curAnimation + 1) % glTF.animations.length;
    }
  }

  renderGlTF(device, glTF, {
    scene,
    camera: glTF.cameras ? {
      index: parseInt(cameraParam!) || 0
    } : getDefaultCamera(glTF, scene, camDir, device.canvas.width / device.canvas.height)
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
