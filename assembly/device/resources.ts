import {
  BufferProperties, MipmapHint, Pipeline, PipelineProperties, ReadonlyExtent3D, ReadonlyOrigin3D, ReadonlyVertexAttribute, RenderPass, RenderPassProperties, SamplerProperties, Shader, ShaderDescriptor, ShaderType, TextureData, TextureProperties, Uint, UniformType, VertexFormat
} from '../../src/common';
import { BlendState, DepthState, StencilState } from '../../src/common/device/descriptor/index';
import { Buffer, Texture } from '../../src/common/device/resources/index';
import {
  bufferData, createBuffer, BufferId, RenderingDeviceId, deleteBuffer, ShaderId, createShader, deleteShader, deleteTexture, TextureId, createTexture, mipmap, textureBuffers, textureImages, RenderPassId, deleteRenderPass, resolveRenderPass, createRenderPass, PipelineId, deletePipeline, createPipeline
} from '../mugl';

export class GLBuffer extends Buffer {
  public readonly id: BufferId;

  public constructor(
    deviceId: RenderingDeviceId,
    private readonly _props: BufferProperties
  ) {
    super();
    this.id = createBuffer(deviceId, _props.type, _props.size, _props.usage);
  }

  public get props(): BufferProperties {
    return this._props;
  }

  public data(data: ArrayBufferView, offset: Uint = 0): GLBuffer {
    bufferData(this.id, data, offset);
    return this;
  }

  public destroy(): void {
    deleteBuffer(this.id);
  }
}


export class GLTexture extends Texture {
  public readonly id: TextureId;

  public constructor(
    deviceId: RenderingDeviceId,
    private readonly _props: TextureProperties,
    private readonly _sampler: SamplerProperties
  ) {
    super();
    this.id = createTexture(
      deviceId,
      _props.type, _props.format, _props.width, _props.height, _props.depth, _props.mipLevels, _props.samples, _props.renderTarget,
      _sampler.wrapU, _sampler.wrapV, _sampler.wrapW, _sampler.magFilter, _sampler.minFilter, _sampler.minLOD, _sampler.maxLOD, _sampler.maxAniso
    );
  }

  public get props(): TextureProperties {
    return this._props;
  }

  public get sampler(): SamplerProperties {
    return this._sampler;
  }

  public data(
    data: TextureData, origin: ReadonlyOrigin3D = [0, 0, 0], extent: ReadonlyExtent3D = [0, 0, 0], mipLevel: Uint = 0
  ): GLTexture {
    const buffer = data.buffer;
    const buffers = data.buffers;
    const image = data.image;
    const images = data.images;
    if (buffer) {
      textureBuffers(this.id, [buffer], origin, extent, mipLevel);
    } else if (buffers) {
      textureBuffers(this.id, buffers, origin, extent, mipLevel);
    } else if (image) {
      textureImages(this.id, [image], origin, extent, mipLevel);
    } else if (images) {
      textureImages(this.id, images, origin, extent, mipLevel);
    }
    return this;
  }

  public mipmap(hint: MipmapHint = MipmapHint.None): GLTexture {
    mipmap(this.id, hint);
    return this;
  }

  public destroy(): void {
    deleteTexture(this.id);
  }
}

export class GLShader implements Shader {
  public readonly id: ShaderId;
  private readonly _type: ShaderType;
  private readonly _source: string;

  public constructor(deviceId: RenderingDeviceId, desc: ShaderDescriptor) {
    this._type = desc.type;
    this._source = desc.source;
    this.id = createShader(deviceId, this._type, this._source);
  }

  public get type(): ShaderType {
    return this._type;
  }

  public get source(): string {
    return this._source;
  }

  public destroy(): void {
    deleteShader(this.id);
  }
}

export class GLRenderPass implements RenderPass {
  public readonly id: RenderPassId;

  public constructor(
    deviceId: RenderingDeviceId,
    private readonly _props: RenderPassProperties
  ) {
    const hasColor = _props.color.length > 0;
    const depth = _props.depth;
    this.id = createRenderPass(deviceId,
      hasColor ? _props.color.map<TextureId>(color => (color.tex as GLTexture).id) : null,
      hasColor ? _props.color.map<Uint>(color => color.mipLevel) : null,
      hasColor ? _props.color.map<Uint>(color => color.slice) : null,
      depth ? (depth.tex as GLTexture).id : 0,
      depth ? depth.mipLevel : 0,
      depth ? depth.slice : 0,
      _props.clearColor, _props.clearDepth, _props.clearStencil
    );
  }

  public get props(): RenderPassProperties {
    return this._props;
  }

  public resolve(): void {
    resolveRenderPass(this.id);
  }

  public destroy(): void {
    deleteRenderPass(this.id);
  }
}

export class GLPipeline implements Pipeline {
  public readonly id: PipelineId;

  public constructor(
    deviceId: RenderingDeviceId,
    private readonly _props: PipelineProperties
  ) {
    const attrNames: string[] = [];
    const attrBufferIds: Uint[] = [];
    const attrFormats: VertexFormat[] = [];
    const attrShaderLoc: Uint[] = [];
    const attrOffsets: Uint[] = [];
    for (let i = 0; i < _props.buffers.length; ++i) {
      const attrs: ReadonlyVertexAttribute[] = _props.buffers[i].attrs;
      for (let j = 0; j < attrs.length; ++j) {
        attrNames.push(attrs[j].name);
        attrBufferIds.push(i);
        attrFormats.push(attrs[j].format);
        attrShaderLoc.push(attrs[j].shaderLoc);
        attrOffsets.push(attrs[j].offset);
      }
    }

    const _depth = _props.depth;
    const _stencil = _props.stencil;
    const _blend = _props.blend;
    const depth: DepthState = _depth ? _depth : {} as DepthState;
    const stencil: StencilState =_stencil ? _stencil : {} as StencilState;
    const blend: BlendState = _blend ? _blend : {} as BlendState;

    this.id = createPipeline(deviceId,
      (_props.vert as GLShader).id, (_props.frag as GLShader).id, _props.indexFormat, _props.mode,
      _props.buffers.map<Uint>(layout => (layout.stride << 1) + (layout.instanced ? 1 : 0)),
      attrNames, attrBufferIds, attrFormats, attrShaderLoc, attrOffsets,
      _props.uniforms.length ? _props.uniforms.map<string>(uniform => uniform.name) : null,
      _props.uniforms.length ? _props.uniforms.map<UniformType>(uniform => uniform.type) : null,
      _props.uniforms.length ? _props.uniforms.map<Uint>(uniform => (uniform.type === UniformType.Tex) ? uniform.texType : uniform.valueFormat) : null,
      _props.raster.frontFace, _props.raster.cullMode, _props.raster.depthBias, _props.raster.depthBiasSlopeScale, _props.raster.alphaToCoverage,
      !!_props.depth, depth.write, depth.compare,
      !!_props.stencil, stencil.frontCompare, stencil.frontFailOp, stencil.frontZFailOp, stencil.frontPassOp,
      stencil.backCompare, stencil.backFailOp, stencil.backZFailOp, stencil.backPassOp, stencil.readMask, stencil.writeMask,
      !!_props.blend, blend.srcFactorRGB, blend.dstFactorRGB, blend.opRGB,
      blend.srcFactorAlpha, blend.dstFactorAlpha, blend.opAlpha, blend.colorMask
    );
  }

  public get props(): PipelineProperties {
    return this._props;
  }

  public destroy(): void {
    deletePipeline(this.id);
  }
}
