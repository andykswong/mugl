import { DeepReadonly, DeepRequired } from 'ts-essentials';
import {
  BlendStateDescriptor, DepthStateDescriptor, GLPipeline as IGLPipeline, GLRenderingDevice, IndexFormat,
  PipelineDescriptor, PrimitiveType, RasterizationStateDescriptor, StencilStateDescriptor, UniformLayoutDescriptor,
  UniformTexDescriptor, UniformType, UniformValueDescriptor, VertexAttributeDescriptor, VertexBufferLayoutDescriptor,
  vertexByteSize
} from '../api';
import { GL_TRIANGLES, GL_UNSIGNED_SHORT } from '../api';
import { MAX_VERTEX_ATTRIBS } from './const';
import { DEFAULT_RASTER_STATE, DEFAULT_DEPTH_STATE, DEFAULT_STENCIL_STATE, DEFAULT_BLEND_STATE } from './pipestate';
import { createProgram } from './shader';

/** Cache of uniform info. */
type UniformCache = {
  [name: string]: (UniformTexDescriptor | UniformValueDescriptor) & {
    /** Uniform location. */
    loc: WebGLUniformLocation,

    /** Texture slot ID. */
    texId: number
  }
};

export class GLPipeline implements IGLPipeline {
  public readonly vert: string;
  public readonly frag: string;
  public readonly indexFormat: IndexFormat;
  public readonly mode: PrimitiveType;
  public readonly buffers: readonly DeepRequired<DeepReadonly<VertexBufferLayoutDescriptor>>[];
  public readonly uniforms: DeepRequired<DeepReadonly<UniformLayoutDescriptor>>;

  public readonly raster: Required<Readonly<RasterizationStateDescriptor>>;
  public readonly depth: Required<Readonly<DepthStateDescriptor>> | false;
  public readonly stencil: Required<Readonly<StencilStateDescriptor>> | false;
  public readonly blend: Required<Readonly<BlendStateDescriptor>> | false;

  public readonly cache: UniformCache;

  public glp: WebGLProgram | null;

  private readonly gl: WebGLRenderingContext;

  public constructor(
    context: GLRenderingDevice, {
      vert,
      frag,
      indexFormat = GL_UNSIGNED_SHORT,
      mode = GL_TRIANGLES,
      buffers,
      uniforms,
      raster,
      depth = false,
      stencil = false,
      blend = false
    }: PipelineDescriptor
  ) {
    const gl = this.gl = context.gl;

    this.vert = vert;
    this.frag = frag;
    this.indexFormat = indexFormat;
    this.mode = mode;

    // Auto calculate buffer offsets, stride and shaderLoc
    const hasAttr: boolean[] = Array(MAX_VERTEX_ATTRIBS);
    let nextShaderLoc = 0;
    const buf = this.buffers = buffers.map(({ attrs: descAttrs, stride = 0, instanced = false }) => {
      const attrs: Required<VertexAttributeDescriptor>[] = Array(descAttrs.length);
      let maxOffset = 0;
      for (let j = 0; j < descAttrs.length; ++j) {
        const { offset = maxOffset, shaderLoc = nextShaderLoc } = descAttrs[j];
        attrs[j] = { ...descAttrs[j], offset, shaderLoc };
        hasAttr[nextShaderLoc = shaderLoc] = true;
        while (hasAttr[++nextShaderLoc]);
        maxOffset = offset + vertexByteSize(attrs[j].format);
      }
      return { attrs, stride: Math.max(stride, maxOffset), instanced };
    });

    const glp = this.glp = createProgram(gl, vert, frag, buf);

    // Populate uniform types and location cache
    this.uniforms = uniforms ?
      Object.keys(uniforms).reduce((result, key) => {
        result[key] = { ...uniforms[key] };
        return result;
      }, <DeepRequired<UniformLayoutDescriptor>>{}) :
      {};

    const cache: UniformCache = this.cache = {};
    let texCount = 0;
    for (const key in uniforms) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const loc = gl.getUniformLocation(glp!, key);
      if (loc) {
        const desc = uniforms[key];
        cache[key] = { ...desc, loc, texId: desc.type === UniformType.Tex ? texCount++ : -1 };
      }
    }

    this.raster = { ...DEFAULT_RASTER_STATE, ...raster };
    this.depth = depth ? { ...DEFAULT_DEPTH_STATE, ...depth } : false;
    this.stencil = stencil ? { ...DEFAULT_STENCIL_STATE, ...stencil } : false;
    this.blend = blend ? { ...DEFAULT_BLEND_STATE, ...blend } : false;
  }

  destroy(): void {
    this.gl.deleteProgram(this.glp);
    this.glp = null;
  }
}
