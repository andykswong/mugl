import { lookAt, mat, mat4, perspective, ReadonlyMat4 } from 'munum/assembly';
import {
  BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  FilterMode, Float, Int, RenderPipeline, RenderPass, Sampler, ShaderStage, Texture,
  TextureFormat, TextureUsage, vertexBufferLayouts, VertexFormat
} from '../interop/mugl';
import { BaseExample, createBuffer, Cube, Model, Quad, toIndices, toVertices } from '../common';
import { vertCube, fragCube, vertQuad, fragQuad } from './shaders/postprocess';

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

const cubeVertices = toVertices({ positions: Cube.positions, colors: Cube.colors } as Model);
const cubeIndices = toIndices(Cube);

const quadVertices = toVertices(Quad);

export class PostprocessExample extends BaseExample {
  pass: RenderPass | null = null;
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

  constructor(private readonly device: Device, useWebGPU: boolean) {
    super(useWebGPU);
  }

  init(): void {
    const cubeVs = this.gpu.createShader(this.device, { code: vertCube(this.useWebGPU), usage: ShaderStage.Vertex });
    const cubeFs = this.gpu.createShader(this.device, { code: fragCube(this.useWebGPU), usage: ShaderStage.Fragment });
    const quadVs = this.gpu.createShader(this.device, { code: vertQuad(this.useWebGPU), usage: ShaderStage.Vertex });
    const quadFs = this.gpu.createShader(this.device, { code: fragQuad(this.useWebGPU), usage: ShaderStage.Fragment });

    const dataLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [{ label: 'Data', type: BindingType.Buffer }]
    });
    const offscreenTexLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'tex', type: BindingType.Texture },
        { binding: 1, label: 'tex', type: BindingType.Sampler },
      ]
    });

    // Setup the cube
    {
      this.cubePipeline = this.gpu.createRenderPipeline(this.device, {
        vertex: cubeVs,
        fragment: cubeFs,
        buffers: vertexBufferLayouts([{ attributes: [/* position */ VertexFormat.F32x3, /* color */ VertexFormat.F32x4] }]),
        bindGroups: [dataLayout],
        depthStencil: {
          format: TextureFormat.Depth16,
          depthCompare: CompareFunction.LessEqual,
          depthWrite: true
        },
        primitive: { cullMode: CullMode.Back },
        targets: { targets: [{ format: TextureFormat.RGBA8 }] }
      });

      this.vertBuffer = createBuffer(this.gpu, this.device, cubeVertices);
      this.indexBuffer = createBuffer(this.gpu, this.device, cubeIndices, BufferUsage.Index);
      this.cubeDataBuffer = createBuffer(this.gpu, this.device, this.cubeData, BufferUsage.Uniform | BufferUsage.Stream);

      this.cubeBindGroup = this.gpu.createBindGroup(this.device, {
        layout: dataLayout,
        entries: [{ buffer: this.cubeDataBuffer }]
      });
    }

    // Setup the fullscreen quad
    {
      this.quadPipeline = this.gpu.createRenderPipeline(this.device, {
        vertex: quadVs,
        fragment: quadFs,
        bindGroups: [offscreenTexLayout, dataLayout],
        buffers: vertexBufferLayouts([{ attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }]),
        depthStencil: { format: TextureFormat.Depth24Stencil8 },
      });

      this.quadVertBuffer = createBuffer(this.gpu, this.device, quadVertices);
      this.kernelDataBuffer = createBuffer(this.gpu, this.device, this.kernelData, BufferUsage.Uniform | BufferUsage.Stream);

      this.offscreenTex = this.gpu.createTexture(this.device, {
        format: TextureFormat.RGBA8,
        size: [texSize, texSize, 1],
        sampleCount,
        usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment,
      });
      this.offscreenTexSampler = this.gpu.createSampler(this.device, { magFilter: FilterMode.Linear, minFilter: FilterMode.Linear });

      this.offscreenTexBindGroup = this.gpu.createBindGroup(this.device, {
        layout: offscreenTexLayout,
        entries: [
          { binding: 0, texture: this.offscreenTex },
          { binding: 1, sampler: this.offscreenTexSampler }
        ]
      });

      this.kernelBindGroup = this.gpu.createBindGroup(this.device, {
        layout: dataLayout,
        entries: [{ buffer: this.kernelDataBuffer }]
      });
    }

    // Setup the offscreen pass
    {
      this.depthTex = this.gpu.createTexture(this.device, {
        format: TextureFormat.Depth16,
        size: [texSize, texSize, 1],
        usage: TextureUsage.RenderAttachment,
        sampleCount
      });

      this.offscreenPass = this.gpu.createRenderPass(this.device, {
        colors: [{
          view: { texture: this.offscreenTex! },
          clear: [0.25, 0.25, 0.25, 1],
        }],
        depthStencil: { texture: this.depthTex! },
        clearDepth: 1
      });
    }

    // Setup the on-screen pass
    this.pass = this.gpu.createRenderPass(this.device, { clearColor: [0, 0, 0, 1], clearDepth: 1 });

    this.register([
      this.cubePipeline!, this.vertBuffer!, this.indexBuffer!, this.cubeDataBuffer!, this.kernelDataBuffer!,
      this.quadPipeline!, this.quadVertBuffer!, this.offscreenTex!, this.offscreenTexSampler!, this.depthTex!,
      this.pass!, this.offscreenPass!, this.cubeBindGroup!, this.offscreenTexBindGroup!, this.kernelBindGroup!,
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
      this.gpu.writeBuffer(this.device, this.cubeDataBuffer!, this.cubeData);
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
      this.gpu.writeBuffer(this.device, this.kernelDataBuffer!, this.kernelData);
    }

    // Draw cube to quad texture
    this.gpu.beginRenderPass(this.device, this.offscreenPass!);
    {
      this.gpu.setRenderPipeline(this.device, this.cubePipeline!);
      this.gpu.setIndex(this.device, this.indexBuffer!);
      this.gpu.setVertex(this.device, 0, this.vertBuffer!);
      this.gpu.setBindGroup(this.device, 0, this.cubeBindGroup!);
      this.gpu.drawIndexed(this.device, cubeIndices.length);
    }
    this.gpu.submitRenderPass(this.device);

    // Draw quad texture to screen
    this.gpu.beginRenderPass(this.device, this.pass!);
    {
      this.gpu.setRenderPipeline(this.device, this.quadPipeline!);
      this.gpu.setVertex(this.device, 0, this.quadVertBuffer!);
      this.gpu.setBindGroup(this.device, 0, this.offscreenTexBindGroup!);
      this.gpu.setBindGroup(this.device, 1, this.kernelBindGroup!);
      this.gpu.draw(this.device, 6);
    }
    this.gpu.submitRenderPass(this.device);

    return true;
  }
}
