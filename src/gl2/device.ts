import {
  BYTE_MASK, BufferBinding, BufferDescriptor, Canvas, Color, ColorMask, GL1Feature, GL2Feature, GLRenderingDevice,
  GLRenderingDeviceFactory, GLRenderingDeviceOptions, IndexFormat, indexSize, PipelineDescriptor, PrimitiveType,
  RenderPassContext, RenderPassDescriptor, SamplerDescriptor, TextureDescriptor, UniformValuesDescriptor,
  vertexNormalized, vertexSize, vertexType, UniformType
} from '../device';
import {
  GL_ARRAY_BUFFER, GL_BACK, GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_ELEMENT_ARRAY_BUFFER, GL_FLOAT,
  GL_FLOAT_MAT3, GL_FLOAT_MAT4, GL_FLOAT_VEC2, GL_FLOAT_VEC3, GL_FLOAT_VEC4, GL_FRAMEBUFFER, GL_FRONT,
  GL_MAX_VERTEX_ATTRIBS, GL_SCISSOR_TEST, GL_STENCIL_BUFFER_BIT, GL_TEXTURE0, GL_TRIANGLES, GL_UNIFORM_BUFFER,
  GL_UNSIGNED_SHORT
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

/**
 * Create a {@link GLRenderingDevice}.
 * @param canvas the canvas to be used
 * @param options context initialization options
 * @returns rendering device instance, or null if WebGL is not supported
 */
export const getGLDevice: GLRenderingDeviceFactory =
  (canvas: Canvas, options?: GLRenderingDeviceOptions): GLRenderingDevice | null => {
    let gl: WebGLRenderingContext | null = null;
    let isWebGL2 = false;
    if (options?.webgl2) {
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
export class WebGLRenderingDevice implements GLRenderingDevice {
  public readonly canvas: Canvas;

  private readonly renderCtx: WebGLRenderPassContext;
  private readonly exts: Readonly<Record<GL1Feature | GL2Feature, unknown>>;
  private readonly state: WebGLState;
  private readonly maxAttr: number;

  constructor(public readonly gl: WebGLRenderingContext, public readonly webgl2: boolean) {
    this.canvas = gl.canvas;
    this.maxAttr = Math.min(gl.getParameter(GL_MAX_VERTEX_ATTRIBS), MAX_VERTEX_ATTRIBS);

    const extensions = this.exts = <Record<GL1Feature | GL2Feature, unknown>>{};
    for (const ext of Object.values(webgl2 ? GL2Feature : GL1Feature)) {
      extensions[ext] = gl.getExtension(ext);
    }

    this.state = this.reset();
    this.renderCtx = new WebGLRenderPassContext(
      gl, webgl2, this.state, this.maxAttr, this.feature(GL1Feature.Instancing)
    );
  }

  public buffer(desc: BufferDescriptor): GLBuffer {
    return new GLBuffer(this, desc);
  }

  public texture(desc: TextureDescriptor, sampler?: SamplerDescriptor): GLTexture {
    return new GLTexture(this, desc, sampler);
  }

  public pipeline(desc: PipelineDescriptor): GLPipeline {
    return new GLPipeline(this, desc);
  }

  public pass(desc?: RenderPassDescriptor): GLRenderPass {
    return new GLRenderPass(this, desc);
  }

  public render(pass: GLRenderPass): RenderPassContext {
    let { width, height } = this.gl.canvas;
    if (pass.color.length) { // Offscreen pass
      [width, height] = pass.color[0].tex.size;
    }

    // Bind the pass framebuffer
    this.gl.bindFramebuffer(GL_FRAMEBUFFER, pass.glfb);

    // Reset viewport and scissor
    this.gl.viewport(0, 0, width, height);
    this.gl.depthRange(0, 1);

    if (this.state.scissor) {
      this.state.scissor = false;
      this.gl.disable(GL_SCISSOR_TEST);
    }

    // Clear buffers, temporarily override color/depth/stencil masks as necessary
    const blend = this.state.pipe.blend || DEFAULT_BLEND_STATE;
    const depth = this.state.pipe.depth || DEFAULT_DEPTH_STATE
    const stencil = this.state.pipe.stencil || DEFAULT_STENCIL_STATE;
    let clearMask = 0;
    if (pass.clearColor) {
      clearMask |= GL_COLOR_BUFFER_BIT;
      this.gl.clearColor(...pass.clearColor);
      applyColorMask(this.gl, blend.colorMask, ColorMask.All);
    }
    if (pass.clearDepth !== false) {
      clearMask |= GL_DEPTH_BUFFER_BIT;
      this.gl.clearDepth(pass.clearDepth);
      applyDepthMask(this.gl, depth.writeEnabled, true);
    }
    if (pass.clearStencil !== false) {
      clearMask |= GL_STENCIL_BUFFER_BIT;
      this.gl.clearStencil(pass.clearStencil);
      applyStencilMask(this.gl, stencil.writeMask, BYTE_MASK);
    }
    if (clearMask) {
      this.gl.clear(clearMask);
  
      // Restore masks
      if (clearMask & GL_COLOR_BUFFER_BIT) {
        applyColorMask(this.gl, ColorMask.All, blend.colorMask);
      }
      if (clearMask & GL_DEPTH_BUFFER_BIT) {
        applyDepthMask(this.gl, true, depth.writeEnabled);
      }
      if (clearMask & GL_STENCIL_BUFFER_BIT) {
        applyStencilMask(this.gl, BYTE_MASK, stencil.writeMask);
      }
    }

    this.renderCtx.pass = pass;
    return this.renderCtx;
  }

  public feature<F>(feature: GL1Feature | GL2Feature): F {
    return <F>this.exts[feature];
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
    applyPipelineState(this.gl, prevPipeState, pipeline, this.state.stencilRef);
    mergePipelineState(prevPipeState, pipeline);

    // Update buffer and vertex attribute cache
    const bufs = this.state.bufs = Array(pipeline.buffers.length);
    const newAttrs: (GLAttr | null)[] = Array(this.maxAttr).fill(null);
    const oldAttrs = this.state.attrs;
    this.state.attrs = newAttrs;
    for (let slot = 0; slot < pipeline.buffers.length; ++slot) {
      const { attrs, stride, instanced } = pipeline.buffers[slot];
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
    this.state.idxFmt = pipeline.indexFormat;

    // Cache primitive rendering mode
    this.state.mode = pipeline.mode;

    return this;
  }

  public index({ glb }: GLBuffer): RenderPassContext {
    if (glb !== this.state.idx) {
      this.gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, (this.state.idx = glb));
    }

    return this;
  }

  public vertex(slot: number, { glb }: GLBuffer): RenderPassContext {
    const buf = this.state.bufs[slot];
    if (buf && buf.glb !== glb) {
      this.gl.bindBuffer(GL_ARRAY_BUFFER, (buf.glb = glb));
      for (let i = 0; i < buf.attrs.length; ++i) {
        const { ptr, step } = buf.attrs[i];
        this.gl.vertexAttribPointer(...ptr);
        if (this.webgl2) {
          (<WebGL2RenderingContext>this.gl).vertexAttribDivisor(ptr[0], step);
        } else {
          this.extInst?.vertexAttribDivisorANGLE(ptr[0], step);
        }
      }
    }

    return this;
  }

  public uniforms(desc: UniformValuesDescriptor): RenderPassContext {
    if (!this.state.pipeObj) {
      return this; // Skipping updates. No effect if pipeline not bound
    }

    for (const key in desc) {
      const uniformInfo = this.state.pipeObj.cache[key];
      if (!uniformInfo) { // No such uniform
        if (process.env.DEBUG) {
          console.warn(`Unknown uniform: ${key}`);
        }
        continue;
      }

      const val = desc[key];
      if (uniformInfo.type === UniformType.Value) {
        if (Array.isArray(val) || ArrayBuffer.isView(val)) { // Array types
          switch (uniformInfo.format) {
            case GL_FLOAT_MAT4: this.gl.uniformMatrix4fv(uniformInfo.loc, false, val); break;
            case GL_FLOAT_MAT3: this.gl.uniformMatrix3fv(uniformInfo.loc, false, val); break;
            case GL_FLOAT_VEC4: this.gl.uniform4fv(uniformInfo.loc, val); break;
            case GL_FLOAT_VEC3: this.gl.uniform3fv(uniformInfo.loc, val); break;
            case GL_FLOAT_VEC2: this.gl.uniform2fv(uniformInfo.loc, val); break;
            case GL_FLOAT: this.gl.uniform1fv(uniformInfo.loc, val); break;
            default:
              if (process.env.DEBUG) {
                console.warn(`Cannot bind a number array to uniform: ${key}`);
              }
          }
        } else if (typeof val === 'number') { // Single number
          if (uniformInfo.format === GL_FLOAT) {
            this.gl.uniform1f(uniformInfo.loc, val);
          } else if (process.env.DEBUG) {
            console.warn(`Cannot bind a number to uniform: ${key}`);
          }
        } else if (process.env.DEBUG) {
          console.warn(`Invalid value bound to value uniform: ${key}`);
        }
      } else if (uniformInfo.type === UniformType.Tex) {
        if ((<GLTexture>val)?.glt) {
          this.gl.activeTexture(GL_TEXTURE0 + uniformInfo.binding);
          this.gl.bindTexture((<GLTexture>val).type, (<GLTexture>val).glt);
          this.gl.uniform1i(uniformInfo.loc, uniformInfo.binding);
        } else if (process.env.DEBUG) {
          console.warn(`Invalid value bound to texture uniform: ${key}`);
        }
      } else { // Uniform buffer
        if ((<BufferBinding>val)?.buffer?.type === GL_UNIFORM_BUFFER) {
          const offset = (<BufferBinding>val).offset || 0;
          (<WebGL2RenderingContext>this.gl)
            .bindBufferRange(GL_UNIFORM_BUFFER, uniformInfo.loc, (<GLBuffer>(<BufferBinding>val).buffer).glb,
              offset, (<BufferBinding>val).size || ((<GLBuffer>(<BufferBinding>val).buffer).size - offset));
        } else if (process.env.DEBUG) {
          console.warn(`Invalid value bound to uniform buffer: ${key}`);
        }
      }
    }

    return this;
  }

  public draw(vertexCount: number, instanceCount = 1, firstVertex = 0): RenderPassContext {
    if (instanceCount > 1 && (this.webgl2 || this.extInst)) {
      if (this.webgl2) {
        (<WebGL2RenderingContext>this.gl)
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
    const { mode, idxFmt } = this.state;
    const offset = firstIndex * indexSize(idxFmt);
    if (instanceCount > 1 && (this.webgl2 || this.extInst)) {
      if (this.webgl2) {
        (<WebGL2RenderingContext>this.gl)
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
      this.gl.enable(GL_SCISSOR_TEST);
      this.state.scissor = true;
    }
    this.gl.scissor(x, y, width, height);
    return this;
  }

  public blendColor(color: Color): RenderPassContext {
    this.gl.blendColor(...color);
    return this;
  }

  public stencilRef(ref: number): RenderPassContext {
    if (this.state.stencilRef !== ref) {
      const { frontCompare, backCompare, readMask } = this.state.pipe.stencil || DEFAULT_STENCIL_STATE;
      this.gl.stencilFuncSeparate(GL_FRONT, frontCompare, ref, readMask);
      this.gl.stencilFuncSeparate(GL_BACK, backCompare, ref, readMask);
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
  blend: Color;
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
  const blend: Color = [1, 1, 1, 1];
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
    idxFmt: GL_UNSIGNED_SHORT,
    mode: GL_TRIANGLES,
    pipe,
    blend,
    stencilRef,
    scissor: false
  }
}
