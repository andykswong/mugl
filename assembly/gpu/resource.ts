import { DeviceId, BufferId, TextureId, SamplerId, ShaderId, BindGroupLayoutId, BindGroupId, RenderPipelineId, RenderPassId, createBuffer, deleteDevice, deleteBuffer, deleteTexture, createTexture, deleteShader, createShader, createSampler, deleteSampler, deleteBindGroupLayout, createBindGroupLayout, deleteBindGroup, createBindGroup, createRenderPass, deleteRenderPass, createRenderPipeline, deleteRenderPipeline } from '../mugl';
import { BindGroupDescriptor, BindGroupLayoutDescriptor, BufferDescriptor, ColorTargetStates, DepthStencilState, RenderPassDescriptor, RenderPipelineDescriptor, SamplerDescriptor, ShaderDescriptor, TextureDescriptor } from './descriptor';
import { BindingType } from './type';

const BIND_GROUP_LAYOUT_ENTRY_SIZE = 32;
const BIND_GROUP_ENTRY_SIZE = 24;
const VERTEX_ATTRIBUTE_SIZE = 12;
const VERTEX_BUFFER_LAYOUT_SIZE = 16;
const COLOR_TARGET_STATE_SIZE = 32;
const COLOR_ATTACHMENT_SIZE = 32;

/**
 * A resource that can be destroyed.
 */
export abstract class Resource {
  /**
   * Destroy the resource.
   */
  public abstract destroy(): void;
}

/**
 * A GPU device resource.
 */
export abstract class Device extends Resource {
  public id: DeviceId = 0;

  public destroy(): void {
    deleteDevice(this.id);
  }
}

/**
 * A GPU buffer resource.
 */
export class Buffer extends Resource {
  public readonly id: BufferId;

  public constructor(device: Device, desc: BufferDescriptor) {
    super();
    this.id = createBuffer(device.id, desc.size, desc.usage);
  }

  public destroy(): void {
    deleteBuffer(this.id);
  }
}

/**
 * A GPU texture resource.
 */
export class Texture extends Resource {
  public readonly id: TextureId;

  public constructor(device: Device, desc: TextureDescriptor) {
    super();
    this.id = createTexture(
      device.id,
      desc.size[0], desc.size[1], desc.size[2],
      desc.mipLevelCount,
      desc.sampleCount,
      desc.dimension,
      desc.format,
      desc.usage
    );
  }

  public destroy(): void {
    deleteTexture(this.id);
  }
}

/**
 * A GPU texture sampler resource.
 */
export class Sampler extends Resource {
  public readonly id: SamplerId;

  public constructor(device: Device, desc: SamplerDescriptor) {
    super();
    this.id = createSampler(
      device.id,
      desc.addressModeU, desc.addressModeV, desc.addressModeW,
      desc.magFilter, desc.minFilter, desc.mipmapFilter,
      desc.lodMinClamp, desc.lodMaxClamp,
      desc.compare,
      desc.maxAnisotropy
    );
  }

  public destroy(): void {
    deleteSampler(this.id);
  }
}

/**
 * A GPU shader object.
 */
export class Shader extends Resource {
  public readonly id: ShaderId;

  public constructor(device: Device, desc: ShaderDescriptor) {
    super();
    const code = String.UTF8.encode(desc.code);
    this.id = createShader(device.id, changetype<usize>(code), code.byteLength, desc.usage);
  }

  public destroy(): void {
    deleteShader(this.id);
  }
}

/**
 * A GPU bind group layout object.
 */
export class BindGroupLayout extends Resource {
  public readonly id: BindGroupLayoutId;

  public constructor(device: Device, desc: BindGroupLayoutDescriptor) {
    super();
    const len = desc.entries.length;
    const entries = new ArrayBuffer(BIND_GROUP_LAYOUT_ENTRY_SIZE * len);
    const entriesPtr = changetype<usize>(entries);
    for (let i = 0; i < len; ++i) {
      const base = entriesPtr + BIND_GROUP_LAYOUT_ENTRY_SIZE * i;
      const entry = desc.entries[i];
      // TODO: use a slice into a concatenated label string instead
      const label = String.UTF8.encode(entry.label);
      store<u32>(base, changetype<u32>(label), 0);
      store<u32>(base, label.byteLength, 4);
      // TODO: set default binding slot to i
      store<u32>(base, entry.binding, 8);
      store<u32>(base, entry.visibility, 12);
      store<u32>(base, entry.type, 16);
      switch (entry.type) {
        case BindingType.Buffer:
          store<u8>(base, entry.bufferDynamicOffset ? 1 : 0, 20);
          break;
        case BindingType.Sampler:
          store<u32>(base, entry.samplerType, 20);
          break;
        case BindingType.Texture:
          store<u32>(base, entry.textureSampleType, 20);
          store<u32>(base, entry.textureDimension, 24);
          store<u8>(base, entry.textureMultisampled ? 1 : 0, 28);
          break;
        default:
          throw new RangeError('invalid value for BindingType');
      }
    }
    this.id = createBindGroupLayout(device.id, entriesPtr, len);
  }

