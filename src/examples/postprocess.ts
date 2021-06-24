import { mat3, mat4 } from 'gl-matrix';
import { BufferType, CompareFunc, CullMode, GLRenderingDevice, PixelFormat, VertexFormat, UniformType, UniformFormat } from '..';
import { BaseExample, bufferWithData, flatMap } from './common';
import { Cube, Quad } from './data';

const texSize = 1024;

const kernels: mat3[] = [
  // edge detection
  [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ],
  // emboss
  [
    -2, -1, 0,
    -1, 1, 1,
    0, 1, 2
  ],
  // normal
  [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0
  ],
];

const vertCube = `
uniform mat4 mvp;
attribute vec4 position;
attribute vec4 color;
varying vec4 vColor;
void main(void) {
  gl_Position = mvp * position;
  vColor = color;
}`;

const fragCube = `
precision mediump float;
varying vec4 vColor;
void main(void) {
  gl_FragColor = vColor;
}`;

const vertQuad = `
attribute vec4 position;
attribute vec2 uv;
varying vec2 vUv;
void main(void) {
  gl_Position = position;
  vUv = uv;
}
`;

const fragQuad = `
precision mediump float; 
uniform sampler2D tex;
uniform vec2 texSize;
uniform mat3 kernel;
uniform float kernelWeight;
varying vec2 vUv;
void main(void) {
  vec2 onePixel = vec2(1.0, 1.0) / texSize;
  vec4 colorSum =
    texture2D(tex, vUv + onePixel * vec2(-1, -1)) * kernel[0][0] +
    texture2D(tex, vUv + onePixel * vec2( 0, -1)) * kernel[0][1] +
    texture2D(tex, vUv + onePixel * vec2( 1, -1)) * kernel[0][2] +
    texture2D(tex, vUv + onePixel * vec2(-1,  0)) * kernel[1][0] +
    texture2D(tex, vUv + onePixel * vec2( 0,  0)) * kernel[1][1] +
    texture2D(tex, vUv + onePixel * vec2( 1,  0)) * kernel[1][2] +
    texture2D(tex, vUv + onePixel * vec2(-1,  1)) * kernel[2][0] +
    texture2D(tex, vUv + onePixel * vec2( 0,  1)) * kernel[2][1] +
    texture2D(tex, vUv + onePixel * vec2( 1,  1)) * kernel[2][2] ;
  gl_FragColor = vec4((colorSum / kernelWeight).rgb, 1);
}
`;

const cubeVertices = new Float32Array(flatMap(Cube.positions, (p, i) => [...p, ...Cube.colors[i]]));
const cubeIndices = new Uint16Array(flatMap(Cube.indices, v => v));

const quadVertices = new Float32Array(flatMap(Quad.positions, (p, i) => [...p, ...Quad.uvs[i]]));

export class PostprocessExample extends BaseExample {
  offscreenPass: any;
  defaultPass: any;
  vertBuffer: any;
  indexBuffer: any;
  cubePipeline: any;
  quadVertBuffer: any;
  quadPipeline: any;
  offscreenTex: any;
  depthTex: any;
  kernel = 0;

  nextKernel = (): void => {
    this.kernel = (this.kernel + 1) % kernels.length;
  };

  constructor(private readonly device: GLRenderingDevice) {
    super();
  }

  init(): void {
    const ctx = this.device;

    // Setup the cube
    this.vertBuffer = bufferWithData(ctx, BufferType.Vertex, cubeVertices);
    this.indexBuffer = bufferWithData(ctx, BufferType.Index, cubeIndices);
    this.cubePipeline = ctx.pipeline({
      vert: vertCube,
      frag: fragCube,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'color', format: VertexFormat.Float4 }
          ]
        }
      ],
      uniforms: {
        'mvp': { type: UniformType.Value, format: UniformFormat.Mat4 },
      },
      depth: {
        compare: CompareFunc.LEqual,
        writeEnabled: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    });

    // Setup the fullscreen quad
    this.offscreenTex = ctx.texture({ size: [texSize, texSize] });

    this.quadVertBuffer = bufferWithData(ctx, BufferType.Vertex, quadVertices);
    this.quadPipeline = ctx.pipeline({
      vert: vertQuad,
      frag: fragQuad,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: {
        'tex': { type: UniformType.Tex, format: this.offscreenTex.type },
        'texSize':{ type: UniformType.Value, format: UniformFormat.Vec2 },
        'kernel': { type: UniformType.Value, format: UniformFormat.Mat3 },
        'kernelWeight': { type: UniformType.Value, format: UniformFormat.Float },
      }
    });

    this.depthTex = ctx.texture({
      format: PixelFormat.Depth,
      size: [texSize, texSize]
    });

    this.defaultPass = ctx.pass({
      clearColor: [0, 0, 0, 1],
      clearDepth: 1
    });

    this.offscreenPass = ctx.pass({
      color: [{ tex: this.offscreenTex }],
      depth: { tex: this.depthTex },
      clearColor: [0.25, 0.25, 0.25, 1],
      clearDepth: 1
    });

    ctx.canvas.addEventListener('click', this.nextKernel);

    this.register(
      this.defaultPass, this.offscreenPass,
      this.cubePipeline, this.vertBuffer, this.indexBuffer,
      this.quadPipeline, this.quadVertBuffer, this.offscreenTex, this.depthTex
    );
  }

  render(t: number): boolean {
    const proj =  mat4.perspective(mat4.create(), Math.PI / 4, this.device.canvas.width / this.device.canvas.height, 0.01, 100);
    const view = mat4.lookAt(mat4.create(), [10 * Math.cos(t), 5 * Math.sin(t), 10 * Math.sin(t)], [0, 0, 0], [0, 1, 0]);
    const mvp = mat4.mul(view, proj, view);

    // Draw cube to texture
    this.device.render(this.offscreenPass)
      .pipeline(this.cubePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms({
        'mvp': mvp
      })
      .drawIndexed(cubeIndices.length)
      .end();

    const kernel = kernels[this.kernel];
    let kernelWeight = (<number[]>kernel).reduce((x, y) => x + y);
    kernelWeight = kernelWeight <= 0 ? 1 : kernelWeight;

    // Draw to screen
    this.device.render(this.defaultPass)
      .pipeline(this.quadPipeline)
      .vertex(0, this.quadVertBuffer)
      .uniforms({
        'tex': this.offscreenTex,
        'texSize': [this.offscreenTex.size[0], this.offscreenTex.size[1]],
        'kernel': kernel,
        'kernelWeight': kernelWeight
      })
      .draw(6)
      .end();

    return true;
  }

  destroy(): void {
    super.destroy();
    this.device.canvas.removeEventListener('click', this.nextKernel);
  }
}
