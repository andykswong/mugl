import { Canvas } from '../dom';
import {
  AddressMode, BindGroup, BindGroupLayout, BindGroupLayoutEntry, BindingType, Buffer, BufferUsage, Color,
  ColorAttachment, ColorTargetState, CompareFunction, CullMode, Device, FilterMode, Float, FrontFace, Future,
  FutureStatus, GPU, ImageSource, IndexFormat, MipmapHint, PrimitiveTopology, RenderPass, RenderPassDescriptor, RenderPipeline,
  Resource, Sampler, SamplerBindingType, Shader, ShaderStage, StencilOperation, Texture, TextureDimension,
  TextureFormat, TextureSampleType, TextureUsage, UInt, VertexAttribute, VertexBufferLayout
} from '../gpu';
import { WebGL } from '../gl2';
import { GenerationalArena } from './arena';
import { dataView, decodeStr, toWebGLContextAttributes, toWebGPUContextAttributes } from './deserialize';
import { WebGPU } from '../webgpu';

export type ContextId = number & { readonly __tag: unique symbol };
export type FutureId = number & { readonly __tag: unique symbol };
export type ImageSourceId = number & { readonly __tag: unique symbol };
export type CanvasId = number & { readonly __tag: unique symbol };
export type ResourceId = number & { readonly __tag: unique symbol };

const contexts: Record<ContextId, { memory: WebAssembly.Memory | undefined }> = {};
const futures = new GenerationalArena<Future, FutureId>();
const images = new GenerationalArena<TexImageSource, ImageSourceId>();
const imageMap: Record<string, ImageSourceId> = {};
const canvases = new GenerationalArena<Canvas, CanvasId>();
const canvasMap: Record<string, CanvasId> = {};
const canvasContextMap: Record<CanvasId, ContextId> = {};
const resources = new GenerationalArena<Resource, ResourceId>();
const deviceContextMap: Record<ResourceId, ContextId> = {};
const deviceGPUMap: Record<ResourceId, GPU> = {};

//#region utils

function getMemory(context: ContextId): WebAssembly.Memory {
  return contexts[context].memory as WebAssembly.Memory;
}

function getDeviceMemory(resource: ResourceId): WebAssembly.Memory {
  return getMemory(deviceContextMap[resource]);
}

function deleteResource(id: ResourceId): void {
  const resource = resources.get(id);
  if (resource) {
    resource.destroy();
    resources.delete(id);
  }
}

function getGPU(device: ResourceId): GPU {
  return deviceGPUMap[device] || WebGL;
}

function getCanvasById(context: ContextId, id: string): CanvasId {
  if (canvases.get(canvasMap[id] || 0 as CanvasId)) {
    return canvasMap[id];
  }
  const canvas = document.getElementById(id) as Canvas;
  if (!canvas) {
    return 0 as CanvasId;
  }
  let canvasId = canvasMap[id];
  if (canvasId) {
    canvases.set(canvasId, canvas);
  } else {
    canvasId = canvases.add(canvas);
  }
  canvasContextMap[canvasId] = context;
  return canvasId;
}

//#endregion utils

//#region host functions

/**
 * Sets the WebAssembly memory for the given context.
 * @param context context ID
 * @param memory WebAssembly memory
 */
export function set_context_memory(context: ContextId, memory: WebAssembly.Memory): void {
  (contexts[context] = contexts[context] || {}).memory = memory;
}

/**
 * Binds an image source to given ID string for WebAssembly context.
 * @param id ID string
 * @param image image source
 * @returns image source ID
 */
export function set_image_by_id(id: string, image: TexImageSource): ImageSourceId {
  if (imageMap[id]) {
    images.set(imageMap[id], image);
    return imageMap[id];
  }
  return (imageMap[id] = images.add(image));
}

/**
 * Provides a device object to WebAssembly context.
 * @param context context ID
 * @param device the device
 * @param canvasId canvas ID string
 * @param gpu GPU API type
 * @returns device ID
 */
