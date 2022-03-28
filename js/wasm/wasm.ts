import {
  AddressMode, BindGroup, BindGroupLayout, BindGroupLayoutEntry, BindingType, Buffer, BufferUsage, Canvas, Color,
  ColorAttachment, ColorTargetState, CompareFunction, CullMode, Device, FilterMode, Float, FrontFace, Future, GPU,
  ImageSource, IndexFormat, MipmapHint, PrimitiveTopology, RenderPass, RenderPassDescriptor, RenderPipeline, Resource,
  Sampler, SamplerBindingType, Shader, ShaderStage, StencilOperation, Texture, TextureDimension, TextureFormat,
  TextureSampleType, TextureUsage, UInt, VertexAttribute, VertexBufferLayout, WebGL
} from '../gpu';
import { Id, IdArena } from './id';
import { dataView, decodeStr, toWebGLContextAttributes } from './deserialize';

export type FutureId = Id<'Future'>;
export type ImageSourceId = Id<'Image'>;
export type CanvasId = Id<'Canvas'>;
export type ResourceId = Id<'GPUResource'>;

const API: GPU = WebGL;

/**
 * mugl WebGL binding for WebAssembly.
 */
export function WebAssemblyGL(): WebAssembly.ModuleImports {
  const futures = new IdArena<'Future', Future>();
  const images = new IdArena<'Image', ImageSource>();
  const imageMap: Record<string, ImageSourceId> = {};
  const canvases = new IdArena<'Canvas', Canvas>();
  const canvasMap: Record<string, CanvasId> = {};
  const resources = new IdArena<'GPUResource', Resource>();

  function deleteResource(id: ResourceId): void {
    const resource = resources.get(id);
    if (resource) {
      resource.destroy();
      resources.delete(id);
    }
  }

  const self = {
    memory: null as unknown as WebAssembly.Memory,

    ['is-future-done'](future: FutureId): boolean {
      const f = futures.get(future);
      if (f) {
        if (!f.done) {
          return false;
        } else {
          futures.delete(future);
        }
      }
      return true;
    },

    ['create-image'](ptr: UInt, len: UInt): ImageSourceId {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = decodeStr(self.memory, ptr, len);
      return images.add(img);
    },
    ['get-image-by-id'](ptr: UInt, len: UInt): ImageSourceId {
      const id = decodeStr(self.memory, ptr, len);
      if (imageMap[id]) {
        return imageMap[id];
      }
      const image = document.getElementById(id) as ImageSource;
      if (!image) {
        return 0 as ImageSourceId;
      }
      return (imageMap[id] = images.add(image));
    },
    ['delete-image'](img: ImageSourceId): void {
      images.delete(img);
    },
    ['get-image-width'](img: ImageSourceId): UInt {
      return images.get(img)?.width || 0;
    },
    ['get-image-height'](img: ImageSourceId): UInt {
      return images.get(img)?.height || 0;
    },
    ['get-canvas-by-id'](ptr: UInt, len: UInt): CanvasId {
      const id = decodeStr(self.memory, ptr, len);
      if (canvasMap[id]) {
        return canvasMap[id];
      }
      const canvas = document.getElementById(id) as Canvas;
      if (!canvas) {
        return 0 as CanvasId;
      }
      return (canvasMap[id] = canvases.add(canvas));
    },
    ['get-canvas-width'](canvas: CanvasId): UInt {
      return canvases.get(canvas)?.width || 0;
    },
    ['get-canvas-height'](canvas: CanvasId): UInt {
      return canvases.get(canvas)?.height || 0;
    },

    ['webgl-request-device'](canvasId: CanvasId, attrs: UInt, features: UInt): ResourceId {
      const canvas = canvases.get(canvasId);
      if (canvas) {
        const device = WebGL.requestWebGL2Device(canvas, toWebGLContextAttributes(attrs), features);
        if (device) {
          return resources.add(device);
        }
      }
      return 0 as ResourceId;
    },
    ['webgl-generate-mipmap'](device: ResourceId, tex: ResourceId, hint: MipmapHint): void {
      WebGL.generateMipmap(resources.get(device) as Device, resources.get(tex) as Texture, hint);
    },

    ['reset-device'](device: ResourceId): void {
      API.resetDevice(resources.get(device) as Device);
    },
    ['delete-device']: deleteResource,
    ['is-device-lost'](device: ResourceId): boolean {
      return API.isDeviceLost(resources.get(device) as Device);
    },
    ['get-device-features'](device: ResourceId): UInt {
      return API.getDeviceFeatures(resources.get(device) as Device);
    },

    ['create-buffer'](device: ResourceId, size: UInt, usage: BufferUsage): ResourceId {
      const ret = API.createBuffer(resources.get(device) as Device, {
        size: size >>> 0,
        usage: usage >>> 0,
      });
      return resources.add(ret);
    },
    ['delete-buffer']: deleteResource,
    ['create-texture'](
      device: ResourceId,
      width: UInt, height: UInt, depth: UInt,
      mipLevelCount: UInt,
      sampleCount: UInt,
      dimension: TextureDimension,
      format: TextureFormat,
      usage: TextureUsage
    ): ResourceId {
      const ret = API.createTexture(resources.get(device) as Device, {
        size: [width >>> 0, height >>> 0, depth >>> 0],
        mipLevelCount: mipLevelCount >>> 0,
        sampleCount: sampleCount >>> 0,
        dimension: dimension >>> 0,
        format: format >>> 0,
        usage: usage >>> 0,
      });
      return resources.add(ret);
    },
    ['delete-texture']: deleteResource,
    ['create-sampler'](
      device: ResourceId,
      addressModeU: AddressMode, addressModeV: AddressMode, addressModeW: AddressMode,
      magFilter: FilterMode, minFilter: FilterMode, mipmapFilter: FilterMode,
      lodMinClamp: Float, lodMaxClamp: Float,
      compare: CompareFunction,
      maxAnisotropy: UInt
    ): ResourceId {
      const ret = API.createSampler(resources.get(device) as Device, {
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
    },
    ['delete-sampler']: deleteResource,
    ['create-shader'](device: ResourceId, codePtr: UInt, codeLen: UInt, usage: ShaderStage): ResourceId {
      const ret = API.createShader(resources.get(device) as Device, {
        code: decodeStr(self.memory, codePtr, codeLen),
        usage: usage >>> 0,
      });
      return resources.add(ret);
    },
    ['delete-shader']: deleteResource,

    ['create-bind-group-layout'](device: ResourceId, entriesPtr: UInt, entriesLen: UInt): ResourceId {
      const entries: BindGroupLayoutEntry[] = [];
      for (let i = 0; i < entriesLen; i++) {
        const base = entriesPtr + i * 32;
        const ptr0 = dataView(self.memory).getUint32(base + 0, true);
        const len0 = dataView(self.memory).getUint32(base + 4, true);
        const type = dataView(self.memory).getUint8(base + 16);
        let bufferDynamicOffset = false;
        let samplerType = SamplerBindingType.Filtering;
        let textureSampleType = TextureSampleType.Float;
        let textureDimension = TextureDimension.D2;
        let textureMultisampled = false;

        switch (type) {
          case BindingType.Buffer:
            bufferDynamicOffset = !!dataView(self.memory).getUint8(base + 20);
            break;
          case BindingType.Sampler:
            samplerType = dataView(self.memory).getUint32(base + 20, true) >>> 0;
            break;
          case BindingType.Texture:
            textureSampleType = dataView(self.memory).getUint32(base + 20, true) >>> 0;
            textureDimension = dataView(self.memory).getUint32(base + 24, true) >>> 0;
            textureMultisampled = !!dataView(self.memory).getUint8(base + 28);
            break;
          default:
            throw new RangeError('invalid variant discriminant for BindingType');
        }
        entries.push({
          label: decodeStr(self.memory, ptr0, len0),
          binding: dataView(self.memory).getUint32(base + 8, true) >>> 0,
          visibility: dataView(self.memory).getUint32(base + 12, true) >>> 0,
          type,
          bufferDynamicOffset,
          samplerType,
          textureSampleType,
          textureDimension,
          textureMultisampled,
        });
      }
      const ret = API.createBindGroupLayout(resources.get(device) as Device, { entries });
      return resources.add(ret);
    },
    ['delete-bind-group-layout']: deleteResource,
    ['create-bind-group'](device: ResourceId, layout: ResourceId, entriesPtr: UInt, entriesLen: UInt): ResourceId {
      const entries = [];
      for (let i = 0; i < entriesLen; i++) {
        const base = entriesPtr + i * 24;
        const type = dataView(self.memory).getUint8(base + 4);
        let buffer: Buffer | null = null;
        let bufferOffset = 0;
        let bufferSize = 0;
        let sampler: Sampler | null = null;
        let texture: Texture | null = null;

        switch (type) {
          case BindingType.Buffer:
            buffer = resources.get(dataView(self.memory).getFloat64(base + 8, true) as ResourceId) as Buffer;
            bufferOffset = dataView(self.memory).getUint32(base + 16, true);
            bufferSize = dataView(self.memory).getUint32(base + 20, true);
            break;
          case BindingType.Sampler:
            sampler = resources.get(dataView(self.memory).getFloat64(base + 8, true) as ResourceId) as Sampler;
            break;
          case BindingType.Texture:
            texture = resources.get(dataView(self.memory).getFloat64(base + 8, true) as ResourceId) as Texture;
            break;
          default:
            throw new RangeError('invalid variant discriminant for BindingResource');
        }
        entries.push({
          binding: dataView(self.memory).getUint32(base + 0, true),
          buffer,
          bufferOffset,
          bufferSize,
          sampler,
          texture
        });
      }
      const ret = API.createBindGroup(resources.get(device) as Device, {
        layout: resources.get(layout) as BindGroupLayout,
        entries,
      });
      return resources.add(ret);
    },
    ['delete-bind-group']: deleteResource,
    ['create-render-pipeline'](
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
      colorWriteMask: UInt, blendColorOperation: UInt, blendColorSrcFactor: UInt, blendColorDstFactor: UInt, blendAlphaOperation: UInt, blendAlphaSrcFactor: UInt, blendAlphaDstFactor: UInt
    ): ResourceId {
      const attributes: VertexAttribute[] = [];
      for (let i = 0; i < attributesLen; i++) {
        const base = attributesPtr + i * 12;
        attributes.push({
          format: dataView(self.memory).getUint32(base + 0, true),
          offset: dataView(self.memory).getUint32(base + 4, true),
          shaderLocation: dataView(self.memory).getUint32(base + 8, true),
        });
      }

      const buffers: VertexBufferLayout[] = [];
      for (let i = 0; i < buffersLen; i++) {
        const base = buffersPtr + i * 16;
        const start = dataView(self.memory).getUint32(base + 0, true);
        const len = dataView(self.memory).getUint32(base + 4, true);
        buffers.push({
          attributes: attributes.slice(start, start + len),
          stride: dataView(self.memory).getUint32(base + 8, true),
          stepMode: dataView(self.memory).getUint32(base + 12, true),
        });
      }

      const bindGroups: BindGroupLayout[] = [];
      for (let i = 0; i < bindGroupsLen; i++) {
        const base = bindGroupsPtr + i * 8;
        bindGroups.push(resources.get(dataView(self.memory).getFloat64(base + 0, true) as ResourceId) as BindGroupLayout);
      }

      const targets: ColorTargetState[] = [];
      for (let i = 0; i < colorsLen; i++) {
        const base = colorsPtr + i * 32;
        targets.push({
          format: dataView(self.memory).getUint32(base + 0, true) >>> 0,
          writeMask: dataView(self.memory).getUint32(base + 4, true) >>> 0,
          blendColor: {
            operation: dataView(self.memory).getUint32(base + 8, true) >>> 0,
            srcFactor: dataView(self.memory).getUint32(base + 12, true) >>> 0,
            dstFactor: dataView(self.memory).getUint32(base + 16, true) >>> 0,
          },
          blendAlpha: {
            operation: dataView(self.memory).getUint32(base + 20, true) >>> 0,
            srcFactor: dataView(self.memory).getUint32(base + 24, true) >>> 0,
            dstFactor: dataView(self.memory).getUint32(base + 28, true) >>> 0,
          },
        });
      }

      const ret = API.createRenderPipeline(resources.get(device) as Device, {
        vertex: resources.get(vertex) as Shader,
        fragment: resources.get(fragment) as Shader,
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
        } : null,
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
        },
      });

      return resources.add(ret);
    },
    ['delete-render-pipeline']: deleteResource,
    ['create-render-pass'](
      device: ResourceId,
      clearDepth: Float, clearStencil: Float,
      clearColorRed: Float, clearColorGreen: Float, clearColorBlue: Float, clearColorAlpha: Float,
      isOffscreen: UInt,
      depthStencilTexture: ResourceId, depthStecilMipLevel: UInt, depthStecilSlice: UInt,
      colorsPtr: UInt, colorsLen: UInt
    ): ResourceId {
      let desc: RenderPassDescriptor;
      switch (isOffscreen) {
        case 0:  // Default pass
          desc = {
            clearDepth,
            clearStencil,
            clearColor: isNaN(clearColorRed) ? null : [clearColorRed, clearColorGreen, clearColorBlue, clearColorAlpha],
          };
          break;
        case 1: { // Offscreen pass
          const colors: ColorAttachment[] = [];
          for (let i = 0; i < colorsLen; i++) {
            const base = colorsPtr + i * 32;
            const clear: Color = [
              dataView(self.memory).getFloat32(base + 16, true),
              dataView(self.memory).getFloat32(base + 20, true),
              dataView(self.memory).getFloat32(base + 24, true),
              dataView(self.memory).getFloat32(base + 28, true)
            ];
            colors.push({
              view: {
                texture: resources.get(dataView(self.memory).getFloat64(base + 0, true) as ResourceId) as Texture,
                mipLevel: dataView(self.memory).getUint32(base + 8, true),
                slice: dataView(self.memory).getUint32(base + 12, true),
              },
              clear: isNaN(clear[0]) ? null : clear,
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
            },
          };
          break;
        }
        default:
          throw new RangeError('invalid variant discriminant for RenderPassDescriptor');
      }
      const ret = API.createRenderPass(resources.get(device) as Device, desc);
      return resources.add(ret);
    },
    ['delete-render-pass']: deleteResource,
    ['read-buffer'](device: ResourceId, buffer: ResourceId, offset: UInt, outPtr: UInt, size: UInt): FutureId {
      const ret = API.readBuffer(
        resources.get(device) as Device,
        resources.get(buffer) as Buffer,
        new Uint8Array(self.memory.buffer.slice(outPtr, outPtr + size * 1),
          offset >>> 0)
      );
      return futures.add(ret);
    },
    ['write-buffer'](device: ResourceId, buffer: ResourceId, dataPtr: UInt, size: UInt, offset: UInt): void {
      API.writeBuffer(resources.get(device) as Device, resources.get(buffer) as Buffer, new Uint8Array(self.memory.buffer.slice(dataPtr, dataPtr + size * 1)), offset >>> 0);
    },
    ['copy-buffer'](device: ResourceId, src: ResourceId, dst: ResourceId, size: UInt, srcOffset: UInt, dstOffset: UInt): void {
      API.copyBuffer(resources.get(device) as Device, resources.get(src) as Buffer, resources.get(dst) as Buffer, size >>> 0, srcOffset >>> 0, dstOffset >>> 0);
    },
    ['write-texture'](
      device: ResourceId,
      texture: ResourceId, mipLevel: UInt, x: UInt, y: UInt, z: UInt,
      dataPtr: UInt, dataLen: UInt,
      offset: UInt, bytesPerRow: UInt, rowsPerImage: UInt,
      width: UInt, height: UInt, depth: UInt
    ) {
      API.writeTexture(resources.get(device) as Device, {
        texture: resources.get(texture) as Texture,
        mipLevel: mipLevel >>> 0,
        origin: [x >>> 0, y >>> 0, z >>> 0],
      }, new Uint8Array(self.memory.buffer.slice(dataPtr, dataPtr + dataLen * 1)), {
        offset: offset >>> 0,
        bytesPerRow: bytesPerRow >>> 0,
        rowsPerImage: rowsPerImage >>> 0,
      }, [width >>> 0, height >>> 0, depth >>> 0]);
    },
    ['copy-external-image-to-texture'](
      device: ResourceId,
      src: ImageSourceId, srcX: UInt, srcY: UInt,
      dst: ResourceId, mipLevel: UInt, dstX: UInt, dstY: UInt, dstZ: UInt,
      width: UInt, height: UInt
    ): void {
      API.copyExternalImageToTexture(resources.get(device) as Device, {
        src: images.get(src) as TexImageSource,
        origin: [srcX >>> 0, srcY >>> 0],
      }, {
        texture: resources.get(dst) as Texture,
        mipLevel: mipLevel >>> 0,
        origin: [dstX >>> 0, dstY >>> 0, dstZ >>> 0],
      }, [width >>> 0, height >>> 0]);
    },
    ['copy-texture'](
      device: ResourceId,
      src: ResourceId, srcMipLevel: UInt, srcX: UInt, srcY: UInt, srcZ: UInt,
      dst: ResourceId, dstMipLevel: UInt, dstX: UInt, dstY: UInt, dstZ: UInt,
      width: UInt, height: UInt, depth: UInt
    ) {
      API.copyTexture(resources.get(device) as Device, {
        texture: resources.get(src) as Texture,
        mipLevel: srcMipLevel >>> 0,
        origin: [srcX >>> 0, srcY >>> 0, srcZ >>> 0],
      }, {
        texture: resources.get(dst) as Texture,
        mipLevel: dstMipLevel >>> 0,
        origin: [dstX >>> 0, dstY >>> 0, dstZ >>> 0],
      }, [width >>> 0, height >>> 0, depth >>> 0]);
    },
    ["copy-texture-to-buffer"](
      device: ResourceId,
      src: ResourceId, srcMipLevel: UInt, srcX: UInt, srcY: UInt, srcZ: UInt,
      dst: ResourceId,
      offset: UInt, bytesPerRow: UInt, rowsPerImage: UInt,
      width: UInt, height: UInt, depth: UInt
    ): void {
      API.copyTextureToBuffer(resources.get(device) as Device, {
        texture: resources.get(src) as Texture,
        mipLevel: srcMipLevel >>> 0,
        origin: [srcX >>> 0, srcY >>> 0, srcZ >>> 0],
      }, resources.get(dst) as Buffer, {
        offset: offset >>> 0,
        bytesPerRow: bytesPerRow >>> 0,
        rowsPerImage: rowsPerImage >>> 0,
      }, [width >>> 0, height >>> 0, depth >>> 0]);
    },

    ['begin-render-pass'](device: ResourceId, pass: ResourceId): void {
      API.beginRenderPass(resources.get(device) as Device, resources.get(pass) as RenderPass);
    },
    ['begin-default-pass'](
      device: ResourceId,
      clearDepth: Float, clearStencil: Float,
      clearColorRed: Float, clearColorGreen: Float, clearColorBlue: Float, clearColorAlpha: Float,
    ): void {
      API.beginDefaultPass(resources.get(device) as Device, {
        clearColor: isNaN(clearColorRed) ? null : [clearColorRed, clearColorGreen, clearColorBlue, clearColorAlpha],
        clearDepth,
        clearStencil,
      });
    },
    ['submit-render-pass'](device: ResourceId): void {
      API.submitRenderPass(resources.get(device) as Device);
    },
    ['set-render-pipeline'](device: ResourceId, pipeline: ResourceId): void {
      API.setRenderPipeline(resources.get(device) as Device, resources.get(pipeline) as RenderPipeline);
    },
    ['set-index'](device: ResourceId, index: ResourceId): void {
      API.setIndex(resources.get(device) as Device, resources.get(index) as Buffer);
    },
    ['set-vertex'](device: ResourceId, slot: UInt, vertex: ResourceId, offset: UInt): void {
      API.setVertex(resources.get(device) as Device, slot >>> 0, resources.get(vertex) as Buffer, offset >>> 0);
    },
    ['set-bind-group'](device: ResourceId, slot: UInt, bindGroup: ResourceId, offsetsPtr: UInt, offsetsLen: UInt): void {
      API.setBindGroup(
        resources.get(device) as Device, slot >>> 0,
        resources.get(bindGroup) as BindGroup,
        new Uint32Array(self.memory.buffer.slice(offsetsPtr, offsetsPtr + offsetsLen * 4)) as unknown as UInt[]
      );
    },
    ['draw'](device: ResourceId, vertexCount: UInt, instanceCount: UInt, firstVertex: UInt, firstInstance: UInt): void {
      API.draw(resources.get(device) as Device, vertexCount >>> 0, instanceCount >>> 0, firstVertex >>> 0, firstInstance >>> 0);
    },
    ['draw-indexed'](device: ResourceId, indexCount: UInt, instanceCount: UInt, firstIndex: UInt, firstInstance: UInt): void {
      API.drawIndexed(resources.get(device) as Device, indexCount >>> 0, instanceCount >>> 0, firstIndex >>> 0, firstInstance >>> 0);
    },
    ['set-viewport'](device: ResourceId, x: UInt, y: UInt, width: UInt, height: UInt, minDepth: UInt, maxDepth: UInt): void {
      API.setViewport(resources.get(device) as Device, x >>> 0, y >>> 0, width >>> 0, height >>> 0, minDepth >>> 0, maxDepth >>> 0);
    },
    ['set-scissor-rect'](device: ResourceId, x: UInt, y: UInt, width: UInt, height: UInt): void {
      API.setScissorRect(resources.get(device) as Device, x >>> 0, y >>> 0, width >>> 0, height >>> 0);
    },
    ['set-blend-const'](device: ResourceId, red: Float, green: Float, blue: Float, alpha: Float): void {
      API.setBlendConst(resources.get(device) as Device, [red, green, blue, alpha]);
    },
    ['set-stencil-ref'](device: ResourceId, ref: UInt): void {
      API.setStencilRef(resources.get(device) as Device, ref >>> 0);
    }
  };

  return self;
}
