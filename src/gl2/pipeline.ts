import { DeepReadonly, DeepRequired } from 'ts-essentials';
import {
  BlendStateDescriptor, DepthStateDescriptor, GLPipeline as IGLPipeline, GLRenderingDevice, IndexFormat,
  PipelineDescriptor, PrimitiveType, RasterizationStateDescriptor, StencilStateDescriptor, UniformBufferLayout,
  UniformLayoutDescriptor, UniformTexLayout, UniformType, UniformValueLayout, VertexAttributeDescriptor,
  VertexBufferLayoutDescriptor, vertexByteSize
} from '../device';
import { GL_INVALID_INDEX, GL_TRIANGLES, GL_UNSIGNED_SHORT } from '../device';
import { MAX_VERTEX_ATTRIBS } from './const';
import { DEFAULT_RASTER_STATE, DEFAULT_DEPTH_STATE, DEFAULT_STENCIL_STATE, DEFAULT_BLEND_STATE } from './pipestate';
import { createProgram } from './shader';

/** An entry of uniform info cache */
type UniformCacheEntry = (UniformTexLayout & {
  /** Uniform location. */
  loc: WebGLUniformLocation,
  /** Texture bind slot ID. */
  binding: number
}) | (UniformValueLayout & {
  /** Uniform location. */
  loc: WebGLUniformLocation
}) | (UniformBufferLayout & {
  /** Uniform block index. */
  loc: GLuint,
  /** Uniform buffer bind slot ID. */
  binding: number
});

/** Cache of uniform info. */
type UniformCache = {
  [name: string]: UniformCacheEntry
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
      let maxOffset = 0, minOffset = descAttrs.length > 0 ? Infinity : 0;
      for (let j = 0; j < descAttrs.length; ++j) {
        const { offset = maxOffset, shaderLoc = nextShaderLoc } = descAttrs[j];
        attrs[j] = { ...descAttrs[j], offset, shaderLoc };
        hasAttr[nextShaderLoc = shaderLoc] = true;
        while (hasAttr[++nextShaderLoc]);
        maxOffset = Math.max(maxOffset, offset + vertexByteSize(attrs[j].format));
        minOffset = Math.min(minOffset, offset);
      }
      return { attrs, stride: stride || (maxOffset - minOffset), instanced };
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const glp = (this.glp = createProgram(gl, vert, frag, buf))!;

    // Populate uniform types and location cache
    this.uniforms = uniforms ?
      Object.keys(uniforms).reduce((result, key) => {
        result[key] = { ...uniforms[key] };
        return result;
      }, <DeepRequired<UniformLayoutDescriptor>>{}) :
      {};

    const cache: UniformCache = this.cache = {};
    let bufCount = 0;
    let texCount = 0;
    for (const key in uniforms) {
      const desc = uniforms[key];
      let loc;
      if (desc.type === UniformType.Buffer) {
        loc = (<WebGL2RenderingContext>gl).getUniformBlockIndex(glp, key);
        (<WebGL2RenderingContext>this.gl).uniformBlockBinding(glp, loc, bufCount++);
      } else {
        loc = gl.getUniformLocation(glp, key);
      }
      if (loc !== null && loc !== GL_INVALID_INDEX) {
        cache[key] = <UniformCacheEntry>{
          ...desc,
          loc,
          binding: desc.type === UniformType.Tex ? texCount++ :
            desc.type === UniformType.Buffer ? bufCount : -1
        };
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
