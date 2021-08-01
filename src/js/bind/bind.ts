/* eslint-disable @typescript-eslint/no-explicit-any */

import { ASUtil } from '@assemblyscript/loader';
import {
  AddressMode, BlendFactor, BlendOp, Buffer, BufferType, ColorMask, CompareFunc, CullMode, FilterMode, Float,
  FrontFace, IndexFormat, Int, MinFilterMode, MipmapHint, Pipeline, PixelFormat, PrimitiveType,
  ReadonlyVertexAttribute, RenderingDevice, RenderPass, RenderPassContext, Shader, ShaderType, StencilOp, Texture,
  TexType, UniformType, Usage, VertexFormat
} from '../../common';
import { UniformBindings, UniformLayout } from '../../common/device/descriptor';
import { GLRenderingDeviceFactory, GLRenderingDeviceOptions } from '../device';
import { getGLDevice } from '../gl2';

type Ptr = number;
type Uint = number;
type ImageId = Uint;
type CanvasId = Uint;
type RenderingDeviceId = Uint;
type RenderPassContextId = Uint;
type BufferId = Uint;
type TextureId = Uint;
type RenderPassId = Uint;
type ShaderId = Uint;
type PipelineId = Uint;

const UINT_MAX = 4294967295;

/**
 * mugl-WASM binding object.
 */
export interface MuglBind {
  /**
   * Bind mugl to WASM module exports.
   * @param exports module exports
   */
  bindModule(exports: ASUtil & Record<string, unknown>): void;

  canvasIdMap: Record<string, CanvasId>;
  canvas: Record<CanvasId, HTMLCanvasElement>;
  images: Record<ImageId, HTMLImageElement>;
  devices: Record<RenderingDeviceId, RenderingDevice>;
  renderPassContexts: Record<RenderPassContextId, RenderPassContext>;
  boundUniforms: Record<RenderPassContextId, UniformBindings>;
  buffers: Record<BufferId, Buffer>;
  textures: Record<TextureId, Texture>;
  shaders: Record<ShaderId, Shader>;
  renderPasses: Record<RenderPassId, RenderPass>;
  pipelines: Record<PipelineId, Pipeline>;
}

/**
 * Bind mugl device library to WASM module.
 */
