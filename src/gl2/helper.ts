import { MUGL_DEBUG } from '../config';
import * as GLenum from '../gpu/gl-const';
import { BlendComponent, ColorWrite, Device, RenderPipelineState, TextureView, UInt, is3DTexture } from '../gpu';
import {
  WebGL2BufferAttributes, WebGL2Device, WebGL2PipelineBlendState, WebGL2PipelineState, WebGL2State, WebGL2Texture
} from './model';

const STENCIL_MASK = 0xFFFFFFFF;

/**
 * Returns if device context is lost.
 * @param device the GPU device
 * @returns true if device context is lost
 */
export function isDeviceLost(device: Device): boolean {
  return (device as WebGL2Device).gl.isContextLost();
}

//#region State functions

export function initWebGL2State(gl: WebGL2RenderingContext): WebGL2State {
  const state = createPipelineState();

  // Apply the default states

  gl.blendColor(1, 1, 1, 1);
  applyPipelineState(gl, null, state, state, 0, true);

  const maxAttribs = gl.getParameter(GLenum.MAX_VERTEX_ATTRIBS);
  for (let i = 0; i < maxAttribs; ++i) {
    gl.disableVertexAttribArray(i);
  }

  // Default alignment is 4. Use 1 to make byte data texture work.
  gl.pixelStorei(GLenum.PACK_ALIGNMENT, 1);
  gl.pixelStorei(GLenum.UNPACK_ALIGNMENT, 1);

  return {
    copyFrameBuffer: gl.createFramebuffer(),
    buffers: [],
    state,
    pipeline: null,
    index: null,
    stencilRef: 0,
    scissor: false
  };
}

export function createPipelineState(desc: RenderPipelineState = {}): WebGL2PipelineState {
  const primitive = desc.primitive || {};
  const depthStencil = desc.depthStencil || {};
  const { stencilFront = {}, stencilBack = {} } = depthStencil;
  const { sampleCount = 1, alphaToCoverage = false } = desc.multisample || {};
  const targets = desc.targets || {};
  const drawBuffers = (targets.targets && targets.targets.map((target) =>
    createPipelineBlendState(target.blendColor, target.blendAlpha, target.writeMask)
  )) || [];

  return {
    sampleCount,
    alphaToCoverage,

    topology: primitive.topology || GLenum.TRIANGLES,
    indexFormat: primitive.indexFormat || GLenum.UNSIGNED_SHORT,
    frontFace: primitive.frontFace || GLenum.CCW,
    cullMode: primitive.cullMode || GLenum.NONE,

    depth: !!desc.depthStencil,
    depthWrite: depthStencil.depthWrite || false,
    depthFormat: depthStencil.format || GLenum.DEPTH_COMPONENT16,
    depthCompare: depthStencil.depthCompare || GLenum.ALWAYS,
    depthBias: depthStencil.depthBias || 0,
    depthBiasSlopeScale: depthStencil.depthBiasSlopeScale || 0,

    stencil: !!(depthStencil.stencilFront || depthStencil.stencilBack),
    stencilFrontCompare: stencilFront.compare || GLenum.ALWAYS,
    stencilFrontFailOp: stencilFront.failOp || GLenum.KEEP,
    stencilFrontDepthFailOp: stencilFront.depthFailOp || GLenum.KEEP,
    stencilFrontPassOp: stencilFront.passOp || GLenum.KEEP,
    stencilBackCompare: stencilBack.compare || GLenum.ALWAYS,
    stencilBackFailOp: stencilBack.failOp || GLenum.KEEP,
    stencilBackDepthFailOp: stencilBack.depthFailOp || GLenum.KEEP,
    stencilBackPassOp: stencilBack.passOp || GLenum.KEEP,
    stencilReadMask: depthStencil.stencilReadMask || STENCIL_MASK,
    stencilWriteMask: depthStencil.stencilWriteMask || STENCIL_MASK,

    blend: !!desc.targets,
    drawBuffers,
    ...createPipelineBlendState(targets.blendColor, targets.blendAlpha, targets.writeMask)
  };
}

