import { lookAt, mat3, mat4, perspective, ReadonlyMat3 } from 'munum';
import { BufferType, CompareFunc, CullMode, GLRenderingDevice, PixelFormat, VertexFormat, UniformType, UniformFormat, ShaderType } from '..';
import { BaseExample, bufferWithData, flatMap } from './common';
import { Cube, Quad } from './data';

const texSize = 1024;

const kernels: ReadonlyMat3[] = [
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

    const cubeVs = this.device.shader({ type: ShaderType.Vertex, source: vertCube });
    const cubeFs = this.device.shader({ type: ShaderType.Fragment, source: fragCube });
    const quadVs = this.device.shader({ type: ShaderType.Vertex, source: vertQuad });
    const quadFs = this.device.shader({ type: ShaderType.Fragment, source: fragQuad });

    // Setup the cube
    this.vertBuffer = bufferWithData(ctx, BufferType.Vertex, cubeVertices);
    this.indexBuffer = bufferWithData(ctx, BufferType.Index, cubeIndices);
    this.cubePipeline = ctx.pipeline({
      vert: cubeVs,
      frag: cubeFs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'color', format: VertexFormat.Float4 }
          ]
        }
      ],
      uniforms: [
        { name: 'mvp', valueFormat: UniformFormat.Mat4 },
      ],
      depth: {
        compare: CompareFunc.LEqual,
        write: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    });

    // Setup the fullscreen quad
    this.offscreenTex = ctx.texture({
      width: texSize,
      height: texSize
    });

    this.quadVertBuffer = bufferWithData(ctx, BufferType.Vertex, quadVertices);
    this.quadPipeline = ctx.pipeline({
      vert: quadVs,
      frag: quadFs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: [
        { name: 'tex', type: UniformType.Tex, texType: this.offscreenTex.type },
        { name: 'texSize', valueFormat: UniformFormat.Vec2 },
        { name: 'kernel', valueFormat: UniformFormat.Mat3 },
        { name: 'kernelWeight' },
      ]
    });

    this.depthTex = ctx.texture({
      format: PixelFormat.Depth,
      width: texSize,
      height: texSize,
      renderTarget: true
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
      this.quadPipeline, this.quadVertBuffer, this.offscreenTex, this.depthTex,
      cubeFs, cubeVs, quadFs, quadVs
    );
  }

  render(t: number): boolean {
    const proj = perspective(this.device.width / this.device.height, Math.PI / 4, 0.01, 100);
    const view = lookAt([10 * Math.cos(t), 5 * Math.sin(t), 10 * Math.sin(t)], [0, 0, 0]);
    const mvp = mat4.mul(proj, view);

    // Draw cube to texture
    this.device.render(this.offscreenPass)
      .pipeline(this.cubePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms([{ name: 'mvp', values: mvp }])
      .drawIndexed(cubeIndices.length)
      .end();

    const kernel = kernels[this.kernel];
    let kernelWeight = kernel.reduce((x, y) => x + y);
    kernelWeight = kernelWeight <= 0 ? 1 : kernelWeight;

    // Draw to screen
    this.device.render(this.defaultPass)
      .pipeline(this.quadPipeline)
      .vertex(0, this.quadVertBuffer)
      .uniforms([
        { name: 'tex', tex: this.offscreenTex },
        { name: 'texSize', values: [this.offscreenTex.props.width, this.offscreenTex.props.height] },
        { name: 'kernel', values: kernel },
        { name: 'kernelWeight', value: kernelWeight },
      ])
      .draw(6)
      .end();

    return true;
  }

  destroy(): void {
    super.destroy();
    this.device.canvas.removeEventListener('click', this.nextKernel);
  }
}
