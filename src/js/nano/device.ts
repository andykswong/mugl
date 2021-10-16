import {
  BYTE_MASK, BufferDescriptor, Canvas, GLRenderingDevice, GLRenderingDeviceFactory, PipelineDescriptor,
  ReadonlyColor, RenderPassContext, RenderPassDescriptor, SamplerDescriptor, TextureDescriptor, vertexSize,
  vertexType, vertexNormalized, indexSize, UniformBindings, ShaderDescriptor
} from '../device';
import { GLenum } from '../../common/gl';
import { GL_EXT_DRAW_BUFFERS, GL_EXT_INSTANCING, MAX_VERTEX_ATTRIBS } from './const';
import {
  NGL_ENABLE_BLEND, NGL_ENABLE_MRT, NGL_ENABLE_OFFSCREEN, NGL_ENABLE_SCISSOR, NGL_ENABLE_STENCIL, NGL_ENABLE_TEXTURE
} from './config';
import { GLBuffer, GLPipeline, GLRenderPass, GLShader, GLTexture, applyPipelineState } from './resources';
import { EMPTY_TEXTURE, renderPassLite } from './stubs';

/**
 * Create a {@link GLRenderingDevice}.
 * @param canvas the canvas to be used
 * @param options context initialization options
 * @returns rendering device instance, or null if WebGL is not supported
 */
export const getNGLDevice: GLRenderingDeviceFactory =
  (canvas: Canvas, options?: WebGLContextAttributes): GLRenderingDevice | null => {
    const gl: WebGLRenderingContext | null = canvas.getContext('webgl', options);
    if (!gl) {
      return null;
    }
    return new NanoGLRenderingDevice(gl);
  }

/**
 * The WebGL rendering context, in WebGPU API style.
 */
class NanoGLRenderingDevice implements GLRenderingDevice {
  public readonly webgl2 = false;
  public readonly canvas: Canvas;

  /** Render pass context. */
  private readonly r: NanoGLRenderPassContext;
  
  /** Draw buffers extension. */
  private readonly d: WEBGL_draw_buffers | undefined;

  constructor(public readonly gl: WebGLRenderingContext) {
    this.canvas = gl.canvas;
    if (NGL_ENABLE_MRT) {
      this.d = this.feature(GL_EXT_DRAW_BUFFERS);
    }
    this.r = new NanoGLRenderPassContext(gl, this.feature(GL_EXT_INSTANCING));
  }

  public get width(): number {
    return this.gl.drawingBufferWidth;
  }

  public get height(): number {
    return this.gl.drawingBufferHeight;
  }

  public buffer(desc: BufferDescriptor): GLBuffer {
    return new GLBuffer(this.gl, desc);
  }

  public texture(desc: TextureDescriptor, sampler?: SamplerDescriptor): GLTexture {
    if (NGL_ENABLE_TEXTURE) {
      return new GLTexture(this.gl, desc, sampler);
    }
    return EMPTY_TEXTURE;
  }

  public shader(desc: ShaderDescriptor): GLShader {
    return new GLShader(this.gl, desc);
  }

  public pipeline(desc: PipelineDescriptor): GLPipeline {
    return new GLPipeline(this.gl, desc);
  }

  public pass(desc: RenderPassDescriptor = {}): GLRenderPass {
    if (NGL_ENABLE_TEXTURE && NGL_ENABLE_OFFSCREEN) {
      return new GLRenderPass(this.gl, desc, this.d);
    }
    return renderPassLite(desc);
  }

  public render(pass: GLRenderPass): RenderPassContext {
    let width = this.width, height = this.height;
  
    if (NGL_ENABLE_OFFSCREEN) {
      if (pass.props.color) {
        ({ width, height } = pass.props.color[0].tex.props as Required<TextureDescriptor>);
      }
  
      // Bind the pass framebuffer
      this.gl.bindFramebuffer(GLenum.FRAMEBUFFER, pass.glfb);
    }

    // Reset viewport and scissor
    // CAVEAT: depthRange NOT supported and NOT reset
    this.gl.viewport(0, 0, width, height);
    if (NGL_ENABLE_SCISSOR) {
      this.gl.disable(GLenum.SCISSOR_TEST);
    }

    // Clear buffers
    let clearMask = 0;
    if (pass.props.clearColor) {
      clearMask |= GLenum.COLOR_BUFFER_BIT;
      this.gl.clearColor(...pass.props.clearColor);
      if (NGL_ENABLE_BLEND) {
        this.gl.colorMask(true, true, true, true);
      }
    }
    if (!isNaN(pass.props.clearDepth)) {
      clearMask |= GLenum.DEPTH_BUFFER_BIT;
      this.gl.clearDepth(pass.props.clearDepth);
      this.gl.depthMask(true);
    }
    if (NGL_ENABLE_STENCIL && !isNaN(pass.props.clearStencil)) {
      clearMask |= GLenum.STENCIL_BUFFER_BIT;
      this.gl.clearStencil(pass.props.clearStencil);
      this.gl.stencilMask(BYTE_MASK);
    }
    if (clearMask) {
      this.gl.clear(clearMask);
    }

    return this.r;
  }

  public feature<F>(extension: string): F {
    return this.gl.getExtension(extension);
  }

  public reset(): void {
    this.r.reset();
  }
}

class NanoGLRenderPassContext implements RenderPassContext {
  /** Current state. */
  private s!: WebGLState;

  constructor(
    private readonly gl: WebGLRenderingContext,
    private readonly inst?: ANGLE_instanced_arrays
  ) {
    this.reset();
  }

  public reset(): void {
    this.s = {
      p: null,
      r: 0
    };
  }

