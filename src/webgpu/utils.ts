import {
  AddressMode, BlendComponent, BlendFactor, BlendOperation, CompareFunction, FilterMode, PrimitiveTopology,
  ShaderStage, StencilFaceState, StencilOperation, TextureDimension, TextureFormat, TextureSampleType,
  TextureUsage, TextureView, VertexFormat
} from '../gpu';
import { WebGPURenderPassOperations, WebGPUTexture } from './model';

export function toGPUAddressMode(mode?: AddressMode): GPUAddressMode {
  switch (mode) {
    case AddressMode.Repeat:
      return 'repeat';
    case AddressMode.MirrorRepeat:
      return 'mirror-repeat';
    default:
      return 'clamp-to-edge';
  }
}

export function toGPUFilterMode(mode?: FilterMode): GPUFilterMode {
  return mode === FilterMode.Linear ? 'linear' : 'nearest';
}

export function toGPUCompareFunction(func?: CompareFunction): GPUCompareFunction {
  switch (func) {
    case CompareFunction.Equal:
      return 'equal';
    case CompareFunction.Greater:
      return 'greater';
    case CompareFunction.GreaterEqual:
      return 'greater-equal';
    case CompareFunction.Less:
      return 'less';
    case CompareFunction.LessEqual:
      return 'less-equal';
    case CompareFunction.Never:
      return 'never';
    case CompareFunction.NotEqual:
      return 'not-equal';
    default:
      return 'always';
  }
}

export function toGPUTextureDimension(dimension?: TextureDimension): GPUTextureDimension {
  return dimension === TextureDimension.D3 ? '3d' : '2d';
}

export function toGPUTextureViewDimension(dimension?: TextureDimension): GPUTextureViewDimension {
  switch (dimension) {
    case TextureDimension.D3:
      return '3d';
    case TextureDimension.CubeMap:
      return 'cube';
    case TextureDimension.D2Array:
      return '2d-array';
    default:
      return '2d';
  }
}

export function toGPUTextureFormat(format?: TextureFormat): GPUTextureFormat {
  switch (format) {
    case TextureFormat.R8: return 'r8unorm';
    case TextureFormat.R8SNORM: return 'r8snorm';
    case TextureFormat.R8UI: return 'r8uint';
    case TextureFormat.R8I: return 'r8sint';

    case TextureFormat.R16UI: return 'r16uint';
    case TextureFormat.R16I: return 'r16sint';
    case TextureFormat.RG8: return 'rg8unorm';
    case TextureFormat.RG8SNORM: return 'rg8snorm';
    case TextureFormat.RG8UI: return 'rg8uint';
    case TextureFormat.RG8I: return 'rg8sint';

    case TextureFormat.R32UI: return 'r32uint';
    case TextureFormat.R32I: return 'r32sint';
    case TextureFormat.RG16UI: return 'rg16uint';
    case TextureFormat.RG16I: return 'rg16sint';
    case TextureFormat.RGBA8: return 'rgba8unorm';
    case TextureFormat.SRGBA8: return 'rgba8unorm-srgb';
    case TextureFormat.RGBA8SNORM: return 'rgba8snorm';
    case TextureFormat.RGBA8UI: return 'rgba8uint';
    case TextureFormat.RGBA8I: return 'rgba8sint';
    case TextureFormat.RGB10A2: return 'rgb10a2unorm';

    case TextureFormat.RG32UI: return 'rg32uint';
    case TextureFormat.RG32I: return 'rg32sint';
    case TextureFormat.RGBA16UI: return 'rgba16uint';
    case TextureFormat.RGBA16I: return 'rgba16sint';

    case TextureFormat.R16F: return 'r16float';
    case TextureFormat.RG16F: return 'rg16float';
    case TextureFormat.RG11B10F: return 'rg11b10ufloat';
    case TextureFormat.RGBA16F: return 'rgba16float';
    case TextureFormat.R32F: return 'r32float';
    case TextureFormat.RG32F: return 'rg32float';
    case TextureFormat.RGBA32F: return 'rgba32float';

    case TextureFormat.Depth16: return 'depth16unorm';
    case TextureFormat.Depth24: return 'depth24plus';
    case TextureFormat.Depth24Stencil8: return 'depth24plus-stencil8';
    case TextureFormat.Depth32F: return 'depth32float';
    case TextureFormat.Depth32FStencil8: return 'depth32float-stencil8';

    default:
      return 'rgba8unorm';
  }
}

export function toGPUTextureUsageFlags(usage: TextureUsage = 0 as TextureUsage): GPUTextureUsageFlags {
  return GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST |
    (usage & TextureUsage.TextureBinding ? GPUTextureUsage.TEXTURE_BINDING : 0) |
    (usage & TextureUsage.RenderAttachment ? GPUTextureUsage.RENDER_ATTACHMENT : 0);
}

export function toGPUTextureSampleType(type?: TextureSampleType): GPUTextureSampleType {
  switch (type) {
    case TextureSampleType.UnfilterableFloat:
      return 'unfilterable-float';
    case TextureSampleType.Depth:
      return 'depth';
    case TextureSampleType.UInt:
      return 'uint';
    case TextureSampleType.Int:
      return 'sint';
    default:
      return 'float';
  }
}

export function toGPUShaderStage(stage: ShaderStage = 0 as ShaderStage): GPUShaderStageFlags {
  return (stage & ShaderStage.Fragment ? GPUShaderStage.FRAGMENT : 0) |
    (stage & ShaderStage.Vertex ? GPUShaderStage.VERTEX : 0);
}

