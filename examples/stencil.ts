import { lookAt, mat4, perspective, scale } from 'munum';
import { BufferType, CompareFunc, CullMode, RenderingDevice, VertexFormat, PipelineDescriptor, StencilOp, UniformType, UniformFormat, ShaderType } from '..';
import { BaseExample, bufferWithData, flatMap } from './common';
import { airplane, Cube } from './data';

const texSize = 512;

const cubeVertices = new Float32Array(flatMap(Cube.positions, (p, i) => [...p, ...Cube.uvs[i]]));

const cubeIndices = new Uint16Array(flatMap(Cube.indices, v => v));
// Reverse face winding for skybox
const skyboxIndices = new Uint16Array(flatMap(Cube.indices, v => [...v].reverse()));

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
  pass: any;
  vertBuffer: any;
  indexBuffer: any;
  skyIndexBuffer: any;
  tex: any;
  cubePipeline: any;
  cubeOutlinePipeline: any;

  constructor(private readonly device: RenderingDevice) {
    super();
  }

  init(): void {
    const ctx = this.device;

    const vs = this.device.shader({ type: ShaderType.Vertex, source: vert });
    const cubeFs = this.device.shader({ type: ShaderType.Fragment, source: fragCube });
    const skyFs = this.device.shader({ type: ShaderType.Fragment, source: fragColor });

    this.tex = ctx.texture({
      width: texSize,
      height: texSize
    });
    airplane().then((image) => {
      this.tex.data({ image });
    });

    this.vertBuffer = bufferWithData(ctx, BufferType.Vertex, cubeVertices);
    this.indexBuffer = bufferWithData(ctx, BufferType.Index, cubeIndices);
    this.skyIndexBuffer = bufferWithData(ctx, BufferType.Index, skyboxIndices);

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
        { name: 'tex', type: UniformType.Tex, texType: this.tex.type }
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
    this.cubePipeline = ctx.pipeline(cubePipelineDesc);

    this.cubeOutlinePipeline = ctx.pipeline({
      ...cubePipelineDesc,
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
      },
    });

    this.pass = ctx.pass({
      clearDepth: 1,
      clearStencil: 0
    });

    this.register(
      this.pass, this.vertBuffer, this.indexBuffer, this.skyIndexBuffer,
      this.tex, this.cubePipeline, this.cubeOutlinePipeline,
      vs, cubeFs, skyFs
    );
  }

  render(t: number): boolean {
    const proj =  perspective(this.device.canvas.width / this.device.canvas.height, Math.PI / 4, 0.01, 100);
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
        { name: 'tex', tex: this.tex }
      ])
      .stencilRef(1)
      .drawIndexed(cubeIndices.length);

    // Draw outline
    mvp = mat4.mul(vp, scale([1.1, 1.1, 1.1]));
    ctx.pipeline(this.cubeOutlinePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms([
        { name: 'mvp', values: mvp },
        { name: 'color', values: [0.1, 0.3, 0.25, 1.0] }
      ])
      .stencilRef(1)
      .drawIndexed(cubeIndices.length);

    // Draw skybox
    mvp = mat4.mul(vp, scale([10, 10, 10]));
    ctx.pipeline(this.cubePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.skyIndexBuffer)
      .uniforms([
        { name: 'mvp', values: mvp },
        { name: 'tex', tex: this.tex }
      ])
      .drawIndexed(skyboxIndices.length)
      .end();

    return true;
  }
}
