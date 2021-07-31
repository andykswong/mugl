import { BufferDescriptor, BufferProperties, GLenum, Int } from '../../common';
import { GLBuffer as IGLBuffer, GLRenderingDevice } from '../device';

export class GLBuffer implements IGLBuffer {
  public readonly props: BufferProperties;
  public glb: WebGLBuffer | null;

  private readonly gl: WebGLRenderingContext;

  public constructor(context: GLRenderingDevice, props: BufferDescriptor) {
    const gl = this.gl = context.gl;
    this.props = {
      type: props.type || GLenum.ARRAY_BUFFER,
      usage: props.usage || GLenum.STATIC_DRAW,
      size: props.size
    };

    gl.bindBuffer(this.props.type, this.glb = gl.createBuffer());
    gl.bufferData(this.props.type, this.props.size, this.props.usage);
  }

  public data(data: ArrayBufferView, offset: Int = 0): GLBuffer {
    this.gl.bindBuffer(this.props.type, this.glb);
    this.gl.bufferSubData(this.props.type, offset, data);
    return this;
  }

  public destroy(): void {
    this.gl.deleteBuffer(this.glb);
    this.glb = null;
  }
}
