import { lookAt, mat, mat4, perspective, scale, translate, vec3 } from 'munum/assembly';
import {
  BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  FilterMode, Float, RenderPipeline, RenderPass, Sampler, ShaderStage, Texture,
  TextureFormat, TextureUsage, vertexBufferLayouts, VertexFormat
} from '../interop/mugl';
import { BaseExample, createBuffer, Cube, Model, Quad, toIndices, toVertices } from '../common';
import { fragCube, fragQuad, vertCube, vertQuad } from './shaders/mrt';

const sampleCount = 4;
const texSize = 512;

const cubeVertices = toVertices({ positions: Cube.positions, uvs: Cube.uvs } as Model);
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

  constructor( private readonly device: Device, useWebGPU: boolean) {
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
        { binding: 0, label: 'tex0', type: BindingType.Texture }, { binding: 1, label: 'tex0', type: BindingType.Sampler },
        { binding: 2, label: 'tex1', type: BindingType.Texture }, { binding: 3, label: 'tex1', type: BindingType.Sampler },
        { binding: 4, label: 'tex2', type: BindingType.Texture }, { binding: 5, label: 'tex2', type: BindingType.Sampler },
      ]
    });

    // Setup the cube
    {
      this.cubePipeline = this.gpu.createRenderPipeline(this.device, {
        vertex: cubeVs,
        fragment: cubeFs,
        buffers: vertexBufferLayouts([{ attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }]),
        bindGroups: [dataLayout],
        depthStencil: {
          format: TextureFormat.Depth16,
          depthCompare: CompareFunction.LessEqual,
          depthWrite: true
        },
        primitive: { cullMode: CullMode.Back },
        targets: { targets: [{ format: TextureFormat.RGBA8 }, { format: TextureFormat.RGBA8 }, { format: TextureFormat.RGBA8 }] },
        multisample: { sampleCount },
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
        bindGroups: [offscreenTexLayout],
        buffers: vertexBufferLayouts([{ attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }]),
        depthStencil: { format: TextureFormat.Depth24Stencil8 },
      });

      this.quadVertBuffer = createBuffer(this.gpu, this.device, quadVertices);
      this.colorTex = this.gpu.createTexture(this.device, {
        format: TextureFormat.RGBA8,
        size: [texSize, texSize, 1],
        sampleCount,
        usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment
      });
      this.uvTex = this.gpu.createTexture(this.device, {
        format: TextureFormat.RGBA8,
        size: [texSize, texSize, 1],
        sampleCount,
        usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment
      });
      this.positionTex = this.gpu.createTexture(this.device, {
        format: TextureFormat.RGBA8,
        size: [texSize, texSize, 1],
        sampleCount,
        usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment
      });
      this.offscreenTexSampler = this.gpu.createSampler(this.device, { magFilter: FilterMode.Linear, minFilter: FilterMode.Linear });

      this.offscreenTexBindGroup = this.gpu.createBindGroup(this.device, {
        layout: offscreenTexLayout,
        entries: [
          { binding: 0, texture: this.colorTex }, { binding: 1, sampler: this.offscreenTexSampler },
          { binding: 2, texture: this.uvTex }, { binding: 3, sampler: this.offscreenTexSampler },
          { binding: 4, texture: this.positionTex }, { binding: 5, sampler: this.offscreenTexSampler },
        ]
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
        colors: [
          { view: { texture: this.colorTex! }, clear: [0.1, 0.2, 0.3, 1] },
          { view: { texture: this.uvTex! }, clear: [0.3, 0.1, 0.2, 1] },
          { view: { texture: this.positionTex! }, clear: [0.1, 0.3, 0.2, 1] }
        ],
        depthStencil: { texture: this.depthTex! },
        clearDepth: 1
      });
    }

    this.pass = this.gpu.createRenderPass(this.device, { clearColor: [0, 0, 0, 1], clearDepth: 1 });

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
      this.gpu.writeBuffer(this.device, this.cubeDataBuffer!, this.cubeData);
    }

    // Draw cube to textures
    this.gpu.beginRenderPass(this.device, this.offscreenPass!);
    {
      this.gpu.setRenderPipeline(this.device, this.cubePipeline!);
      this.gpu.setIndex(this.device, this.indexBuffer!);
      this.gpu.setVertex(this.device, 0, this.vertBuffer!);
      this.gpu.setBindGroup(this.device, 0, this.cubeBindGroup!);
      this.gpu.drawIndexed(this.device, cubeIndices.length);
    }
    this.gpu.submitRenderPass(this.device);

    // Draw to screen
    this.gpu.beginRenderPass(this.device, this.pass!);
    {
      this.gpu.setRenderPipeline(this.device, this.quadPipeline!);
      this.gpu.setVertex(this.device, 0, this.quadVertBuffer!);
      this.gpu.setBindGroup(this.device, 0, this.offscreenTexBindGroup!);
      this.gpu.draw(this.device, 6);
    }
    this.gpu.submitRenderPass(this.device);

    return true;
  }
}
