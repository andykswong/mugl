import { MUGL_DEBUG } from '../../common/config';
import {
  BYTE_MASK, BufferDescriptor, ColorMask, GLenum, IndexFormat, indexSize, PipelineDescriptor, PrimitiveType,
  RenderPassContext, RenderPassDescriptor, SamplerDescriptor, ShaderDescriptor, TextureDescriptor, UniformBindings,
  vertexNormalized, vertexSize, vertexType, UniformType, FloatList
} from '../../common';
import {
  Canvas, GL1Feature, GL2Feature, GLRenderingDevice, GLRenderingDeviceFactory, GLRenderingDeviceOptions, ReadonlyColor, UniformFormat
} from '../device';
import { MAX_VERTEX_ATTRIBS } from './const';
import { GLBuffer } from './buffer';
import { GLPipeline } from './pipeline';
import {
  applyColorMask, applyDepthMask, applyPipelineState, applyStencilMask, DEFAULT_BLEND_STATE, DEFAULT_DEPTH_STATE,
  DEFAULT_STENCIL_STATE, GLPipelineState, mergePipelineState, newGLPipelineState
} from './pipestate';
import { GLRenderPass } from './renderpass';
import { GLTexture } from './texture';
import { GLShader } from './shader';

/**
 * Create a {@link GLRenderingDevice}.
 * @param canvas the canvas to be used
 * @param options context initialization options
 * @returns rendering device instance, or null if WebGL is not supported
 */
export const getGLDevice: GLRenderingDeviceFactory =
  (canvas: Canvas, options: GLRenderingDeviceOptions = {}): GLRenderingDevice | null => {
    let gl: WebGLRenderingContext | null = null;
    let isWebGL2 = false;
    if (options.webgl2) {
      isWebGL2 = !!(gl = canvas.getContext('webgl2', options));
    }
    if (!gl) {
      gl = canvas.getContext('webgl', options) ||
        // @ts-ignore: try experimental-webgl for older browsers
        canvas.getContext('experimental-webgl', options);
    }
    if (!gl) {
      return null;
    }
    return new WebGLRenderingDevice(gl, isWebGL2);
  }

/**
 * The WebGL rendering context, in WebGPU API style.
 */
class WebGLRenderingDevice implements GLRenderingDevice {
  public readonly canvas: Canvas;

  private readonly renderCtx: WebGLRenderPassContext;
  private readonly state: WebGLState;
  private readonly maxAttr: number;

  constructor(public readonly gl: WebGLRenderingContext, public readonly webgl2: boolean) {
    this.canvas = gl.canvas;
    this.maxAttr = Math.min(gl.getParameter(GLenum.MAX_VERTEX_ATTRIBS), MAX_VERTEX_ATTRIBS);

    // Try to enable all used extensions by default
    for (const ext of Object.values(webgl2 ? GL2Feature : GL1Feature)) {
      this.feature(ext);
    }

    this.state = this.reset();
    this.renderCtx = new WebGLRenderPassContext(
      gl, webgl2, this.state, this.maxAttr, this.feature(GL1Feature.Instancing)
    );
  }

  public get width(): number {
    return this.gl.drawingBufferWidth;
  }

  public get height(): number {
    return this.gl.drawingBufferHeight;
  }

  public buffer(desc: BufferDescriptor): GLBuffer {
    return new GLBuffer(this, desc);
  }

  public texture(desc: TextureDescriptor, sampler?: SamplerDescriptor): GLTexture {
    return new GLTexture(this, desc, sampler);
  }

  public shader(desc: ShaderDescriptor): GLShader {
    return new GLShader(this, desc);
  }

  public pipeline(desc: PipelineDescriptor): GLPipeline {
    return new GLPipeline(this, desc);
  }

  public pass(desc?: RenderPassDescriptor): GLRenderPass {
    return new GLRenderPass(this, desc);
  }

