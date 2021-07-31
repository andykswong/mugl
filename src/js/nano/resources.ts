/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { MUGL_DEBUG } from '../../config';
import {
  BufferDescriptor, BufferProperties, BYTE_MASK, GLBuffer as IGLBuffer, GLPipeline as IGLPipeline, GLRenderPass as IGLRenderPass, GLShader as IGLShader,
  GLTexture as IGLTexture, PipelineDescriptor, PipelineState, ReadonlyExtent3D, ReadonlyOrigin3D, RenderPassDescriptor, SamplerDescriptor,
  SamplerProperties, ShaderDescriptor, ShaderType, TextureData, TextureDescriptor, TextureProperties, VertexAttribute, vertexByteSize
} from '../device';
import { GLenum } from '../../common/gl';
import { COLOR_PIXEL_FORMAT, DEPTH_PIXEL_FORMAT } from './const';
import {
  NGL_ENABLE_OFFSCREEN, NGL_ENABLE_STENCIL, NGL_ENABLE_RASTER, NGL_ENABLE_BLEND, NGL_ENABLE_MRT
} from './config';
import { PipelineProperties, ReadonlyVertexBufferLayout } from '../../common/device/descriptor';
import { RenderPassProperties } from '../../common/device/descriptor';

export class GLBuffer implements IGLBuffer {
  public readonly props: BufferProperties;

  public glb: WebGLBuffer | null;

  public constructor(private readonly gl: WebGLRenderingContext, props: BufferDescriptor) {
    this.props = {
      type: GLenum.ARRAY_BUFFER,
      usage: GLenum.STATIC_DRAW,
      ...props
    };
    gl.bindBuffer(this.props.type, this.glb = gl.createBuffer());
    gl.bufferData(this.props.type, this.props.size, this.props.usage);
  }

  public data(data: ArrayBufferView, offset = 0): GLBuffer {
    this.gl.bindBuffer(this.props.type, this.glb);
    this.gl.bufferSubData(this.props.type, offset, data);
    return this;
  }

  public destroy(): void {
    this.gl.deleteBuffer(this.glb);
  }
}

export class GLTexture implements IGLTexture {
  public readonly props: TextureProperties;
  public readonly sampler: SamplerProperties;

  public glt: WebGLTexture | null = null;
  public glrb: WebGLRenderbuffer | null = null;

  public constructor(
    private readonly gl: WebGLRenderingContext,
    props: TextureDescriptor,
    sampler?: SamplerDescriptor
  ) {
    const p = this.props = {
      type: GLenum.TEXTURE_2D,
      format: COLOR_PIXEL_FORMAT,
      width: 1,
      height: 1,
      ...props
    } as TextureProperties;
    const s = this.sampler = {
      wrapU: GLenum.CLAMP_TO_EDGE,
      wrapV: GLenum.CLAMP_TO_EDGE,
      magFilter: GLenum.NEAREST,
      minFilter: GLenum.NEAREST,
      ...sampler
    } as SamplerProperties;

    // CAVEAT: Only supports RGBA8 vs DEPTH_STENCIL. No depth texture support
    if (p.format <= DEPTH_PIXEL_FORMAT) { // depth/stencil renderbuffer
      if (NGL_ENABLE_OFFSCREEN) {
        gl.bindRenderbuffer(GLenum.RENDERBUFFER, this.glrb = gl.createRenderbuffer());
        gl.renderbufferStorage(GLenum.RENDERBUFFER, NGL_ENABLE_STENCIL ? GLenum.DEPTH_STENCIL : GLenum.DEPTH_COMPONENT16,
          p.width, p.height);
      }
    } else { // RGBA8 texture
      gl.bindTexture(p.type, this.glt = gl.createTexture());
      gl.texParameteri(p.type, GLenum.TEXTURE_MIN_FILTER, s.minFilter);
      gl.texParameteri(p.type, GLenum.TEXTURE_MAG_FILTER, s.magFilter);
      gl.texParameteri(p.type, GLenum.TEXTURE_WRAP_S, s.wrapU);
      gl.texParameteri(p.type, GLenum.TEXTURE_WRAP_T, s.wrapV);
      gl.texImage2D(p.type, 0, GLenum.RGBA, p.width, p.height, 0, GLenum.RGBA, GLenum.UNSIGNED_BYTE, null);
    }
  }

