import { lookAt, mat4, perspective, ReadonlyMat3 } from 'munum';
import { Buffer, BufferType, CompareFunc, CullMode, Float, Int, Pipeline, PixelFormat, RenderPass, Texture, VertexFormat, UniformType, UniformFormat, ShaderType, RenderingDevice } from 'mugl';
import { BaseExample, createBuffer, Cube, Model, Quad, toIndices, toVertices } from '../common';

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

const cubeVertices = toVertices({
  positions: Cube.positions,
  colors: Cube.colors
} as Model);
const cubeIndices = toIndices(Cube);

const quadVertices = toVertices(Quad);

export class PostprocessExample extends BaseExample {
  offscreenPass: RenderPass | null = null;
  defaultPass: RenderPass | null = null;
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  cubePipeline: Pipeline | null = null;
  quadVertBuffer: Buffer | null = null;
  quadPipeline: Pipeline | null = null;
  offscreenTex: Texture | null = null;
  depthTex: Texture | null = null;

  constructor(private readonly device: RenderingDevice) {
    super();
  }

  init(): void {
    const ctx = this.device;

    const cubeVs = this.device.shader({ type: ShaderType.Vertex, source: vertCube });
    const cubeFs = this.device.shader({ type: ShaderType.Fragment, source: fragCube });
    const quadVs = this.device.shader({ type: ShaderType.Vertex, source: vertQuad });
    const quadFs = this.device.shader({ type: ShaderType.Fragment, source: fragQuad });

    // Setup the cube
    this.vertBuffer = createBuffer(ctx, cubeVertices);
    this.indexBuffer = createBuffer(ctx, cubeIndices, BufferType.Index);
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

    this.quadVertBuffer = createBuffer(ctx, quadVertices);
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
        { name: 'tex', type: UniformType.Tex, texType: this.offscreenTex!.props.type },
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

    this.register([
      this.defaultPass!, this.offscreenPass!,
      this.cubePipeline!, this.vertBuffer!, this.indexBuffer!,
      this.quadPipeline!, this.quadVertBuffer!, this.offscreenTex!, this.depthTex!,
      cubeFs, cubeVs, quadFs, quadVs
    ]);
  }

  render(t: Float): boolean {
    const proj = perspective((this.device.width as Float) / (this.device.height as Float), Math.PI / 4 as Float, 0.01, 100);
    const view = lookAt([10 * Math.cos(t) as Float, 5 * Math.sin(t) as Float, 10 * Math.sin(t) as Float], [0, 0, 0]);
    const mvp = mat4.mul(proj, view);

    // Draw cube to texture
    this.device.render(this.offscreenPass!)
      .pipeline(this.cubePipeline!)
      .vertex(0, this.vertBuffer!)
      .index(this.indexBuffer!)
      .uniforms([{ name: 'mvp', values: mvp }])
      .drawIndexed(cubeIndices.length)
      .end();

    const kernel = kernels[Math.floor(t / 2) as Int % kernels.length];
    let kernelWeight: Float = 0;
    for (let i = 0; i < kernel.length; ++i) {
      kernelWeight += kernel[i];
    }
    kernelWeight = kernelWeight <= 0 ? 1 : kernelWeight;

    // Draw to screen
    this.device.render(this.defaultPass!)
      .pipeline(this.quadPipeline!)
      .vertex(0, this.quadVertBuffer!)
      .uniforms([
        { name: 'tex', tex: this.offscreenTex },
        { name: 'texSize', values: [this.offscreenTex!.props.width as Float, this.offscreenTex!.props.height as Float] },
        { name: 'kernel', values: kernel },
        { name: 'kernelWeight', value: kernelWeight },
      ])
      .draw(6)
      .end();

    return true;
  }
}
