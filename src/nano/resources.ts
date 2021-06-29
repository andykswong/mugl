import { DeepReadonly, DeepRequired } from 'ts-essentials';
import {
  AddressMode, BlendStateDescriptor, BufferDescriptor, BufferType, BYTE_MASK, Color, DepthStateDescriptor,
  Extent3D, FilterMode, GLBuffer as IGLBuffer, GLPipeline as IGLPipeline, GLRenderPass as IGLRenderPass,
  GLTexture as IGLTexture, IndexFormat, MinFilterMode, Origin3D, PipelineDescriptor,
  PipelineStateDescriptor, PixelFormat, PrimitiveType, RasterizationStateDescriptor, RenderPassDescriptor,
  SamplerDescriptor, StencilStateDescriptor, TextureData, TextureDescriptor, TextureView, TexType,
  UniformLayoutDescriptor, Usage, VertexAttributeDescriptor, VertexBufferLayoutDescriptor, vertexSize
} from '../device';
import {
  GL_ALWAYS, GL_ARRAY_BUFFER, GL_BACK, GL_BLEND, GL_CCW, GL_CLAMP_TO_EDGE, GL_COLOR_ATTACHMENT0, GL_COMPILE_STATUS,
  GL_CULL_FACE, GL_DEPTH_ATTACHMENT, GL_DEPTH_COMPONENT16, GL_DEPTH_STENCIL, GL_DEPTH_STENCIL_ATTACHMENT,
  GL_DEPTH_TEST, GL_FRAGMENT_SHADER, GL_FRAMEBUFFER, GL_FRAMEBUFFER_COMPLETE, GL_FRONT, GL_FUNC_ADD, GL_KEEP,
  GL_LINEAR, GL_LINK_STATUS, GL_ONE, GL_POLYGON_OFFSET_FILL, GL_RENDERBUFFER, GL_RGBA,
  GL_SAMPLE_ALPHA_TO_COVERAGE, GL_STATIC_DRAW, GL_STENCIL_TEST, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER,
  GL_TEXTURE_MIN_FILTER, GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_TRIANGLES, GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT,
  GL_VERTEX_SHADER, GL_ZERO
} from '../device/glenums';
import { COLOR_PIXEL_FORMAT, DEPTH_PIXEL_FORMAT, VERTEX_FLOAT_BYTES } from './const';
import {
  NANOGL_ENABLE_OFFSCREEN, NANOGL_ENABLE_STENCIL, NANOGL_ENABLE_RASTER, NANOGL_ENABLE_BLEND
} from './features';

const EMPTY = {};
const EMPTY3: [number?, number?, number?] = [];

export class GLBuffer implements IGLBuffer {
  public readonly type: BufferType = GL_ARRAY_BUFFER;
  public readonly usage: Usage = GL_STATIC_DRAW;
  public readonly size: number = 0;

  public glb: WebGLBuffer | null;

  public constructor(private readonly gl: WebGLRenderingContext, desc: BufferDescriptor) {
    Object.assign(this, desc);
    gl.bindBuffer(this.type, this.glb = gl.createBuffer());
    gl.bufferData(this.type, this.size, this.usage);
  }

  public data(data: BufferSource, offset = 0): GLBuffer {
    this.gl.bindBuffer(this.type, this.glb);
    this.gl.bufferSubData(this.type, offset, data);
    return this;
  }

  public destroy(): void {
    this.gl.deleteBuffer(this.glb);
  }
}

export class GLTexture implements IGLTexture {
  public readonly type: TexType = GL_TEXTURE_2D;
  public readonly format: PixelFormat = COLOR_PIXEL_FORMAT;
  public readonly size!: Readonly<Required<Extent3D>>;

  public readonly wrapU: AddressMode = GL_CLAMP_TO_EDGE;
  public readonly wrapV: AddressMode = GL_CLAMP_TO_EDGE;
  public readonly magFilter: FilterMode = GL_LINEAR;
  public readonly minFilter: MinFilterMode = GL_LINEAR;