  public render(pass: GLRenderPass): RenderPassContext {
    let width = this.width;
    let height = this.height;
    if (pass.props.color.length) { // Offscreen pass
      width = pass.props.color[0].tex.props.width;
      height = pass.props.color[0].tex.props.height;
    }

    // Bind the pass framebuffer
    this.gl.bindFramebuffer(GLenum.FRAMEBUFFER, pass.glfb);

    // Reset viewport and scissor
    this.gl.viewport(0, 0, width, height);
    this.gl.depthRange(0, 1);

    if (this.state.scissor) {
      this.state.scissor = false;
      this.gl.disable(GLenum.SCISSOR_TEST);
    }

    // Clear buffers, temporarily override color/depth/stencil masks as necessary
    const blend = this.state.pipe.blend || DEFAULT_BLEND_STATE;
    const depth = this.state.pipe.depth || DEFAULT_DEPTH_STATE
    const stencil = this.state.pipe.stencil || DEFAULT_STENCIL_STATE;
    let clearMask = 0;
    if (pass.props.clearColor) {
      clearMask |= GLenum.COLOR_BUFFER_BIT;
      this.gl.clearColor(...pass.props.clearColor);
      applyColorMask(this.gl, blend.colorMask, ColorMask.All);
    }
    if (!isNaN(pass.props.clearDepth)) {
      clearMask |= GLenum.DEPTH_BUFFER_BIT;
      this.gl.clearDepth(pass.props.clearDepth);
      applyDepthMask(this.gl, depth.write, true);
    }
    if (!isNaN(pass.props.clearStencil)) {
      clearMask |= GLenum.STENCIL_BUFFER_BIT;
      this.gl.clearStencil(pass.props.clearStencil);
      applyStencilMask(this.gl, stencil.writeMask, BYTE_MASK);
    }
    if (clearMask) {
      this.gl.clear(clearMask);

      // Restore masks
      if (clearMask & GLenum.COLOR_BUFFER_BIT) {
        applyColorMask(this.gl, ColorMask.All, blend.colorMask);
      }
      if (clearMask & GLenum.DEPTH_BUFFER_BIT) {
        applyDepthMask(this.gl, true, depth.write);
      }
      if (clearMask & GLenum.STENCIL_BUFFER_BIT) {
        applyStencilMask(this.gl, BYTE_MASK, stencil.writeMask);
      }
    }

    this.renderCtx.pass = pass;
    return this.renderCtx;
  }

  public feature<F>(feature: string): F {
    return this.gl.getExtension(feature);
  }

  public reset(): WebGLState {
    return Object.assign(this.state || {}, initState(this.gl, this.maxAttr));
  }
}

class WebGLRenderPassContext implements RenderPassContext {
  public pass: GLRenderPass | null = null;

  constructor(
    private readonly gl: WebGLRenderingContext,
    private readonly webgl2: boolean,
    private readonly state: WebGLState,
    private readonly maxAttr: number,
    private readonly extInst?: ANGLE_instanced_arrays
  ) { }

  public pipeline(pipeline: GLPipeline): RenderPassContext {
    // Optimization: pipeline unchanged, skip other updates
    if (this.state.pipeObj === pipeline) {
      return this;
    }

    // Update shader program
    if (!this.state.pipeObj || this.state.pipeObj.glp !== pipeline.glp) {
      this.gl.useProgram(pipeline.glp);
    }
    this.state.pipeObj = pipeline;

    // Update pipeline state cache
    const prevPipeState = this.state.pipe;
    applyPipelineState(this.gl, prevPipeState, pipeline.props, this.state.stencilRef);
    mergePipelineState(prevPipeState, pipeline.props);

    // Update buffer and vertex attribute cache
    const bufs = this.state.bufs = Array(pipeline.props.buffers.length);
    const newAttrs: (GLAttr | null)[] = Array(this.maxAttr).fill(null);
    const oldAttrs = this.state.attrs;
    this.state.attrs = newAttrs;
    for (let slot = 0; slot < pipeline.props.buffers.length; ++slot) {
      const { attrs, stride, instanced } = pipeline.props.buffers[slot];
      const bufAttrs: GLAttr[] = [];
      bufs[slot] = { glb: null, attrs: bufAttrs };
      for (const { format, offset, shaderLoc } of attrs) {
        bufAttrs.push(newAttrs[shaderLoc] = {
          buf: slot,
          ptr: [
            shaderLoc,
            vertexSize(format),
            vertexType(format),
            vertexNormalized(format),
            stride,
            offset
          ],
          step: instanced ? 1 : 0
        });
      }
    }

    // Enable / disable vertex attributes
    for (let i = 0; i < this.maxAttr; ++i) {
      if (newAttrs[i] && !oldAttrs[i]) {
        this.gl.enableVertexAttribArray(i);
      } else if (!newAttrs[i] && oldAttrs[i]) {
        this.gl.disableVertexAttribArray(i);
      }
    }

    // Update index format
    this.state.idxFmt = pipeline.props.indexFormat;

    // Cache primitive rendering mode
    this.state.mode = pipeline.props.mode;

    return this;
  }