export function set_device(context: ContextId, device: Device, canvasId: string = 'canvas', gpu: GPU = WebGL): ResourceId {
  const deviceId = resources.add(device);
  const canvas = getCanvasById(context, canvasId);
  deviceContextMap[deviceId] = canvasContextMap[canvas];
  deviceGPUMap[deviceId] = gpu;
  return deviceId;
}

//#endregion host functions

//#region context

export function free_context(context: ContextId): void {
  delete contexts[context];
}

export function get_future_status(future: FutureId): FutureStatus {
  const f = futures.get(future);
  if (f) {
    if (f.status !== FutureStatus.Pending) {
      futures.delete(future);
    }
    return f.status;
  }
  return FutureStatus.Done;
}

export function get_future_value(future: FutureId): ResourceId {
  return futures.get(future)?.value as ResourceId || 0 as ResourceId;
}

//#endregion context

//#region DOM

export function get_image_by_id(context: ContextId, ptr: UInt, len: UInt): ImageSourceId {
  const id = decodeStr(getMemory(context), ptr, len);
  if (imageMap[id]) {
    return imageMap[id];
  }
  const image = document.getElementById(id) as TexImageSource;
  if (!image) {
    return 0 as ImageSourceId;
  }
  return (imageMap[id] = images.add(image));
}

export function delete_image(img: ImageSourceId): void {
  images.delete(img);
}

export function get_image_width(img: ImageSourceId): UInt {
  return images.get(img)?.width || 0;
}

export function get_image_height(img: ImageSourceId): UInt {
  return images.get(img)?.height || 0;
}

export function get_canvas_by_id(context: ContextId, ptr: UInt, len: UInt): CanvasId {
  const id = decodeStr(getMemory(context), ptr, len);
  return getCanvasById(context, id);
}

export function get_canvas_width(canvas: CanvasId): UInt {
  return canvases.get(canvas)?.width || 0;
}

export function get_canvas_height(canvas: CanvasId): UInt {
  return canvases.get(canvas)?.height || 0;
}

export function delete_canvas(canvas: CanvasId): void {
  canvases.delete(canvas);
  delete canvasContextMap[canvas];
  // TODO: good to keep canvasMap entry?
}

//#endregion DOM

//#region WebGPU

export function webgpu_request_device(canvasId: CanvasId, attrs: UInt, features: UInt): FutureId {
  const canvas = canvases.get(canvasId);
  if (!canvas) {
    return 0 as FutureId;
  }

  const future = WebGPU.requestWebGPUDevice(canvas, toWebGPUContextAttributes(attrs), features)
    .then((device) => {
      let deviceId = 0 as ResourceId;
      if (device) {
        deviceId = resources.add(device);
        deviceContextMap[deviceId] = canvasContextMap[canvasId];
        deviceGPUMap[deviceId] = WebGPU;
      }
      return deviceId;
    });

  const ret = {
    status: FutureStatus.Pending,
    value: 0,
    then(onFullfilled, onRejected) {
      return future.then(onFullfilled, onRejected);
    }
  } as Future<ResourceId> & { status: FutureStatus, value: ResourceId };

  return futures.add(ret);
}

export function webgpu_create_surface_texture(deviceId: ResourceId, canvasId: CanvasId, attrs: UInt = 0): ResourceId {
  const ret = WebGPU.createSurfaceTexture(
    resources.get(deviceId) as Device,
    canvases.get(canvasId),
    toWebGPUContextAttributes(attrs)
  );
  return resources.add(ret);
}

export function webgpu_create_surface_depth_texture(deviceId: ResourceId, canvasId: CanvasId, attrs: UInt = 0): ResourceId {
  const ret = WebGPU.createSurfaceDepthTexture(
    resources.get(deviceId) as Device,
    canvases.get(canvasId),
    toWebGPUContextAttributes(attrs)
  );
  return resources.add(ret);
}