  /**
   * Write data to the texture.
   * CAVEAT: Only writing to 2D RGBA8 texture is supported. No support for mipLevel
   */
  data(
    data: TextureData,
    [x, y]: ReadonlyOrigin3D = [0, 0, 0],
    [width, height]: ReadonlyExtent3D = [this.props.width - x,  this.props.height - y, 0]
  ): GLTexture {
    this.gl.bindTexture(this.props.type, this.glt);
    if (data.buffer) {
      this.gl.texSubImage2D(this.props.type, 0, x, y, width, height, GLenum.RGBA, GLenum.UNSIGNED_BYTE, data.buffer);
    } else if (data.image) {
      this.gl.texSubImage2D(this.props.type, 0, x, y, GLenum.RGBA, GLenum.UNSIGNED_BYTE, data.image);
    }

    return this;
  }

  /**
   * Generate mipmap for a texture object. CAVEAT: no support for mipmap hint.
   */
  mipmap(): GLTexture {
    this.gl.bindTexture(this.props.type!, this.glt);
    this.gl.generateMipmap(this.props.type!);
    return this;
  }

  destroy(): void {
    this.gl.deleteTexture(this.glt);
    this.gl.deleteRenderbuffer(this.glrb);
  }
}

export class GLRenderPass implements IGLRenderPass {
  public readonly props: RenderPassProperties;

  public glfb: WebGLFramebuffer | null = null;

  // CAVEAT: MSAA resolve unsupported
  public glrfb!: readonly WebGLFramebuffer[];

  public constructor(
    private readonly gl: WebGLRenderingContext,
    props: RenderPassDescriptor,
    drawBuffersExt?: WEBGL_draw_buffers
  ) {
    this.props = props as RenderPassProperties;
    if (props.color?.length) {
      // An offscreen pass, need to create a framebuffer with color and depth attachments
      gl.bindFramebuffer(GLenum.FRAMEBUFFER, this.glfb = gl.createFramebuffer());

      const count = (NGL_ENABLE_MRT && drawBuffersExt) ? props.color.length : 1;
      for (let i = 0; i < count; ++i) {
        gl.framebufferTexture2D(
          GLenum.FRAMEBUFFER, GLenum.COLOR_ATTACHMENT0 + i, props.color[i].tex.props.type,
          (props.color[i].tex as GLTexture).glt, 0
        );
      }

      if (NGL_ENABLE_MRT && count > 1) {
        drawBuffersExt!.drawBuffersWEBGL(props.color.map((_, i) => GLenum.COLOR_ATTACHMENT0 + i));
      }

      // Attach optional depth-stencil buffer to framebuffer
      // CAVEAT: Depth texture is not supported
      if (props.depth) {
        gl.framebufferRenderbuffer(GLenum.FRAMEBUFFER, NGL_ENABLE_STENCIL ? GLenum.DEPTH_STENCIL_ATTACHMENT : GLenum.DEPTH_ATTACHMENT,
          GLenum.RENDERBUFFER, (props.depth.tex as GLTexture).glrb);
      }

      if (MUGL_DEBUG) {
        console.assert(
          gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || gl.isContextLost(),
          'Framebuffer completeness check failed'
        );
      }
    }
  }

  public destroy(): void {
    this.gl.deleteFramebuffer(this.glfb);
  }

  public resolve(): void {
    // CAVEAT: MSAA resolve not supported for WebGL1
  }
}

export class GLShader implements IGLShader {
  public readonly type: ShaderType;
  public readonly source: string;

  public gls: WebGLShader;

  public constructor(
    private readonly gl: WebGLRenderingContext,
    props: ShaderDescriptor
  ) {
    const shader = this.gls = gl.createShader(this.type = props.type)!;
    gl.shaderSource(shader, this.source = props.source);
    gl.compileShader(shader);

    if (MUGL_DEBUG) {
      console.assert(
        gl.getShaderParameter(shader, GLenum.COMPILE_STATUS) || gl.isContextLost(),
        `Failed to compile shader: ${gl.getShaderInfoLog(shader)}`
      );
    }
  }

  destroy(): void {
    this.gl.deleteShader(this.gls);
  }
}

export class GLPipeline implements IGLPipeline {
  public readonly props: PipelineProperties;

  public glp: WebGLProgram | null;

  public constructor(private readonly gl: WebGLRenderingContext, props: PipelineDescriptor) {
    // CAVEAT: Auto calculated buffer offsets, stride and shaderLoc may not be what you expected.
    // TODO: Consider moving auto calculation to a shared util method
    let shaderLoc = 0;
    this.props = {
      mode: GLenum.TRIANGLES,
      indexFormat: GLenum.UNSIGNED_SHORT,
      ...props,
      buffers: props.buffers.map(({ attrs: descAttrs, stride, instanced = false }) => {
        const attrs: Required<VertexAttribute>[] = Array(descAttrs.length);
        let offset = 0;
        for (let j = 0; j < descAttrs.length; ++j, ++shaderLoc) {
          const { name, format, offset: curOffset = offset, shaderLoc: curShaderLoc = shaderLoc } = descAttrs[j];
          attrs[j] = { name, format, offset: curOffset, shaderLoc: curShaderLoc };
          offset = Math.max(offset, curOffset) + vertexByteSize(format);
        }
        return { attrs, stride: stride || offset, instanced };
      })
    } as PipelineProperties;

    this.glp = createProgram(gl, props.vert as IGLShader, props.frag as IGLShader, this.props.buffers);
  }

