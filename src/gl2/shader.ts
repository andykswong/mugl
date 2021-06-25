import { DeepReadonly, DeepRequired } from 'ts-essentials';
import { VertexBufferLayoutDescriptor } from '../device';
import { GL_COMPILE_STATUS, GL_VERTEX_SHADER, GL_FRAGMENT_SHADER, GL_LINK_STATUS } from '../device';

export function createProgram(
  gl: WebGLRenderingContext, vert: string, frag: string,
  buffers: DeepReadonly<DeepRequired<VertexBufferLayoutDescriptor>>[]
): WebGLProgram | null {
  const vs = createShader(gl, GL_VERTEX_SHADER, vert);
  const fs = createShader(gl, GL_FRAGMENT_SHADER, frag);

  // Non-null assertion to workaround type checks. WebGL APIs works fine with null.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);

  // Bind attribute locations
  for (const { attrs } of buffers) {
    for (const attr of attrs) {
      gl.bindAttribLocation(program, attr.shaderLoc, attr.name);
    }
  }

  // Link program then free up shaders
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (process.env.DEBUG) {
    console.assert(
      gl.getProgramParameter(program, GL_LINK_STATUS) || gl.isContextLost(),
      `Failed to link program: ${gl.getProgramInfoLog(program)}`
    );
  }

  return program;
}

function createShader(gl: WebGLRenderingContext, shaderType: number, source: string): WebGLShader {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const shader = gl.createShader(shaderType)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (process.env.DEBUG) {
    console.assert(
      gl.getShaderParameter(shader, GL_COMPILE_STATUS) || gl.isContextLost(),
      `Failed to compile shader: ${gl.getShaderInfoLog(shader)}`
    );
  }

  return shader;
}
