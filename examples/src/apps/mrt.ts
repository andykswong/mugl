import { lookAt, mat4, perspective, scale, translate, vec3 } from 'munum';
import { Buffer, BufferType, CompareFunc, CullMode, RenderingDevice, PixelFormat, TextureDescriptor, VertexFormat, UniformType, UniformFormat, ShaderType, RenderPass, Pipeline, Texture, Float } from 'mugl';
import { BaseExample, createBuffer, Cube, Model, Quad, toIndices, toVertices } from '../common';

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

const cubeVertices = toVertices({
  positions: Cube.positions,
  uvs: Cube.uvs
} as Model);
const cubeIndices = toIndices(Cube);

const quadVertices = toVertices(Quad);

export class MRTExample extends BaseExample {
  offscreenPass: RenderPass | null = null;
  defaultPass: RenderPass | null = null;
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  cubePipeline: Pipeline | null = null;
  quadVertBuffer: Buffer | null = null;
  quadPipeline: Pipeline | null = null;
  colorTex: Texture | null = null;
  uvTex: Texture | null = null;
  positionTex: Texture | null = null;
  depthTex: Texture | null = null;

  constructor(
    private readonly device: RenderingDevice,
    private readonly webgl2: boolean
  ) {
    super();
  }

  init(): void {
    const cubeVs = this.device.shader({ type: ShaderType.Vertex, source: this.webgl2 ? vertCubeGL2 : vertCube });
    const cubeFs = this.device.shader({ type: ShaderType.Fragment, source: this.webgl2 ? fragCubeGL2 : fragCube });
    const quadVs = this.device.shader({ type: ShaderType.Vertex, source: vertQuad });
    const quadFs = this.device.shader({ type: ShaderType.Fragment, source: fragQuad });

    // Setup the cube
    this.vertBuffer = createBuffer(this.device, cubeVertices);
    this.indexBuffer = createBuffer(this.device, cubeIndices, BufferType.Index);
    this.cubePipeline = this.device.pipeline({
      vert: cubeVs,
      frag: cubeFs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: [
        { name: 'model', valueFormat: UniformFormat.Mat4 },
        { name: 'vp', valueFormat: UniformFormat.Mat4 },
        { name: 'color', valueFormat: UniformFormat.Vec3 },
      ],
      depth: {
        compare: CompareFunc.LEqual,
        write: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    });

    // Setup the fullscreen quad
    const offTexDesc: TextureDescriptor = {
      width: texSize,
      height: texSize
    };

    this.colorTex = this.device.texture(offTexDesc);
    this.uvTex = this.device.texture(offTexDesc);
    this.positionTex = this.device.texture(offTexDesc);

    this.depthTex = this.device.texture({
      width: texSize,
      height: texSize,
      format: PixelFormat.Depth,
      renderTarget: true
    });

    this.quadVertBuffer = createBuffer(this.device, quadVertices);
    this.quadPipeline = this.device.pipeline({
      vert: quadVs,
      frag: quadFs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: [
        { name: 'tex0', type: UniformType.Tex, texType: this.colorTex!.props.type },
        { name: 'tex1', type: UniformType.Tex, texType: this.uvTex!.props.type },
        { name: 'tex2', type: UniformType.Tex, texType: this.positionTex!.props.type }
      ]
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

    this.register([
      this.defaultPass!, this.offscreenPass!,
      this.cubePipeline!, this.vertBuffer!, this.indexBuffer!,
      this.quadPipeline!, this.quadVertBuffer!,
      this.colorTex!, this.uvTex!, this.positionTex!, this.depthTex!,
      cubeFs, cubeVs, quadFs, quadVs
    ]);
  }

  render(t: Float): boolean {
    const pos = vec3.create(.5, .5, .5);
    const proj = perspective((this.device.width as Float) / (this.device.height as Float), Math.PI / 4 as Float, 0.01, 100);
    const view = lookAt(vec3.add([5 * Math.cos(t) as Float, 2.5 * Math.sin(t) as Float, 5 * Math.sin(t) as Float], pos), pos);
    const vp = mat4.mul(proj, view);

    let model = translate(pos);
    model = mat4.mul(model, scale([.5, .5, .5]), model);

    // Draw cube to textures
    this.device.render(this.offscreenPass!)
      .pipeline(this.cubePipeline!)
      .vertex(0, this.vertBuffer!)
      .index(this.indexBuffer!)
      .uniforms([
        { name: 'model', values: model },
        { name: 'vp', values: vp },
        { name: 'color', values: [1, 1, 1] }
      ])
      .drawIndexed(cubeIndices.length)
      .end();

    // Draw to screen
    this.device.render(this.defaultPass!)
      .pipeline(this.quadPipeline!)
      .vertex(0, this.quadVertBuffer!)
      .uniforms([
        { name: 'tex0', tex: this.colorTex },
        { name: 'tex1', tex: this.uvTex },
        { name: 'tex2', tex: this.positionTex },
      ])
      .draw(6)
      .end();

    return true;
  }
}
