import { lookAt, mat, mat4, perspective, scale, translate, vec3 } from 'munum/assembly';
import {
  BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  FilterMode, Float, RenderPipeline, RenderPass, Sampler, ShaderStage, Texture,
  TextureFormat, TextureUsage, vertexBufferLayouts, VertexFormat, WebGL
} from '../interop/mugl';
import { BaseExample, createBuffer, Cube, Model, Quad, toIndices, toVertices } from '../common';

const sampleCount = 4;
const texSize = 512;

const vertCube = `#version 300 es
precision mediump float;
layout(std140) uniform Data {
  mat4 model, vp;
  vec3 color;
};
layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;
out vec3 vPosition;
out vec2 vUv;
void main(void) {
  vec4 worldPos = model * vec4(position, 1.0);
  vPosition = worldPos.xyz;
  vUv = uv;
  gl_Position = vp * worldPos;
}`;

const fragCube = `#version 300 es
precision mediump float;
layout(std140) uniform Data {
  mat4 model;
  mat4 vp;
  vec3 color;
};
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

const vertQuad = `#version 300 es
layout (location=0) in vec3 position;
layout (location=1) in vec2 uv;
out vec2 vUv;
void main(void) {
  gl_Position = vec4(position, 1.0);
  vUv = uv;
}
`;

const fragQuad = `#version 300 es
precision mediump float;
uniform sampler2D tex0, tex1, tex2;
in vec2 vUv;
out vec4 outColor;
void main(void) {
  vec4 colorSum =
    texture(tex0, vUv * 2.0 - vec2(0.0, 1.0)) * step(0.5, 1.0 - vUv.x) * step(0.5, vUv.y) +
    texture(tex1, vUv * 2.0 - vec2(0.0, 0.0)) * step(0.5, 1.0 - vUv.x) * step(0.5, 1.0 - vUv.y) +
    texture(tex2, vUv * 2.0 - vec2(1.0, 1.0)) * step(0.5, vUv.x) * step(0.5, vUv.y);
    outColor = vec4(colorSum.rgb, 1.0);
}
`;

const cubeVertices = toVertices({
  positions: Cube.positions,
  uvs: Cube.uvs
} as Model);
const cubeIndices = toIndices(Cube);

const quadVertices = toVertices(Quad);

export class MRTExample extends BaseExample {
  pass: RenderPass | null = null;
  offscreenPass: RenderPass | null = null;
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  quadVertBuffer: Buffer | null = null;
  cubeDataBuffer: Buffer | null = null;
  cubePipeline: RenderPipeline | null = null;
  quadPipeline: RenderPipeline | null = null;
  colorTex: Texture | null = null;
  uvTex: Texture | null = null;
  positionTex: Texture | null = null;
  depthTex: Texture | null = null;
  offscreenTexSampler: Sampler | null = null;
  offscreenTexBindGroup: BindGroup | null = null;
  cubeBindGroup: BindGroup | null = null;

  cubeData: Float32Array = new Float32Array(40);

  constructor(
    private readonly device: Device
  ) {
    super();
  }

  init(): void {
    // Create shaders
    const cubeVs = WebGL.createShader(this.device, { code: vertCube, usage: ShaderStage.Vertex });
    const cubeFs = WebGL.createShader(this.device, { code: fragCube, usage: ShaderStage.Fragment });
    const quadVs = WebGL.createShader(this.device, { code: vertQuad, usage: ShaderStage.Vertex });
    const quadFs = WebGL.createShader(this.device, { code: fragQuad, usage: ShaderStage.Fragment });

    const dataLayout = WebGL.createBindGroupLayout(this.device, {
      entries: [{ label: 'Data', type: BindingType.Buffer }]
    });

    // Setup the cube
    {
      this.vertBuffer = createBuffer(this.gpu, this.device, cubeVertices);
      this.indexBuffer = createBuffer(this.gpu, this.device, cubeIndices, BufferUsage.Index);
      this.cubeDataBuffer = createBuffer(this.gpu, this.device, this.cubeData, BufferUsage.Uniform | BufferUsage.Stream);

      this.cubeBindGroup = WebGL.createBindGroup(this.device, {
        layout: dataLayout,
        entries: [{ buffer: this.cubeDataBuffer }]
      });

      this.cubePipeline = WebGL.createRenderPipeline(this.device, {
        vertex: cubeVs,
        fragment: cubeFs,
        buffers: vertexBufferLayouts([
          { attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }
        ]),
        bindGroups: [dataLayout],
        depthStencil: {
          depthCompare: CompareFunction.LessEqual,
          depthWrite: true
        },
        primitive: {
          cullMode: CullMode.Back
        }
      });
    }

    // Setup the fullscreen quad
    const offscreenTexLayout = WebGL.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'tex0', type: BindingType.Texture }, { binding: 1, label: 'tex0', type: BindingType.Sampler },
        { binding: 2, label: 'tex1', type: BindingType.Texture }, { binding: 3, label: 'tex1', type: BindingType.Sampler },
        { binding: 4, label: 'tex2', type: BindingType.Texture }, { binding: 5, label: 'tex2', type: BindingType.Sampler },
      ]
    });
    {
      this.quadVertBuffer = createBuffer(this.gpu, this.device, quadVertices);
      this.colorTex = WebGL.createTexture(this.device, { size: [texSize, texSize, 1], sampleCount });
      this.uvTex = WebGL.createTexture(this.device, { size: [texSize, texSize, 1], sampleCount });
      this.positionTex = WebGL.createTexture(this.device, { size: [texSize, texSize, 1], sampleCount });
      this.offscreenTexSampler = WebGL.createSampler(this.device, {
        magFilter: FilterMode.Linear,
        minFilter: FilterMode.Linear,
      });

      this.offscreenTexBindGroup = WebGL.createBindGroup(this.device, {
        layout: offscreenTexLayout,
        entries: [
          { binding: 0, texture: this.colorTex }, { binding: 1, sampler: this.offscreenTexSampler },
          { binding: 2, texture: this.uvTex }, { binding: 3, sampler: this.offscreenTexSampler },
          { binding: 4, texture: this.positionTex }, { binding: 5, sampler: this.offscreenTexSampler },
        ]
      });

      this.quadPipeline = WebGL.createRenderPipeline(this.device, {
        vertex: quadVs,
        fragment: quadFs,
        bindGroups: [offscreenTexLayout],
        buffers: vertexBufferLayouts([
          { attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }
        ]),
      });
    }

    // Setup the offscreen pass
    {
      this.depthTex = WebGL.createTexture(this.device, {
        format: TextureFormat.Depth16,
        size: [texSize, texSize, 1],
        usage: TextureUsage.RenderAttachment,
        sampleCount
      });

      this.offscreenPass = WebGL.createRenderPass(this.device, {
        colors: [
          { view: { texture: this.colorTex! }, clear: [0.1, 0.2, 0.3, 1] },
          { view: { texture: this.uvTex! }, clear: [0.3, 0.1, 0.2, 1] },
          { view: { texture: this.positionTex! }, clear: [0.1, 0.3, 0.2, 1] }
        ],
        depthStencil: { texture: this.depthTex! },
        clearDepth: 1
      });
    }

    this.pass = WebGL.createRenderPass(this.device, {
      clearColor: [0, 0, 0, 1],
      clearDepth: 1
    });

    this.register([
      this.pass!, this.offscreenPass!,
      this.cubePipeline!, this.vertBuffer!, this.indexBuffer!, this.cubeDataBuffer!, this.cubeBindGroup!,
      this.quadPipeline!, this.quadVertBuffer!, this.offscreenTexBindGroup!,
      this.colorTex!, this.uvTex!, this.positionTex!, this.depthTex!, this.offscreenTexSampler!,
      cubeFs, cubeVs, quadFs, quadVs, dataLayout, offscreenTexLayout
    ]);
  }

  render(t: Float): boolean {
    // Update cube mvp
    {
      const pos = vec3.create(.5, .5, .5);
      const proj = perspective((this.width as Float) / (this.height as Float), Math.PI / 4 as Float, 0.01, 100);
      const view = lookAt(vec3.add([5 * Math.cos(t) as Float, 2.5 * Math.sin(t) as Float, 5 * Math.sin(t) as Float], pos), pos);
      const vp = mat4.mul(proj, view);

      let model = translate(pos);
      model = mat4.mul(model, scale([.5, .5, .5]), model);

      mat.copy(model, this.cubeData, 0, 0, 16);
      mat.copy(vp, this.cubeData, 0, 16, 16);
      mat.copy([1 as Float, 1, 1], this.cubeData, 0, 32, 3);
      WebGL.writeBuffer(this.device, this.cubeDataBuffer!, this.cubeData);
    }

    // Draw cube to textures
    WebGL.beginRenderPass(this.device, this.offscreenPass!);
    {
      WebGL.setRenderPipeline(this.device, this.cubePipeline!);
      WebGL.setIndex(this.device, this.indexBuffer!);
      WebGL.setVertex(this.device, 0, this.vertBuffer!);
      WebGL.setBindGroup(this.device, 0, this.cubeBindGroup!);
      WebGL.drawIndexed(this.device, cubeIndices.length);
    }
    WebGL.submitRenderPass(this.device);

    // Draw to screen
    WebGL.beginRenderPass(this.device, this.pass!);
    {
      WebGL.setRenderPipeline(this.device, this.quadPipeline!);
      WebGL.setVertex(this.device, 0, this.quadVertBuffer!);
      WebGL.setBindGroup(this.device, 0, this.offscreenTexBindGroup!);
      WebGL.draw(this.device, 6);
    }
    WebGL.submitRenderPass(this.device);

    return true;
  }
}