  public destroy(): void {
    deleteBindGroupLayout(this.id);
  }
}

/**
 * A GPU bind group object.
 */
export class BindGroup extends Resource {
  public readonly id: BindGroupId;

  public constructor(device: Device, desc: BindGroupDescriptor) {
    super();
    const len = desc.entries.length;
    const entries = new ArrayBuffer(BIND_GROUP_ENTRY_SIZE * len);
    const entriesPtr = changetype<usize>(entries);
    for (let i = 0; i < len; ++i) {
      const base = entriesPtr + BIND_GROUP_ENTRY_SIZE * i;
      const entry = desc.entries[i];
      // TODO: set default binding slot to i
      store<u32>(base, entry.binding, 0);
      if (entry.buffer) {
        store<u32>(base, BindingType.Buffer, 4);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        store<BufferId>(base, entry.buffer!.id, 8);
        store<u32>(base, entry.bufferOffset, 16);
        store<u32>(base, entry.bufferSize, 20);
      } else if (entry.sampler) {
        store<u32>(base, BindingType.Sampler, 4);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        store<SamplerId>(base, entry.sampler!.id, 8);
      } else if (entry.texture) {
        store<u32>(base, BindingType.Texture, 4);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        store<TextureId>(base, entry.texture!.id, 8);
      } else {
        throw new TypeError('one of buffer, sampler, texture must be specified for BindGroupEntry');
      }
    }
    this.id = createBindGroup(device.id, desc.layout.id, entriesPtr, len);
  }

  public destroy(): void {
    deleteBindGroup(this.id);
  }
}

/**
 * A GPU render pipeline object.
 */
export class RenderPipeline extends Resource {
  public readonly id: RenderPipelineId;

  public constructor(device: Device, desc: RenderPipelineDescriptor) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const depthStecil: DepthStencilState = desc.depthStencil ? desc.depthStencil! : {} as DepthStencilState;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const targets: ColorTargetStates = desc.targets ? desc.targets! : {} as ColorTargetStates;

    const buffersLen = desc.buffers.length;
    let attributesLen = 0;
    for (let i = 0; i < buffersLen; ++i) {
      attributesLen += desc.buffers[i].attributes.length;
    }
    const attributes = new ArrayBuffer(VERTEX_ATTRIBUTE_SIZE * attributesLen);
    const buffers = new ArrayBuffer(VERTEX_BUFFER_LAYOUT_SIZE * buffersLen);
    for (let i = 0, j = 0; i < buffersLen; ++i) {
      const base = changetype<usize>(buffers) + VERTEX_BUFFER_LAYOUT_SIZE * i;
      const buffer = desc.buffers[i];
      store<u32>(base, j, 0);
      store<u32>(base, buffer.attributes.length, 4);
      store<u32>(base, buffer.stride, 8);
      store<u32>(base, buffer.stepMode, 12);

      for (let k = 0; k < buffer.attributes.length; ++k) {
        const attrBase = changetype<usize>(attributes) + VERTEX_ATTRIBUTE_SIZE * (j + k);
        const attribute = buffer.attributes[k];
        store<u32>(attrBase, attribute.format, 0);
        store<u32>(attrBase, attribute.offset, 4);
        store<u32>(attrBase, attribute.shaderLocation, 8);
      }

      j += buffer.attributes.length;
    }