  destroy(): void {
    this.gl.deleteProgram(this.glp);
  }
}

export function applyPipelineState(
  gl: WebGLRenderingContext, state: PipelineState, stencilRef = 0
): void {
  const { blend, depth, stencil } = state;
  const raster = state.raster || {};

  // 1. Apply rasterizer state
  if (NGL_ENABLE_RASTER) {
    glToggle(gl, GLenum.SAMPLE_ALPHA_TO_COVERAGE, !!raster.alphaToCoverage);
    glToggle(gl, GLenum.CULL_FACE, !!raster.cullMode);
    glToggle(gl, GLenum.POLYGON_OFFSET_FILL, !!(raster.depthBiasSlopeScale || raster.depthBias));

    gl.polygonOffset(raster.depthBiasSlopeScale || 0, raster.depthBias || 0);

    if (raster.cullMode) {
      gl.cullFace(raster.cullMode);
    }
    gl.frontFace(raster.frontFace || GLenum.CCW);
  }

  // 2. Apply depth state changes
  glToggle(gl, GLenum.DEPTH_TEST, !!depth);

  if (depth) {
    gl.depthMask(!!depth.write);
    gl.depthFunc(depth.compare || GLenum.ALWAYS);
  }

  // 3. Apply stencil state changes
  if (NGL_ENABLE_STENCIL) {
    glToggle(gl, GLenum.STENCIL_TEST, !!stencil);

    if (stencil) {
      gl.stencilMask(stencil.writeMask ?? BYTE_MASK);
      const mask = stencil.readMask ?? BYTE_MASK;
      gl.stencilFuncSeparate(GLenum.FRONT, stencil.frontCompare || GLenum.ALWAYS, stencilRef, mask);
      gl.stencilFuncSeparate(GLenum.BACK, stencil.backCompare || GLenum.ALWAYS, stencilRef, mask);
      gl.stencilOpSeparate(GLenum.FRONT, stencil.frontFailOp || GLenum.KEEP, stencil.frontZFailOp || GLenum.KEEP,
        stencil.frontPassOp || GLenum.KEEP);
      gl.stencilOpSeparate(GLenum.BACK, stencil.backFailOp || GLenum.KEEP, stencil.backZFailOp || GLenum.KEEP,
        stencil.backPassOp || GLenum.KEEP);
    }
  }

  // 4. Apply blend state changes
  if (NGL_ENABLE_BLEND) {
    glToggle(gl, GLenum.BLEND, !!blend);

    if (blend) {
      const mask = blend.colorMask || BYTE_MASK;
      gl.colorMask(!!(mask & 1), !!(mask & 2), !!(mask & 4), !!(mask & 8));
      gl.blendFuncSeparate(
        blend.srcFactorRGB || GLenum.ONE, blend.dstFactorRGB || GLenum.ZERO,
        blend.srcFactorAlpha || GLenum.ONE, blend.dstFactorAlpha || GLenum.ZERO);
      gl.blendEquationSeparate(blend.opRGB || GLenum.FUNC_ADD, blend.opAlpha || GLenum.FUNC_ADD);
    }
  }
}

function glToggle(gl: WebGLRenderingContext, flag: GLenum, enable: boolean): void {
  enable ? gl.enable(flag) : gl.disable(flag);
}

export function createProgram(
  gl: WebGLRenderingContext, vs: IGLShader, fs: IGLShader, buffers: readonly ReadonlyVertexBufferLayout[]
): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, vs.gls!);
  gl.attachShader(program, fs.gls!);

  // Bind attribute locations
  for (const { attrs } of buffers) {
    for (const attr of attrs) {
      gl.bindAttribLocation(program, attr.shaderLoc, attr.name);
    }
  }

  // Link program
  gl.linkProgram(program);

  if (MUGL_DEBUG) {
    console.assert(
      gl.getProgramParameter(program, GLenum.LINK_STATUS) || gl.isContextLost(),
      `Failed to link program: ${gl.getProgramInfoLog(program)}`
    );
  }

  return program;
}
