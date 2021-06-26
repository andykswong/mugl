import { mat4, vec3 } from 'gl-matrix';
import { BufferType, CompareFunc, CullMode, GLRenderingDevice, PixelFormat, VertexFormat, Extent2D, UniformType, UniformFormat } from '..';
import { BaseExample, bufferWithData, flatMap } from './common';
import { Cube, Quad } from './data';

const texSize = 1024;

const vertCube = `
precision mediump float;
uniform mat4 model, vp;
attribute vec3 position;
attribute vec2 uv;
varying vec3 vPosition;
varying vec2 vUv;
void main(void) {
  vec4 worldPos = model * vec4(position, 1.0);
  vPosition = worldPos.xyz;
  vUv = uv;
  gl_Position = vp * worldPos;
}`;

const fragCube = `
#extension GL_EXT_draw_buffers : require
precision mediump float;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 color;
void main(void) {
  gl_FragData[0] = vec4(color, 1.0);
  gl_FragData[1] = vec4(vUv, 0.0, 0.0);
  gl_FragData[2] = vec4(vPosition, 0.0);
}`;

const vertCubeGL2 = `#version 300 es
precision mediump float;
uniform mat4 model, vp;
in vec3 position;
in vec2 uv;
out vec3 vPosition;
out vec2 vUv;
void main(void) {
  vec4 worldPos = model * vec4(position, 1.0);
  vPosition = worldPos.xyz;
  vUv = uv;
  gl_Position = vp * worldPos;
}`;

const fragCubeGL2 = `#version 300 es
precision mediump float;
uniform vec3 color;
in vec3 vPosition;
in vec2 vUv;
layout(location = 0) out vec4 out0;
layout(location = 1) out vec4 out1;
layout(location = 2) out vec4 out2;
void main(void) {
  out0 = vec4(color, 1.0);
  out1 = vec4(vUv, 0.0, 0.0);
  out2 = vec4(vPosition, 0.0);
}`;

const vertQuad = `
attribute vec4 position;
attribute vec2 uv;
varying vec2 vUv;
void main(void) {
  gl_Position = position;
  vUv = uv;
}
`;

const fragQuad = `
precision mediump float;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;
varying vec2 vUv;
void main(void) {
  vec4 colorSum =
    texture2D(tex0, vUv * 2.0 - vec2(0.0, 1.0)) * step(0.5, 1.0 - vUv.x) * step(0.5, vUv.y) +
    texture2D(tex1, vUv * 2.0 - vec2(0.0, 0.0)) * step(0.5, 1.0 - vUv.x) * step(0.5, 1.0 - vUv.y) +
    texture2D(tex2, vUv * 2.0 - vec2(1.0, 1.0)) * step(0.5, vUv.x) * step(0.5, vUv.y);
  gl_FragColor = vec4(colorSum.rgb, 1.0);
}
`;

const cubeVertices = new Float32Array(flatMap(Cube.positions, (p, i) => [...p, ...Cube.uvs[i]]));
const cubeIndices = new Uint16Array(flatMap(Cube.indices, v => v));

const quadVertices = new Float32Array(flatMap(Quad.positions, (p, i) => [...p, ...Quad.uvs[i]]));

export class MRTExample extends BaseExample {
  offscreenPass: any;
  defaultPass: any;
  vertBuffer: any;
  indexBuffer: any;
  cubePipeline: any;
  quadVertBuffer: any;
  quadPipeline: any;
  colorTex: any;
  uvTex: any;
  positionTex: any;
  depthTex: any;

  constructor(private readonly device: GLRenderingDevice) {
    super();
  }

  init(): void {
    // Setup the cube
    this.vertBuffer = bufferWithData(this.device, BufferType.Vertex, cubeVertices);
    this.indexBuffer = bufferWithData(this.device, BufferType.Index, cubeIndices);
    this.cubePipeline = this.device.pipeline({
      vert: this.device.webgl2 ? vertCubeGL2 : vertCube,
      frag: this.device.webgl2 ? fragCubeGL2 : fragCube,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: {
        'model': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'vp': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'color': { type: UniformType.Value, format: UniformFormat.Vec3 },
      },
      depth: {
        compare: CompareFunc.LEqual,
        writeEnabled: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    });

    // Setup the fullscreen quad
    const offTexDesc = {
      size: [texSize, texSize] as Required<Extent2D>
    };

    this.colorTex = this.device.texture(offTexDesc);
    this.uvTex = this.device.texture(offTexDesc);
    this.positionTex = this.device.texture(offTexDesc);

    this.depthTex = this.device.texture({
      ...offTexDesc,
      format: PixelFormat.Depth
    });

    this.quadVertBuffer = bufferWithData(this.device, BufferType.Vertex, quadVertices);
    this.quadPipeline = this.device.pipeline({
      vert: vertQuad,
      frag: fragQuad,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: {
        'tex0': { type: UniformType.Tex, format: this.colorTex.type },
        'tex1': { type: UniformType.Tex, format: this.uvTex.type },
        'tex2': { type: UniformType.Tex, format: this.positionTex.type }
      }
    });

    this.defaultPass = this.device.pass({
      clearColor: [0, 0, 0, 1],
      clearDepth: 1
    });

    this.offscreenPass = this.device.pass({
      color: [
        { tex: this.colorTex },
        { tex: this.uvTex },
        { tex: this.positionTex }
      ],
      depth: { tex: this.depthTex },
      clearColor: [0, 0, 0, 1],
      clearDepth: 1
    });

    this.register(
      this.defaultPass, this.offscreenPass,
      this.cubePipeline, this.vertBuffer, this.indexBuffer,
      this.quadPipeline, this.quadVertBuffer,
      this.colorTex, this.uvTex, this.positionTex, this.depthTex
    );
  }

  render(t: number): boolean {
    const pos: vec3 = [.5, .5, .5];
    const proj =  mat4.perspective(mat4.create(), Math.PI / 4, this.device.canvas.width / this.device.canvas.height, 0.01, 100);
    const view = mat4.lookAt(mat4.create(), vec3.add(vec3.create(), [5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)], pos), pos, [0, 1, 0]);
    const vp = mat4.mul(view, proj, view);

    let model = mat4.fromTranslation(mat4.create(), pos);
    model = mat4.mul(model, model, mat4.fromScaling(mat4.create(), [.5, .5, .5]));

    // Draw cube to textures
    this.device.render(this.offscreenPass)
      .pipeline(this.cubePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms({
        'model': model,
        'vp': vp,
        'color': [1, 1, 1]
      })
      .drawIndexed(cubeIndices.length)
      .end();

    // Draw to screen
    this.device.render(this.defaultPass)
      .pipeline(this.quadPipeline)
      .vertex(0, this.quadVertBuffer)
      .uniforms({
        'tex0': this.colorTex,
        'tex1': this.uvTex,
        'tex2': this.positionTex,
      })
      .draw(6)
      .end();

    return true;
  }
}
