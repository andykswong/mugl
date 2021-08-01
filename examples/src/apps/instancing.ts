import { Buffer, BufferType, Float, Pipeline, RenderingDevice, RenderPass, ShaderType, UniformFormat, Usage, VertexFormat } from 'mugl';
import { BaseExample, createBuffer, createFloat32Array } from '../common';

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
const position = createFloat32Array([
  0.0, -0.05,
  -0.05, 0.0,
  0.05, 0.05
]);
const offsetAndColor = new Float32Array(N * N * 5);
const angle = new Float32Array(N * N);

const fN = N as Float;
for (let i = 0; i < N * N; i++) {
  angle[i] = Math.random() * (2 * Math.PI) as Float;

  // Offsets
  offsetAndColor[5 * i] = (-1 + 2 * Math.floor(i / N) / fN + 0.1) as Float;
  offsetAndColor[5 * i + 1] = (-1 + 2 * ((i % N) as Float) / fN + 0.1) as Float;

  // Colors
  const r = (Math.floor(i / N) / fN) as Float;
  const g = ((i % N) as Float) / fN;
  const b = r * g + 0.2;
  offsetAndColor[5 * i + 2] = r;
  offsetAndColor[5 * i + 3] = g;
  offsetAndColor[5 * i + 4] = b;
}

export class InstancingExample extends BaseExample {
  position: Buffer | null = null;
  offsetColor: Buffer | null = null;
  angle: Buffer | null = null;
  pass: RenderPass | null = null;
  pipeline: Pipeline | null = null;
  t: Float = 0;

  constructor(private readonly device: RenderingDevice) {
    super();
  }

  init(): void {
    const vs = this.device.shader({ type: ShaderType.Vertex, source: vert });
    const fs = this.device.shader({ type: ShaderType.Fragment, source: frag });

    this.position = createBuffer(this.device, position);
    this.offsetColor = createBuffer(this.device, offsetAndColor);
    this.angle = createBuffer(this.device, angle, BufferType.Vertex, Usage.Stream);
    this.pass = this.device.pass({ clearColor: [0, 0, 0, 1] });
    this.pipeline = this.device.pipeline({
      vert: vs,
      frag: fs,
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
      uniforms: [
        { name: 'ambient', valueFormat: UniformFormat.Vec3 }
      ]
    });

    this.register([this.position!, this.offsetColor!, this.angle!, this.pipeline!, this.pass!, vs, fs]);
  }

  render(t: Float): boolean {
    for (let i = 0; i < N * N; i++) {
      angle[i] += (this.t - t - 2 * Math.PI * Math.floor(angle[i] / Math.PI / 2)) as Float;
    }
    this.t = t;
    const a = Math.sin(t) / 2 as Float;

    this.angle!.data(angle);

    this.device.render(this.pass!)
      .pipeline(this.pipeline!)
      .uniforms([{ name: 'ambient', values: [a, a, a] }])
      .vertex(0, this.position!)
      .vertex(1, this.offsetColor!)
      .vertex(2, this.angle!)
      .draw(3, N * N)
      .end();

    return true;
  }
}