  public index({ glb }: GLBuffer): RenderPassContext {
    if (glb !== this.state.idx) {
      this.gl.bindBuffer(GLenum.ELEMENT_ARRAY_BUFFER, (this.state.idx = glb));
    }

    return this;
  }

  public vertex(slot: number, { glb }: GLBuffer): RenderPassContext {
    const buf = this.state.bufs[slot];
    if (buf && buf.glb !== glb) {
      this.gl.bindBuffer(GLenum.ARRAY_BUFFER, (buf.glb = glb));
      for (let i = 0; i < buf.attrs.length; ++i) {
        const { ptr, step } = buf.attrs[i];
        this.gl.vertexAttribPointer(...ptr);
        if (this.webgl2) {
          (this.gl as WebGL2RenderingContext).vertexAttribDivisor(ptr[0], step);
        } else {
          this.extInst?.vertexAttribDivisorANGLE(ptr[0], step);
        }
      }
    }

    return this;
  }

  public uniforms(bindings: UniformBindings): RenderPassContext {
    if (!this.state.pipeObj) {
      return this; // Skipping updates. No effect if pipeline not bound
    }

    for (let i = 0; i < bindings.length; ++i) {
      const binding = bindings[i];
      const uniformInfo = this.state.pipeObj.cache[binding.name];
      if (!uniformInfo) { // No such uniform
        if (MUGL_DEBUG) {
          console.warn(`Unknown uniform: ${binding.name}`);
        }
        continue;
      }

      if (uniformInfo.type === UniformType.Value) {
        if (binding.values) { // Array types
          switch (uniformInfo.valueFormat) {
            case UniformFormat.Mat4: this.gl.uniformMatrix4fv(uniformInfo.loc, false, binding.values as FloatList); break;
            case UniformFormat.Mat3: this.gl.uniformMatrix3fv(uniformInfo.loc, false, binding.values as FloatList); break;
            case UniformFormat.Mat2: this.gl.uniformMatrix2fv(uniformInfo.loc, false, binding.values as FloatList); break;
            case UniformFormat.Vec4: this.gl.uniform4fv(uniformInfo.loc, binding.values as FloatList); break;
            case UniformFormat.Vec3: this.gl.uniform3fv(uniformInfo.loc, binding.values as FloatList); break;
            case UniformFormat.Vec2: this.gl.uniform2fv(uniformInfo.loc, binding.values as FloatList); break;
            case UniformFormat.Float: this.gl.uniform1fv(uniformInfo.loc, binding.values as FloatList); break;
            default:
              if (MUGL_DEBUG) {
                console.warn(`Cannot bind a number array to uniform: ${binding.name}`);
              }
          }
        } else if (binding.value || binding.value === 0) { // Single number
          if (uniformInfo.valueFormat === UniformFormat.Float) {
            this.gl.uniform1f(uniformInfo.loc, binding.value);
          } else if (MUGL_DEBUG) {
            console.warn(`Cannot bind a number to uniform: ${binding.name}`);
          }
        } else if (MUGL_DEBUG) {
          console.warn(`Invalid value bound to value uniform: ${binding.name}`);
        }
      } else if (uniformInfo.type === UniformType.Tex) {
        if (binding.tex) {
          this.gl.activeTexture(GLenum.TEXTURE0 + uniformInfo.binding);
          this.gl.bindTexture(binding.tex.props.type, (binding.tex as GLTexture).glt);
          this.gl.uniform1i(uniformInfo.loc, uniformInfo.binding);
        } else if (MUGL_DEBUG) {
          console.warn(`Invalid value bound to texture uniform: ${binding.name}`);
        }
      } else if (uniformInfo.type === UniformType.Buffer) { // Uniform buffer
        if (binding.buffer?.props.type === GLenum.UNIFORM_BUFFER) {
          const offset = binding.bufferOffset || 0;
          (this.gl as WebGL2RenderingContext)
            .bindBufferRange(
              GLenum.UNIFORM_BUFFER,
              uniformInfo.index,
              (binding.buffer as GLBuffer).glb,
              offset,
              binding.bufferSize || ((binding.buffer as GLBuffer).props.size - offset)
            );
        } else if (MUGL_DEBUG) {
          console.warn(`Invalid value bound to uniform buffer: ${binding.name}`);
        }
      }
    }

    return this;
  }

