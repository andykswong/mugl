import {
  GLenum, IndexFormat, PipelineDescriptor, PipelineProperties, PrimitiveType, ReadonlyVertexAttribute, TexType,
  UniformFormat, UniformLayoutEntry, UniformType, vertexByteSize
} from '../../common';
import { GLPipeline as IGLPipeline, GLRenderingDevice } from '../device';
import { MAX_VERTEX_ATTRIBS } from './const';
import { DEFAULT_RASTER_STATE, DEFAULT_DEPTH_STATE, DEFAULT_STENCIL_STATE, DEFAULT_BLEND_STATE } from './pipestate';
import { createProgram, GLShader } from './shader';

/** An entry of uniform info cache */
type UniformCacheEntry = UniformLayoutEntry & {
  /** Uniform location. */
  loc: WebGLUniformLocation | null,

  /** Uniform block index. */
  index: GLuint,
  
  /** Uniform buffer / Texture bind slot ID. */
  binding: number
}

/** Cache of uniform info. */
type UniformCache = Record<string, UniformCacheEntry>;

export class GLPipeline implements IGLPipeline {
  public readonly props: PipelineProperties;
  public glp: WebGLProgram | null;

  public readonly cache: UniformCache;

  private readonly gl: WebGLRenderingContext;

  public constructor(context: GLRenderingDevice, props: PipelineDescriptor) {
    const gl = this.gl = context.gl;

    // Auto calculate buffer offsets, stride and shaderLoc
    const hasAttr: boolean[] = Array(MAX_VERTEX_ATTRIBS);
    let nextShaderLoc = 0;
    const buffers = props.buffers.map(({ attrs: descAttrs, stride = 0, instanced = false }) => {
      const attrs: ReadonlyVertexAttribute[] = Array(descAttrs.length);
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
    const uniforms = (props.uniforms || []).map(uniform => ({
      name: uniform.name,
      type: uniform.type || UniformType.Value,
      texType: uniform.texType || TexType.Tex2D,
      valueFormat: uniform.valueFormat || UniformFormat.Float
    }));

    this.props = {
      vert: props.vert,
      frag: props.frag,
      indexFormat: props.indexFormat || IndexFormat.UInt16,
      mode: props.mode || PrimitiveType.Tri,
      buffers,
      uniforms,
      raster: { ...DEFAULT_RASTER_STATE, ...props.raster },
      depth: props.depth ? { ...DEFAULT_DEPTH_STATE, ...props.depth } : null,
      stencil: props.stencil ? { ...DEFAULT_STENCIL_STATE, ...props.stencil } : null,
      blend: props.blend ? { ...DEFAULT_BLEND_STATE, ...props.blend } : null
    };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const glp = this.glp = createProgram(gl, props.vert as GLShader, props.frag as GLShader, buffers)!;

    // Populate uniform types and location cache
    const cache: UniformCache = this.cache = {};
    let bufCount = 0;
    let texCount = 0;
    for (let i = 0; i < uniforms.length; ++i) {
      const uniform = uniforms[i];
      let loc = null;
      let index = GLenum.INVALID_INDEX;
      if (uniform.type === UniformType.Buffer) {
        index = (gl as WebGL2RenderingContext).getUniformBlockIndex(glp, uniform.name);
        (gl as WebGL2RenderingContext).uniformBlockBinding(glp, index, bufCount++);
      } else {
        loc = gl.getUniformLocation(glp, uniform.name);
      }
      if (loc !== null || index !== GLenum.INVALID_INDEX) {
        cache[uniform.name] = {
          ...uniform,
          loc,
          index,
          binding: uniform.type === UniformType.Tex ? texCount++ : 
            uniform.type === UniformType.Buffer ? bufCount : -1
        };
      }
    }
  }

  destroy(): void {
    this.gl.deleteProgram(this.glp);
    this.glp = null;
  }
}