export function muglBind(
  imports: Record<string, unknown>,
  deviceFactory: GLRenderingDeviceFactory = getGLDevice
): MuglBind {
  let module: any = {};

  let canvasId: CanvasId = 1;
  const canvasIdMap: Record<string, CanvasId> = {};
  const canvas: Record<CanvasId, HTMLCanvasElement> = {};
  let imageId: ImageId = 1;
  const images: Record<ImageId, HTMLImageElement> = {};
  let deviceId: RenderingDeviceId = 1;
  const devices: Record<RenderingDeviceId, RenderingDevice> = {};
  let renderPassContextId: RenderPassContextId = 1;
  const renderPassContexts: Record<RenderPassContextId, RenderPassContext> = {};
  const boundUniforms: Record<RenderPassContextId, UniformBindings> = {};
  let bufferId: BufferId = 1;
  const buffers: Record<BufferId, Buffer> = {};
  let textureId: TextureId = 1;
  const textures: Record<TextureId, Texture> = {};
  let shaderId: ShaderId = 1;
  const shaders: Record<ShaderId, Shader> = {};
  let renderPassId: RenderPassId = 1;
  const renderPasses: Record<RenderPassId, RenderPass> = {};
  let pipelineId: PipelineId = 1;
  const pipelines: Record<PipelineId, Pipeline> = {};

  imports.mugl = {
    getCanvasById(id: Ptr): CanvasId {
      const idStr = module.__getString(id);
      if (canvasIdMap[idStr]) { return canvasIdMap[idStr]; }
      const c = document.getElementById(idStr) as HTMLCanvasElement;
      if (!c) { return 0; }
      canvasIdMap[idStr] = canvasId;
      canvas[canvasId] = c;
      return canvasId++;
    },

    createImage(uri: Ptr): ImageId {
      const img = images[imageId] = new Image();
      img.crossOrigin = 'anonymous';
      img.src = module.__getString(uri);
      return imageId++;
    },
    deleteImage(ptr: ImageId): void {
      delete images[ptr];
    },

    getGLDevice(c: CanvasId, flags: Uint): RenderingDeviceId {
      const options: GLRenderingDeviceOptions = {
        alpha: !!(flags & 1),
        antialias: !!(flags & (1 << 1)),
        depth: !!(flags & (1 << 2)),
        desynchronized: !!(flags & (1 << 3)),
        failIfMajorPerformanceCaveat: !!(flags & (1 << 4)),
        powerPreference: (flags & (1 << 6)) ? 'high-performance' :
          (flags & (1 << 5)) ? 'low-power' : 'default',
        premultipliedAlpha: !!(flags & (1 << 7)),
        preserveDrawingBuffer: !!(flags & (1 << 8)),
        stencil: !!(flags & (1 << 9)),
        webgl2: !!(flags & (1 << 10))
      };
      const device = canvas[c] && deviceFactory(canvas[c], options);
      if (!device) { return 0; }
      devices[deviceId] = device;
      return deviceId++;
    },

    getCanvasWidth(device: RenderingDeviceId): Uint {
      return devices[device]?.width;
    },
    getCanvasHeight(device: RenderingDeviceId): Uint {
      return devices[device]?.height;
    },
    resetDevice(device: RenderingDeviceId): void {
      devices[device]?.reset();
    },
    deviceFeature(device: RenderingDeviceId, feature: Ptr): boolean {
      // TODO: return feature object pointer
      return devices[device]?.feature(module.__getString(feature)) ? true : false;
    },

    createBuffer(device: RenderingDeviceId, type: BufferType, size: Uint, usage: Usage): BufferId {
      const d = devices[device];
      if (!d) { return 0; }
      buffers[bufferId] = d.buffer({ type, size, usage });
      return bufferId++;
    },
    deleteBuffer(buffer: BufferId): void {
      buffers[buffer]?.destroy();
      delete buffers[buffer];
    },
    bufferData(buffer: BufferId, data: Ptr, offset: Uint): void {
      buffers[buffer]?.data(module.__getArrayView(data), offset);
    },

    createTexture(
      device: RenderingDeviceId,
      type: TexType, format: PixelFormat, width: Uint, height: Uint, depth: Uint, mipLevels: Uint, samples: Uint, renderTarget: boolean,
      wrapU: AddressMode, wrapV: AddressMode, wrapW: AddressMode, magFilter: FilterMode, minFilter: MinFilterMode, minLOD: Float, maxLOD: Float, maxAniso: Float
    ): TextureId {
      const d = devices[device];
      if (!d) { return 0; }
      textures[textureId] = d.texture(
        { type, format, width, height, depth, mipLevels, samples, renderTarget },
        { wrapU, wrapV, wrapW, magFilter, minFilter, minLOD, maxLOD, maxAniso }
      );
      return textureId++;
    },
    deleteTexture(texture: TextureId): void {
      textures[texture]?.destroy();
      delete textures[texture];
    },
    textureBuffers(texture: TextureId, bufferPtr: Ptr, origin: Ptr, extent: Ptr, mipLevel: Uint): void {
      const bufferPtrs = module.__getArrayView(bufferPtr);
      const bufferData = new Array(bufferPtrs.length);
      for (let i = 0; i < bufferPtrs.length; ++i) {
        bufferData[i] = module.__getArrayView(bufferPtrs[i]);
      }
      textures[texture]?.data({ buffers: bufferData }, module.__getArrayView(origin), module.__getArrayView(extent), mipLevel);
    },
    textureImages(texture: TextureId, imagesPtr: Ptr, origin: Ptr, extent: Ptr, mipLevel: Uint): void {
      const imagePtrs = module.__getArrayView(imagesPtr);
      const imageData = new Array(imagePtrs.length);
      for (let i = 0; i < imagePtrs.length; ++i) {
        imageData[i] = images[imagePtrs[i]];
      }
      textures[texture]?.data({ images: imageData }, module.__getArrayView(origin), module.__getArrayView(extent), mipLevel);
    },
    mipmap(texture: TextureId, hint: MipmapHint): void {
      textures[texture]?.mipmap(hint);
    },

    createShader(device: RenderingDeviceId, type: ShaderType, source: Ptr): ShaderId {
      const d = devices[device];
      if (!d) { return 0; }
      shaders[shaderId] = d.shader({ type, source: module.__getString(source) });
      return shaderId++;
    },
    deleteShader(shader: ShaderId): void {
      shaders[shader]?.destroy();
      delete shaders[shader];
    },

    createRenderPass(
      device: RenderingDeviceId,
      colorTex: Ptr, colorMipLevel: Ptr, colorSlice: Ptr,
      depthTex: TextureId, depthMipLevel: Uint, depthSlice: Uint,
      clearColor: Ptr, clearDepth: Float, clearStencil: Float
    ): RenderPassId {
      const d = devices[device];
      if (!d) { return 0; }
      let color = [];
      if (colorTex) {
        const mipLevels = module.__getArrayView(colorMipLevel);
        const slices = module.__getArrayView(colorSlice);
        const colorTexes = module.__getArrayView(colorTex);
        color = Array(colorTexes.length);
        for (let i = 0; i < color.length; ++i) {
          color.push({
            tex: textures[colorTexes[i]],
            mipLevel: mipLevels[i],
            slice: slices[i]
          });
        }
      }
      renderPasses[renderPassId] = d.pass({
        color,
        depth: textures[depthTex] ? {
          tex: textures[depthTex],
          mipLevel: depthMipLevel,
          slice: depthSlice
        } : null,
        clearColor: clearColor ? module.__getArrayView(clearColor) : null,
        clearDepth,
        clearStencil
      });
      return renderPassId++;
    },
    deleteRenderPass(pass: RenderPassId): void {
      renderPasses[pass]?.destroy();
      delete renderPasses[pass];
    },
    resolveRenderPass(pass: RenderPassId): void {
      renderPasses[pass]?.resolve();
    },

    createPipeline(
      device: RenderingDeviceId,
      vert: ShaderId, frag: ShaderId, indexFormat: IndexFormat, mode: PrimitiveType,
      bufferInstStridesPtr: Ptr,
      attrNamesPtr: Ptr, attrBufferIdsPtr: Ptr, attrFormatsPtr: Ptr, attrShaderLocPtr: Ptr, attrOffsetsPtr: Ptr,
      uniformNamesPtr: Ptr, uniformTypesPtr: Ptr, uniformFormatsPtr: Ptr,
      frontFace: FrontFace, cullMode: CullMode, depthBias: Float, depthBiasSlopeScale: Float, alphaToCoverage: boolean,
      depthEnabled: boolean, depthWrite: boolean, depthCompare: CompareFunc,
      stencilEnabled: boolean,
      stencilFrontCompare: CompareFunc, stencilFrontFailOp: StencilOp, stencilFrontZFailOp: StencilOp, stencilFrontPassOp: StencilOp,
      stencilBackCompare: CompareFunc, stencilBackFailOp: StencilOp, stencilBackZFailOp: StencilOp, stencilBackPassOp: StencilOp,
      stencilReadMask: Uint, stencilWriteMask: Uint,
      blendEnabled: boolean,
      srcFactorRGB: BlendFactor, dstFactorRGB: BlendFactor, opRGB: BlendOp,
      srcFactorAlpha: BlendFactor, dstFactorAlpha: BlendFactor, opAlpha: BlendOp, colorMask: ColorMask
    ): PipelineId {
      const d = devices[device];
      if (!d) { return 0; }

      const bufferInstStrides = module.__getArrayView(bufferInstStridesPtr);
      const buffers = Array(bufferInstStrides.length);
      for (let i = 0; i < buffers.length; ++i) {
        buffers[i] = {
          attrs: [] as ReadonlyVertexAttribute[],
          stride: (bufferInstStrides[i] >> 1),
          instanced: !!(bufferInstStrides[i] & 1)
        };
      }

      const attrNamesPtrs = module.__getArrayView(attrNamesPtr);
      const attrNames = Array(attrNamesPtrs.length);
      for (let i = 0; i < attrNames.length; ++i) {
        attrNames[i] = module.__getString(attrNamesPtrs[i]);
      }
      const attrBufferIds: Uint[] = module.__getArrayView(attrBufferIdsPtr);
      const attrFormats: VertexFormat[] = module.__getArrayView(attrFormatsPtr);
      const attrShaderLoc: Uint[] = module.__getArrayView(attrShaderLocPtr);
      const attrOffsets: Uint[] = module.__getArrayView(attrOffsetsPtr);
      for (let i = 0; i < attrNames.length; ++i) {
        buffers[attrBufferIds[i]].attrs.push({
          name: attrNames[i],
          format: attrFormats[i],
          shaderLoc: attrShaderLoc[i] === UINT_MAX ? undefined : attrShaderLoc[i],
          offset: attrOffsets[i] === UINT_MAX ? undefined : attrOffsets[i]
        });
      }

      const uniforms: UniformLayout = [];
      if (uniformNamesPtr) {
        const uniformNamesPtrs = module.__getArrayView(uniformNamesPtr);
        const uniformNames = Array(uniformNamesPtrs.length);
        for (let i = 0; i < uniformNames.length; ++i) {
          uniformNames[i] = module.__getString(uniformNamesPtrs[i]);
        }
        const uniformTypes: UniformType[] = module.__getArrayView(uniformTypesPtr);
        const uniformFormats: Uint[] = module.__getArrayView(uniformFormatsPtr);
        for (let i = 0; i < uniformNames.length; ++i) {
          uniforms.push({
            name: uniformNames[i],
            type: uniformTypes[i],
            texType: uniformFormats[i],
            valueFormat: uniformFormats[i]
          })
        }
      }

      pipelines[pipelineId] = d.pipeline({
        vert: shaders[vert],
        frag: shaders[frag],
        indexFormat,
        mode,
        buffers,
        uniforms,
        raster: { frontFace, cullMode, depthBias, depthBiasSlopeScale, alphaToCoverage },
        depth: depthEnabled ? { write: depthWrite, compare: depthCompare } : null,
        stencil: stencilEnabled ? {
          frontCompare: stencilFrontCompare, frontFailOp: stencilFrontFailOp, frontZFailOp: stencilFrontZFailOp, frontPassOp: stencilFrontPassOp,
          backCompare: stencilBackCompare, backFailOp: stencilBackFailOp, backZFailOp: stencilBackZFailOp, backPassOp: stencilBackPassOp,
          readMask: stencilReadMask, writeMask: stencilWriteMask
        } : null,
        blend: blendEnabled ? {
          srcFactorRGB, dstFactorRGB, opRGB, srcFactorAlpha, dstFactorAlpha, opAlpha, colorMask
        } : null
      });

      return pipelineId++;
    },
    deletePipeline(pipeline: PipelineId): void {
      pipelines[pipeline]?.destroy();
      delete pipelines[pipeline];
    },

    render(device: RenderingDeviceId, pass: RenderPassId): RenderPassContextId {
      const d = devices[device];
      const p = renderPasses[pass];
      if (!d || !p) { return 0; }
      renderPassContexts[renderPassContextId] = d.render(p);
      boundUniforms[renderPassContextId] = [];
      return renderPassContextId++;
    },
    endRender(context: RenderPassContextId): void {
      renderPassContexts[context]?.end();
      delete renderPassContexts[context];
      delete boundUniforms[context];
    },
    bindPipeline(context: RenderPassContextId, pipeline: PipelineId): void {
      if (pipelines[pipeline]) {
        renderPassContexts[context]?.pipeline(pipelines[pipeline]);
      }
    },
    bindVertexBuffer(context: RenderPassContextId, slot: Uint, buffer: BufferId): void {
      if (buffers[buffer]) {
        renderPassContexts[context]?.vertex(slot, buffers[buffer]);
      }
    },
    bindIndexBuffer(context: RenderPassContextId, buffer: BufferId): void {
      if (buffers[buffer]) {
        renderPassContexts[context]?.index(buffers[buffer]);
      }
    },
    bindUniform(
      context: RenderPassContextId, name: Ptr, value: Float, values: Ptr, tex: TextureId,
      buffer: BufferId, bufferOffset: Uint, bufferSize: Uint
    ) {
      boundUniforms[context]?.push({
        name: module.__getString(name),
        value,
        values: values ? module.__getArrayView(values) : undefined,
        tex: textures[tex],
        buffer: buffers[buffer],
        bufferOffset,
        bufferSize
      });
    },
    draw(context: RenderPassContextId, indexed: boolean, count: Uint, instanceCount: Uint, first: Uint): void {
      const uniforms = boundUniforms[context];
      if (uniforms?.length) {
        renderPassContexts[context]?.uniforms(uniforms);
        uniforms.length = 0;
      }
      if (indexed) {
        renderPassContexts[context]?.drawIndexed(count, instanceCount, first);
      } else {
        renderPassContexts[context]?.draw(count, instanceCount, first);
      }
    },
    viewport(context: RenderPassContextId, x: Int, y: Int, width: Int, height: Int, minDepth: Int, maxDepth: Int): void {
      renderPassContexts[context]?.viewport(x, y, width, height, minDepth, maxDepth);
    },
    scissor(context: RenderPassContextId, x: Int, y: Int, width: Int, height: Int): void {
      renderPassContexts[context]?.scissor(x, y, width, height);
    },
    blendColor(context: RenderPassContextId, color: Ptr): void {
      renderPassContexts[context]?.blendColor(module.__getArrayView(color));
    },
    stencilRef(context: RenderPassContextId, ref: Uint): void {
      renderPassContexts[context]?.stencilRef(ref);
    },
  };

  return {
    bindModule(exports) {
      module = exports;
    },
    canvasIdMap,
    canvas,
    images,
    devices,
    renderPassContexts,
    boundUniforms,
    buffers,
    textures,
    shaders,
    renderPasses,
    pipelines
  };
}