//#endregion WebGPU

//#region WebGL2

export function webgl_request_device(canvasId: CanvasId, attrs: UInt, features: UInt): ResourceId {
  const canvas = canvases.get(canvasId);
  if (canvas) {
    const device = WebGL.requestWebGL2Device(canvas, toWebGLContextAttributes(attrs), features);
    if (device) {
      const deviceId = resources.add(device);
      deviceContextMap[deviceId] = canvasContextMap[canvasId];
      deviceGPUMap[deviceId] = WebGL;
      return deviceId;
    }
  }
  return 0 as ResourceId;
}

export function webgl_generate_mipmap(device: ResourceId, tex: ResourceId, hint: MipmapHint): void {
  WebGL.generateMipmap(resources.get(device) as Device, resources.get(tex) as Texture, hint);
}

//#endregion WebGL2

export function flush(device: ResourceId): void {
  getGPU(device).flush(resources.get(device) as Device);
}

export function reset_device(device: ResourceId): void {
  getGPU(device).resetDevice(resources.get(device) as Device);
}

export function delete_device(device: ResourceId): void {
  deleteResource(device);
  delete deviceContextMap[device];
  delete deviceGPUMap[device];
}

export function is_device_lost(device: ResourceId): boolean {
  return getGPU(device).isDeviceLost(resources.get(device) as Device);
}

export function get_device_features(device: ResourceId): UInt {
  return getGPU(device).getDeviceFeatures(resources.get(device) as Device);
}

export function create_buffer(device: ResourceId, size: UInt, usage: BufferUsage): ResourceId {
  const ret = getGPU(device).createBuffer(resources.get(device) as Device, {
    size: size >>> 0,
    usage: usage >>> 0,
  });
  return resources.add(ret);
}

export { deleteResource as delete_buffer };

export function create_texture(
  device: ResourceId,
  width: UInt, height: UInt, depth: UInt,
  mipLevelCount: UInt,
  sampleCount: UInt,
  dimension: TextureDimension,
  format: TextureFormat,
  usage: TextureUsage
): ResourceId {
  const ret = getGPU(device).createTexture(resources.get(device) as Device, {
    size: [width >>> 0, height >>> 0, depth >>> 0],
    mipLevelCount: mipLevelCount >>> 0,
    sampleCount: sampleCount >>> 0,
    dimension: dimension >>> 0,
    format: format >>> 0,
    usage: usage >>> 0,
  });
  return resources.add(ret);
}

export { deleteResource as delete_texture };

export function create_sampler(
  device: ResourceId,
  addressModeU: AddressMode, addressModeV: AddressMode, addressModeW: AddressMode,
  magFilter: FilterMode, minFilter: FilterMode, mipmapFilter: FilterMode,
  lodMinClamp: Float, lodMaxClamp: Float,
  compare: CompareFunction,
  maxAnisotropy: UInt
): ResourceId {
  const ret = getGPU(device).createSampler(resources.get(device) as Device, {
    addressModeU: addressModeU >>> 0,
    addressModeV: addressModeV >>> 0,
    addressModeW: addressModeW >>> 0,
    magFilter: magFilter >>> 0,
    minFilter: minFilter >>> 0,
    mipmapFilter: mipmapFilter >>> 0,
    lodMinClamp,
    lodMaxClamp,
    compare: compare >>> 0,
    maxAnisotropy: maxAnisotropy >>> 0,
  });
  return resources.add(ret);
}

export { deleteResource as delete_sampler };

export function create_shader(device: ResourceId, codePtr: UInt, codeLen: UInt, usage: ShaderStage): ResourceId {
  const ret = getGPU(device).createShader(resources.get(device) as Device, {
    code: decodeStr(getDeviceMemory(device), codePtr, codeLen),
    usage: usage >>> 0,
  });
  return resources.add(ret);
}

export { deleteResource as delete_shader };

