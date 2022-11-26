import { lookAt, mat, mat4, perspective, ReadonlyMat4 } from 'munum/assembly';
import {
  BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  FilterMode, Float, Int, RenderPipeline, RenderPass, Sampler, ShaderStage, Texture,
  TextureFormat, TextureUsage, vertexBufferLayouts, VertexFormat, WebGL
} from '../interop/mugl';
import { BaseExample, createBuffer, Cube, Model, Quad, toIndices, toVertices } from '../common';

const sampleCount = 1;
const texSize = 512;

// 3x3 kernels with padding
// See: https://en.wikipedia.org/wiki/Kernel_(image_processing)
const kernels: ReadonlyMat4[] = [
  // edge detection
  [
    -1, -1, -1, 0,
    -1, 8, -1, 0,
    -1, -1, -1, 0,
    0, 0, 0, 0,
  ],
  // emboss
  [
    -2, -1, 0, 0,
    -1, 1, 1, 0,
    0, 1, 2, 0,
    0, 0, 0, 0,
  ],
  // edge detection 2
  [
    0, -1, 0, 0,
    -1, 4, -1, 0,
    0, -1, 0, 0,
    0, 0, 0, 0,
  ],
  // identity
  [
    0, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ],
];

const vertCube = `#version 300 es
layout(std140) uniform Data {
  mat4 mvp;
};
layout (location=0) in vec4 position;
layout (location=1) in vec4 color;
out vec4 vColor;
void main(void) {
  gl_Position = mvp * position;
  vColor = color;
}`;

