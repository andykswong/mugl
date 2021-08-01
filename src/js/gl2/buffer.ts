import { BufferDescriptor, BufferProperties, BufferType, Uint, Usage } from '../../common';
import { GLBuffer as IGLBuffer, GLRenderingDevice } from '../device';

export class GLBuffer implements IGLBuffer {
  public readonly props: BufferProperties;
  public glb: WebGLBuffer | null;

  private readonly gl: WebGLRenderingContext;

  public constructor(context: GLRenderingDevice, props: BufferDescriptor) {
    const gl = this.gl = context.gl;
    this.props = {
      type: props.type || BufferType.Vertex,
      usage: props.usage || Usage.Static,
      size: props.size
    };

    gl.bindBuffer(this.props.type, this.glb = gl.createBuffer());
    gl.bufferData(this.props.type, this.props.size, this.props.usage);
  }

  public data(data: ArrayBufferView, offset: Uint = 0): GLBuffer {
    this.gl.bindBuffer(this.props.type, this.glb);
    this.gl.bufferSubData(this.props.type, offset, data);
    return this;
  }

  public destroy(): void {
    this.gl.deleteBuffer(this.glb);
    this.glb = null;
  }
}
