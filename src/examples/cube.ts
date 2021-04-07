import { mat4 } from 'gl-matrix';
import {
  BufferType, CompareFunc, RenderingDevice, CullMode, VertexFormat, PixelFormat, TexType, AddressMode, MinFilterMode,
  UniformFormat, UniformType, PipelineDescriptor
} from '..';
import { BaseExample, bufferWithData, flatMap, loadImage } from './common';
import { Cube } from './data';

const texSize = 512;

// Double the cube UVs for repeating effect
const cubeVertices = new Float32Array(flatMap(Cube.positions, (p, i) => [...p, Cube.uvs[i][0] * 2, Cube.uvs[i][1] * 2]));

const cubeIndices = new Uint16Array(flatMap(Cube.indices, v => v));

const vert = `
precision mediump float;
uniform mat4 mvp;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
varying vec3 vNormal;
void main(void) {
  vUv = uv;
  vNormal = normalize(position);
  gl_Position = mvp * vec4(position, 1.0);
}
`;

const fragCube = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D tex;
void main () {
  gl_FragColor = texture2D(tex, vUv);
}
`;

const fragSky = `
precision mediump float;
varying vec3 vNormal;
uniform samplerCube tex;
void main () {
  gl_FragColor = textureCube(tex, normalize(vNormal));
}
`;

function toImage(ctx: CanvasRenderingContext2D): Promise<HTMLImageElement> {
  return new Promise((resolve) => ctx.canvas.toBlob((blob) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => resolve(img);
  }));
}

function generateSkyBox(): Promise<HTMLImageElement[]> {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = texSize;
  const ctx = canvas.getContext('2d')!;

  const skyColor = '#28ccdf', groundColor = '#39314b';
  const topDownGrd = ctx.createLinearGradient(0, 0, 0, texSize);
  topDownGrd.addColorStop(0, skyColor);
  topDownGrd.addColorStop(0.4, '#8aebf1');
  topDownGrd.addColorStop(0.99, '#dff6f5');
  topDownGrd.addColorStop(1, groundColor);

  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, texSize, texSize);
  const topImg = toImage(ctx);

  ctx.fillStyle = groundColor;
  ctx.fillRect(0, 0, texSize, texSize);
  const bottomImg = toImage(ctx);

  ctx.fillStyle = topDownGrd;
  ctx.fillRect(0, 0, texSize, texSize);
  const sideImg = toImage(ctx);

  return Promise.all([sideImg, topImg, bottomImg]);
}

export class CubeExample extends BaseExample {
  pass: any;
  vertBuffer: any;
  indexBuffer: any;
  cubePipeline: any;
  cubeTex: any;
  skyPipeline: any;
  skyTex: any;
  loaded = false;

  constructor(device: RenderingDevice) {
    super(device);
  }

  init(): void {
    const ctx = this.device;

    this.vertBuffer = bufferWithData(ctx, BufferType.Vertex, cubeVertices);

    // Setup the cube
    this.indexBuffer = bufferWithData(ctx, BufferType.Index, cubeIndices);
    this.cubeTex = ctx.texture({
      type: TexType.Tex2D,
      format: PixelFormat.RGBA8,
      size: [texSize, texSize]
    }, {
      minFilter: MinFilterMode.LinearMipmapLinear,
      wrapU: AddressMode.Repeat,
      wrapV: AddressMode.Repeat,
      maxAniso: 16
    });
    const cubePipelineDesc: PipelineDescriptor = {
      vert,
      frag: fragCube,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: {
        'mvp': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'tex': { type: UniformType.Tex, format: this.cubeTex.type }
      },
      depth: {
        compare: CompareFunc.LEqual,
        writeEnabled: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = ctx.pipeline(cubePipelineDesc);

    // Setup the sky box
    this.skyTex = ctx.texture({
      type: TexType.Cube,
      format: PixelFormat.RGBA8,
      size: [texSize, texSize]
    });
    this.skyPipeline = ctx.pipeline({
      ...cubePipelineDesc,
      frag: fragSky,
      uniforms: {
        'mvp': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'tex': { type: UniformType.Tex, format: this.skyTex.type }
      },
      raster: {
        cullMode: CullMode.Front // Render back face for sky box
      }
    });

    this.pass = ctx.pass({ clearDepth: 1 });

    // Load textures
    this.loaded = false;
    Promise.all([
      loadImage('./airplane.png'),
      generateSkyBox()
    ]).then(([cubeImg, skyImgs]) => {
      this.skyTex.data([skyImgs[0], ...skyImgs, skyImgs[0], skyImgs[0]]);
      this.cubeTex.data(cubeImg).mipmap();
      this.loaded = true;
    });

    this.register(
      this.pass, this.vertBuffer,
      this.cubePipeline, this.indexBuffer, this.cubeTex,
      this.skyPipeline, this.skyTex
    );
  }

  render(t: number): boolean {
    if (!this.loaded) {
      // To avoid errors, skip rendering until textures are ready
      // Alternatively you can use a placeholder texture
      return true;
    }

    const proj = mat4.perspective(mat4.create(), Math.PI / 4, this.device.canvas.width / this.device.canvas.height, 0.01, 100);
    const view = mat4.lookAt(mat4.create(), [10 * Math.cos(t), 5 * Math.sin(t), 10 * Math.sin(t)], [0, 0, 0], [0, 1, 0]);
    const vp = mat4.mul(view, proj, view);

    const ctx = this.device.render(this.pass);

    // Draw cube
    let mvp = vp; // Cube at (0, 0, 0)
    ctx.pipeline(this.cubePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms({
        'mvp': mvp,
        'tex': this.cubeTex
      })
      .drawIndexed(cubeIndices.length);

    // Draw skybox
    mvp = mat4.mul(vp, vp, mat4.fromScaling(mat4.create(), [10, 10, 10]));  // Make the skybox bigger
    ctx.pipeline(this.skyPipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms({
        'mvp': mvp,
        'tex': this.skyTex
      })
      .drawIndexed(cubeIndices.length)
      .end();

    return true;
  }
}