  // CAVEAT: Below params are all unsupported
  public readonly mipLevels!: number;
  public readonly samples!: number;
  public readonly renderTarget!: boolean;
  public readonly wrapW!: AddressMode;
  public readonly minLOD!: number;
  public readonly maxLOD!: number;
  public readonly maxAniso!: number;

  public glt: WebGLTexture | null;
  public glrb: WebGLRenderbuffer | null;

  public constructor(
    private readonly gl: WebGLRenderingContext,
    desc: TextureDescriptor, 
    sampler: SamplerDescriptor = EMPTY
  ) {
    Object.assign(this, desc, sampler);
    this.glt = this.glrb = null;

    // CAVEAT: Only supports RGBA8 vs DEPTH_STENCIL. No depth texture support
    const [width, height] = this.size;
    if (this.format <= DEPTH_PIXEL_FORMAT) { // depth/stencil renderbuffer
      if (NANOGL_ENABLE_OFFSCREEN) {
        gl.bindRenderbuffer(GL_RENDERBUFFER, this.glrb = gl.createRenderbuffer());
        gl.renderbufferStorage(GL_RENDERBUFFER, NANOGL_ENABLE_STENCIL ? GL_DEPTH_STENCIL : GL_DEPTH_COMPONENT16,
          width, height);
      }
    } else { // RGBA8 texture
      gl.bindTexture(this.type, this.glt = gl.createTexture());
      gl.texParameteri(this.type, GL_TEXTURE_MIN_FILTER, this.minFilter);
      gl.texParameteri(this.type, GL_TEXTURE_MAG_FILTER, this.magFilter);
      gl.texParameteri(this.type, GL_TEXTURE_WRAP_S, this.wrapU);
      gl.texParameteri(this.type, GL_TEXTURE_WRAP_T, this.wrapV);
      gl.texImage2D(this.type, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, null);
    }
  }

  /**
   * Write data to the texture.
   * CAVEAT: Only writing to 2D RGBA8 texture is supported. No support for mipLevel
   */
  data(
    data: TextureData,
    [x = 0, y = 0]: Origin3D = EMPTY3,
    [width = this.size[0] - x, height = this.size[1] - y]: Extent3D = EMPTY3
  ): GLTexture {
    this.gl.bindTexture(this.type, this.glt);
    if (ArrayBuffer.isView(data)) {
      this.gl.texSubImage2D(this.type, 0, x, y, width, height, GL_RGBA, GL_UNSIGNED_BYTE, data);
    } else {
      this.gl.texSubImage2D(this.type, 0, x, y, GL_RGBA, GL_UNSIGNED_BYTE, data);
    }

    return this;
  }

  /**
   * Generate mipmap for a texture object. CAVEAT: no support for mipmap hint.
   */
  mipmap(): GLTexture {
    this.gl.bindTexture(this.type, this.glt);
    this.gl.generateMipmap(this.type);
    return this;
  }

  destroy(): void {
    this.gl.deleteTexture(this.glt);
    this.gl.deleteRenderbuffer(this.glrb);
  }
}

export class GLRenderPass implements IGLRenderPass {
  public readonly color: readonly Readonly<Required<TextureView>>[] = [];
  public readonly depth: Readonly<Required<TextureView>> | null = null;
  public readonly clearColor: Color | false = false;
  public readonly clearDepth: number | false = false;
  public readonly clearStencil: number | false = false;

  public glfb: WebGLFramebuffer | null;

  // CAVEAT: MSAA resolve unsupported
  public glrfb!: readonly (WebGLFramebuffer | null)[];

