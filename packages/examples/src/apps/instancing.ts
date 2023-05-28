import { BindGroup, BindingType, Buffer, BufferUsage, Device, Float, RenderPass, RenderPipeline, Shader, ShaderStage, TextureFormat, UInt, VertexFormat, vertexBufferLayouts } from '../interop/mugl';
import { BaseExample, createBuffer, createFloat32Array, createUint16Array } from '../common';

const code = `
struct VertexInput {
  @location(0) position: vec2<f32>,
  @location(1) offset: vec2<f32>,
  @location(2) color: vec3<f32>,
  @location(3) angle: f32,
};

struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) color: vec3<f32>,
};

@vertex
fn vs_main(
  model: VertexInput,
) -> VertexOutput {
  var out: VertexOutput;
  out.color = model.color;
  out.clip_position = vec4<f32>(
      cos(model.angle) * model.position[0] + sin(model.angle) * model.position[1] + model.offset[0],
      -sin(model.angle) * model.position[0] + cos(model.angle) * model.position[1] + model.offset[1],
      0.0,
      1.0
  );
  return out;
}

struct Data {
  ambient: vec4<f32>,
};
@group(0) @binding(0) var<uniform> data: Data;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(data.ambient.rgb + in.color, data.ambient[3]);
}
`;

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
const indices = createUint16Array([0, 1, 2, 0]);
const position = createFloat32Array([
  0.0, -0.05,
  -0.05, 0.0,
  0.05, 0.05
]);
const offsetAndColor = new Float32Array(Math.ceil(N * N * 5 / 4) as UInt * 4);
const angle = new Float32Array(Math.ceil(N * N / 4) as UInt * 4);

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

  constructor(
    private readonly device: Device,
    useWebGPU: boolean
  ) {
    super(useWebGPU);
  }

  init(): void {
    let vs: Shader, fs: Shader;
    if (this.useWebGPU) {
      vs = fs = this.gpu.createShader(this.device, { code, usage: ShaderStage.Vertex | ShaderStage.Fragment });
    } else {
      vs = this.gpu.createShader(this.device, { code: vert, usage: ShaderStage.Vertex });
      fs = this.gpu.createShader(this.device, { code: frag, usage: ShaderStage.Fragment });
    }

    this.indexBuffer = createBuffer(this.gpu, this.device, indices, BufferUsage.Index);
    this.position = createBuffer(this.gpu, this.device, position);
    this.offsetColor = createBuffer(this.gpu, this.device, offsetAndColor);
    this.angle = createBuffer(this.gpu, this.device, angle, BufferUsage.Vertex | BufferUsage.Stream);
    this.ambient = createBuffer(this.gpu, this.device, this.ambientData, BufferUsage.Uniform | BufferUsage.Stream);

    const bindGroupLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [{ label: 'Data', type: BindingType.Buffer }]
    });

    this.bindGroup = this.gpu.createBindGroup(this.device, {
      layout: bindGroupLayout,
      entries: [{ buffer: this.ambient }]
    });

    this.pipeline = this.gpu.createRenderPipeline(this.device, {
      vertex: vs,
      fragment: fs,
      buffers: vertexBufferLayouts([
        { attributes: [/* position */ VertexFormat.F32x2] },
        { attributes: [/* offset */ VertexFormat.F32x2, /* color */ VertexFormat.F32x3], instanced: true },
        { attributes: [/* angle */ VertexFormat.F32], instanced: true }
      ]),
      bindGroups: [bindGroupLayout],
      depthStencil: {
        format: TextureFormat.Depth24Stencil8
      },
    });

    this.pass = this.gpu.createRenderPass(this.device, { clearColor: [0, 0, 0, 1] });

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

    this.gpu.writeBuffer(this.device, this.angle!, angle);

    const a = Math.sin(t) / 2 as Float;
    this.ambientData[0] = this.ambientData[1] = this.ambientData[2] = a;
    this.gpu.writeBuffer(this.device, this.ambient!, this.ambientData);

    this.gpu.beginRenderPass(this.device, this.pass!);
    this.gpu.setRenderPipeline(this.device, this.pipeline!);
    this.gpu.setIndex(this.device, this.indexBuffer!);
    this.gpu.setVertex(this.device, 0, this.position!);
    this.gpu.setVertex(this.device, 1, this.offsetColor!);
    this.gpu.setVertex(this.device, 2, this.angle!);
    this.gpu.setBindGroup(this.device, 0, this.bindGroup!);
    this.gpu.drawIndexed(this.device, 3, N * N);
    this.gpu.submitRenderPass(this.device);

    return true;
  }
}