    const bindGroupsLen = desc.bindGroups.length;
    const bindGroups = new ArrayBuffer(8 * bindGroupsLen);
    for (let i = 0; i < bindGroupsLen; ++i) {
      store<BindGroupId>(changetype<usize>(bindGroups) + 8 * i, desc.bindGroups[i].id, 0);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const colorsLen = targets.targets ? targets.targets!.length : 0;
    const colors = new ArrayBuffer(COLOR_TARGET_STATE_SIZE * colorsLen);
    for (let i = 0; i < colorsLen; ++i) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const target = targets.targets![i];
      const base = changetype<usize>(colors) + COLOR_TARGET_STATE_SIZE * i;
      store<u32>(base, target.format, 0);
      store<u32>(base, target.writeMask, 4);
      store<u32>(base, target.blendColor.operation, 8);
      store<u32>(base, target.blendColor.srcFactor, 12);
      store<u32>(base, target.blendColor.dstFactor, 16);
      store<u32>(base, target.blendAlpha.operation, 20);
      store<u32>(base, target.blendAlpha.srcFactor, 24);
      store<u32>(base, target.blendAlpha.dstFactor, 28);
    }

    const vertexEntryPoint = String.UTF8.encode(desc.vertexEntryPoint);
    const fragmentEntryPoint = String.UTF8.encode(desc.fragmentEntryPoint);

    this.id = createRenderPipeline(
      device.id,
      desc.vertex.id, desc.fragment.id,
      changetype<usize>(attributes), attributesLen,
      changetype<usize>(buffers), buffersLen,
      changetype<usize>(bindGroups), bindGroupsLen,
      desc.primitive.topology, desc.primitive.indexFormat, desc.primitive.frontFace, desc.primitive.cullMode,
      desc.multisample.sampleCount, desc.multisample.alphaToCoverage,
      !!desc.depthStencil, depthStecil.format, depthStecil.depthWrite, depthStecil.depthCompare,
      depthStecil.stencilFront.compare, depthStecil.stencilFront.failOp, depthStecil.stencilFront.depthFailOp, depthStecil.stencilFront.passOp,
      depthStecil.stencilBack.compare, depthStecil.stencilBack.failOp, depthStecil.stencilBack.depthFailOp, depthStecil.stencilBack.passOp,
      depthStecil.stencilReadMask, depthStecil.stencilWriteMask, depthStecil.depthBias, depthStecil.depthBiasSlopeScale, depthStecil.depthBiasClamp,
      changetype<usize>(colors), colorsLen,
      targets.writeMask,
      targets.blendColor.operation, targets.blendColor.srcFactor, targets.blendColor.dstFactor,
      targets.blendAlpha.operation, targets.blendAlpha.srcFactor, targets.blendAlpha.dstFactor,
      changetype<usize>(vertexEntryPoint), vertexEntryPoint.byteLength, changetype<usize>(fragmentEntryPoint), fragmentEntryPoint.byteLength,
    );
  }

  public destroy(): void {
    deleteRenderPipeline(this.id);
  }
}

/**
 * A GPU render pass object.
 */
export class RenderPass extends Resource {
  public readonly id: RenderPassId;

  public constructor(device: Device, desc: RenderPassDescriptor) {
    super();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const len = desc.colors ? desc.colors!.length : 0;
    const colors = new ArrayBuffer(COLOR_ATTACHMENT_SIZE * len);
    for (let i = 0; i < len; ++i) {
      const base = changetype<usize>(colors) + COLOR_ATTACHMENT_SIZE * i;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const color = desc.colors![i];
      store<TextureId>(base, color.view.texture.id, 0);
      store<u32>(base, color.view.mipLevel, 8);
      store<u32>(base, color.view.slice, 12);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const clearColor = color.clear ? color.clear! : [NaN, NaN, NaN, NaN];
      store<f32>(base, clearColor[0], 16);
      store<f32>(base, clearColor[1], 20);
      store<f32>(base, clearColor[2], 24);
      store<f32>(base, clearColor[3], 28);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const clearColor = desc.clearColor ? desc.clearColor! : [NaN, NaN, NaN, NaN];

    this.id = createRenderPass(
      device.id,
      desc.clearDepth, desc.clearStencil,
      clearColor[0], clearColor[1], clearColor[2], clearColor[3],
      !!desc.colors,
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      desc.depthStencil ? desc.depthStencil!.texture.id : 0,
      desc.depthStencil ? desc.depthStencil!.mipLevel : 0,
      desc.depthStencil ? desc.depthStencil!.slice : 0,
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      changetype<usize>(colors), len
    );
  }

  public destroy(): void {
    deleteRenderPass(this.id);
  }
}