  public constructor(
    private readonly gl: WebGLRenderingContext,
    desc: RenderPassDescriptor = EMPTY
  ) {
    Object.assign(this, desc);

    this.glfb = null;
    if (this.color[0]) {
      // An offscreen pass, need to create a framebuffer with color- and depth attachments
      // CAVEAT: MRT is not supported
      gl.bindFramebuffer(GL_FRAMEBUFFER, this.glfb = gl.createFramebuffer());
      gl.framebufferTexture2D(
        GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, this.color[0].tex.type, (<GLTexture>this.color[0].tex).glt, 0
      );

      // Attach optional depth-stencil buffer to framebuffer
      // CAVEAT: Depth texture is not supported
      if (this.depth) {
        gl.framebufferRenderbuffer(GL_FRAMEBUFFER, NANOGL_ENABLE_STENCIL ? GL_DEPTH_STENCIL_ATTACHMENT : GL_DEPTH_ATTACHMENT,
          GL_RENDERBUFFER, (<GLTexture>this.depth.tex).glrb);
      }
  
      if (process.env.DEBUG) {
        console.assert(
          gl.checkFramebufferStatus(GL_FRAMEBUFFER) === GL_FRAMEBUFFER_COMPLETE || gl.isContextLost(),
          'Framebuffer completeness check failed'
        );
      }
    }
  }

  public destroy(): void {
    this.gl.deleteFramebuffer(this.glfb);
  }

  public resolve(): void {
    // CAVEAT: MSAA resolve not supported
  }
}

export class GLPipeline implements IGLPipeline {
  public readonly vert!: string;
  public readonly frag!: string;
  public readonly mode: PrimitiveType = GL_TRIANGLES;
  public readonly indexFormat: IndexFormat = GL_UNSIGNED_SHORT;
  public readonly buffers: readonly DeepRequired<DeepReadonly<VertexBufferLayoutDescriptor>>[];
  public readonly uniforms!: DeepRequired<DeepReadonly<UniformLayoutDescriptor>>;
  public readonly raster!: Required<Readonly<RasterizationStateDescriptor>>;
  public readonly depth!: Required<Readonly<DepthStateDescriptor>> | false;
  public readonly stencil!: Required<Readonly<StencilStateDescriptor>> | false;
  public readonly blend!: Required<Readonly<BlendStateDescriptor>> | false;

  public glp: WebGLProgram | null;

  public constructor(private readonly gl: WebGLRenderingContext, desc: PipelineDescriptor) {
    Object.assign(this, desc);

    // CAVEAT: Auto calculated buffer offsets, stride and shaderLoc may not be what you expected.
    // TODO: Consider moving auto calculation to a shared util method
    let shaderLoc = 0;
    this.glp = createProgram(gl, desc.vert, desc.frag,
      this.buffers = desc.buffers.map(({ attrs: descAttrs, stride, instanced = false }) => {
        const attrs: Required<VertexAttributeDescriptor>[] = Array(descAttrs.length);
        let offset = 0;
        for (let j = 0; j < descAttrs.length; ++j, ++shaderLoc) {
          const { name, format, offset: curOffset = offset, shaderLoc: curShaderLoc = shaderLoc } = descAttrs[j];
          attrs[j] = { name, format, offset: curOffset, shaderLoc: curShaderLoc };
          // CAVEAT: No support for non-float vertex formats
          offset = Math.max(offset, curOffset) + VERTEX_FLOAT_BYTES * vertexSize(format);
        }
        return { attrs, stride: stride || offset, instanced };
      })
    );
  }

  destroy(): void {
    this.gl.deleteProgram(this.glp);
  }
}

