import { Buffer, Device, Float, RenderPipeline, ShaderStage, VertexFormat, vertexBufferLayouts } from 'mugl';
import { API, BaseExample, createBuffer, toVertices, Triangle } from '../common';

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

  constructor(private readonly device: Device) {
    super();
  }

  init(): void {
    const vs = API.createShader(this.device, { code: vert, usage: ShaderStage.Vertex });
    const fs = API.createShader(this.device, { code: frag, usage: ShaderStage.Fragment });

    this.buffer = createBuffer(this.device, position);

    this.pipeline = API.createRenderPipeline(this.device, {
      vertex: vs,
      fragment: fs,
      buffers: vertexBufferLayouts([
        { attributes: [/* position */ VertexFormat.F32x3, /* color */ VertexFormat.F32x4] }
      ]),
    });

    this.register([this.buffer!, this.pipeline!, vs, fs]);
  }

  render(delta: Float): boolean {
    API.beginDefaultPass(this.device, { clearColor: [0.1, 0.2, 0.3, 1.0] });
    API.setRenderPipeline(this.device, this.pipeline!);
    API.setVertex(this.device, 0, this.buffer!);
    API.draw(this.device, 3);
    API.submitRenderPass(this.device);

    return false;
  }
}