  public draw(vertexCount: number, instanceCount = 1, firstVertex = 0): RenderPassContext {
    if (!this.state.pipeObj) {
      return this; // Skipping draw call. No effect if pipeline not bound
    }

    if (this.state.pipeObj.instanced && (this.webgl2 || this.extInst)) {
      if (this.webgl2) {
        (this.gl as WebGL2RenderingContext)
          .drawArraysInstanced(this.state.mode, firstVertex, vertexCount, instanceCount);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.extInst!.drawArraysInstancedANGLE(this.state.mode, firstVertex, vertexCount, instanceCount);
      }
    } else {
      this.gl.drawArrays(this.state.mode, firstVertex, vertexCount);
    }
    return this;
  }

  public drawIndexed(indexCount: number, instanceCount = 1, firstIndex = 0): RenderPassContext {
    if (!this.state.pipeObj) {
      return this; // Skipping draw call. No effect if pipeline not bound
    }

    const { mode, idxFmt } = this.state;
    const offset = firstIndex * indexSize(idxFmt);
    if (this.state.pipeObj.instanced && (this.webgl2 || this.extInst)) {
      if (this.webgl2) {
        (this.gl as WebGL2RenderingContext)
          .drawElementsInstanced(mode, indexCount, idxFmt, offset, instanceCount);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.extInst!.drawElementsInstancedANGLE(mode, indexCount, idxFmt, offset, instanceCount);
      }
    } else {
      this.gl.drawElements(mode, indexCount, idxFmt, offset);
    }
    return this;
  }

  public viewport(x: number, y: number, width: number, height: number, minDepth = 0, maxDepth = 1): RenderPassContext {
    this.gl.viewport(x, y, width, height);
    this.gl.depthRange(minDepth, maxDepth);
    return this;
  }

  public scissor(x: number, y: number, width: number, height: number): RenderPassContext {
    if (!this.state.scissor) {
      this.gl.enable(GLenum.SCISSOR_TEST);
      this.state.scissor = true;
    }
    this.gl.scissor(x, y, width, height);
    return this;
  }

  public blendColor(color: ReadonlyColor): RenderPassContext {
    this.gl.blendColor(...color);
    return this;
  }

  public stencilRef(ref: number): RenderPassContext {
    if (this.state.stencilRef !== ref) {
      const { frontCompare, backCompare, readMask } = this.state.pipe.stencil || DEFAULT_STENCIL_STATE;
      this.gl.stencilFuncSeparate(GLenum.FRONT, frontCompare, ref, readMask);
      this.gl.stencilFuncSeparate(GLenum.BACK, backCompare, ref, readMask);
      this.state.stencilRef = ref;
    }
    return this;
  }

  public end(): void {
    this.pass?.resolve();
    this.pass = null;
  }
}

interface WebGLState {
  pipeObj: GLPipeline | null;
  bufs: GLBuf[];
  attrs: (GLAttr | null)[];
  idx: WebGLBuffer | null;
  idxFmt: IndexFormat;
  mode: PrimitiveType;
  pipe: GLPipelineState;
  blend: ReadonlyColor;
  stencilRef: number;
  scissor: boolean;
}

type GLAttr = {
  buf: number,
  ptr: [
    loc: number,
    size: number,
    type: number,
    normalized: boolean,
    stride: number,
    offset: number
  ],
  step: number
};

type GLBuf = {
  glb: WebGLBuffer | null,
  attrs: GLAttr[]
};

function initState(gl: WebGLRenderingContext, maxAttr: number): WebGLState {
  const pipe = newGLPipelineState();
  const blend: ReadonlyColor = [1, 1, 1, 1];
  const stencilRef = 0;

  // Apply the default states
  gl.useProgram(null);
  gl.blendColor(...blend);
  applyPipelineState(gl, pipe, pipe, stencilRef, true);
  for (let i = 0; i < maxAttr; ++i) {
    gl.disableVertexAttribArray(i);
  }

  return {
    pipeObj: null,
    bufs: [],
    attrs: [],
    idx: null,
    idxFmt: IndexFormat.UInt16,
    mode: PrimitiveType.Tri,
    pipe,
    blend,
    stencilRef,
    scissor: false
  }
}