export function toGPUPrimitiveTopology(topology?: PrimitiveTopology): GPUPrimitiveTopology {
  switch (topology) {
    case PrimitiveTopology.Points:
      return 'point-list';
    case PrimitiveTopology.Lines:
      return 'line-list';
    case PrimitiveTopology.LineStrip:
      return 'line-strip';
    case PrimitiveTopology.TriangleStrip:
      return 'triangle-strip';
    default:
      return 'triangle-list';
  }
}

export function toGPUStencilOperation(op?: StencilOperation): GPUStencilOperation {
  switch (op) {
    case StencilOperation.Zero:
      return 'zero';
    case StencilOperation.Replace:
      return 'replace';
    case StencilOperation.Invert:
      return 'invert';
    case StencilOperation.Increment:
      return 'increment-clamp';
    case StencilOperation.Decrement:
      return 'decrement-clamp';
    case StencilOperation.IncrementWrap:
      return 'increment-wrap';
    case StencilOperation.DecrementWrap:
      return 'decrement-wrap';
    default:
      return 'keep';
  }
}

export function toGPUStencilFaceState(state?: StencilFaceState): GPUStencilFaceState {
  return {
    compare: toGPUCompareFunction(state?.compare),
    failOp: toGPUStencilOperation(state?.failOp),
    depthFailOp: toGPUStencilOperation(state?.depthFailOp),
    passOp: toGPUStencilOperation(state?.passOp),
  };
}

export function toGPUBlendComponent(blend?: BlendComponent): GPUBlendComponent {
  return {
    srcFactor: toGPUBlendFactor(blend?.srcFactor),
    dstFactor: toGPUBlendFactor(blend?.dstFactor),
    operation: toGPUBlendOperation(blend?.operation),
  };
}

export function toGPUBlendFactor(factor?: BlendFactor): GPUBlendFactor | undefined {
  switch (factor) {
    case BlendFactor.Zero: return 'zero';
    case BlendFactor.One: return 'one';
    case BlendFactor.Src: return 'src';
    case BlendFactor.OneMinusSrc: return 'one-minus-src';
    case BlendFactor.Dst: return 'dst';
    case BlendFactor.OneMinusDst: return 'one-minus-dst';
    case BlendFactor.SrcAlpha: return 'src-alpha';
    case BlendFactor.OneMinusSrcAlpha: return 'one-minus-src-alpha';
    case BlendFactor.DstAlpha: return 'dst-alpha';
    case BlendFactor.OneMinusDstAlpha: return 'one-minus-dst-alpha';
    case BlendFactor.Constant: return 'constant';
    case BlendFactor.OneMinusConstant: return 'one-minus-constant';
    case BlendFactor.SrcAlphaSaturated: return 'src-alpha-saturated';
  }
  return;
}

export function toGPUBlendOperation(operation?: BlendOperation): GPUBlendOperation {
  switch (operation) {
    case BlendOperation.Subtract: return 'subtract';
    case BlendOperation.ReverseSubtract: return 'reverse-subtract';
    case BlendOperation.Min: return 'min';
    case BlendOperation.Max: return 'max';
    default: return 'add';
  }
}

export function toGPUVertexFormat(format: VertexFormat): GPUVertexFormat {
  switch (format) {
    case VertexFormat.UI8x2: return 'uint8x2';
    case VertexFormat.UI8x4: return 'uint8x4';
    case VertexFormat.I8x2: return 'sint8x2';
    case VertexFormat.I8x4: return 'sint8x4';
    case VertexFormat.UNORM8x2: return 'unorm8x2';
    case VertexFormat.UNORM8x4: return 'unorm8x4';
    case VertexFormat.SNORM8x2: return 'snorm8x2';
    case VertexFormat.SNORM8x4: return 'snorm8x4';
    case VertexFormat.UI16x2: return 'uint16x2';
    case VertexFormat.UI16x4: return 'uint16x4';
    case VertexFormat.I16x2: return 'sint16x2';
    case VertexFormat.I16x4: return 'sint16x4';
    case VertexFormat.UNORM16x2: return 'unorm16x2';
    case VertexFormat.UNORM16x4: return 'unorm16x4';
    case VertexFormat.SNORM16x2: return 'snorm16x2';
    case VertexFormat.SNORM16x4: return 'snorm16x4';
    case VertexFormat.F16x2: return 'float16x2';
    case VertexFormat.F16x4: return 'float16x4';
    case VertexFormat.F32: return 'float32';
    case VertexFormat.F32x2: return 'float32x2';
    case VertexFormat.F32x3: return 'float32x3';
    case VertexFormat.F32x4: return 'float32x4';
  }
}

export function toWebGPURenderPassOperations<T>(clearValue?: T): WebGPURenderPassOperations<T> {
  return {
    clearValue,
    loadOp: clearValue === void 0 ? 'load' : 'clear',
    storeOp: 'store',
  } as WebGPURenderPassOperations<T>;
}

export function toRenderableGPUTextureView(
  view?: TextureView | null, useMsaaTex = false
): GPUTextureView | undefined {
  const texture = view?.texture as WebGPUTexture | undefined;
  return ((useMsaaTex && texture?.msaa) || texture?.tex)?.createView({
    dimension: '2d',
    baseMipLevel: view?.mipLevel,
    baseArrayLayer: view?.slice,
    mipLevelCount: 1,
    arrayLayerCount: 1,
  });
}
