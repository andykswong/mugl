import { DeepRequired } from 'ts-essentials';
import {
  BYTE_MASK, PipelineStateDescriptor, ColorMask, BlendStateDescriptor, DepthStateDescriptor, RasterizationStateDescriptor,
  StencilStateDescriptor
} from '../device';
import {
  GL_CCW, GL_NONE, GL_ALWAYS, GL_KEEP, GL_ONE, GL_ZERO, GL_FUNC_ADD, GL_CULL_FACE, GL_POLYGON_OFFSET_FILL,
  GL_SAMPLE_ALPHA_TO_COVERAGE, GL_DEPTH_TEST, GL_STENCIL_TEST, GL_FRONT, GL_BACK, GL_BLEND
} from '../device';

/**
 * WebGL pipeline state.
 */
export type GLPipelineState = DeepRequired<PipelineStateDescriptor> & {
  /** Specify if blend state is enabled. */
  blendOn: boolean;

  /** Specify if depth state is enabled. */
  depthOn: boolean;

  /** Specify if stencil state is enabled. */
  stencilOn: boolean;
};

export const DEFAULT_RASTER_STATE: Readonly<Required<RasterizationStateDescriptor>> = {
  frontFace: GL_CCW,
  cullMode: GL_NONE,
  depthBias: 0,
  depthBiasSlopeScale: 0,
  alphaToCoverage: false
} as const;

export const DEFAULT_DEPTH_STATE: Readonly<Required<DepthStateDescriptor>> = {
  writeEnabled: false,
  compare: GL_ALWAYS
} as const;

export const DEFAULT_STENCIL_STATE: Readonly<Required<StencilStateDescriptor>> = {
  frontCompare: GL_ALWAYS,
  frontFailOp: GL_KEEP,
  frontZFailOp: GL_KEEP,
  frontPassOp: GL_KEEP,
  backCompare: GL_ALWAYS,
  backFailOp: GL_KEEP,
  backZFailOp: GL_KEEP,
  backPassOp: GL_KEEP,
  readMask: BYTE_MASK,
  writeMask: BYTE_MASK
} as const;

export const DEFAULT_BLEND_STATE: Readonly<Required<BlendStateDescriptor>> = {
  srcFactorRGB: GL_ONE,
  dstFactorRGB: GL_ZERO,
  opRGB: GL_FUNC_ADD,
  srcFactorAlpha: GL_ONE,
  dstFactorAlpha: GL_ZERO,
  opAlpha: GL_FUNC_ADD,
  colorMask: ColorMask.All
} as const;

export const newGLPipelineState = (): GLPipelineState => ({
  blend: false,
  blendOn: false,
  depth: false,
  depthOn: false,
  stencil: false,
  stencilOn: false,
  raster: { ...DEFAULT_RASTER_STATE }
});

export function applyPipelineState(
  gl: WebGLRenderingContext, prevState: GLPipelineState, state: DeepRequired<PipelineStateDescriptor>, stencilRef = 0,
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
    if ((b = (n !== GL_NONE))) {
      gl.cullFace(n);
    }
    glToggle(gl, GL_CULL_FACE, b);
  }

  n = nextRaster.depthBiasSlopeScale;
  n2 = nextRaster.depthBias;
  if (force || (prevRaster.depthBiasSlopeScale !== n) || (prevRaster.depthBias !== n2)) {
    glToggle(gl, GL_POLYGON_OFFSET_FILL, !(!n && !n2)); // Enable if any of the 2 values is non-zero
    gl.polygonOffset(n, n2);
  }

  b = nextRaster.alphaToCoverage;
  if (force || (prevRaster.alphaToCoverage !== b)) {
    glToggle(gl, GL_SAMPLE_ALPHA_TO_COVERAGE, b);
  }

  // 2. Apply depth state changes
  b = !!depth;
  if (force || (prevState.depthOn !== b)) {
    glToggle(gl, GL_DEPTH_TEST, b);
  }

  if (force || b) {
    const prevDepth = prevState.depth || DEFAULT_DEPTH_STATE;
    const nextDepth = depth || DEFAULT_DEPTH_STATE;

    applyDepthMask(gl, prevDepth.writeEnabled, nextDepth.writeEnabled, force);

    n = nextDepth.compare;
    if (force || (prevDepth.compare !== n)) {
      gl.depthFunc(n);
    }
  }

  // 3. Apply stencil state changes
  b = !!stencil;
  if (force || (prevState.stencilOn !== b)) {
    glToggle(gl, GL_STENCIL_TEST, b);
  }

  if (force || b) {
    const prevStencil = prevState.stencil || DEFAULT_STENCIL_STATE;
    const nextStencil = stencil || DEFAULT_STENCIL_STATE;

    n = nextStencil.readMask;
    b = force || (prevStencil.readMask !== n);

    n2 = nextStencil.frontCompare;
    if (b || (prevStencil.frontCompare !== n2)) {
      gl.stencilFuncSeparate(GL_FRONT, n2, stencilRef, n);
    }
    n2 = nextStencil.backCompare;
    if (b || (prevStencil.backCompare !== n2)) {
      gl.stencilFuncSeparate(GL_BACK, n2, stencilRef, n);
    }

    n = nextStencil.frontFailOp;
    n2 = nextStencil.frontZFailOp;
    n3 = nextStencil.frontPassOp;
    if (force ||
      (prevStencil.frontFailOp !== n) ||
      (prevStencil.frontZFailOp !== n2) ||
      (prevStencil.frontPassOp !== n3)
    ) {
      gl.stencilOpSeparate(GL_FRONT, n, n2, n3);
    }
    n = nextStencil.backFailOp;
    n2 = nextStencil.backZFailOp;
    n3 = nextStencil.backPassOp;
    if (force ||
      (prevStencil.backFailOp !== n) ||
      (prevStencil.backZFailOp !== n2) ||
      (prevStencil.backPassOp !== n3)
    ) {
      gl.stencilOpSeparate(GL_BACK, n, n2, n3);
    }

    applyStencilMask(gl, prevStencil.writeMask, nextStencil.writeMask, force);
  }

  // 4. Apply blend state changes
  b = !!blend;
  if (force || (prevState.blendOn !== b)) {
    glToggle(gl, GL_BLEND, b);
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
  prevState: GLPipelineState, { blend, depth, stencil, raster }: DeepRequired<PipelineStateDescriptor>
): void {
  prevState.blend = assignOrFalse(prevState.blend, blend);
  prevState.blendOn = !!blend;
  prevState.depth = assignOrFalse(prevState.depth, depth);
  prevState.depthOn = !!depth;
  prevState.stencil = assignOrFalse(prevState.stencil, stencil);
  prevState.stencilOn = !!stencil;
  Object.assign(prevState.raster, raster);
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

const assignOrFalse = <T>(to: T | false, from: T | false): T | false =>
  (from || to) ? Object.assign(to || {}, from) : false;
