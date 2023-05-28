import { Buffer, Device, Float, RenderPass, RenderPipeline, Shader, ShaderStage, TextureFormat, VertexFormat, vertexBufferLayouts } from '../interop/mugl';
import { BaseExample, createBuffer, toVertices, Triangle } from '../common';

const code = `
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) color: vec4<f32>,
};

struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) color: vec4<f32>,
};

@vertex
fn vs_main(
  model: VertexInput,
) -> VertexOutput {
  var out: VertexOutput;
  out.color = model.color;
  out.clip_position = vec4<f32>(model.position, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return in.color;
}
`;

const vert = `#version 300 es
layout (location=0) in vec3 position;
layout (location=1) in vec4 color;
out vec4 vColor;
void main () {
  gl_Position = vec4(position, 1);
  vColor = color;
}
`;

const frag = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 outColor;
void main () {
  outColor = vColor;
}
`;

const position = toVertices(Triangle);

export class BasicExample extends BaseExample {
  buffer: Buffer | null = null;
  pipeline: RenderPipeline | null = null;
  pass: RenderPass | null = null;

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

    this.buffer = createBuffer(this.gpu, this.device, position);

    this.pipeline = this.gpu.createRenderPipeline(this.device, {
      vertex: vs,
      fragment: fs,
      buffers: vertexBufferLayouts([
        // must match shader vertex inputs
        { attributes: [/* position */ VertexFormat.F32x3, /* color */ VertexFormat.F32x4] }
      ]),
      depthStencil: {
        // must match surface depth format
        format: TextureFormat.Depth24Stencil8
      },
    });

    this.pass = this.gpu.createRenderPass(this.device, { clearColor: [0.1, 0.2, 0.3, 1.0] });

    this.register([this.buffer!, this.pipeline!, this.pass!, vs, fs]);
  }

  render(_: Float): boolean {
    this.gpu.beginRenderPass(this.device, this.pass!);
    this.gpu.setRenderPipeline(this.device, this.pipeline!);
    this.gpu.setVertex(this.device, 0, this.buffer!);
    this.gpu.draw(this.device, 3);
    this.gpu.submitRenderPass(this.device);

    return false;
  }
}
