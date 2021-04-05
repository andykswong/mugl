import { BufferDescriptor, BufferType, GLBuffer as IGLBuffer, GLRenderingDevice, Usage } from '../api';
import { GL_ARRAY_BUFFER, GL_STATIC_DRAW } from '../api';

export class GLBuffer implements IGLBuffer {
  public readonly type: BufferType;
  public readonly usage: Usage;
  public readonly size: number;

  public glb: WebGLBuffer | null;

  private readonly gl: WebGLRenderingContext;

  public constructor(context: GLRenderingDevice, {
    size,
    type = GL_ARRAY_BUFFER,
    usage = GL_STATIC_DRAW
  }: BufferDescriptor) {
    const gl = this.gl = context.gl;
    this.type = type;
    this.usage = usage;
    this.size = size;

    gl.bindBuffer(type, this.glb = gl.createBuffer());
    gl.bufferData(type, size, usage);
  }

  public data(data: BufferSource, offset = 0): GLBuffer {
    this.gl.bindBuffer(this.type, this.glb);
    this.gl.bufferSubData(this.type, offset, data);
    return this;
  }

  public destroy(): void {
    this.gl.deleteBuffer(this.glb);
    this.glb = null;
  }
}