export function applyPipelineState(
  gl: WebGLRenderingContext, state: PipelineStateDescriptor, stencilRef = 0
): void {
  const { blend, depth, stencil, raster } = state;

  // 1. Apply rasterizer state
  if (NANOGL_ENABLE_RASTER) {
    if (raster) {
      glToggle(gl, GL_SAMPLE_ALPHA_TO_COVERAGE, !!raster.alphaToCoverage);
      glToggle(gl, GL_CULL_FACE, !!raster.cullMode);
      glToggle(gl, GL_POLYGON_OFFSET_FILL, !!(raster.depthBiasSlopeScale || raster.depthBias));

      gl.polygonOffset(raster.depthBiasSlopeScale || 0, raster.depthBias || 0);

      if (raster.cullMode) {
        gl.cullFace(raster.cullMode);
      }
      gl.frontFace(raster.frontFace || GL_CCW);
    }
  }

  // 2. Apply depth state changes
  glToggle(gl, GL_DEPTH_TEST, !!depth);

  if (depth) {
    gl.depthMask(!!depth.writeEnabled);
    gl.depthFunc(depth.compare || GL_ALWAYS);
  }

  // 3. Apply stencil state changes
  if (NANOGL_ENABLE_STENCIL) {
    glToggle(gl, GL_STENCIL_TEST, !!stencil);

    if (stencil) {
      gl.stencilMask(stencil.writeMask ?? BYTE_MASK);
      const mask = stencil.readMask ?? BYTE_MASK;
      gl.stencilFuncSeparate(GL_FRONT, stencil.frontCompare || GL_ALWAYS, stencilRef, mask);
      gl.stencilFuncSeparate(GL_BACK, stencil.backCompare || GL_ALWAYS, stencilRef, mask);
      gl.stencilOpSeparate(GL_FRONT, stencil.frontFailOp || GL_KEEP, stencil.frontZFailOp || GL_KEEP,
        stencil.frontPassOp || GL_KEEP);
      gl.stencilOpSeparate(GL_BACK, stencil.backFailOp || GL_KEEP, stencil.backZFailOp || GL_KEEP,
        stencil.backPassOp || GL_KEEP);
    }
  }

  // 4. Apply blend state changes
  if (NANOGL_ENABLE_BLEND) {
    glToggle(gl, GL_BLEND, !!blend);

    if (blend) {
      const mask = blend.colorMask || BYTE_MASK;
      gl.colorMask(!!(mask & 1), !!(mask & 2), !!(mask & 4), !!(mask & 8));
      gl.blendFuncSeparate(
        blend.srcFactorRGB || GL_ONE, blend.dstFactorRGB || GL_ZERO,
        blend.srcFactorAlpha || GL_ONE, blend.dstFactorAlpha || GL_ZERO);
      gl.blendEquationSeparate(blend.opRGB || GL_FUNC_ADD, blend.opAlpha || GL_FUNC_ADD);
    }
  }
}

function glToggle(gl: WebGLRenderingContext, flag: GLenum, enable: boolean): void {
  enable ? gl.enable(flag) : gl.disable(flag);
}

export function createProgram(
  gl: WebGLRenderingContext, vert: string, frag: string,
  buffers: DeepReadonly<DeepRequired<VertexBufferLayoutDescriptor>>[]
): WebGLProgram | null {
  const vs = createShader(gl, GL_VERTEX_SHADER, vert);
  const fs = createShader(gl, GL_FRAGMENT_SHADER, frag);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);

  // Bind attribute locations
  for (const { attrs } of buffers) {
    for (const attr of attrs) {
      gl.bindAttribLocation(program, attr.shaderLoc, attr.name);
    }
  }

  // Link program then free up shaders
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (process.env.DEBUG) {
    console.assert(
      gl.getProgramParameter(program, GL_LINK_STATUS) || gl.isContextLost(),
      `Failed to link program: ${gl.getProgramInfoLog(program)}`
    );
  }

  return program;
}

function createShader(gl: WebGLRenderingContext, shaderType: number, source: string): WebGLShader {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const shader = gl.createShader(shaderType)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (process.env.DEBUG) {
    console.assert(
      gl.getShaderParameter(shader, GL_COMPILE_STATUS) || gl.isContextLost(),
      `Failed to compile shader: ${gl.getShaderInfoLog(shader)}`
    );
  }

  return shader;
}
