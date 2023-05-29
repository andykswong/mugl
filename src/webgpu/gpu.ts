import { MUGL_FINALIZER } from '../config';
import { Canvas } from '../dom';
import {
  BindGroup, BindGroupDescriptor, BindGroupLayout, BindGroupLayoutDescriptor, BindingType, Buffer, BufferDescriptor,
  BufferUsage, Color, CullMode, Device, Extent2D, Extent3D, FrontFace, Future, FutureStatus, ImageCopyExternalImage,
  ImageCopyTexture, ImageDataLayout, IndexFormat, PrimitiveTopology, RenderPass, RenderPassDescriptor, RenderPipeline,
  RenderPipelineDescriptor, Sampler, SamplerBindingType, SamplerDescriptor, Shader, ShaderDescriptor, ShaderStage, Texture,
  TextureDescriptor, TextureDimension, TextureFormat, TextureUsage, UInt, UIntArray, VertexStepMode, isDepthStencil
} from '../gpu';
import {
  WebGPUBindGroup, WebGPUBindGroupLayout, WebGPUBuffer, WebGPUDevice, WebGPURenderPass, WebGPURenderPipeline,
  WebGPUSampler, WebGPUShader, WebGPUTexture
} from './model';
import { WebGPUCanvasContextProvider, WebGPUCanvasOptions, WebGPUFeature, WebGPUFeatureNames } from './type';
import {
  toGPUAddressMode, toGPUBlendComponent, toGPUCompareFunction, toGPUFilterMode, toGPUPrimitiveTopology,
  toGPUShaderStage, toGPUStencilFaceState, toGPUTextureDimension, toGPUTextureFormat, toGPUTextureSampleType,
  toGPUTextureUsageFlags, toGPUTextureViewDimension, toGPUVertexFormat, toRenderableGPUTextureView,
  toWebGPURenderPassOperations
} from './utils';

//#region Constants

type GPUFinalizer = FinalizationRegistry<() => void>;

const gpuFinalizer: GPUFinalizer | undefined = MUGL_FINALIZER ?
  new FinalizationRegistry(finalizer => finalizer()) : void 0;

//#endregion Constants

//#region Device

/**
 * Requests a WebGPU {@link Device}.
 * @param canvas the canvas to be used
 * @param options WebGPU context initialization options
 * @param features WebGPU features to enable
 * @returns future to WebGPU device instance, or null if WebGPU is not supported
 */
export function requestWebGPUDevice(
  canvas: Canvas | WebGPUCanvasContextProvider,
  options: GPURequestAdapterOptions & WebGPUCanvasOptions = {},
  features = 0 as WebGPUFeature
): Future<Device | null> {
  const future = {
    status: FutureStatus.Pending,
    value: null,
    then(resolve, reject) {
      return promise.then(resolve, reject);
    }
  } as Future<Device | null> & { status: FutureStatus, value: Device | null };

  const promise = requestWebGPUDeviceAsync(canvas, options, features)
    .then((device) => {
      future.status = FutureStatus.Done;
      return device;
    }, (error) => {
      future.status = FutureStatus.Error;
      throw error;
    });

  return future;
}

async function requestWebGPUDeviceAsync(
  canvas: Canvas | WebGPUCanvasContextProvider,
  options: GPURequestAdapterOptions & WebGPUCanvasOptions,
  features: WebGPUFeature
): Promise<Device | null> {
  let enabledFeatures = 0 as WebGPUFeature;
  const requiredFeatures: GPUFeatureName[] = [];
  for (const feature in WebGPUFeatureNames) {
    if (features & +feature) {
      enabledFeatures |= +feature;
      requiredFeatures.push(WebGPUFeatureNames[+feature as WebGPUFeature]);
    }
  }

  const device = await (await navigator.gpu?.requestAdapter(options))
    ?.requestDevice({ requiredFeatures });
  const readBuffers = [] as GPUBuffer[];

  if (!device) {
    return null;
  }

  const destroy = () => {
    device.destroy();
    for (const buffer of readBuffers) {
      buffer.destroy();
    }
    readBuffers.length = 0;
  }

  const deviceWrapper = {
    ...options,
    features: enabledFeatures,
    canvas,
    device,
    readBuffers,
    get encoder() {
      return this._encoder || (this._encoder = this.device?.createCommandEncoder());
    },
    get surface() {
      return this._surface || (this._surface = createSurfaceTexture(this));
    },
    get depth() {
      return this._depth || (this._depth = createSurfaceDepthTexture(this));
    },
    get lost() {
      return !this.device;
    },
    reset() {
      this._encoder = void 0;
      this.renderPass = void 0;
    },
    submit() {
      this._encoder && this.device?.queue.submit([this._encoder.finish()]);
      this.reset();
    },
    destroy() {
      destroy();
      this.reset();
    }
  } as WebGPUDevice & { _encoder?: GPUCommandEncoder, _surface?: Texture, _depth?: Texture };

  device.lost.then(() => {
    deviceWrapper.device = void 0;
  });

  if (MUGL_FINALIZER) {
    (gpuFinalizer as GPUFinalizer).register(deviceWrapper, destroy);
  }

  return deviceWrapper;
}

