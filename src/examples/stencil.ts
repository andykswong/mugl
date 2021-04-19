import { mat4 } from 'gl-matrix';
import { BufferType, CompareFunc, CullMode, VertexFormat, PipelineDescriptor, RenderingDevice, StencilOp, UniformType, UniformFormat } from '..';
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

  constructor(device: RenderingDevice) {
    super(device);
  }

  init(): void {
    const ctx = this.device;

    this.tex = ctx.texture({ size: [texSize, texSize] });
    airplane().then((img) => {
      this.tex.data(img);
    });

    this.vertBuffer = bufferWithData(ctx, BufferType.Vertex, cubeVertices);
    this.indexBuffer = bufferWithData(ctx, BufferType.Index, cubeIndices);
    this.skyIndexBuffer = bufferWithData(ctx, BufferType.Index, skyboxIndices);

    const cubePipelineDesc: PipelineDescriptor = {
      vert,
      frag: fragCube,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ],
          stride: 20
        }
      ],
      uniforms: {
        'mvp': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'tex': { type: UniformType.Tex, format: this.tex.type }
      },
      depth: {
        compare: CompareFunc.LEqual,
        writeEnabled: true
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
      frag: fragColor,
      uniforms: {
        'mvp': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'color': { type: UniformType.Value, format: UniformFormat.Vec4 },
      },
      depth: {
        writeEnabled: true
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
      this.tex, this.cubePipeline, this.cubeOutlinePipeline
    );
  }

  render(t: number): boolean {
    const proj =  mat4.perspective(mat4.create(), Math.PI / 4, this.device.canvas.width / this.device.canvas.height, 0.01, 100);
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
        'tex': this.tex
      })
      .stencilRef(1)
      .drawIndexed(cubeIndices.length);

    // Draw outline
    mvp = mat4.mul(mat4.create(), vp, mat4.fromScaling(mat4.create(), [1.1, 1.1, 1.1]));
    ctx.pipeline(this.cubeOutlinePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms({
        'mvp': mvp,
        'color': [0.1, 0.3, 0.25, 1.0]
      })
      .stencilRef(1)
      .drawIndexed(cubeIndices.length);

    // Draw skybox
    mvp = mat4.mul(mat4.create(), vp, mat4.fromScaling(mat4.create(), [10, 10, 10]));
    ctx.pipeline(this.cubePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.skyIndexBuffer)
      .uniforms({
        'mvp': mvp,
        'tex': this.tex
      })
      .drawIndexed(skyboxIndices.length)
      .end();

    return true;
  }
}
