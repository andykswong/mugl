import { BufferType, RenderingDevice, UniformFormat, UniformType, Usage, VertexFormat } from '..';
import { BaseExample, bufferWithData } from './common';

const vert = `
precision mediump float;
attribute vec2 position;
attribute vec3 color;
attribute vec2 offset;
attribute float angle;
varying vec3 vColor;
void main() {
  gl_Position = vec4(
    cos(angle) * position.x + sin(angle) * position.y + offset.x,
    -sin(angle) * position.x + cos(angle) * position.y + offset.y,
    0, 1);
  vColor = color;
}
`;

const frag = `
precision mediump float;
uniform vec3 ambient;
varying vec3 vColor;
void main () {
  gl_FragColor = vec4(ambient + vColor, 1.0);
}
`;

const N = 10; // N * N triangles

const position = new Float32Array([
  0.0, -0.05,
  -0.05, 0.0,
  0.05, 0.05
]);
const offsetAndColor = new Float32Array(N * N * 5);
const angle = new Float32Array(N * N);

for (let i = 0; i < N * N; i++) {
  angle[i] = Math.random() * (2 * Math.PI);

  // Offsets
  offsetAndColor[5 * i] = -1 + 2 * Math.floor(i / N) / N + 0.1;
  offsetAndColor[5 * i + 1] = -1 + 2 * (i % N) / N + 0.1;

  // Colors
  const r = Math.floor(i / N) / N;
  const g = (i % N) / N;
  const b = r * g + 0.2;
  offsetAndColor[5 * i + 2] = r;
  offsetAndColor[5 * i + 3] = g;
  offsetAndColor[5 * i + 4] = b;
}

export class InstancingExample extends BaseExample {
  position: any;
  offsetColor: any;
  angle: any;
  pass: any;
  pipeline: any;
  t = 0;

  constructor(device: RenderingDevice) {
    super(device);
  }

  init(): void {
    const ctx = this.device;

    this.position = bufferWithData(ctx, BufferType.Vertex, position);
    this.offsetColor = bufferWithData(ctx, BufferType.Vertex, offsetAndColor);
    this.angle = bufferWithData(ctx, BufferType.Vertex, angle, Usage.Stream);

    this.pass = ctx.pass({ clearColor: [0, 0, 0, 1] });

    this.pipeline = ctx.pipeline({
      vert,
      frag,
      buffers: [
        {
          attrs: [{ name: 'position', format: VertexFormat.Float2 }]
        },
        {
          attrs: [
            { name: 'offset', format: VertexFormat.Float2 },
            { name: 'color', format: VertexFormat.Float3 },
          ],
          instanced: true
        },
        {
          attrs: [{ name: 'angle', format: VertexFormat.Float }],
          instanced: true
        },
      ],
      uniforms: {
        'ambient': { type: UniformType.Value, format: UniformFormat.Vec3 }
      }
    });

    this.register(this.position, this.offsetColor, this.angle, this.pipeline, this.pass);
  }

  render(t: number): boolean {
    for (let i = 0; i < N * N; i++) {
      angle[i] += this.t - t - 2 * Math.PI * ((angle[i] / Math.PI / 2) | 0);
    }
    this.t = t;
    this.angle.data(angle);
    const a = Math.sin(t) / 2;

    this.device.render(this.pass)
      .pipeline(this.pipeline)
      .uniforms({
        'ambient': [a, a, a]
      })
      .vertex(0, this.position)
      .vertex(1, this.offsetColor)
      .vertex(2, this.angle)
      .draw(3, N * N)
      .end();

    return true;
  }
}
