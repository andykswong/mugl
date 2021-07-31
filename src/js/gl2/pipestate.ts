import { Writable } from 'ts-essentials';
import {
  BYTE_MASK, ColorMask, BlendState, DepthState, GLenum, RasterizationState, StencilState, ReadonlyPipelineState
} from '../../common';

/**
 * WebGL pipeline state.
 */
export type GLPipelineState = Writable<ReadonlyPipelineState> & {
  /** Specify if blend state is enabled. */
  blendOn: boolean;

  /** Specify if depth state is enabled. */
  depthOn: boolean;

  /** Specify if stencil state is enabled. */
  stencilOn: boolean;
};

export const DEFAULT_RASTER_STATE: Readonly<Required<RasterizationState>> = {
  frontFace: GLenum.CCW,
  cullMode: GLenum.NONE,
  depthBias: 0,
  depthBiasSlopeScale: 0,
  alphaToCoverage: false
} as const;

export const DEFAULT_DEPTH_STATE: Readonly<Required<DepthState>> = {
  write: false,
  compare: GLenum.ALWAYS
} as const;

export const DEFAULT_STENCIL_STATE: Readonly<Required<StencilState>> = {
  frontCompare: GLenum.ALWAYS,
  frontFailOp: GLenum.KEEP,
  frontZFailOp: GLenum.KEEP,
  frontPassOp: GLenum.KEEP,
  backCompare: GLenum.ALWAYS,
  backFailOp: GLenum.KEEP,
  backZFailOp: GLenum.KEEP,
  backPassOp: GLenum.KEEP,
  readMask: BYTE_MASK,
  writeMask: BYTE_MASK
} as const;

export const DEFAULT_BLEND_STATE: Readonly<Required<BlendState>> = {
  srcFactorRGB: GLenum.ONE,
  dstFactorRGB: GLenum.ZERO,
  opRGB: GLenum.FUNC_ADD,
  srcFactorAlpha: GLenum.ONE,
  dstFactorAlpha: GLenum.ZERO,
  opAlpha: GLenum.FUNC_ADD,
  colorMask: ColorMask.All
} as const;

export const newGLPipelineState = (): GLPipelineState => ({
  blend: null,
  blendOn: false,
  depth: null,
  depthOn: false,
  stencil: null,
  stencilOn: false,
  raster: { ...DEFAULT_RASTER_STATE }
});