export function create_bind_group_layout(device: ResourceId, entriesPtr: UInt, entriesLen: UInt): ResourceId {
  const memory = getDeviceMemory(device);
  const entries: BindGroupLayoutEntry[] = [];
  for (let i = 0; i < entriesLen; i++) {
    const base = entriesPtr + i * 32;
    const ptr0 = dataView(memory).getUint32(base + 0, true);
    const len0 = dataView(memory).getUint32(base + 4, true);
    const type = dataView(memory).getUint8(base + 16);
    let bufferDynamicOffset = false;
    let samplerType = SamplerBindingType.Filtering;
    let textureSampleType = TextureSampleType.Float;
    let textureDimension = TextureDimension.D2;
    let textureMultisampled = false;

    switch (type) {
      case BindingType.Buffer:
        bufferDynamicOffset = !!dataView(memory).getUint8(base + 20);
        break;
      case BindingType.Sampler:
        samplerType = dataView(memory).getUint32(base + 20, true) >>> 0;
        break;
      case BindingType.Texture:
        textureSampleType = dataView(memory).getUint32(base + 20, true) >>> 0;
        textureDimension = dataView(memory).getUint32(base + 24, true) >>> 0;
        textureMultisampled = !!dataView(memory).getUint8(base + 28);
        break;
      default:
        throw new RangeError('invalid variant discriminant for BindingType');
    }
    entries.push({
      label: decodeStr(memory, ptr0, len0),
      binding: dataView(memory).getUint32(base + 8, true) >>> 0,
      visibility: dataView(memory).getUint32(base + 12, true) >>> 0,
      type,
      bufferDynamicOffset,
      samplerType,
      textureSampleType,
      textureDimension,
      textureMultisampled,
    });
  }
  const ret = getGPU(device).createBindGroupLayout(resources.get(device) as Device, { entries });
  return resources.add(ret);
}

export { deleteResource as delete_bind_group_layout };

export function create_bind_group(device: ResourceId, layout: ResourceId, entriesPtr: UInt, entriesLen: UInt): ResourceId {
  const memory = getDeviceMemory(device);
  const entries = [];
  for (let i = 0; i < entriesLen; i++) {
    const base = entriesPtr + i * 24;
    const type = dataView(memory).getUint8(base + 4);
    let buffer: Buffer | undefined;
    let bufferOffset = 0;
    let bufferSize = 0;
    let sampler: Sampler | undefined;
    let texture: Texture | undefined;

    switch (type) {
      case BindingType.Buffer:
        buffer = resources.get(dataView(memory).getFloat64(base + 8, true) as ResourceId) as Buffer;
        bufferOffset = dataView(memory).getUint32(base + 16, true);
        bufferSize = dataView(memory).getUint32(base + 20, true);
        break;
      case BindingType.Sampler:
        sampler = resources.get(dataView(memory).getFloat64(base + 8, true) as ResourceId) as Sampler;
        break;
      case BindingType.Texture:
        texture = resources.get(dataView(memory).getFloat64(base + 8, true) as ResourceId) as Texture;
        break;
      default:
        throw new RangeError('invalid variant discriminant for BindingResource');
    }
    entries.push({
      binding: dataView(memory).getUint32(base + 0, true),
      buffer,
      bufferOffset,
      bufferSize: bufferSize || void 0,
      sampler,
      texture
    });
  }
  const ret = getGPU(device).createBindGroup(resources.get(device) as Device, {
    layout: resources.get(layout) as BindGroupLayout,
    entries,
  });
  return resources.add(ret);
}

export { deleteResource as delete_bind_group };

