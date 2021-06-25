import {
  BYTE_MASK, BufferDescriptor, Canvas, Color, GL1Feature, GL2Feature, GLRenderingDevice, GLRenderingDeviceFactory,
  PipelineDescriptor, RenderPassContext, RenderPassDescriptor, SamplerDescriptor,
  TextureDescriptor, UniformValuesDescriptor, UniformValueLayout, vertexSize
} from '../device';
import {
  GL_FRAMEBUFFER, GL_SCISSOR_TEST, GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_STENCIL_BUFFER_BIT,
  GL_ELEMENT_ARRAY_BUFFER, GL_ARRAY_BUFFER, GL_TEXTURE0, GL_FRONT, GL_BACK, GL_UNSIGNED_SHORT, GL_ALWAYS,
  GL_FLOAT_VEC3, GL_FLOAT_VEC2, GL_FLOAT_VEC4, GL_FLOAT_MAT3, GL_FLOAT_MAT4, GL_FLOAT
} from '../device/glenums';
import { GL_EXT_INSTANCING, MAX_VERTEX_ATTRIBS } from './const';
import {
  NANOGL_ENABLE_BLEND, NANOGL_ENABLE_OFFSCREEN, NANOGL_ENABLE_SCISSOR, NANOGL_ENABLE_STENCIL,
  NANOGL_ENABLE_TEXTURE
} from './features';
import { GLBuffer, GLPipeline, GLRenderPass, GLTexture, applyPipelineState } from './resources';
import { EMPTY_TEXTURE, renderPassLite } from './stubs';

/**
 * Create a {@link GLRenderingDevice}.
 * @param canvas the canvas to be used
 * @param options context initialization options
 * @returns rendering device instance, or null if WebGL is not supported
 */
export const getNanoGLDevice: GLRenderingDeviceFactory =
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

  private readonly rctx: NanoGLRenderPassContext;
  private readonly exts: Readonly<Record<GL1Feature | GL2Feature, unknown>>;

  constructor(public readonly gl: WebGLRenderingContext) {
    this.canvas = gl.canvas;

    const extensions = this.exts = <Record<GL1Feature | GL2Feature, unknown>>{};
    extensions[GL_EXT_INSTANCING] = gl.getExtension(GL_EXT_INSTANCING);

    this.rctx = new NanoGLRenderPassContext(gl, this.feature(GL_EXT_INSTANCING));
  }

  public buffer(desc: BufferDescriptor): GLBuffer {
    return new GLBuffer(this.gl, desc);
  }

  public texture(desc: TextureDescriptor, sampler?: SamplerDescriptor): GLTexture {
    if (NANOGL_ENABLE_TEXTURE) {
      return new GLTexture(this.gl, desc, sampler);
    }
    return EMPTY_TEXTURE;
  }

  public pipeline(desc: PipelineDescriptor): GLPipeline {
    return new GLPipeline(this.gl, desc);
  }

  public pass(desc?: RenderPassDescriptor): GLRenderPass {
    if (NANOGL_ENABLE_TEXTURE && NANOGL_ENABLE_OFFSCREEN) {
      return new GLRenderPass(this.gl, desc);
    }
    return renderPassLite(desc);
  }

  public render(pass: GLRenderPass): RenderPassContext {
    let { width, height } = this.gl.canvas;
  
    if (NANOGL_ENABLE_OFFSCREEN) {
      if (pass.color[0]) {
        [width, height] = pass.color[0].tex.size;
      }
  
      // Bind the pass framebuffer
      this.gl.bindFramebuffer(GL_FRAMEBUFFER, pass.glfb);
    }

    // Reset viewport and scissor
    // CAVEAT: depthRange NOT supported and NOT reset
    this.gl.viewport(0, 0, width, height);
    if (NANOGL_ENABLE_SCISSOR) {
      this.gl.disable(GL_SCISSOR_TEST);
    }

    // Clear buffers
    let clearMask = 0;
    if (pass.clearColor) {
      clearMask |= GL_COLOR_BUFFER_BIT;
      this.gl.clearColor(...pass.clearColor);
      if (NANOGL_ENABLE_BLEND) {
        this.gl.colorMask(true, true, true, true);
      }
    }
    if (pass.clearDepth !== false) {
      clearMask |= GL_DEPTH_BUFFER_BIT;
      this.gl.clearDepth(pass.clearDepth);
      this.gl.depthMask(true);
    }
    if (NANOGL_ENABLE_STENCIL && (pass.clearStencil !== false)) {
      clearMask |= GL_STENCIL_BUFFER_BIT;
      this.gl.clearStencil(pass.clearStencil);
      this.gl.stencilMask(BYTE_MASK);
    }
    if (clearMask) {
      this.gl.clear(clearMask);
    }

    return this.rctx;
  }

  public feature<F>(extension: GL1Feature | GL2Feature): F {
    return <F>this.exts[extension];
  }

  public reset(): void {
    this.rctx.reset();
  }
}

class NanoGLRenderPassContext implements RenderPassContext {
  private state!: WebGLState;

  constructor(
    private readonly gl: WebGLRenderingContext,
    private readonly inst?: ANGLE_instanced_arrays
  ) {
    this.reset();
  }

  public reset(): void {
    this.state = {
      pipeObj: null,
      stencilRef: 0
    };
  }