function createPipelineBlendState(
  blendColor: BlendComponent = {}, blendAlpha: BlendComponent = {}, blendWriteMask: ColorWrite = ColorWrite.All
): WebGL2PipelineBlendState {
  return {
    blendWriteMask,
    blendColorOp: blendColor.operation || GLenum.FUNC_ADD,
    blendColorSrcFactor: blendColor.srcFactor !== void 0 ? blendColor.srcFactor : GLenum.ONE,
    blendColorDstFactor: blendColor.dstFactor || GLenum.ZERO,
    blendAlphaOp: blendAlpha.operation || GLenum.FUNC_ADD,
    blendAlphaSrcFactor: blendAlpha.srcFactor !== void 0 ? blendAlpha.srcFactor : GLenum.ONE,
    blendAlphaDstFactor: blendAlpha.dstFactor || GLenum.ZERO,
  };
}

export function applyPipelineState(
  gl: WebGL2RenderingContext, extDrawBuffersi: OES_draw_buffers_indexed | null,
  prevState: WebGL2PipelineState, state: WebGL2PipelineState, stencilRef = 0,
  force = false
): void {
  // Temporary variables to reuse for performance
  let b = false, n = 0, n2 = 0, n3 = 0, n4 = 0;

  // 1. Apply primitive state
  n = state.frontFace;
  if (force || (prevState.frontFace !== n)) {
    gl.frontFace(n);
  }
  n = state.cullMode;
  if (force || (prevState.cullMode !== n)) {
    if ((b = (n !== GLenum.NONE))) {
      gl.cullFace(n);
    }
    glToggle(gl, GLenum.CULL_FACE, b);
  }

  // 2. Apply multisample state
  b = state.alphaToCoverage;
  if (force || (prevState.alphaToCoverage !== b)) {
    glToggle(gl, GLenum.SAMPLE_ALPHA_TO_COVERAGE, b);
  }

  // 3. Apply depth state changes
  b = !!state.depth;
  if (force || (prevState.depth !== b)) {
    glToggle(gl, GLenum.DEPTH_TEST, b);
  }

  if (force || b) {
    applyDepthMask(gl, prevState.depthWrite, state.depthWrite, force);

    n = state.depthCompare;
    if (force || (prevState.depthCompare !== n)) {
      gl.depthFunc(n);
    }
  }

  n = state.depthBiasSlopeScale;
  n2 = state.depthBias;
  if (force || (prevState.depthBiasSlopeScale !== n) || (prevState.depthBias !== n2)) {
    glToggle(gl, GLenum.POLYGON_OFFSET_FILL, !(!n && !n2)); // Enable if any of the 2 values is non-zero
    gl.polygonOffset(n, n2);
  }

  // 4. Apply stencil state changes
  b = !!state.stencil;
  if (force || (prevState.stencil !== b)) {
    glToggle(gl, GLenum.STENCIL_TEST, b);
  }

  if (force || b) {
    n = state.stencilReadMask;
    b = force || (prevState.stencilReadMask !== n);

    n2 = state.stencilFrontCompare;
    if (b || (prevState.stencilFrontCompare !== n2)) {
      gl.stencilFuncSeparate(GLenum.FRONT, n2, stencilRef, n);
    }
    n2 = state.stencilBackCompare;
    if (b || (prevState.stencilBackCompare !== n2)) {
      gl.stencilFuncSeparate(GLenum.BACK, n2, stencilRef, n);
    }

    n = state.stencilFrontFailOp;
    n2 = state.stencilFrontDepthFailOp;
    n3 = state.stencilFrontPassOp;
    if (force ||
      (prevState.stencilFrontFailOp !== n) ||
      (prevState.stencilFrontDepthFailOp !== n2) ||
      (prevState.stencilFrontPassOp !== n3)
    ) {
      gl.stencilOpSeparate(GLenum.FRONT, n, n2, n3);
    }
    n = state.stencilBackFailOp;
    n2 = state.stencilBackDepthFailOp;
    n3 = state.stencilBackPassOp;
    if (force ||
      (prevState.stencilBackFailOp !== n) ||
      (prevState.stencilBackDepthFailOp !== n2) ||
      (prevState.stencilBackPassOp !== n3)
    ) {
      gl.stencilOpSeparate(GLenum.BACK, n, n2, n3);
    }

    applyStencilMask(gl, prevState.stencilWriteMask, state.stencilWriteMask, force);
  }

  // 5. Apply blend state changes
  b = state.blend;
  if (force || (prevState.blend !== b)) {
    glToggle(gl, GLenum.BLEND, b);
  }

  if (force || b) {
    n = state.blendColorSrcFactor;
    n2 = state.blendColorDstFactor;
    n3 = state.blendAlphaSrcFactor;
    n4 = state.blendAlphaDstFactor;
    if (force ||
      (prevState.blendColorSrcFactor !== n) ||
      (prevState.blendColorDstFactor !== n2) ||
      (prevState.blendAlphaSrcFactor !== n3) ||
      (prevState.blendAlphaDstFactor !== n4)
    ) {
      gl.blendFuncSeparate(n, n2, n3, n4);
    }

    n = state.blendColorOp;
    n2 = state.blendAlphaOp;
    if (force || (prevState.blendColorOp !== n) || (prevState.blendAlphaOp !== n2)) {
      gl.blendEquationSeparate(n, n2);
    }

    applyColorMask(gl, prevState.blendWriteMask, state.blendWriteMask, force);

    // 5.1. Apply individual draw buffer blend states on top of existing blend state 
    if (extDrawBuffersi) {
      for (let i = 0; i < state.drawBuffers.length; ++i) {
        applyBlendStatei(extDrawBuffersi, i, state, state.drawBuffers[i]);
      }
    }
  }
}

