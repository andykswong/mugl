import { Buffer, Device, Float, RenderPass, RenderPipeline, ShaderStage, TextureFormat, VertexFormat, vertexBufferLayouts } from '../interop/mugl';
import { BaseExample, createBuffer, toVertices, Triangle } from '../common';
import { frag, vert } from './shaders/basic';

const position = toVertices(Triangle);

export class BasicExample extends BaseExample {
  buffer: Buffer | null = null;
  pipeline: RenderPipeline | null = null;
  pass: RenderPass | null = null;

  constructor(private readonly device: Device, useWebGPU: boolean) {
    super(useWebGPU);
  }

  init(): void {
    const vs = this.gpu.createShader(this.device, { code: vert(this.useWebGPU), usage: ShaderStage.Vertex });
    const fs = this.gpu.createShader(this.device, { code: frag(this.useWebGPU), usage: ShaderStage.Fragment });

    this.pipeline = this.gpu.createRenderPipeline(this.device, {
      vertex: vs,
      fragment: fs,
      buffers: vertexBufferLayouts([{ attributes: [/* position */ VertexFormat.F32x3, /* color */ VertexFormat.F32x4] }]),
      depthStencil: { format: TextureFormat.Depth24Stencil8 },
    });

    this.pass = this.gpu.createRenderPass(this.device, { clearColor: [0.1, 0.2, 0.3, 1.0] });

    this.buffer = createBuffer(this.gpu, this.device, position);

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
