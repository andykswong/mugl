import { lookAt, mat4, perspective, scale } from 'munum';
import {
  BufferType, CompareFunc, CullMode, RenderingDevice, VertexFormat, PixelFormat, TexType, AddressMode, MinFilterMode,
  UniformFormat, UniformType, PipelineDescriptor, ShaderType
} from '..';
import { BaseExample, bufferWithData, flatMap } from './common';
import { USE_NGL } from './config';
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

  constructor(private readonly device: RenderingDevice) {
    super();
  }

  init(): void {
    const ctx = this.device;

    const vs = this.device.shader({ type: ShaderType.Vertex, source: vert });
    const cubeFs = this.device.shader({ type: ShaderType.Fragment, source: fragCube });
    const skyFs = this.device.shader({ type: ShaderType.Fragment, source: fragSky });

    this.vertBuffer = bufferWithData(ctx, BufferType.Vertex, cubeVertices);

    // Setup the cube
    this.indexBuffer = bufferWithData(ctx, BufferType.Index, cubeIndices);
    this.cubeTex = ctx.texture({
      type: TexType.Tex2D,
      format: PixelFormat.RGBA8,
      width: texSize,
      height: texSize
    }, {
      minFilter: MinFilterMode.LinearMipmapLinear,
      wrapU: AddressMode.Repeat,
      wrapV: AddressMode.Repeat,
      maxAniso: 16
    });
    const cubePipelineDesc: PipelineDescriptor = {
      vert: vs,
      frag: cubeFs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: [
        { name: 'mvp', valueFormat: UniformFormat.Mat4 },
        { name: 'tex', type: UniformType.Tex, texType: this.cubeTex.type },
      ],
      depth: {
        compare: CompareFunc.LEqual,
        write: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = ctx.pipeline(cubePipelineDesc);

    // Setup the sky box (Cube texture not supported for NGL)
    if (!USE_NGL) {
      this.skyTex = ctx.texture({
        type: TexType.Cube,
        format: PixelFormat.RGBA8,
        width: texSize,
        height: texSize
      });
      this.skyPipeline = ctx.pipeline({
        ...cubePipelineDesc,
        frag: skyFs,
        uniforms: [
          { name: 'mvp', valueFormat: UniformFormat.Mat4 },
          { name: 'tex', type: UniformType.Tex, texType: this.skyTex.type },
        ],
        raster: {
          cullMode: CullMode.Front // Render back face for sky box
        }
      });
    }

    this.pass = ctx.pass({
      clearColor: [0.3, 0.3, 0.3, 1],
      clearDepth: 1
    });

    // Load textures
    this.loaded = false;
    Promise.all([
      airplane(),
      skyBox(texSize)
    ]).then(([cubeImg, skyImgs]) => {
      this.skyTex?.data({ images: [skyImgs[0], ...skyImgs, skyImgs[0], skyImgs[0]] });
      this.cubeTex.data({ image: cubeImg }).mipmap();
      this.loaded = true;
    });

    this.register(
      this.pass, this.vertBuffer,
      this.cubePipeline, this.indexBuffer, this.cubeTex,
      this.skyPipeline, this.skyTex,
      vs, cubeFs, skyFs
    );
  }

  render(t: number): boolean {
    if (!this.loaded) {
      // To avoid errors, skip rendering until textures are ready
      // Alternatively you can use a placeholder texture
      return true;
    }

    const proj = perspective(this.device.width / this.device.height, Math.PI / 4, 0.01, 100);
    const view = lookAt([10 * Math.cos(t), 5 * Math.sin(t), 10 * Math.sin(t)], [0, 0, 0]);
    const vp = mat4.mul(proj, view);

    const ctx = this.device.render(this.pass);

    // Draw cube
    let mvp = vp; // Cube at (0, 0, 0)
    ctx.pipeline(this.cubePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms([
        { name: 'mvp', values: mvp },
        { name: 'tex', tex: this.cubeTex },
      ])
      .drawIndexed(cubeIndices.length);

    // Draw skybox
    if (this.skyTex) {
      mvp = mat4.mul(vp, scale([10, 10, 10]), vp);  // Make the skybox bigger
      ctx.pipeline(this.skyPipeline)
        .vertex(0, this.vertBuffer)
        .index(this.indexBuffer)
        .uniforms([
          { name: 'mvp', values: mvp },
          { name: 'tex', tex: this.skyTex },
        ])
        .drawIndexed(cubeIndices.length)
        .end();
    }

    return true;
  }
}
