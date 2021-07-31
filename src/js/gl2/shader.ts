import { MUGL_DEBUG } from '../../config';
import { GLenum, ShaderDescriptor, ShaderType, VertexBufferLayout } from '../../common';
import { GLRenderingDevice, GLShader as IGLShader } from '../device';

export class GLShader implements IGLShader {
  public readonly type: ShaderType;
  public readonly source: string;
  public gls: WebGLShader | null;

  private readonly gl: WebGLRenderingContext;

  public constructor(context: GLRenderingDevice, props: ShaderDescriptor) {
    const gl = this.gl = context.gl;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shader = this.gls = gl.createShader(this.type = props.type)!;
    gl.shaderSource(shader, this.source = props.source);
    gl.compileShader(shader);

    if (MUGL_DEBUG) {
      console.assert(
        gl.getShaderParameter(shader, GLenum.COMPILE_STATUS) || gl.isContextLost(),
        `Failed to compile shader: ${gl.getShaderInfoLog(shader)}`
      );
    }

  }

  public destroy(): void {
    this.gl.deleteShader(this.gls);
    this.gls = null;
  }
}

export function createProgram(
  gl: WebGLRenderingContext, vert: GLShader, frag: GLShader,
  buffers: VertexBufferLayout[]
): WebGLProgram {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const program = gl.createProgram()!;
  gl.attachShader(program, vert.gls!);
  gl.attachShader(program, frag.gls!);
  /* eslint-enable */

  // Bind attribute locations
  for (let i = 0; i < buffers.length; ++i) {
    const attrs = buffers[i].attrs;
    for (let j = 0; j < attrs.length; ++j) {
      gl.bindAttribLocation(program, attrs[j].shaderLoc || 0, attrs[j].name);
    }
  }

  // Link program then free up shaders
  gl.linkProgram(program);

  if (MUGL_DEBUG) {
    console.assert(
      gl.getProgramParameter(program, GLenum.LINK_STATUS) || gl.isContextLost(),
      `Failed to link program: ${gl.getProgramInfoLog(program)}`
    );
  }

  return program;
}
