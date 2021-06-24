import { mat4 } from 'gl-matrix';
import {
  BufferType, CompareFunc, CullMode, GLRenderingDevice, VertexFormat, PixelFormat, TexType, AddressMode, MinFilterMode,
  UniformFormat, UniformType, PipelineDescriptor
} from '..';
import { BaseExample, bufferWithData, flatMap } from './common';
import { airplane, Cube, skyBox } from './data';

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

export class CubeExample extends BaseExample {
  pass: any;
  vertBuffer: any;
  indexBuffer: any;
  cubePipeline: any;
  cubeTex: any;
  skyPipeline: any;
  skyTex: any;
  loaded = false;

  constructor(private readonly device: GLRenderingDevice) {
    super();
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
      airplane(),
      skyBox(texSize)
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
