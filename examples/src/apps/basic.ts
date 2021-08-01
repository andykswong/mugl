import { Buffer, Float, Pipeline, RenderingDevice, RenderPass, ShaderType, VertexFormat } from 'mugl';
import { BaseExample, createBuffer, toVertices, Triangle } from '../common';

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

const position = toVertices(Triangle);

export class BasicExample extends BaseExample {
  buffer: Buffer | null = null;
  pass: RenderPass | null = null;
  pipeline: Pipeline | null = null;
  angle: Float = 0;

  constructor(private readonly device: RenderingDevice) {
    super();
  }

  init(): void {
    const vs = this.device.shader({ type: ShaderType.Vertex, source: vert });
    const fs = this.device.shader({ type: ShaderType.Fragment, source: frag });
    this.buffer = createBuffer(this.device, position);
    this.pass = this.device.pass();
    this.pipeline = this.device.pipeline({
      vert: vs,
      frag: fs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'color', format: VertexFormat.Float4 }
          ]
        }
      ],
      uniforms: [ { name: 'angle' } ]
    });

    this.register([ this.buffer!, this.pipeline!, this.pass!, vs, fs ]);
  }

  render(delta: Float): boolean {
    this.device.render(this.pass!)
      .pipeline(this.pipeline!)
      .vertex(0, this.buffer!)
      .uniforms([{ name: 'angle', value: delta / 30 * Math.PI as Float }])
      .draw(3)
      .end();
    return true;
  }
}
