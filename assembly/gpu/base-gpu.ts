
import {
  beginRenderPass, copyBuffer, copyExternalImageToTexture, copyTexture, copyTextureToBuffer, draw, drawIndexed, flush,
  getFeatures, isDeviceLost, readBuffer, resetDevice, setBindGroup, setBlendConst, setIndex, setRenderPipeline,
  setScissorRect, setStencilRef, setVertex, setViewport, submitRenderPass, writeBuffer, writeTexture
} from '../mugl';
import {
  BufferDescriptor, TextureDescriptor, SamplerDescriptor, ShaderDescriptor, BindGroupLayoutDescriptor,
  BindGroupDescriptor, RenderPipelineDescriptor, RenderPassDescriptor, ImageCopyTexture, ImageDataLayout,
  ImageCopyExternalImage
} from './descriptor';
import { GPU } from './gpu';
import { Color, Extent2D, Extent3D, Float, Future, UInt, UIntArray } from './primitive';
import {
  Buffer, BindGroupLayout, BindGroup, Device, RenderPipeline, RenderPass, Sampler, Shader, Texture,
} from './resource';

/**
 * Base implementation of the GPU interface.
 */
export class BaseGPU implements GPU {
  public flush(device: Device): void {
    flush(device.id);
  }

  public resetDevice(device: Device): void {
    resetDevice(device.id);
  }

  public isDeviceLost(device: Device): boolean {
    return isDeviceLost(device.id);
  }

  public getDeviceFeatures(device: Device): UInt {
    return getFeatures(device.id);
  }

  public createBuffer(device: Device, desc: BufferDescriptor): Buffer {
    return new Buffer(device, desc);
  }

  public createTexture(device: Device, desc: TextureDescriptor): Texture {
    return new Texture(device, desc);
  }

  public createSampler(device: Device, desc: SamplerDescriptor): Sampler {
    return new Sampler(device, desc);
  }

  public createShader(device: Device, desc: ShaderDescriptor): Shader {
    return new Shader(device, desc);
  }

  public createBindGroupLayout(device: Device, desc: BindGroupLayoutDescriptor): BindGroupLayout {
    return new BindGroupLayout(device, desc);
  }

  public createBindGroup(device: Device, desc: BindGroupDescriptor): BindGroup {
    return new BindGroup(device, desc);
  }

  public createRenderPipeline(device: Device, desc: RenderPipelineDescriptor): RenderPipeline {
    return new RenderPipeline(device, desc);
  }

  public createRenderPass(device: Device, desc: RenderPassDescriptor): RenderPass {
    return new RenderPass(device, desc);
  }

  public readBuffer(device: Device, buffer: Buffer, out: Uint8Array, offset: UInt = 0): Future {
    return new Future(
      readBuffer(device.id, buffer.id, offset, changetype<usize>(out.buffer) + out.byteOffset, out.byteLength)
    );
  }

  public writeBuffer(device: Device, buffer: Buffer, data: ArrayBufferView, offset: UInt = 0): void {
    writeBuffer(device.id, buffer.id, changetype<usize>(data.buffer) + data.byteOffset, data.byteLength, offset);
  }

  public copyBuffer(device: Device, src: Buffer, dst: Buffer, size: UInt = 0, srcOffset: UInt = 0, dstOffset: UInt = 0): void {
    copyBuffer(device.id, src.id, dst.id, size, srcOffset, dstOffset);
  }

  // TODO: set default size instead of 0!
  public writeTexture(device: Device, texture: ImageCopyTexture, data: ArrayBufferView, layout: ImageDataLayout, size: Extent3D = [0, 0, 0]): void {
    writeTexture(
      device.id,
      texture.texture.id, texture.mipLevel, texture.origin[0], texture.origin[1], texture.origin[2],
      changetype<usize>(data.buffer) + data.byteOffset, data.byteLength,
      layout.offset, layout.bytesPerRow, layout.rowsPerImage,
      size[0], size[1], size[2]
    );
  }

  public copyExternalImageToTexture(
    device: Device, src: ImageCopyExternalImage, dst: ImageCopyTexture, size: Extent2D = [src.src.width - src.origin[0], src.src.height - src.origin[1]]
  ): void {
    copyExternalImageToTexture(
      device.id,
      src.src.id, src.origin[0], src.origin[1],
      dst.texture.id, dst.mipLevel, dst.origin[0], dst.origin[1], dst.origin[2],
      size[0], size[1]
    );
  }

  // TODO: set default size instead of 0!
  public copyTexture(device: Device, src: ImageCopyTexture, dst: ImageCopyTexture, size: Extent3D = [0, 0, 0]): void {
    copyTexture(
      device.id,
      src.texture.id, src.mipLevel, src.origin[0], src.origin[1], src.origin[2],
      dst.texture.id, dst.mipLevel, dst.origin[0], dst.origin[1], dst.origin[2],
      size[0], size[1], size[2]
    );
  }

  // TODO: set default size instead of 0!
  public copyTextureToBuffer(device: Device, src: ImageCopyTexture, dst: Buffer, layout: ImageDataLayout, size: Extent3D = [0, 0, 0]): void {
    copyTextureToBuffer(
      device.id,
      src.texture.id, src.mipLevel, src.origin[0], src.origin[1], src.origin[2],
      dst.id,
      layout.offset, layout.bytesPerRow, layout.rowsPerImage,
      size[0], size[1], size[2]
    );
  }

  public beginRenderPass(device: Device, pass: RenderPass | null = null): void {
    beginRenderPass(device.id, pass ? pass.id : 0);
  }

  public submitRenderPass(device: Device): void {
    submitRenderPass(device.id);
  }

  public setRenderPipeline(device: Device, pipeline: RenderPipeline): void {
    setRenderPipeline(device.id, pipeline.id);
  }

  public setIndex(device: Device, buffer: Buffer): void {
    setIndex(device.id, buffer.id);
  }

  public setVertex(device: Device, slot: UInt, buffer: Buffer, offset: UInt = 0): void {
    setVertex(device.id, slot, buffer.id, offset);
  }

  public setBindGroup(device: Device, slot: UInt, bindGroup: BindGroup, offsets: UIntArray = []): void {
    setBindGroup(device.id, slot, bindGroup.id, changetype<usize>(offsets), offsets.length);
  }

  public draw(device: Device, vertexCount: UInt, instanceCount: UInt = 1, firstVertex: UInt = 0, firstInstance: UInt = 0): void {
    draw(device.id, vertexCount, instanceCount, firstVertex, firstInstance);
  }
  public drawIndexed(device: Device, indexCount: UInt, instanceCount: UInt = 1, firstIndex: UInt = 0, firstInstance: UInt = 0): void {
    drawIndexed(device.id, indexCount, instanceCount, firstIndex, firstInstance);
  }
  public setViewport(device: Device, x: UInt, y: UInt, width: UInt, height: UInt, minDepth: Float = 0, maxDepth: Float = 1): void {
    setViewport(device.id, x, y, width, height, minDepth, maxDepth);
  }
  public setScissorRect(device: Device, x: UInt, y: UInt, width: UInt, height: UInt): void {
    setScissorRect(device.id, x, y, width, height);
  }
  public setBlendConst(device: Device, color: Color): void {
    setBlendConst(device.id, color[0], color[1], color[2], color[3]);
  }
  public setStencilRef(device: Device, ref: UInt): void {
    setStencilRef(device.id, ref);
  }
}