function applyBlendStatei(
  ext: OES_draw_buffers_indexed, index: number,
  prevState: WebGL2PipelineBlendState, state: WebGL2PipelineBlendState, force = false
): void {
  // Temporary variables to reuse
  let n = 0, n2 = 0, n3 = 0, n4 = 0;

  n = state.blendColorSrcFactor;
  n2 = state.blendColorDstFactor;
  n3 = state.blendAlphaSrcFactor;
  n4 = state.blendAlphaDstFactor;
  if (force ||
    (prevState.blendColorSrcFactor !== n) ||
    (prevState.blendColorDstFactor !== n2) ||
    (prevState.blendAlphaSrcFactor !== n3) ||
    (prevState.blendAlphaDstFactor !== n4)
  ) {
    ext.blendFuncSeparateiOES(index, n, n2, n3, n4);
  }

  n = state.blendColorOp;
  n2 = state.blendAlphaOp;
  if (force || (prevState.blendColorOp !== n) || (prevState.blendAlphaOp !== n2)) {
    ext.blendEquationSeparateiOES(index, n, n2);
  }

  applyColorMaski(ext, index, prevState.blendWriteMask, state.blendWriteMask, force);
}

function applyColorMaski(
  ext: OES_draw_buffers_indexed, index: number, prevMask: ColorWrite, mask: ColorWrite, force = false
): void {
  if (force || prevMask !== mask) {
    ext.colorMaskiOES(
      index,
      !!(mask & ColorWrite.Red),
      !!(mask & ColorWrite.Green),
      !!(mask & ColorWrite.Blue),
      !!(mask & ColorWrite.Alpha)
    );
  }
}

export function applyColorMask(gl: WebGL2RenderingContext, prevMask: ColorWrite, mask: ColorWrite, force = false): void {
  if (force || prevMask !== mask) {
    gl.colorMask(
      !!(mask & ColorWrite.Red),
      !!(mask & ColorWrite.Green),
      !!(mask & ColorWrite.Blue),
      !!(mask & ColorWrite.Alpha)
    );
  }
}

export function applyDepthMask(gl: WebGL2RenderingContext, prevMask: boolean, mask: boolean, force = false): void {
  if (force || prevMask !== mask) {
    gl.depthMask(mask);
  }
}

export function applyStencilMask(gl: WebGL2RenderingContext, prevMask: UInt, mask: UInt, force = false): void {
  if (force || prevMask !== mask) {
    gl.stencilMask(mask);
  }
}

export function glToggle(gl: WebGL2RenderingContext, flag: GLenum, enable: boolean): void {
  enable ? gl.enable(flag) : gl.disable(flag);
}

//#endregion State functions

//#region Utils