export function create_render_pipeline(
  device: ResourceId,
  vertex: ResourceId, fragment: ResourceId,
  attributesPtr: UInt, attributesLen: UInt,
  buffersPtr: UInt, buffersLen: UInt,
  bindGroupsPtr: UInt, bindGroupsLen: UInt,
  topology: PrimitiveTopology, indexFormat: IndexFormat, frontFace: FrontFace, cullMode: CullMode,
  sampleCount: UInt, alphaToCoverage: UInt,
  hasDepthStencil: UInt, depthStencilFormat: TextureFormat, depthWrite: UInt, depthCompare: CompareFunction,
  stencilFrontCompare: CompareFunction, stencilFrontFailOp: StencilOperation, stencilFrontDepthFailOp: StencilOperation, stencilFrontPassOp: StencilOperation,
  stencilBackCompare: CompareFunction, stencilBackFailOp: StencilOperation, stencilBackDepthFailOp: StencilOperation, stencilBackPassOp: StencilOperation,
  stencilReadMask: UInt, stencilWriteMask: UInt, depthBias: Float, depthBiasSlopeScale: Float, depthBiasClamp: Float,
  colorsPtr: UInt, colorsLen: UInt,
  colorWriteMask: UInt, blendColorOperation: UInt, blendColorSrcFactor: UInt, blendColorDstFactor: UInt, blendAlphaOperation: UInt, blendAlphaSrcFactor: UInt, blendAlphaDstFactor: UInt,
  vertexEntryPointPtr: UInt, vertexEntryPointLen: UInt, fragmentEntryPointPtr: UInt, fragmentEntryPointLen: UInt,
): ResourceId {
  const memory = getDeviceMemory(device);
  const attributes: VertexAttribute[] = [];
  for (let i = 0; i < attributesLen; i++) {
    const base = attributesPtr + i * 12;
    attributes.push({
      format: dataView(memory).getUint32(base + 0, true),
      offset: dataView(memory).getUint32(base + 4, true),
      shaderLocation: dataView(memory).getUint32(base + 8, true),
    });
  }

  const buffers: VertexBufferLayout[] = [];
  for (let i = 0; i < buffersLen; i++) {
    const base = buffersPtr + i * 16;
    const start = dataView(memory).getUint32(base + 0, true);
    const len = dataView(memory).getUint32(base + 4, true);
    buffers.push({
      attributes: attributes.slice(start, start + len),
      stride: dataView(memory).getUint32(base + 8, true),
      stepMode: dataView(memory).getUint32(base + 12, true),
    });
  }

  const bindGroups: BindGroupLayout[] = [];
  for (let i = 0; i < bindGroupsLen; i++) {
    const base = bindGroupsPtr + i * 8;
    bindGroups.push(resources.get(dataView(memory).getFloat64(base + 0, true) as ResourceId) as BindGroupLayout);
  }

  const targets: ColorTargetState[] = [];
  for (let i = 0; i < colorsLen; i++) {
    const base = colorsPtr + i * 32;
    targets.push({
      format: dataView(memory).getUint32(base + 0, true) >>> 0,
      writeMask: dataView(memory).getUint32(base + 4, true) >>> 0,
      blendColor: {
        operation: dataView(memory).getUint32(base + 8, true) >>> 0,
        srcFactor: dataView(memory).getUint32(base + 12, true) >>> 0,
        dstFactor: dataView(memory).getUint32(base + 16, true) >>> 0,
      },
      blendAlpha: {
        operation: dataView(memory).getUint32(base + 20, true) >>> 0,
        srcFactor: dataView(memory).getUint32(base + 24, true) >>> 0,
        dstFactor: dataView(memory).getUint32(base + 28, true) >>> 0,
      }

    });
  }

  const vertexEntryPoint = decodeStr(getDeviceMemory(device), vertexEntryPointPtr, vertexEntryPointLen);
  const fragmentEntryPoint = decodeStr(getDeviceMemory(device), fragmentEntryPointPtr, fragmentEntryPointLen);

  const ret = getGPU(device).createRenderPipeline(resources.get(device) as Device, {
    vertex: resources.get(vertex) as Shader,
    fragment: resources.get(fragment) as Shader,
    vertexEntryPoint,
    fragmentEntryPoint,
    buffers,
    bindGroups,
    primitive: {
      topology: topology >>> 0,
      indexFormat: indexFormat >>> 0,
      frontFace: frontFace >>> 0,
      cullMode: cullMode >>> 0,
    },
    multisample: {
      sampleCount: sampleCount >>> 0,
      alphaToCoverage: !!alphaToCoverage,
    },
    depthStencil: hasDepthStencil ? {
      format: depthStencilFormat >>> 0,
      depthWrite: !!depthWrite,
      depthCompare: depthCompare >>> 0,
      stencilFront: {
        compare: stencilFrontCompare >>> 0,
        failOp: stencilFrontFailOp >>> 0,
        depthFailOp: stencilFrontDepthFailOp >>> 0,
        passOp: stencilFrontPassOp >>> 0,
      },
      stencilBack: {
        compare: stencilBackCompare >>> 0,
        failOp: stencilBackFailOp >>> 0,
        depthFailOp: stencilBackDepthFailOp >>> 0,
        passOp: stencilBackPassOp >>> 0,
      },
      stencilReadMask: stencilReadMask >>> 0,
      stencilWriteMask: stencilWriteMask >>> 0,
      depthBias,
      depthBiasSlopeScale,
      depthBiasClamp,
    } : void 0,
    targets: {
      writeMask: colorWriteMask >>> 0,
      blendColor: {
        operation: blendColorOperation >>> 0,
        srcFactor: blendColorSrcFactor >>> 0,
        dstFactor: blendColorDstFactor >>> 0,
      },
      blendAlpha: {
        operation: blendAlphaOperation >>> 0,
        srcFactor: blendAlphaSrcFactor >>> 0,
        dstFactor: blendAlphaDstFactor >>> 0,
      },
      targets,
    }
  });

  return resources.add(ret);
}