  public pipeline(pipeline: GLPipeline): RenderPassContext {
    if (this.s.p !== pipeline) {
      this.s.p = pipeline;

      // Update shader program
      this.gl.useProgram(pipeline.glp);
      applyPipelineState(this.gl, pipeline.props, this.s.r);

      // Enable/Disable vertex attributes
      for (let i = 0; i < MAX_VERTEX_ATTRIBS; ++i) {
        this.gl.disableVertexAttribArray(i);
      }
      for (const { attrs } of pipeline.props.buffers) {
        for (const { shaderLoc } of attrs) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.gl.enableVertexAttribArray(shaderLoc);
        }
      }
    }

    return this;
  }

  public index({ glb }: GLBuffer): RenderPassContext {
    this.gl.bindBuffer(GLenum.ELEMENT_ARRAY_BUFFER, glb);
    return this;
  }

  public vertex(slot: number, { glb }: GLBuffer): RenderPassContext {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { attrs, stride, instanced } = this.s.p!.props.buffers[slot];
    this.gl.bindBuffer(GLenum.ARRAY_BUFFER, glb);
    for (const { format, offset, shaderLoc } of attrs) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.gl.vertexAttribPointer(shaderLoc, vertexSize(format), vertexType(format), vertexNormalized(format), stride!, offset!);
      this.inst && this.inst.vertexAttribDivisorANGLE(shaderLoc, instanced ? 1 : 0);
    }
    return this;
  }

  public uniforms(bindings: UniformBindings): RenderPassContext {
    // CAVEAT: must use a single call to set all uniforms, or else textures may be overridden!
    let texId = 0;
    for (const binding of bindings) {
      // CAVEAT: uniform buffer is unsupported
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const loc = this.gl.getUniformLocation(this.s.p!.glp!, binding.name);

      if (loc) {
        if (binding.values || binding.valueBuffer) { // Array types
          // TODO: this is inefficient
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const uniform = this.s.p!.props.uniforms.find(u => u.name === binding.name);
          if (uniform) {
            switch (uniform.valueFormat) {
              case GLenum.FLOAT_MAT4: this.gl.uniformMatrix4fv(loc, false, (binding.values || binding.valueBuffer) as number[]); break;
              case GLenum.FLOAT_MAT3: this.gl.uniformMatrix3fv(loc, false, (binding.values || binding.valueBuffer) as number[]); break;
              // CAVEAT: mat2 uniform is not commonly used and thus disabled
              // case GLenum.FLOAT_MAT2: this.gl.uniformMatrix2fv(loc, false, (binding.values || binding.valueBuffer) as number[]); break;
              case GLenum.FLOAT_VEC4: this.gl.uniform4fv(loc, (binding.values || binding.valueBuffer) as number[]); break;
              case GLenum.FLOAT_VEC3: this.gl.uniform3fv(loc, (binding.values || binding.valueBuffer) as number[]); break;
              case GLenum.FLOAT_VEC2: this.gl.uniform2fv(loc, (binding.values || binding.valueBuffer) as number[]); break;
              default: this.gl.uniform1fv(loc, (binding.values || binding.valueBuffer) as number[]);
            }
          }
        } else if (NGL_ENABLE_TEXTURE && binding.tex) { // Texture
          this.gl.activeTexture(GLenum.TEXTURE0 + texId);
          this.gl.bindTexture(binding.tex.props.type, (binding.tex as GLTexture).glt);
          this.gl.uniform1i(loc, texId++);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        } else if (!isNaN(binding.value!)) { // Single number
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.gl.uniform1f(loc, binding.value!);
        }
      }
    }

    return this;
  }

  public draw(vertexCount: number, instanceCount = 1, firstVertex = 0): RenderPassContext {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { props: { mode }, i } = this.s.p!;
    if (i) {
      this.inst && this.inst.drawArraysInstancedANGLE(mode, firstVertex, vertexCount, instanceCount);
    } else {
      this.gl.drawArrays(mode, firstVertex, vertexCount);
    }
    return this;
  }

  public drawIndexed(indexCount: number, instanceCount = 1, firstIndex = 0): RenderPassContext {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { props: { indexFormat, mode }, i } = this.s.p!;
    if (i) {
      this.inst && this.inst.drawElementsInstancedANGLE(
        mode, indexCount, indexFormat, firstIndex * indexSize(indexFormat), instanceCount);
    } else {
      this.gl.drawElements(mode, indexCount, indexFormat, firstIndex * indexSize(indexFormat));
    }
    return this;
  }

  public viewport(x: number, y: number, width: number, height: number): RenderPassContext {
    this.gl.viewport(x, y, width, height);
    // CAVEAT: depthRange NOT supported
    return this;
  }

  public scissor(x: number, y: number, width: number, height: number): RenderPassContext {
    if (NGL_ENABLE_SCISSOR) {
      this.gl.scissor(x, y, width, height);
    }
    return this;
  }

  public blendColor(color: ReadonlyColor): RenderPassContext {
    if (NGL_ENABLE_BLEND) {
      this.gl.blendColor(...color);
    }
    return this;
  }

  public stencilRef(stencilRef: number): RenderPassContext {
    if (NGL_ENABLE_STENCIL) {
      const stencil = this.s.p && this.s.p.props.stencil;
      if (stencil) {
        const readMask = stencil.readMask ?? BYTE_MASK;
        this.gl.stencilFuncSeparate(GLenum.FRONT, stencil.frontCompare || GLenum.ALWAYS, stencilRef, readMask);
        this.gl.stencilFuncSeparate(GLenum.BACK, stencil.backCompare || GLenum.ALWAYS, stencilRef, readMask);
      }
      this.s.r = stencilRef;
    }
    return this;
  }

  public end(): void {
    // Nothing to do
  }
}

interface WebGLState {
  /** Current pipeline. */
  p: GLPipeline | null;

  /** Current stencil ref. */
  r: number;
}