export function compileShaderProgram(device: Device, vertex: WebGLShader, fragment: WebGLShader): WebGLProgram {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const glp = (device as WebGL2Device).gl.createProgram()!;
  (device as WebGL2Device).gl.attachShader(glp, vertex);
  (device as WebGL2Device).gl.attachShader(glp, fragment);
  (device as WebGL2Device).gl.linkProgram(glp);

  if (MUGL_DEBUG) {
    console.assert(
      (device as WebGL2Device).gl.getProgramParameter(glp, GLenum.LINK_STATUS) || isDeviceLost(device),
      `Failed to link program: ${(device as WebGL2Device).gl.getProgramInfoLog(glp)}`
    );
  }

  return glp;
}

export function framebufferTexture(
  gl: WebGL2RenderingContext, attachment: GLenum, { texture, slice = 0, mipLevel = 0 }: TextureView
): void {
  if (is3DTexture((texture as WebGL2Texture).type)) {
    gl.framebufferTextureLayer(GLenum.FRAMEBUFFER, attachment, (texture as WebGL2Texture).glt, mipLevel, slice);
  } else {
    const texTarget = ((texture as WebGL2Texture).type === GLenum.TEXTURE_CUBE_MAP) ?
      GLenum.TEXTURE_CUBE_MAP_POSITIVE_X + slice : (texture as WebGL2Texture).type;
    gl.framebufferTexture2D(GLenum.FRAMEBUFFER, attachment, texTarget, (texture as WebGL2Texture).glt, mipLevel);
  }
}

export function createResolveFrameBuffer(
  gl: WebGL2RenderingContext, attachment: GLenum, view: TextureView
): WebGLFramebuffer | null {
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(GLenum.FRAMEBUFFER, fb);
  framebufferTexture(gl, attachment, view);
  if (MUGL_DEBUG) {
    console.assert(
      gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || gl.isContextLost(),
      'Framebuffer completeness check failed for MSAA resolve buffer'
    );
  }
  return fb;
}

export function blitFramebuffer(
  gl: WebGL2RenderingContext, from: WebGLFramebuffer | null, to: WebGLFramebuffer | null,
  tex: WebGL2Texture, mask: number, attachment: UInt = GLenum.COLOR_ATTACHMENT0
): void {
  gl.bindFramebuffer(GLenum.READ_FRAMEBUFFER, from);
  gl.bindFramebuffer(GLenum.DRAW_FRAMEBUFFER, to);
  gl.readBuffer(attachment);
  gl.blitFramebuffer(
    0, 0, tex.width, tex.height,
    0, 0, tex.width, tex.height,
    mask, GLenum.NEAREST
  );
}

export function clientWaitAsync(gl: WebGL2RenderingContext, sync: WebGLSync, flags: UInt, interval: UInt): Promise<void> {
  return new Promise((resolve, reject) => {
    function test() {
      const res = gl.clientWaitSync(sync, flags, 0);
      if (res == GLenum.WAIT_FAILED) {
        reject();
      } else if (res == GLenum.TIMEOUT_EXPIRED) {
        setTimeout(test, interval);
      } else {
        resolve();
      }
    }
    test();
  });
}

export function getBufferSubData(
  gl: WebGL2RenderingContext, target: UInt, buffer: WebGLBuffer | null, srcOffset: UInt, length: UInt
): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
  gl.flush();

  return clientWaitAsync(gl, sync, 0, 10)
    .finally(() => gl.deleteSync(sync))
    .then(() => {
      const data = new Uint8Array(length);
      gl.bindBuffer(target, buffer);
      gl.getBufferSubData(target, srcOffset, data, 0, length);
      return data;
    });
}

export function vertexAttribs(gl: WebGL2RenderingContext, buffer: WebGL2BufferAttributes, offset: UInt): void {
  gl.bindBuffer(GLenum.ARRAY_BUFFER, buffer.glb);
  for (let i = 0; i < buffer.attributes.length; ++i) {
    const { ptr, step } = buffer.attributes[i];
    const params: [number, number, number, boolean, number, number] = [...ptr];
    params[5] += offset;
    gl.vertexAttribPointer(...params);
    gl.vertexAttribDivisor(ptr[0], step);
  }
}

//#endregion Utils