/**
 * Resets the device state.
 * @param device the GPU device
 */
export function resetDevice(device: Device): void {
  (device as WebGPUDevice).reset();
}

/**
 * Gets the enabled features of the device.
 * @param device the GPU device
 * @returns enabled features bitflag
 */
export function getDeviceFeatures(device: Device): WebGPUFeature {
  return (device as WebGPUDevice).features;
}

/**
 * Returns if device context is lost.
 * @param device the GPU device
 * @returns true if device context is lost
 */
export function isDeviceLost(device: Device): boolean {
  return (device as WebGPUDevice).lost;
}

/**
 * Flushes the command buffer.
 * @param device the GPU device
 */
export function flush(device: Device): void {
  (device as WebGPUDevice).submit();
}

//#endregion Device

//#region Buffer

/**
 * Creates a new buffer object.
 * @param device the GPU device
 * @param desc the buffer descriptor
 * @returns new buffer object
 */
export function createBuffer(device: Device, desc: BufferDescriptor): Buffer {
  const usage = GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | (
    (desc.usage & BufferUsage.Uniform) ? GPUBufferUsage.UNIFORM :
      (desc.usage & BufferUsage.Index) ? GPUBufferUsage.INDEX :
        (desc.usage & BufferUsage.Vertex) ? GPUBufferUsage.VERTEX :
          0);

  // TODO: support mapped read/write?
  // TODO: support initialization using mappedAtCreation
  const buffer = (device as WebGPUDevice).device?.createBuffer({
    usage,
    size: desc.size,
  });

  const destroy = () => buffer?.destroy();
  const bufferWrapper = {
    buffer,
    destroy
  } as WebGPUBuffer;

  if (MUGL_FINALIZER) {
    (gpuFinalizer as GPUFinalizer).register(bufferWrapper, destroy);
  }

  return bufferWrapper;
}

//#endregion Buffer

//#region Texture

/**
 * Creates a new texture object.
 * @param device the GPU device
 * @param desc the texture descriptor
 * @returns new texture object
 */
export function createTexture(device: Device, desc: TextureDescriptor): Texture {
  const sampleCount = desc.sampleCount || 1;
  const type = desc.dimension || TextureDimension.D2;
  const format = desc.format || TextureFormat.RGBA8;
  const mipLevelCount = desc.mipLevelCount;
  const [width, height, _depth] = desc.size || [1, 1, 1];
  const depth = type === TextureDimension.CubeMap ? 6 : type === TextureDimension.D2 ? 1 : _depth;
  const arrayLayerCount = type === TextureDimension.CubeMap ? 6 : type === TextureDimension.D2Array ? _depth : 1;
  const msaaResolve = !isDepthStencil(format) // depth-stencil cannot be MSAA resolved
    && sampleCount > 1 && !!((desc.usage || 0) & TextureUsage.RenderAttachment);

  const gpuViewDimension = toGPUTextureViewDimension(desc.dimension);
  const gpuFormat = toGPUTextureFormat(desc.format);
  const gpuUsage = toGPUTextureUsageFlags(desc.usage);

  // TODO: support alternative viewFormats (i.e. SRGB vs RGB)
  const tex = (device as WebGPUDevice).device?.createTexture({
    size: [width, height, depth],
    mipLevelCount,
    sampleCount: msaaResolve ? 1 : sampleCount, // sample count of resolve target must be 1
    dimension: toGPUTextureDimension(desc.dimension),
    format: gpuFormat,
    usage: gpuUsage,
  });

  const msaa = msaaResolve ? (device as WebGPUDevice).device?.createTexture({
    size: [width, height, 1],
    mipLevelCount: 1,
    sampleCount,
    dimension: '2d',
    format: gpuFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  }) : null;

  const destroy = () => {
    tex?.destroy();
    msaa?.destroy();
  };
  const textureWrapper = {
    tex,
    msaa,
    get view() {
      if (!this._view && gpuUsage & GPUTextureUsage.TEXTURE_BINDING) {
        this._view = this.tex?.createView({
          format: gpuFormat,
          dimension: gpuViewDimension,
          mipLevelCount,
          arrayLayerCount,
        });
      }
      return this._view;
    },
    destroy
  } as WebGPUTexture & { _view?: GPUTextureView };

  if (MUGL_FINALIZER) {
    (gpuFinalizer as GPUFinalizer).register(textureWrapper, destroy);
  }

  return textureWrapper;
}