  public pipeline(pipeline: GLPipeline): RenderPassContext {
    if (this.state.pipeObj !== pipeline) {
      this.state.pipeObj = pipeline;

      // Update shader program
      this.gl.useProgram(pipeline.glp);
      applyPipelineState(this.gl, pipeline, this.state.stencilRef);

      // Enable/Disable vertex attributes
      for (let i = 0; i < MAX_VERTEX_ATTRIBS; ++i) {
        this.gl.disableVertexAttribArray(i);
      }
      for (const { attrs } of pipeline.buffers) {
        for (const { shaderLoc } of attrs) {
          this.gl.enableVertexAttribArray(shaderLoc);
        }
      }
    }

    return this;
  }

  public index({ glb }: GLBuffer): RenderPassContext {
    this.gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, glb);
    return this;
  }

  public vertex(slot: number, { glb }: GLBuffer): RenderPassContext {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { attrs, stride, instanced } = this.state.pipeObj!.buffers[slot];
    this.gl.bindBuffer(GL_ARRAY_BUFFER, glb);
    for (const { format, offset, shaderLoc } of attrs) {
      // CAVEAT: No support for non-float vertex formats
      this.gl.vertexAttribPointer(shaderLoc, vertexSize(format), GL_FLOAT, false, stride, offset);
      this.inst?.vertexAttribDivisorANGLE(shaderLoc, instanced ? 1 : 0);
    }
    return this;
  }

  public uniforms(desc: UniformValuesDescriptor): RenderPassContext {
    // CAVEAT: must use a single call to set all uniforms, or else textures may be overridden!
    let texId = 0;
    for (const key in desc) {
      const val = desc[key];
      // CAVEAT: uniform buffer is unsupported
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const format = (this.state.pipeObj!.uniforms[key] as UniformValueLayout).format;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const loc = this.gl.getUniformLocation(this.state.pipeObj!.glp!, key);

      if (format && loc) {
        if ((<number[]>val).length) { // Array types
          switch (format) {
            case GL_FLOAT_MAT4: this.gl.uniformMatrix4fv(loc, false, <number[]>val); break;
            case GL_FLOAT_MAT3: this.gl.uniformMatrix3fv(loc, false, <number[]>val); break;
            case GL_FLOAT_VEC4: this.gl.uniform4fv(loc, <number[]>val); break;
            case GL_FLOAT_VEC3: this.gl.uniform3fv(loc, <number[]>val); break;
            case GL_FLOAT_VEC2: this.gl.uniform2fv(loc, <number[]>val); break;
            default: this.gl.uniform1fv(loc, <number[]>val);
          }
        } else if (typeof val === 'number') { // Single number
          this.gl.uniform1f(loc, val);
        } else if (NANOGL_ENABLE_TEXTURE) { // Texture
          this.gl.activeTexture(GL_TEXTURE0 + texId);
          this.gl.bindTexture((<GLTexture>val).type, (<GLTexture>val).glt);
          this.gl.uniform1i(loc, texId++);
        }
      }
    }

    return this;
  }

  public draw(vertexCount: number, instanceCount = 1, firstVertex = 0): RenderPassContext {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { mode } = this.state.pipeObj!;
    if (instanceCount > 1) {
      this.inst?.drawArraysInstancedANGLE(mode, firstVertex, vertexCount, instanceCount);
    } else {
      this.gl.drawArrays(mode, firstVertex, vertexCount);
    }
    return this;
  }

  public drawIndexed(indexCount: number, instanceCount = 1, firstIndex = 0): RenderPassContext {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { mode } = this.state.pipeObj!;
    if (instanceCount > 1) {
      this.inst?.drawElementsInstancedANGLE(mode, indexCount, GL_UNSIGNED_SHORT, firstIndex * 2, instanceCount);
    } else {
      this.gl.drawElements(mode, indexCount, GL_UNSIGNED_SHORT, firstIndex * 2);
    }
    return this;
  }

  public viewport(x: number, y: number, width: number, height: number): RenderPassContext {
    this.gl.viewport(x, y, width, height);
    // CAVEAT: depthRange NOT supported
    return this;
  }

  public scissor(x: number, y: number, width: number, height: number): RenderPassContext {
    if (NANOGL_ENABLE_SCISSOR) {
      this.gl.scissor(x, y, width, height);
    }
    return this;
  }

  public blendColor(color: Color): RenderPassContext {
    if (NANOGL_ENABLE_BLEND) {
      this.gl.blendColor(...color);
    }
    return this;
  }

  public stencilRef(stencilRef: number): RenderPassContext {
    if (NANOGL_ENABLE_STENCIL) {
      const stencil = this.state.pipeObj?.stencil;
      if (stencil) {
        const readMask = stencil.readMask ?? BYTE_MASK;
        this.gl.stencilFuncSeparate(GL_FRONT, stencil.frontCompare || GL_ALWAYS, stencilRef, readMask);
        this.gl.stencilFuncSeparate(GL_BACK, stencil.backCompare || GL_ALWAYS, stencilRef, readMask);
      }
      this.state.stencilRef = stencilRef;
    }
    return this;
  }

  public end(): void {
    // Nothing to do
  }
}

interface WebGLState {
  pipeObj: GLPipeline | null;
  stencilRef: number;
}
