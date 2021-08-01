import {
  Buffer, BufferDescriptor, BufferProperties, Int, Pipeline, PipelineDescriptor, PipelineProperties, ReadonlyColor, RenderPass,
  RenderPassDescriptor, RenderPassProperties, SamplerDescriptor, SamplerProperties, ShaderDescriptor, TextureDescriptor,
  TextureProperties, Uint, UniformBindings
} from '../../src/common';
import { RenderingDevice, RenderPassContext } from '../../src/common/device/device/index';
import {
  bindIndexBuffer, bindPipeline, bindUniform, bindVertexBuffer, blendColor, deviceFeature, draw, endRender, getCanvasHeight,
  getCanvasWidth, render, RenderingDeviceId, RenderPassContextId, resetDevice, scissor, stencilRef, viewport
} from '../mugl';
import { GLBuffer, GLPipeline, GLRenderPass, GLShader, GLTexture } from './resources';

export class GLRenderingDevice extends RenderingDevice {
  public constructor(
    public readonly id: RenderingDeviceId
  ) {
    super();
  }

  public get width(): Uint {
    return getCanvasWidth(this.id);
  }

  public get height(): Uint {
    return getCanvasHeight(this.id);
  }

  public buffer(desc: BufferDescriptor): GLBuffer {
    return new GLBuffer(this.id, desc as BufferProperties);
  }

  public texture(desc: TextureDescriptor, sampler: SamplerDescriptor = {}): GLTexture {
    return new GLTexture(this.id, desc as TextureProperties, sampler as SamplerProperties);
  }

  public shader(desc: ShaderDescriptor): GLShader {
    return new GLShader(this.id, desc);
  }

  public pass(desc: RenderPassDescriptor = {}): GLRenderPass {
    return new GLRenderPass(this.id, desc as RenderPassProperties);
  }

  public pipeline(desc: PipelineDescriptor): GLPipeline {
    return new GLPipeline(this.id, desc as PipelineProperties);
  }

  public render(pass: RenderPass): GLRenderPassContext {
    return new GLRenderPassContext(this.id, pass as GLRenderPass);
  }

  public reset(): void {
    resetDevice(this.id);
  }

  public feature<F>(feature: string): F {
    return deviceFeature(this.id, feature);
  }
}

class GLRenderPassContext extends RenderPassContext {
  public readonly id: RenderPassContextId;

  public constructor(deviceId: RenderingDeviceId, pass: GLRenderPass) {
    super();
    this.id = render(deviceId, pass.id);
  }

  public end(): void {
    endRender(this.id);
  }

  public pipeline(pipeline: Pipeline): GLRenderPassContext {
    bindPipeline(this.id, (pipeline as GLPipeline).id);
    return this;
  }

  public index(buffer: Buffer): GLRenderPassContext {
    bindIndexBuffer(this.id, (buffer as GLBuffer).id);
    return this;
  }

  public vertex(slot: Uint, buffer: Buffer): GLRenderPassContext {
    bindVertexBuffer(this.id, slot, (buffer as GLBuffer).id);
    return this;
  }

  public uniforms(bindings: UniformBindings): GLRenderPassContext {
    for (let i = 0; i < bindings.length; ++i) {
      const uniform = bindings[i];
      bindUniform(
        this.id, uniform.name, uniform.value || 0, uniform.values || null, uniform.tex ? (uniform.tex as GLTexture).id : 0,
        uniform.buffer ? (uniform.buffer as GLBuffer).id : 0, uniform.bufferOffset || 0, uniform.bufferSize || 0
      );
    }
    return this;
  }

  public draw(vertexCount: Uint, instanceCount: Uint = 1, firstVertex: Uint = 0): GLRenderPassContext {
    draw(this.id, false, vertexCount, instanceCount, firstVertex);
    return this;
  }

  public drawIndexed(indexCount: Uint, instanceCount: Uint = 1, firstIndex: Uint = 0): GLRenderPassContext {
    draw(this.id, true, indexCount, instanceCount, firstIndex);
    return this;
  }

  public viewport(x: Int, y: Int, width: Int, height: Int, minDepth: Int = 0, maxDepth: Int = 1): GLRenderPassContext {
    viewport(this.id, x, y, width, height, minDepth, maxDepth);
    return this;
  }

  public scissor(x: Int, y: Int, width: Int, height: Int): GLRenderPassContext {
    scissor(this.id, x, y, width, height);
    return this;
  }

  public blendColor(color: ReadonlyColor): GLRenderPassContext {
    blendColor(this.id, color);
    return this;
  }

  public stencilRef(ref: Uint): GLRenderPassContext {
    stencilRef(this.id, ref);
    return this;
  }
}
