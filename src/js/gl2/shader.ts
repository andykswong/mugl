import { MUGL_DEBUG } from '../../config';
import { GLRenderingDevice, GLShader as IGLShader, ShaderDescriptor, ShaderType, VertexBufferLayout } from '../device';
import { GL_COMPILE_STATUS, GL_LINK_STATUS } from '../device/glenums';

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
        gl.getShaderParameter(shader, GL_COMPILE_STATUS) || gl.isContextLost(),
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
  gl: WebGLRenderingContext, vert: IGLShader, frag: IGLShader,
  buffers: VertexBufferLayout[]
): WebGLProgram {
  // Non-null assertion to workaround type checks. WebGL APIs work fine with null.
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const program = gl.createProgram()!;
  gl.attachShader(program, vert.gls!);
  gl.attachShader(program, frag.gls!);

  // Bind attribute locations
  for (const { attrs } of buffers) {
    for (const attr of attrs) {
      gl.bindAttribLocation(program, attr.shaderLoc!, attr.name);
    }
  }
  /* eslint-enable */

  // Link program then free up shaders
  gl.linkProgram(program);

  if (MUGL_DEBUG) {
    console.assert(
      gl.getProgramParameter(program, GL_LINK_STATUS) || gl.isContextLost(),
      `Failed to link program: ${gl.getProgramInfoLog(program)}`
    );
  }

  return program;
}