export function applyPipelineState(
  gl: WebGLRenderingContext, prevState: GLPipelineState, state: ReadonlyPipelineState, stencilRef = 0,
  force = false
): void {
  const { raster, depth, stencil, blend } = state;
  // Temporary variables to reuse for performance
  let b = false, n = 0, n2 = 0, n3 = 0, n4 = 0;

  // 1. Apply rasterizer state
  const prevRaster = prevState.raster || DEFAULT_RASTER_STATE;
  const nextRaster = raster || DEFAULT_RASTER_STATE;
  n = nextRaster.frontFace;
  if (force || (prevRaster.frontFace !== n)) {
    gl.frontFace(n);
  }

  n = nextRaster.cullMode;
  if (force || (prevRaster.cullMode !== n)) {
    if ((b = (n !== GLenum.NONE))) {
      gl.cullFace(n);
    }
    glToggle(gl, GLenum.CULL_FACE, b);
  }

  n = nextRaster.depthBiasSlopeScale;
  n2 = nextRaster.depthBias;
  if (force || (prevRaster.depthBiasSlopeScale !== n) || (prevRaster.depthBias !== n2)) {
    glToggle(gl, GLenum.POLYGON_OFFSET_FILL, !(!n && !n2)); // Enable if any of the 2 values is non-zero
    gl.polygonOffset(n, n2);
  }

  b = nextRaster.alphaToCoverage;
  if (force || (prevRaster.alphaToCoverage !== b)) {
    glToggle(gl, GLenum.SAMPLE_ALPHA_TO_COVERAGE, b);
  }

  // 2. Apply depth state changes
  b = !!depth;
  if (force || (prevState.depthOn !== b)) {
    glToggle(gl, GLenum.DEPTH_TEST, b);
  }

  if (force || b) {
    const prevDepth = prevState.depth || DEFAULT_DEPTH_STATE;
    const nextDepth = depth || DEFAULT_DEPTH_STATE;

    applyDepthMask(gl, prevDepth.write, nextDepth.write, force);

    n = nextDepth.compare;
    if (force || (prevDepth.compare !== n)) {
      gl.depthFunc(n);
    }
  }

  // 3. Apply stencil state changes
  b = !!stencil;
  if (force || (prevState.stencilOn !== b)) {
    glToggle(gl, GLenum.STENCIL_TEST, b);
  }

  if (force || b) {
    const prevStencil = prevState.stencil || DEFAULT_STENCIL_STATE;
    const nextStencil = stencil || DEFAULT_STENCIL_STATE;

    n = nextStencil.readMask;
    b = force || (prevStencil.readMask !== n);

    n2 = nextStencil.frontCompare;
    if (b || (prevStencil.frontCompare !== n2)) {
      gl.stencilFuncSeparate(GLenum.FRONT, n2, stencilRef, n);
    }
    n2 = nextStencil.backCompare;
    if (b || (prevStencil.backCompare !== n2)) {
      gl.stencilFuncSeparate(GLenum.BACK, n2, stencilRef, n);
    }

    n = nextStencil.frontFailOp;
    n2 = nextStencil.frontZFailOp;
    n3 = nextStencil.frontPassOp;
    if (force ||
      (prevStencil.frontFailOp !== n) ||
      (prevStencil.frontZFailOp !== n2) ||
      (prevStencil.frontPassOp !== n3)
    ) {
      gl.stencilOpSeparate(GLenum.FRONT, n, n2, n3);
    }
    n = nextStencil.backFailOp;
    n2 = nextStencil.backZFailOp;
    n3 = nextStencil.backPassOp;
    if (force ||
      (prevStencil.backFailOp !== n) ||
      (prevStencil.backZFailOp !== n2) ||
      (prevStencil.backPassOp !== n3)
    ) {
      gl.stencilOpSeparate(GLenum.BACK, n, n2, n3);
    }

    applyStencilMask(gl, prevStencil.writeMask, nextStencil.writeMask, force);
  }

  // 4. Apply blend state changes
  b = !!blend;
  if (force || (prevState.blendOn !== b)) {
    glToggle(gl, GLenum.BLEND, b);
  }

  if (force || b) {
    const prevBlend = prevState.blend || DEFAULT_BLEND_STATE;
    const nextBlend = blend || DEFAULT_BLEND_STATE;

    n = nextBlend.srcFactorRGB;
    n2 = nextBlend.dstFactorRGB;
    n3 = nextBlend.srcFactorAlpha;
    n4 = nextBlend.dstFactorAlpha;
    if (force ||
      (prevBlend.srcFactorRGB !== n) ||
      (prevBlend.dstFactorRGB !== n2) ||
      (prevBlend.srcFactorAlpha !== n3) ||
      (prevBlend.dstFactorAlpha !== n4)
    ) {
      gl.blendFuncSeparate(n, n2, n3, n4);
    }

    n = nextBlend.opRGB;
    n2 = nextBlend.opAlpha;
    if (force || (prevBlend.opRGB !== n) || (prevBlend.opAlpha !== n2)) {
      gl.blendEquationSeparate(n, n2);
    }

    applyColorMask(gl, prevBlend.colorMask, nextBlend.colorMask, force);
  }
}

export function mergePipelineState(
  prevState: GLPipelineState, state: ReadonlyPipelineState
): void {
  prevState.blend = assignOrNull(prevState.blend, state.blend);
  prevState.blendOn = !!state.blend;
  prevState.depth = assignOrNull(prevState.depth, state.depth);
  prevState.depthOn = !!state.depth;
  prevState.stencil = assignOrNull(prevState.stencil, state.stencil);
  prevState.stencilOn = !!state.stencil;
  Object.assign(prevState.raster, state.raster);
}

export function applyColorMask(gl: WebGLRenderingContext, prevMask: ColorMask, mask: ColorMask, force = false): void {
  if (prevMask !== mask || force) {
    gl.colorMask(
      !!(mask & ColorMask.R),
      !!(mask & ColorMask.G),
      !!(mask & ColorMask.B),
      !!(mask & ColorMask.A)
    );
  }
}

export function applyDepthMask(gl: WebGLRenderingContext, prevMask: boolean, mask: boolean, force = false): void {
  if (prevMask !== mask || force) {
    gl.depthMask(mask);
  }
}

export function applyStencilMask(gl: WebGLRenderingContext, prevMask: number, mask: number, force = false): void {
  if (prevMask !== mask || force) {
    gl.stencilMask(mask);
  }
}

function glToggle(gl: WebGLRenderingContext, flag: GLenum, enable: boolean): void {
  enable ? gl.enable(flag) : gl.disable(flag);
}

const assignOrNull = <T>(to: T | null, from: T | null): T | null =>
  (from || to) ? Object.assign(to || {}, from) : null;