const fragCube = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 outColor;
void main(void) {
  outColor = vColor;
}`;

const vertQuad = `#version 300 es
layout (location=0) in vec4 position;
layout (location=1) in vec2 uv;
out vec2 vUv;
void main(void) {
  gl_Position = position;
  vUv = uv;
}`;

const fragQuad = `#version 300 es
precision mediump float;
uniform sampler2D tex;
layout(std140) uniform Data {
  mat4 kernel;
  vec2 texSize;
  float kernelWeight;
};
in vec2 vUv;
out vec4 outColor;
void main(void) {
  vec2 onePixel = vec2(1.0, 1.0) / texSize;
  vec4 colorSum =
    texture(tex, vUv + onePixel * vec2(-1, -1)) * kernel[0][0] +
    texture(tex, vUv + onePixel * vec2( 0, -1)) * kernel[0][1] +
    texture(tex, vUv + onePixel * vec2( 1, -1)) * kernel[0][2] +
    texture(tex, vUv + onePixel * vec2(-1,  0)) * kernel[1][0] +
    texture(tex, vUv + onePixel * vec2( 0,  0)) * kernel[1][1] +
    texture(tex, vUv + onePixel * vec2( 1,  0)) * kernel[1][2] +
    texture(tex, vUv + onePixel * vec2(-1,  1)) * kernel[2][0] +
    texture(tex, vUv + onePixel * vec2( 0,  1)) * kernel[2][1] +
    texture(tex, vUv + onePixel * vec2( 1,  1)) * kernel[2][2] ;
    outColor = vec4((colorSum / kernelWeight).rgb, 1);
}`;

const cubeVertices = toVertices({
  positions: Cube.positions,
  colors: Cube.colors
} as Model);
const cubeIndices = toIndices(Cube);

const quadVertices = toVertices(Quad);

export class PostprocessExample extends BaseExample {
  offscreenPass: RenderPass | null = null;
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  quadVertBuffer: Buffer | null = null;
  cubeDataBuffer: Buffer | null = null;
  kernelDataBuffer: Buffer | null = null;
  cubePipeline: RenderPipeline | null = null;
  quadPipeline: RenderPipeline | null = null;
  offscreenTex: Texture | null = null;
  offscreenTexSampler: Sampler | null = null;
  depthTex: Texture | null = null;
  offscreenTexBindGroup: BindGroup | null = null;
  cubeBindGroup: BindGroup | null = null;
  kernelBindGroup: BindGroup | null = null;

  cubeData: Float32Array = new Float32Array(16);
  kernelData: Float32Array = new Float32Array(20);

  constructor(private readonly device: Device) {
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
      this.vertBuffer = createBuffer(this.device, cubeVertices);
      this.indexBuffer = createBuffer(this.device, cubeIndices, BufferUsage.Index);
      this.cubeDataBuffer = createBuffer(this.device, this.cubeData, BufferUsage.Uniform | BufferUsage.Stream);

      this.cubeBindGroup = WebGL.createBindGroup(this.device, {
        layout: dataLayout,
        entries: [{ buffer: this.cubeDataBuffer }]
      });

      this.cubePipeline = WebGL.createRenderPipeline(this.device, {
        vertex: cubeVs,
        fragment: cubeFs,
        buffers: vertexBufferLayouts([
          { attributes: [/* position */ VertexFormat.F32x3, /* color */ VertexFormat.F32x4] }
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
        { binding: 0, label: 'tex', type: BindingType.Texture },
        { binding: 1, label: 'tex', type: BindingType.Sampler },
      ]
    });
    {
      this.quadVertBuffer = createBuffer(this.device, quadVertices);
      this.kernelDataBuffer = createBuffer(this.device, this.kernelData, BufferUsage.Uniform | BufferUsage.Stream);

      this.offscreenTex = WebGL.createTexture(this.device, { size: [texSize, texSize, 1], sampleCount });
      this.offscreenTexSampler = WebGL.createSampler(this.device, {
        magFilter: FilterMode.Linear,
        minFilter: FilterMode.Linear,
      });

      this.offscreenTexBindGroup = WebGL.createBindGroup(this.device, {
        layout: offscreenTexLayout,
        entries: [
          { binding: 0, texture: this.offscreenTex },
          { binding: 1, sampler: this.offscreenTexSampler }
        ]
      });

      this.kernelBindGroup = WebGL.createBindGroup(this.device, {
        layout: dataLayout,
        entries: [{ buffer: this.kernelDataBuffer }]
      });

      this.quadPipeline = WebGL.createRenderPipeline(this.device, {
        vertex: quadVs,
        fragment: quadFs,
        bindGroups: [offscreenTexLayout, dataLayout],
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
        colors: [{
          view: { texture: this.offscreenTex! },
          clear: [0.25, 0.25, 0.25, 1],
        }],
        depthStencil: { texture: this.depthTex! },
        clearDepth: 1
      });
    }

    this.register([
      this.cubePipeline!, this.vertBuffer!, this.indexBuffer!, this.cubeDataBuffer!, this.kernelDataBuffer!,
      this.quadPipeline!, this.quadVertBuffer!, this.offscreenTex!, this.offscreenTexSampler!, this.depthTex!,
      this.offscreenPass!, this.cubeBindGroup!, this.offscreenTexBindGroup!, this.kernelBindGroup!,
      cubeFs, cubeVs, quadFs, quadVs, offscreenTexLayout, dataLayout,
    ]);
  }

  render(t: Float): boolean {
    // Update cube mvp
    {
      const proj = perspective((this.width as Float) / (this.height as Float), Math.PI / 4 as Float, 0.01, 100);
      const view = lookAt([10 * Math.cos(t) as Float, 5 * Math.sin(t) as Float, 10 * Math.sin(t) as Float], [0, 0, 0]);
      const mvp = mat4.mul(proj, view);
      mat.copy(mvp, this.cubeData, 0, 0, 16);
      WebGL.writeBuffer(this.device, this.cubeDataBuffer!, this.cubeData);
    }

    // Update kernel
    {
      const kernel = kernels[Math.floor(t / 2) as Int % kernels.length];
      let kernelWeight: Float = 0;
      for (let i = 0; i < kernel.length; ++i) {
        kernelWeight += kernel[i];
      }
      kernelWeight = kernelWeight <= 0 ? 1 : kernelWeight;

      mat.copy(kernel, this.kernelData, 0, 0, 16);
      this.kernelData[16] = texSize as Float;
      this.kernelData[17] = texSize as Float;
      this.kernelData[18] = kernelWeight;
      WebGL.writeBuffer(this.device, this.kernelDataBuffer!, this.kernelData);
    }

    // Draw cube to texture
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
    WebGL.beginDefaultPass(this.device, {
      clearColor: [0, 0, 0, 1],
      clearDepth: 1
    });
    {
      WebGL.setRenderPipeline(this.device, this.quadPipeline!);
      WebGL.setVertex(this.device, 0, this.quadVertBuffer!);
      WebGL.setBindGroup(this.device, 0, this.offscreenTexBindGroup!);
      WebGL.setBindGroup(this.device, 1, this.kernelBindGroup!);
      WebGL.draw(this.device, 6);
    }
    WebGL.submitRenderPass(this.device);

    return true;
  }
}