/**
 * Creates a new texture object from a canvas surface.
 * @param device the GPU device
 * @param canvas the canvas to be used. Defaults to the device default canvas.
 * @param options configurations for the canvas surface
 * @returns new texture object
 */
export function createSurfaceTexture(
  device: Device, canvas?: Canvas | WebGPUCanvasContextProvider, options?: WebGPUCanvasOptions
): Texture {
  const gpuDevice = (device as WebGPUDevice).device;
  const targetCanvas = canvas || (device as WebGPUDevice).canvas;
  const sampleCount = options?.sampleCount || (device as WebGPUDevice).sampleCount || 1;
  const alphaMode = (options?.premultipliedAlpha || (device as WebGPUDevice).premultipliedAlpha) ?
    'premultiplied' : 'opaque';
  const format = navigator.gpu.getPreferredCanvasFormat();

  const ctx = targetCanvas?.getContext('webgpu') as GPUCanvasContext | undefined;
  gpuDevice && ctx?.configure({
    device: gpuDevice,
    format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING,
    alphaMode,
    // TODO: support alternative viewFormats (i.e. SRGB vs RGB)
  });

  return {
    get tex() {
      return ctx?.getCurrentTexture();
    },
    get msaa() {
      if (sampleCount > 1 && (this._msaa?.width !== targetCanvas.width || this._msaa.height !== targetCanvas.height)) {
        this._msaa?.destroy();
        this._msaa = gpuDevice?.createTexture({
          dimension: '2d',
          size: [targetCanvas.width, targetCanvas.height],
          sampleCount,
          format,
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
      }
      return this._msaa;
    },
    get view() {
      return this.tex?.createView();
    },
    destroy() {
      this._msaa?.destroy();
    }
  } as WebGPUTexture & { _msaa?: GPUTexture };
}


/**
 * Creates a new depth-stencil texture object from a canvas surface.
 * @param device the GPU device
 * @param canvas the canvas to be used. Defaults to the device default canvas.
 * @param options configurations for the canvas surface
 * @returns new texture object
 */
export function createSurfaceDepthTexture(
  device: Device, canvas?: Canvas | WebGPUCanvasContextProvider, options?: WebGPUCanvasOptions
): Texture {
  const gpuDevice = (device as WebGPUDevice).device;
  const targetCanvas = canvas || (device as WebGPUDevice).canvas;
  const sampleCount = options?.sampleCount || (device as WebGPUDevice).sampleCount || 1;
  const format = options?.depthStencilFormat || (device as WebGPUDevice).depthStencilFormat;
  const gpuFormat = format && isDepthStencil(format) ? toGPUTextureFormat(format) : void 0;

  return {
    get tex() {
      if (gpuFormat && (this._tex?.width !== targetCanvas.width || this._tex.height !== targetCanvas.height)) {
        this._tex?.destroy();
        this._tex = gpuDevice?.createTexture({
          dimension: '2d',
          size: [targetCanvas.width, targetCanvas.height],
          sampleCount,
          format: gpuFormat,
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
      }
      return this._tex;
    },
    get view() {
      return this.tex?.createView();
    },
    destroy() {
      this._tex?.destroy();
    }
  } as WebGPUTexture & { _tex?: GPUTexture };
}

//#endregion Texture

//#region Sampler

/**
 * Creates a new sampler object.
 * @param device the GPU device
 * @param desc the sampler descriptor
 * @returns new sampler object
 */
export function createSampler(device: Device, desc: SamplerDescriptor = {}): Sampler {
  return {
    sampler: (device as WebGPUDevice).device?.createSampler({
      addressModeU: toGPUAddressMode(desc.addressModeU),
      addressModeV: toGPUAddressMode(desc.addressModeV),
      addressModeW: toGPUAddressMode(desc.addressModeW),
      magFilter: toGPUFilterMode(desc.magFilter),
      minFilter: toGPUFilterMode(desc.minFilter),
      mipmapFilter: toGPUFilterMode(desc.mipmapFilter),
      lodMinClamp: desc.lodMinClamp,
      lodMaxClamp: desc.lodMaxClamp,
      compare: desc.compare ? toGPUCompareFunction(desc.compare) : void 0,
      maxAnisotropy: desc.maxAnisotropy,
    }),
    destroy(): void {
      // noop
    }
  } as WebGPUSampler;
}

//#endregion Sampler

//#region Shader

/**
 * Creates a new shader module object.
 * @param device the GPU device
 * @param desc the shader descriptor
 * @returns new shader object
 */
export function createShader(device: Device, desc: ShaderDescriptor): Shader {
  return {
    shader: (device as WebGPUDevice).device?.createShaderModule({
      code: desc.code,
      // TODO: sourceMap support?
    }),
    destroy(): void {
      // noop
    }
  } as WebGPUShader;
}

//#endregion Shader

//#region BindGroup

/**
 * Creates a new pipeline bind group layout object.
 * @param device the GPU device
 * @param desc the bind group layout descriptor
 * @returns new bind group layout object
 */
export function createBindGroupLayout(device: Device, desc: BindGroupLayoutDescriptor): BindGroupLayout {
  return {
    layout: (device as WebGPUDevice).device?.createBindGroupLayout({
      entries: desc.entries.map((entry, binding) => ({
        binding: entry.binding ?? binding,
        visibility: toGPUShaderStage(entry.visibility || (ShaderStage.Vertex | ShaderStage.Fragment)),
        buffer: entry.type === BindingType.Buffer ? {
          type: 'uniform',
          hasDynamicOffset: entry.bufferDynamicOffset,
          minBindingSize: 0,
        } : void 0,
        sampler: entry.type === BindingType.Sampler ? {
          type: entry.samplerType === SamplerBindingType.Comparison ? 'comparison' :
            entry.samplerType === SamplerBindingType.NonFiltering ? 'non-filtering' : 'filtering',
        } : void 0,
        texture: entry.type === BindingType.Texture ? {
          sampleType: toGPUTextureSampleType(entry.textureSampleType),
          viewDimension: toGPUTextureViewDimension(entry.textureDimension),
          multisampled: entry.textureMultisampled,
        } : void 0,
        // TODO: support externalTexture
      })),
    }),
    destroy(): void {
      // noop
    }
  } as WebGPUBindGroupLayout;
}

/**
 * Creates a new pipeline bind group object.
 * @param device the GPU device
 * @param desc the bind group descriptor
 * @returns new bind group object
 */
export function createBindGroup(device: Device, desc: BindGroupDescriptor): BindGroup {
  const layout = (desc.layout as WebGPUBindGroupLayout).layout;
  return {
    group: layout && (device as WebGPUDevice).device?.createBindGroup({
      layout,
      entries: desc.entries.map((entry, binding) => {
        const resource = (entry.sampler as WebGPUSampler)?.sampler ??
          (entry.texture as WebGPUTexture)?.view ??
          ((entry.buffer as WebGPUBuffer)?.buffer && ({
            buffer: (entry.buffer as WebGPUBuffer).buffer as GPUBuffer,
            offset: entry.bufferOffset,
            size: entry.bufferSize,
          }));
        return resource && { binding: entry.binding ?? binding, resource };
      }).filter(value => !!value) as GPUBindGroupEntry[],
    }),
    destroy(): void {
      // noop
    }
  } as WebGPUBindGroup;
}

//#endregion BindGroup

//#region RenderPass

/**
 * Creates a new render pass object.
 * @param device the GPU device
 * @param desc the render pass descriptor.
 * @returns new render pass
 */
export function createRenderPass(device: Device, desc: RenderPassDescriptor = {}): RenderPass {
  const colors = desc.colors || [{
    view: { texture: (device as WebGPUDevice).surface },
    clear: desc.clearColor,
  }];

  let depthStencil = desc.depthStencil;
  const isDefaultPass = !desc.colors?.length;
  if (isDefaultPass && !depthStencil) {
    depthStencil = { texture: (device as WebGPUDevice).depth };
  }

  return {
    colors: colors.map(color => color.view),
    colorTargets: colors.map(
      color => (color.view.texture as WebGPUTexture).msaa ? color.view : void 0
    ),
    colorOps: colors.map(color => toWebGPURenderPassOperations(color.clear)),
    depth: depthStencil,
    depthOps: toWebGPURenderPassOperations(isNaN(desc.clearDepth as number) ? void 0 : desc.clearDepth),
    stencilOps: toWebGPURenderPassOperations(isNaN(desc.clearStencil as number) ? void 0 : desc.clearStencil),
    destroy(): void {
      // noop
    }
  } as WebGPURenderPass;
}

//#endregion RenderPass

//#region RenderPipeline

/**
 * Creates a new render pipeline state object.
 * @param device the GPU device
 * @param desc the pipeline descriptor
 * @returns new render pipeline object
 */
export function createRenderPipeline(device: Device, desc: RenderPipelineDescriptor): RenderPipeline {
  const gpuDevice = (device as WebGPUDevice).device;
  const attributes: GPUVertexAttribute[] = [];
  for (const layout of desc.buffers) {
    for (const attr of layout.attributes) {
      attributes.push({
        format: toGPUVertexFormat(attr.format),
        offset: attr.offset,
        shaderLocation: attr.shaderLocation,
      });
    }
  }
  const buffers: GPUVertexBufferLayout[] = [];
  {
    let i = 0;
    for (const layout of desc.buffers) {
      buffers.push({
        stepMode: layout.stepMode === VertexStepMode.Instance ? 'instance' : 'vertex',
        arrayStride: layout.stride,
        attributes: attributes.slice(i, i + layout.attributes.length),
      });
      i += layout.attributes.length;
    }
  }

  const indexFormat = desc.primitive?.indexFormat === IndexFormat.UInt32 ? 'uint32' : 'uint16';

  return {
    indexFormat,
    pipeline: gpuDevice?.createRenderPipeline({
      layout: gpuDevice.createPipelineLayout({
        bindGroupLayouts: (
          desc.bindGroups
            ?.map((group) => (group as WebGPUBindGroupLayout).layout)
            .filter(value => !!value) || []
        ) as GPUBindGroupLayout[],
      }),
      vertex: {
        module: (desc.vertex as WebGPUShader).shader as GPUShaderModule,
        entryPoint: desc.vertexEntryPoint || 'vs_main',
        // TODO: support pipeline-overridable constants
        buffers,
      },
      // TODO: support no color output mode
      fragment: {
        module: (desc.fragment as WebGPUShader).shader as GPUShaderModule,
        entryPoint: desc.fragmentEntryPoint || 'fs_main',
        // TODO: support pipeline-overridable constants
        targets: desc.targets?.targets?.length ?
          desc.targets.targets.map(target => ({
            format: toGPUTextureFormat(target.format),
            writeMask: target.writeMask,
            blend: {
              color: toGPUBlendComponent(target.blendColor),
              alpha: toGPUBlendComponent(target.blendAlpha),
            }
          })) : [{
            format: navigator.gpu.getPreferredCanvasFormat(),
            writeMask: desc.targets?.writeMask,
            blend: {
              color: toGPUBlendComponent(desc.targets?.blendColor),
              alpha: toGPUBlendComponent(desc.targets?.blendAlpha),
            }
          }],
      },
      primitive: {
        topology: toGPUPrimitiveTopology(desc.primitive?.topology),
        stripIndexFormat: (
          desc.primitive?.topology === PrimitiveTopology.TriangleStrip ||
          desc.primitive?.topology === PrimitiveTopology.LineStrip
        ) ? indexFormat : void 0,
        frontFace: desc.primitive?.frontFace === FrontFace.CW ? 'cw' : 'ccw',
        cullMode: desc.primitive?.cullMode === CullMode.Back ? 'back' :
          desc.primitive?.cullMode === CullMode.Front ? 'front' : 'none',
      },
      depthStencil: desc.depthStencil ? {
        format: toGPUTextureFormat(desc.depthStencil?.format || TextureFormat.Depth16),
        depthWriteEnabled: !!desc.depthStencil.depthWrite,
        depthCompare: toGPUCompareFunction(desc.depthStencil.depthCompare),
        stencilFront: toGPUStencilFaceState(desc.depthStencil.stencilFront),
        stencilBack: toGPUStencilFaceState(desc.depthStencil.stencilBack),
        stencilReadMask: desc.depthStencil.stencilReadMask,
        stencilWriteMask: desc.depthStencil.stencilWriteMask,
        depthBias: desc.depthStencil.depthBias,
        depthBiasSlopeScale: desc.depthStencil.depthBiasSlopeScale,
        depthBiasClamp: desc.depthStencil.depthBiasClamp,
      } : void 0,
      multisample: {
        count: desc.multisample?.sampleCount,
        alphaToCoverageEnabled: desc.multisample?.alphaToCoverage,
        // TODO: support sample mask
      },
    }),
    destroy(): void {
      // noop
    }
  } as WebGPURenderPipeline;
}

//#endregion RenderPipeline

//#region Read/Write

/**
 * Reads data from a buffer.
 * @param device the GPU device
 * @param buffer the GPU buffer to read from
 * @param out the output CPU buffer
 * @param offset othe byte offset into GPU buffer to begin reading from. Defaults to 0
 * @returns a {@link Future}
 */
export function readBuffer(device: Device, buffer: Buffer, out?: Uint8Array, offset: UInt = 0): Future<Uint8Array> {
  const gpuDevice = (device as WebGPUDevice).device;
  const gpuBuffer = (buffer as WebGPUBuffer).buffer;
  const size = (gpuBuffer?.size || 0) - offset;
  const value = out || new Uint8Array(Math.max(0, size));
  if (!gpuDevice || !gpuBuffer || size <= 0) {
    return {
      status: FutureStatus.Error,
      value,
      then: (onFullfilled, onRejected) => Promise.reject().then(onFullfilled, onRejected),
    };
  }

  let readBuffer: GPUBuffer;
  {
    let cachedBuffer;
    for (
      cachedBuffer = (device as WebGPUDevice).readBuffers.pop();
      cachedBuffer && cachedBuffer.size < size;
      cachedBuffer = (device as WebGPUDevice).readBuffers.pop()
    ) {
      cachedBuffer.destroy();
    }
    readBuffer = cachedBuffer || gpuDevice.createBuffer({
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      size: Math.ceil(size / 256) * 256,
    });
  }

  (device as WebGPUDevice).encoder?.copyBufferToBuffer(gpuBuffer, offset, readBuffer, 0, size);
  flush(device);

  const future: Future<Uint8Array> & { status: FutureStatus } = {
    status: FutureStatus.Pending,
    value,
    then(onFullfilled, onRejected) {
      return promise.then(onFullfilled, onRejected);
    }
  };

  const promise = gpuDevice.queue.onSubmittedWorkDone()
    .then(() => readBuffer.mapAsync(GPUMapMode.READ, 0, size))
    .then(() => {
      value.set(new Uint8Array(readBuffer.getMappedRange()));
      readBuffer.unmap();
      (device as WebGPUDevice).readBuffers.unshift(readBuffer);
      future.status = FutureStatus.Done;
      return value;
    }, (error) => {
      future.status = FutureStatus.Error;
      throw error;
    });

  return future;
}

/**
 * Writes data to a buffer.
 * @param device the GPU device
 * @param buffer the buffer to write to
 * @param data the buffer data
 * @param offset the byte offset into GPU buffer to begin writing to. Defaults to 0
 */
export function writeBuffer(device: Device, buffer: Buffer, data: ArrayBufferView, offset: UInt = 0): void {
  const gpuBuffer = (buffer as WebGPUBuffer).buffer;
  gpuBuffer && (device as WebGPUDevice).device?.queue.writeBuffer(gpuBuffer, offset, data);
}


/**
 * Writes subregion of data array to a texture.
 * @param device the GPU device
 * @param texture the texture subregion to write to.
 * @param data the texture data
 * @param layout the data layout
 * @param size the size of the data subregion to write
 */
export function writeTexture(
  device: Device, texture: ImageCopyTexture, data: ArrayBufferView, layout: ImageDataLayout, size?: Extent3D
): void;
export function writeTexture(
  device: Device,
  { texture, mipLevel, origin: [x, y, z] = [0, 0, 0] }: ImageCopyTexture,
  data: ArrayBufferView,
  { offset, bytesPerRow, rowsPerImage }: ImageDataLayout,
  [width, height, depth]: Extent3D = [
    ((texture as WebGPUTexture).tex?.width || 0) - x,
    ((texture as WebGPUTexture).tex?.height || 0) - y,
    ((texture as WebGPUTexture).tex?.depthOrArrayLayers || 0) - z
  ]
): void {
  const gpuTex = (texture as WebGPUTexture).tex;
  gpuTex && (device as WebGPUDevice).device?.queue.writeTexture(
    { texture: gpuTex, mipLevel, origin: [x, y, z], },
    data,
    { offset, bytesPerRow, rowsPerImage },
    [width, height, depth]
  );
}

/**
 * Uploads an image subregion to a texture.
 * @param device the GPU device
 * @param src the image subregion to write
 * @param dst the texture subregion to write to.
 * @param size the size of image subregion to write
 */
export function copyExternalImageToTexture(
  device: Device, src: ImageCopyExternalImage, dst: ImageCopyTexture, size?: Extent2D
): void;
export function copyExternalImageToTexture(
  device: Device,
  { src, origin: [srcX, srcY] = [0, 0] }: ImageCopyExternalImage,
  { texture, mipLevel = 0, origin: [x, y, z] = [0, 0, 0] }: ImageCopyTexture,
  [width, height]: Extent2D = [src.width - srcX, src.height - srcY]
): void {
  const gpuTex = (texture as WebGPUTexture).tex;
  gpuTex && (device as WebGPUDevice).device?.queue.copyExternalImageToTexture(
    { source: src, origin: [srcX, srcY] },
    { texture: gpuTex, mipLevel, origin: [x, y, z] }, //TODO: support colorSpace and premultipliedAlpha
    [width, height]
  );
}

/**
 * Copies data from a buffer to another buffer.
 * @param device the GPU device
 * @param src the buffer to read from
 * @param dst the buffer to write to
 * @param size the byte size of the GPU buffer to read. Defaults to the whole buffer
 * @param srcOffset the byte offset into src buffer to begin reading from. Defaults to 0
 * @param dstOffset the byte offset into dst buffer to begin writing to. Defaults to 0
 */
export function copyBuffer(
  device: Device, src: Buffer, dst: Buffer, size: UInt = (src as WebGPUBuffer).buffer?.size || 0,
  srcOffset: UInt = 0, dstOffset: UInt = 0
): void {
  const srcBuffer = (src as WebGPUBuffer).buffer;
  const dstBuffer = (dst as WebGPUBuffer).buffer;
  srcBuffer && dstBuffer &&
    (device as WebGPUDevice).encoder?.copyBufferToBuffer(srcBuffer, srcOffset, dstBuffer, dstOffset, size);
}

/**
 * Copies subregion of a texture to another texture.
 * @param device the GPU device
 * @param src the texture subregion to read from.
 * @param dst the texture subregion to write to.
 * @param size the size of the texture subregion to copy
 */
export function copyTexture(device: Device, src: ImageCopyTexture, dst: ImageCopyTexture, size?: Extent3D): void;
export function copyTexture(
  device: Device,
  { texture, mipLevel, origin: [x, y, z] = [0, 0, 0] }: ImageCopyTexture,
  { texture: dstTexture, mipLevel: dstMipLevel, origin: [dstX, dstY, dstZ] = [0, 0, 0] }: ImageCopyTexture,
  [width, height, depth]: Extent3D = [
    ((texture as WebGPUTexture).tex?.width || 0) - x,
    ((texture as WebGPUTexture).tex?.height || 0) - y,
    ((texture as WebGPUTexture).tex?.depthOrArrayLayers || 0) - z
  ]
): void {
  const srcTex = (texture as WebGPUTexture).tex;
  const dstTex = (dstTexture as WebGPUTexture).tex;
  srcTex && dstTex && (device as WebGPUDevice).encoder?.copyTextureToTexture(
    { texture: srcTex, mipLevel, origin: [x, y, z], },
    { texture: dstTex, mipLevel: dstMipLevel, origin: [dstX, dstY, dstZ], },
    [width, height, depth]
  );
}

/**
 * Copies subregion of a texture to a buffer.
 * @param device the GPU device
 * @param src the texture subregion to read from.
 * @param dst the buffer to write to
 * @param layout the buffer data layout to use for storing the texture
 * @param size the size of the texture subregion to copy
 */
export function copyTextureToBuffer(
  device: Device, src: ImageCopyTexture, dst: Buffer, layout: ImageDataLayout, size?: Extent3D
): void;
export function copyTextureToBuffer(
  device: Device,
  { texture, mipLevel, origin: [x, y, z] = [0, 0, 0] }: ImageCopyTexture,
  dst: Buffer,
  { offset, bytesPerRow, rowsPerImage }: ImageDataLayout,
  [width, height, depth]: Extent3D = [
    ((texture as WebGPUTexture).tex?.width || 0) - x,
    ((texture as WebGPUTexture).tex?.height || 0) - y,
    ((texture as WebGPUTexture).tex?.depthOrArrayLayers || 0) - z
  ]
): void {
  const tex = (texture as WebGPUTexture).tex;
  const buffer = (dst as WebGPUBuffer).buffer;
  tex && buffer && (device as WebGPUDevice).encoder?.copyTextureToBuffer(
    { texture: tex, mipLevel, origin: [x, y, z], },
    { buffer, offset, bytesPerRow, rowsPerImage },
    [width, height, depth]
  );
}

//#endregion Read/Write

//#region Render

/**
 * Starts a render pass.
 * @param device the GPU device
 * @param pass the render pass
 */
export function beginRenderPass(device: Device, pass: RenderPass = createRenderPass(device)): void {
  (device as WebGPUDevice).submit();
  const encoder = (device as WebGPUDevice).encoder;

  const depth = toRenderableGPUTextureView((pass as WebGPURenderPass).depth);
  const format = ((pass as WebGPURenderPass).depth?.texture as WebGPUTexture | undefined)?.tex?.format;
  const useStencil = format === 'depth24plus-stencil8' || format === 'depth32float-stencil8';
  const colors = (pass as WebGPURenderPass).colors;
  const resolveTargets = (pass as WebGPURenderPass).colorTargets;

  (device as WebGPUDevice).renderPass = encoder?.beginRenderPass({
    colorAttachments: colors.map((view, i) => {
      const gpuView = toRenderableGPUTextureView(view, true);
      return gpuView ? {
        view: gpuView,
        resolveTarget: toRenderableGPUTextureView(resolveTargets[i]),
        clearValue: (pass as WebGPURenderPass).colorOps[i].clearValue,
        loadOp: (pass as WebGPURenderPass).colorOps[i].loadOp,
        storeOp: (pass as WebGPURenderPass).colorOps[i].storeOp
      } : null;
    }),
    depthStencilAttachment: depth && {
      view: depth,
      depthClearValue: (pass as WebGPURenderPass).depthOps.clearValue,
      depthLoadOp: (pass as WebGPURenderPass).depthOps.loadOp,
      depthStoreOp: (pass as WebGPURenderPass).depthOps.storeOp,
      stencilClearValue: useStencil ? (pass as WebGPURenderPass).stencilOps.clearValue : void 0,
      stencilLoadOp: useStencil ? (pass as WebGPURenderPass).stencilOps.loadOp : void 0,
      stencilStoreOp: useStencil ? (pass as WebGPURenderPass).stencilOps.storeOp : void 0,
    }
  });
}

/**
 * Submits the current render pass.
 * @param device the GPU device
 * @param flush true to flush the command buffer
 */
export function submitRenderPass(device: Device, flush = true): void {
  (device as WebGPUDevice).renderPass?.end();
  (device as WebGPUDevice).renderPass = void 0;
  (device as WebGPUDevice).indexFormat = void 0;
  flush && (device as WebGPUDevice).submit();
}

/**
 * Binds a RenderPipeline to the current render pass.
 * @param device the GPU device
 * @param pipeline the pipeline to bind
 */
export function setRenderPipeline(device: Device, pipeline: RenderPipeline): void {
  const pipe = (pipeline as WebGPURenderPipeline).pipeline;
  pipe && (device as WebGPUDevice).renderPass?.setPipeline(pipe);
  (device as WebGPUDevice).indexFormat = (pipeline as WebGPURenderPipeline).indexFormat;
}

/**
 * Binds an index buffer to the current render pass.
 * @param device the GPU device
 * @param buffer the buffer to bind
 */
export function setIndex(device: Device, buffer: Buffer): void {
  const buf = (buffer as WebGPUBuffer).buffer;
  buf && (device as WebGPUDevice).renderPass?.setIndexBuffer(buf, (device as WebGPUDevice).indexFormat || 'uint16');
}

/**
 * Binds a vertex buffer to a slot in the current render pass.
 * @param device the GPU device
 * @param slot the vertex slot to bind to
 * @param buffer the buffer to bind
 */
export function setVertex(device: Device, slot: number, buffer: Buffer, offset: UInt = 0): void {
  const buf = (buffer as WebGPUBuffer).buffer;
  buf && (device as WebGPUDevice).renderPass?.setVertexBuffer(slot, buf, offset);
}

/**
 * Binds a bind group to the current render pass.
 * @param device the GPU device
 * @param slot the bind group slot to bind to
 * @param bindGroup the bind group to use
 * @param offsets the dynamic offsets for dynamic buffers in this bind group
 */
export function setBindGroup(device: Device, slot: UInt, bindGroup: BindGroup, offsets: UIntArray = []): void {
  const group = (bindGroup as WebGPUBindGroup).group;
  group && (device as WebGPUDevice).renderPass?.setBindGroup(slot, group, offsets);
}

/**
 * Submits a draw call in the current render pass.
 * @param device the GPU device
 * @param vertexCount the number of vertices to draw
 * @param instanceCount the number of instances to draw. Defaults to 1
 * @param firstVertex the offset to the first vertex to draw. Defaults to 0
 * @param firstInstance the offset to the first instance to draw. Defaults to 0
 */
export function draw(
  device: Device, vertexCount: number, instanceCount = 1, firstVertex = 0, firstInstance = 0
): void {
  (device as WebGPUDevice).renderPass?.draw(vertexCount, instanceCount, firstVertex, firstInstance);
}

/**
 * Submits an indexed draw call in the current render pass.
 * @param device the GPU device
 * @param indexCount the number of vertices to draw
 * @param instanceCount the number of instances to draw. Defaults to 1
 * @param firstIndex the offset to the first vertex to draw. Defaults to 0
 * @param firstInstance the offset to the first instance to draw. Defaults to 0
 * @param baseVertex the offset added to each index value before indexing into the vertex buffers. Defaults to 0
 */
export function drawIndexed(
  device: Device, indexCount: number, instanceCount = 1, firstIndex = 0, firstInstance = 0, baseVertex = 0
): void {
  (device as WebGPUDevice).renderPass?.drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
}

/**
 * Sets the 3D viewport area for the current render pass.
 * @param device the GPU device
 * @param x x offset
 * @param y y offset
 * @param width width
 * @param height height
 * @param minDepth min depth. Defaults to 0
 * @param maxDepth max depth. Defaults to 1
 */
export function setViewport(
  device: Device, x: number, y: number, width: number, height: number, minDepth = 0, maxDepth = 1
): void {
  (device as WebGPUDevice).renderPass?.setViewport(x, y, width, height, minDepth, maxDepth);
}

/**
 * Sets the scissor rectangle for the current render pass.
 * @param device the GPU device
 * @param x x offset
 * @param y y offset
 * @param width width
 * @param height height
 */
export function setScissorRect(device: Device, x: number, y: number, width: number, height: number): void {
  (device as WebGPUDevice).renderPass?.setScissorRect(x, y, width, height);
}

/**
 * Sets the blend-constant color for the current render pass.
 * @param device the GPU device
 * @param color the blend color
 */
export function setBlendConst(device: Device, color: Color): void {
  (device as WebGPUDevice).renderPass?.setBlendConstant(color);
}

/**
 * Sets the stencil reference value for the current render pass.
 * @param device the GPU device
 * @param ref the stencil reference value.
 */
export function setStencilRef(device: Device, ref: UInt): void {
  (device as WebGPUDevice).renderPass?.setStencilReference(ref);
}

//#endregion Render