export { deleteResource as delete_render_pipeline };

export function create_render_pass(
  device: ResourceId,
  clearDepth: Float, clearStencil: Float,
  clearColorRed: Float, clearColorGreen: Float, clearColorBlue: Float, clearColorAlpha: Float,
  isOffscreen: UInt,
  depthStencilTexture: ResourceId, depthStecilMipLevel: UInt, depthStecilSlice: UInt,
  colorsPtr: UInt, colorsLen: UInt
): ResourceId {
  const memory = getDeviceMemory(device);
  let desc: RenderPassDescriptor;
  switch (isOffscreen) {
    case 0:  // Default pass
      desc = {
        clearDepth,
        clearStencil,
        clearColor: isNaN(clearColorRed) ? void 0 : [clearColorRed, clearColorGreen, clearColorBlue, clearColorAlpha],
      };
      break;
    case 1: { // Offscreen pass
      const colors: ColorAttachment[] = [];
      for (let i = 0; i < colorsLen; i++) {
        const base = colorsPtr + i * 32;
        const clear: Color = [
          dataView(memory).getFloat32(base + 16, true),
          dataView(memory).getFloat32(base + 20, true),
          dataView(memory).getFloat32(base + 24, true),
          dataView(memory).getFloat32(base + 28, true)
        ];
        colors.push({
          view: {
            texture: resources.get(dataView(memory).getFloat64(base + 0, true) as ResourceId) as Texture,
            mipLevel: dataView(memory).getUint32(base + 8, true),
            slice: dataView(memory).getUint32(base + 12, true),
          },
          clear: isNaN(clear[0]) ? void 0 : clear,
        });
      }
      desc = {
        clearDepth,
        clearStencil,
        colors,
        depthStencil: {
          texture: resources.get(depthStencilTexture) as Texture,
          mipLevel: depthStecilMipLevel >>> 0,
          slice: depthStecilSlice >>> 0,
        }

      };
      break;
    }
    default:
      throw new RangeError('invalid variant discriminant for RenderPassDescriptor');
  }
  const ret = getGPU(device).createRenderPass(resources.get(device) as Device, desc);
  return resources.add(ret);
}

