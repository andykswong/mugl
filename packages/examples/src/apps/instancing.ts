import {
  BindGroup, BindingType, Buffer, BufferUsage, Device, Float, RenderPipeline, ShaderStage, VertexFormat,
  vertexBufferLayouts, WebGL, RenderPass
} from '../interop/mugl';
import { BaseExample, createBuffer, createFloat32Array, createUint16Array } from '../common';

const vert = `#version 300 es
layout (location=0) in vec2 position;
layout (location=1) in vec2 offset;
layout (location=2) in vec3 color;
layout (location=3) in float angle;
out vec3 vColor;
void main() {
  gl_Position = vec4(
    cos(angle) * position.x + sin(angle) * position.y + offset.x,
    -sin(angle) * position.x + cos(angle) * position.y + offset.y,
    0, 1);
  vColor = color;
}
`;

const frag = `#version 300 es
precision mediump float;
layout(std140) uniform Data {
  vec3 ambient;
};
in vec3 vColor;
out vec4 outColor;
void main () {
  outColor = vec4(ambient + vColor, 1.0);
}
`;

const N = 10; // N * N triangles
const indices = createUint16Array([0, 1, 2]);
const position = createFloat32Array([
  0.0, -0.05,
  -0.05, 0.0,
  0.05, 0.05
]);
const offsetAndColor = new Float32Array(N * N * 5);
const angle = new Float32Array(N * N);

const fN = N as Float;
for (let i = 0; i < N * N; i++) {
  angle[i] = Math.random() * (2 * Math.PI) as Float;

  // Offsets
  offsetAndColor[5 * i] = (-1 + 2 * Math.floor(i / N) / fN + 0.1) as Float;
  offsetAndColor[5 * i + 1] = (-1 + 2 * ((i % N) as Float) / fN + 0.1) as Float;

  // Colors
  const r = (Math.floor(i / N) / fN) as Float;
  const g = ((i % N) as Float) / fN;
  const b = r * g + 0.2;
  offsetAndColor[5 * i + 2] = r;
  offsetAndColor[5 * i + 3] = g;
  offsetAndColor[5 * i + 4] = b;
}

export class InstancingExample extends BaseExample {
  pass: RenderPass | null = null;
  pipeline: RenderPipeline | null = null;
  indexBuffer: Buffer | null = null;
  position: Buffer | null = null;
  offsetColor: Buffer | null = null;
  angle: Buffer | null = null;
  bindGroup: BindGroup | null = null;
  ambient: Buffer | null = null;
  ambientData: Float32Array = new Float32Array(4);
  t: Float = 0;

  constructor(private readonly device: Device) {
    super();
  }

  init(): void {
    const vs = WebGL.createShader(this.device, { code: vert, usage: ShaderStage.Vertex });
    const fs = WebGL.createShader(this.device, { code: frag, usage: ShaderStage.Fragment });


    this.indexBuffer = createBuffer(this.device, indices, BufferUsage.Index);
    this.position = createBuffer(this.device, position);
    this.offsetColor = createBuffer(this.device, offsetAndColor);
    this.angle = createBuffer(this.device, angle, BufferUsage.Vertex | BufferUsage.Stream);
    this.ambient = createBuffer(this.device, this.ambientData, BufferUsage.Uniform | BufferUsage.Stream);

    const bindGroupLayout = WebGL.createBindGroupLayout(this.device, {
      entries: [{ label: 'Data', type: BindingType.Buffer }]
    });

    this.bindGroup = WebGL.createBindGroup(this.device, {
      layout: bindGroupLayout,
      entries: [{ buffer: this.ambient }]
    });

    this.pipeline = WebGL.createRenderPipeline(this.device, {
      vertex: vs,
      fragment: fs,
      buffers: vertexBufferLayouts([
        { attributes: [/* position */ VertexFormat.F32x2] },
        { attributes: [/* offset */ VertexFormat.F32x2, /* color */ VertexFormat.F32x3], instanced: true },
        { attributes: [/* angle */ VertexFormat.F32], instanced: true }
      ]),
      bindGroups: [bindGroupLayout],
    });

    this.pass = WebGL.createRenderPass(this.device, { clearColor: [0, 0, 0, 1] });

    this.register([
      this.bindGroup!, this.indexBuffer!, this.position!, this.offsetColor!, this.angle!, this.pipeline!, this.pass!,
      vs, fs, bindGroupLayout
    ]);
  }

  render(t: Float): boolean {
    for (let i = 0; i < N * N; i++) {
      angle[i] += (this.t - t - 2 * Math.PI * Math.floor(angle[i] / Math.PI / 2)) as Float;
    }
    this.t = t;

    WebGL.writeBuffer(this.device, this.angle!, angle);

    const a = Math.sin(t) / 2 as Float;
    this.ambientData[0] = this.ambientData[1] = this.ambientData[2] = a;
    WebGL.writeBuffer(this.device, this.ambient!, this.ambientData);

    WebGL.beginRenderPass(this.device, this.pass!);
    WebGL.setRenderPipeline(this.device, this.pipeline!);
    WebGL.setIndex(this.device, this.indexBuffer!);
    WebGL.setVertex(this.device, 0, this.position!);
    WebGL.setVertex(this.device, 1, this.offsetColor!);
    WebGL.setVertex(this.device, 2, this.angle!);
    WebGL.setBindGroup(this.device, 0, this.bindGroup!);
    WebGL.drawIndexed(this.device, 3, N * N);
    WebGL.submitRenderPass(this.device);

    return true;
  }
}
