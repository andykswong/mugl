import { lookAt, mat4, perspective, scale } from 'munum';
import { Buffer, BufferType, CompareFunc, CullMode, RenderingDevice, VertexFormat, PipelineDescriptor, StencilOp, UniformType, UniformFormat, ShaderType, Float, RenderPass, Texture, Pipeline } from 'mugl';
import { BaseExample, createBuffer, Cube, getImageById, Model, TEX_SIZE, toIndices, toVertices } from '../common';

const texSize = TEX_SIZE;

const cubeVertices = toVertices({
  positions: Cube.positions,
  uvs: Cube.uvs
} as Model);
const cubeIndices = toIndices(Cube);

// Reverse face winding for skybox so that we can reuse the same pipeline
const skyboxIndexValues: Float[][] = [];
for (let i = 0; i < Cube.indices!.length; ++i) {
  const face = Cube.indices![i];
  skyboxIndexValues.push([face[2], face[1], face[0]]);
}
const skyboxIndices = toIndices({ indices: skyboxIndexValues } as Model);

const vert = `
precision mediump float;
uniform mat4 mvp;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
void main(void) {
  vUv = uv;
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

const fragColor = `
precision mediump float;
uniform vec4 color;
void main () {
  gl_FragColor = color;
}
`;

export class StencilExample extends BaseExample {
  pass: RenderPass | null = null;
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  skyIndexBuffer: Buffer | null = null;
  tex: Texture | null = null;
  cubePipeline: Pipeline | null = null;
  cubeOutlinePipeline: Pipeline | null = null;

  constructor(private readonly device: RenderingDevice) {
    super();
  }

  init(): void {
    const vs = this.device.shader({ type: ShaderType.Vertex, source: vert });
    const cubeFs = this.device.shader({ type: ShaderType.Fragment, source: fragCube });
    const skyFs = this.device.shader({ type: ShaderType.Fragment, source: fragColor });

    this.tex = this.device.texture({
      width: texSize,
      height: texSize
    });

    const image = getImageById('airplane');
    if (image) {
      this.tex!.data({ image });
    }

    this.vertBuffer = createBuffer(this.device, cubeVertices);
    this.indexBuffer = createBuffer(this.device, cubeIndices, BufferType.Index);
    this.skyIndexBuffer = createBuffer(this.device, skyboxIndices, BufferType.Index);

    const cubePipelineDesc: PipelineDescriptor = {
      vert: vs,
      frag: cubeFs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ],
          stride: 20
        }
      ],
      uniforms: [
        { name: 'mvp', valueFormat: UniformFormat.Mat4 },
        { name: 'tex', type: UniformType.Tex, texType: this.tex!.props.type }
      ],
      depth: {
        compare: CompareFunc.LEqual,
        write: true
      },
      stencil: {
        backCompare: CompareFunc.Always,
        backPassOp: StencilOp.Replace,
        frontCompare: CompareFunc.Always,
        frontPassOp: StencilOp.Replace
      },
      raster: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = this.device.pipeline(cubePipelineDesc);

    this.cubeOutlinePipeline = this.device.pipeline({
      buffers: cubePipelineDesc.buffers,
      raster: cubePipelineDesc.raster,
      vert: vs,
      frag: skyFs,
      uniforms: [
        { name: 'mvp', valueFormat: UniformFormat.Mat4 },
        { name: 'color', valueFormat: UniformFormat.Vec4 }
      ],
      depth: {
        write: true
      },
      stencil: {
        backCompare: CompareFunc.NotEqual,
        frontCompare: CompareFunc.NotEqual,
        writeMask: 0
      }
    });

    this.pass = this.device.pass({
      clearDepth: 1,
      clearStencil: 0
    });

    this.register([
      this.pass!, this.vertBuffer!, this.indexBuffer!, this.skyIndexBuffer!,
      this.tex!, this.cubePipeline!, this.cubeOutlinePipeline!,
      vs, cubeFs, skyFs
    ]);
  }

  render(t: Float): boolean {
    const proj =  perspective((this.device.width as Float) / (this.device.height as Float), Math.PI / 4 as Float, 0.01, 100);
    const view = lookAt([10 * Math.cos(t) as Float, 5 * Math.sin(t) as Float, 10 * Math.sin(t) as Float], [0, 0, 0]);
    const vp = mat4.mul(proj, view);

    const ctx = this.device.render(this.pass!);

    // Draw cube
    let mvp = vp; // Cube at (0, 0, 0)
    ctx.pipeline(this.cubePipeline!)
      .vertex(0, this.vertBuffer!)
      .index(this.indexBuffer!)
      .uniforms([
        { name: 'mvp', values: mvp },
        { name: 'tex', tex: this.tex }
      ])
      .stencilRef(1)
      .drawIndexed(cubeIndices.length);

    // Draw outline
    mvp = mat4.mul(vp, scale([1.1, 1.1, 1.1]));
    ctx.pipeline(this.cubeOutlinePipeline!)
      .vertex(0, this.vertBuffer!)
      .index(this.indexBuffer!)
      .uniforms([
        { name: 'mvp', values: mvp },
        { name: 'color', values: [0.1, 0.3, 0.25, 1.0] }
      ])
      .stencilRef(1)
      .drawIndexed(cubeIndices.length);

    // Draw skybox
    mvp = mat4.mul(vp, scale([10, 10, 10]));
    ctx.pipeline(this.cubePipeline!)
      .vertex(0, this.vertBuffer!)
      .index(this.skyIndexBuffer!)
      .uniforms([
        { name: 'mvp', values: mvp },
        { name: 'tex', tex: this.tex }
      ])
      .drawIndexed(skyboxIndices.length)
      .end();

    return true;
  }
}
