import { BufferType, GLRenderingDevice, ShaderType, VertexFormat } from '..';
import { BaseExample, bufferWithData } from './common';

const vert = `
uniform float angle;
attribute vec2 position;
attribute vec4 color;
varying lowp vec4 vColor;
void main () {
  gl_Position = vec4(
    cos(angle) * position.x - sin(angle) * position.y,
    sin(angle) * position.x + cos(angle) * position.y,
    0, 1
  );
  vColor = color;
}
`;

const frag = `
varying lowp vec4 vColor;
void main () {
  gl_FragColor = vColor;
}
`;

const position = new Float32Array([
  // positions   colors
  0.0, 0.5, 1.0, 0.0, 0.0, 1.0,
  0.5, -0.5, 0.0, 1.0, 0.0, 1.0,
  -0.5, -0.5, 0.0, 0.0, 1.0, 1.0,
]);

export class BasicExample extends BaseExample {
  buffer: any;
  pass: any;
  pipeline: any;
  angle = 0;

  rotate = (): void => {
    this.angle += Math.PI / 12;
    this.render();
  };

  constructor(private readonly device: GLRenderingDevice) {
    super();
  }

  init(): void {
    this.buffer = bufferWithData(this.device, BufferType.Vertex, position);

    this.pass = this.device.pass();

    const vs = this.device.shader({ type: ShaderType.Vertex, source: vert });
    const fs = this.device.shader({ type: ShaderType.Fragment, source: frag });

    this.pipeline = this.device.pipeline({
      vert: vs,
      frag: fs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float2 },
            { name: 'color', format: VertexFormat.Float4 }
          ]
        }
      ],
      uniforms: [ { name: 'angle' } ]
    });

    this.device.canvas.addEventListener('click', this.rotate);

    this.register(this.buffer, this.pipeline, this.pass, vs, fs);
  }

  render(): boolean {
    this.device.render(this.pass)
      .pipeline(this.pipeline)
      .vertex(0, this.buffer)
      .uniforms([{ name: 'angle', value: this.angle }])
      .draw(3)
      .end();

    return false;
  }

  destroy(): void {
    super.destroy();
    this.device.canvas.removeEventListener('click', this.rotate);
  }
}