export { deleteResource as delete_render_pass };

export function read_buffer(device: ResourceId, buffer: ResourceId, offset: UInt, outPtr: UInt, size: UInt): FutureId {
  const ret = getGPU(device).readBuffer(
    resources.get(device) as Device,
    resources.get(buffer) as Buffer,
    new Uint8Array(getDeviceMemory(device).buffer.slice(outPtr, outPtr + size * 1),
      offset >>> 0)
  );
  return futures.add(ret);
}

export function write_buffer(device: ResourceId, buffer: ResourceId, dataPtr: UInt, size: UInt, offset: UInt): void {
  getGPU(device).writeBuffer(resources.get(device) as Device, resources.get(buffer) as Buffer, new Uint8Array(getDeviceMemory(device).buffer.slice(dataPtr, dataPtr + size * 1)), offset >>> 0);
}

export function copy_buffer(device: ResourceId, src: ResourceId, dst: ResourceId, size: UInt, srcOffset: UInt, dstOffset: UInt): void {
  getGPU(device).copyBuffer(resources.get(device) as Device, resources.get(src) as Buffer, resources.get(dst) as Buffer, size >>> 0, srcOffset >>> 0, dstOffset >>> 0);
}

export function write_texture(
  device: ResourceId,
  texture: ResourceId, mipLevel: UInt, x: UInt, y: UInt, z: UInt,
  dataPtr: UInt, dataLen: UInt,
  offset: UInt, bytesPerRow: UInt, rowsPerImage: UInt,
  width: UInt, height: UInt, depth: UInt
) {
  getGPU(device).writeTexture(resources.get(device) as Device, {
    texture: resources.get(texture) as Texture,
    mipLevel: mipLevel >>> 0,
    origin: [x >>> 0, y >>> 0, z >>> 0],
  },
    new Uint8Array(getDeviceMemory(device).buffer.slice(dataPtr, dataPtr + dataLen * 1)), {
    offset: offset >>> 0,
    bytesPerRow: bytesPerRow >>> 0,
    rowsPerImage: rowsPerImage >>> 0,
  },
    [width >>> 0, height >>> 0, depth >>> 0]);
}

export function copy_external_image_to_texture(
  device: ResourceId,
  src: ImageSourceId, srcX: UInt, srcY: UInt,
  dst: ResourceId, mipLevel: UInt, dstX: UInt, dstY: UInt, dstZ: UInt,
  width: UInt, height: UInt
): void {
  getGPU(device).copyExternalImageToTexture(resources.get(device) as Device,
    {
      src: images.get(src) as ImageSource,
      origin: [srcX >>> 0, srcY >>> 0],
    },
    {
      texture: resources.get(dst) as Texture,
      mipLevel: mipLevel >>> 0,
      origin: [dstX >>> 0, dstY >>> 0, dstZ >>> 0],
    },
    [width >>> 0, height >>> 0]);
}

export function copy_texture(
  device: ResourceId,
  src: ResourceId, srcMipLevel: UInt, srcX: UInt, srcY: UInt, srcZ: UInt,
  dst: ResourceId, dstMipLevel: UInt, dstX: UInt, dstY: UInt, dstZ: UInt,
  width: UInt, height: UInt, depth: UInt
) {
  getGPU(device).copyTexture(resources.get(device) as Device,
    {
      texture: resources.get(src) as Texture,
      mipLevel: srcMipLevel >>> 0,
      origin: [srcX >>> 0, srcY >>> 0, srcZ >>> 0],
    },
    {
      texture: resources.get(dst) as Texture,
      mipLevel: dstMipLevel >>> 0,
      origin: [dstX >>> 0, dstY >>> 0, dstZ >>> 0],
    },
    [width >>> 0, height >>> 0, depth >>> 0]);
}

