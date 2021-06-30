import { mat4, vec3 } from 'gl-matrix';
import { getGLDevice } from '../../gl2';
import { getNanoGLDevice } from '../../nano';
import { ResolvedGlTF, renderGlTF, resolveGlTF, updateGlTF } from '../../gltf';
import { getSceneExtents } from '../../gltf/gltf-utils';

const urlParams = new URLSearchParams(window.location.search);
const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
const canvasContainer = canvas.parentElement!;
let glTF: ResolvedGlTF | null = null;

const device = process.env.NANOGL_VIEWER ? 
  getNanoGLDevice(canvas, { powerPreference: 'low-power' })! :
  getGLDevice(canvas, {
    powerPreference: 'low-power',
    webgl2: false
  })!;

if (process.env.NANOGL_VIEWER) {
  // Required by PBR shader, but not enabled for Nano device
  device.gl.getExtension('OES_standard_derivatives');
}

if (!device) throw new Error('WebGL is unsupported');

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
    const modelName = urlParams.get('model') || 'DamagedHelmet';
    const modelVariant = urlParams.get('variant') || 'glTF';
    const model = models.find(desc => desc.name === modelName)!;
    uri = `${GLTF_SAMPLE_PATH}/${modelName}/${modelVariant}/${model.variants[modelVariant]}`;
  }

  const data = await resolveGlTF({ uri });

  console.log(uri, data);
  glTF = data;
  render();
}

function render(): void {
  if (!glTF) {
    return;
  }

  const cameraParam = urlParams.get('camera');
  const sceneParam = urlParams.get('scene');
  const scene = ((sceneParam !== null && parseInt(sceneParam)) ?? glTF.scene) || 0

  renderGlTF(device, glTF, {
    scene,
    camera: cameraParam !== null && glTF.cameras ? {
      index: parseInt(cameraParam)
    } : getDefaultCamera(glTF, scene, device.canvas.width / device.canvas.height)
  });
}

function getDefaultCamera(glTF: ResolvedGlTF, sceneId: number, aspectRatio: number): { model: mat4, proj: mat4 } {
  const camPos = vec3.fromValues(1, 2, 2);
  vec3.normalize(camPos, camPos);

  updateGlTF(glTF, { scene: sceneId });
  const [min, max] = getSceneExtents(vec3.create(), vec3.create(), glTF, sceneId);

  const maxAxisLength = Math.max(max[0] - min[0], max[1] - min[1]);
  const yfov = Math.PI / 4;
  const xfov = yfov * aspectRatio;

  const yZoom = maxAxisLength / 2 / Math.tan(yfov / 2);
  const xZoom = maxAxisLength / 2 / Math.tan(xfov / 2);

  const distance = Math.max(xZoom, yZoom);
  vec3.scale(camPos, camPos, distance * 1.2);

  const longestDistance = vec3.distance(min, max);
  let zFar = distance + (longestDistance * 6);
  let zNear = distance - (longestDistance * 6);
  zNear = Math.max(zNear, zFar / 10000);

  const target = vec3.create();
  vec3.add(target, min, max);
  vec3.scale(target, target, 0.5);

  return {
    model: mat4.targetTo(mat4.create(), camPos, target, vec3.fromValues(0, 1, 0)),
    proj: mat4.perspective(mat4.create(), yfov, aspectRatio, zNear, zFar)
  };
}

function resizeCanvas(): void {
  const dpr = window.devicePixelRatio || 1;
  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  render(); 
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

load();