export function copy_texture_to_buffer(
  device: ResourceId,
  src: ResourceId, srcMipLevel: UInt, srcX: UInt, srcY: UInt, srcZ: UInt,
  dst: ResourceId,
  offset: UInt, bytesPerRow: UInt, rowsPerImage: UInt,
  width: UInt, height: UInt, depth: UInt
): void {
  getGPU(device).copyTextureToBuffer(resources.get(device) as Device,
    {
      texture: resources.get(src) as Texture,
      mipLevel: srcMipLevel >>> 0,
      origin: [srcX >>> 0, srcY >>> 0, srcZ >>> 0],
    },
    resources.get(dst) as Buffer,
    {
      offset: offset >>> 0,
      bytesPerRow: bytesPerRow >>> 0,
      rowsPerImage: rowsPerImage >>> 0,
    },
    [width >>> 0, height >>> 0, depth >>> 0]);
}


export function begin_render_pass(device: ResourceId, pass?: ResourceId): void {
  getGPU(device).beginRenderPass(resources.get(device) as Device, pass && resources.get(pass) as RenderPass);
}

export function submit_render_pass(device: ResourceId): void {
  getGPU(device).submitRenderPass(resources.get(device) as Device);
}

export function set_render_pipeline(device: ResourceId, pipeline: ResourceId): void {
  getGPU(device).setRenderPipeline(resources.get(device) as Device, resources.get(pipeline) as RenderPipeline);
}

export function set_index(device: ResourceId, index: ResourceId): void {
  getGPU(device).setIndex(resources.get(device) as Device, resources.get(index) as Buffer);
}

export function set_vertex(device: ResourceId, slot: UInt, vertex: ResourceId, offset: UInt): void {
  getGPU(device).setVertex(resources.get(device) as Device, slot >>> 0, resources.get(vertex) as Buffer, offset >>> 0);
}

export function set_bind_group(device: ResourceId, slot: UInt, bindGroup: ResourceId, offsetsPtr: UInt, offsetsLen: UInt): void {
  getGPU(device).setBindGroup(
    resources.get(device) as Device, slot >>> 0,
    resources.get(bindGroup) as BindGroup,
    new Uint32Array(getDeviceMemory(device).buffer.slice(offsetsPtr, offsetsPtr + offsetsLen * 4)) as unknown as UInt[]
  );
}

export function draw(device: ResourceId, vertexCount: UInt, instanceCount: UInt, firstVertex: UInt, firstInstance: UInt): void {
  getGPU(device).draw(resources.get(device) as Device, vertexCount >>> 0, instanceCount >>> 0, firstVertex >>> 0, firstInstance >>> 0);
}

export function draw_indexed(device: ResourceId, indexCount: UInt, instanceCount: UInt, firstIndex: UInt, firstInstance: UInt): void {
  getGPU(device).drawIndexed(resources.get(device) as Device, indexCount >>> 0, instanceCount >>> 0, firstIndex >>> 0, firstInstance >>> 0);
}

export function set_viewport(device: ResourceId, x: UInt, y: UInt, width: UInt, height: UInt, minDepth: UInt, maxDepth: UInt): void {
  getGPU(device).setViewport(resources.get(device) as Device, x >>> 0, y >>> 0, width >>> 0, height >>> 0, minDepth >>> 0, maxDepth >>> 0);
}

export function set_scissor_rect(device: ResourceId, x: UInt, y: UInt, width: UInt, height: UInt): void {
  getGPU(device).setScissorRect(resources.get(device) as Device, x >>> 0, y >>> 0, width >>> 0, height >>> 0);
}

export function set_blend_const(device: ResourceId, red: Float, green: Float, blue: Float, alpha: Float): void {
  getGPU(device).setBlendConst(resources.get(device) as Device, [red, green, blue, alpha]);
}

export function set_stencil_ref(device: ResourceId, ref: UInt): void {
  getGPU(device).setStencilRef(resources.get(device) as Device, ref >>> 0);
}
