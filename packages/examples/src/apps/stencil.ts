import { lookAt, mat, mat4, perspective, scale } from 'munum/assembly';
import { BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device, Float, RenderPipeline, Sampler, ShaderStage, StencilOperation, Texture, vertexBufferLayouts, VertexFormat, getImage, RenderPass, TextureFormat, TextureUsage, BindGroupLayout } from '../interop/mugl';
import { BaseExample, createBuffer, Cube, Model, TEX_SIZE, toIndices, toVertices } from '../common';
import { frag, fragOutline, vert } from './shaders/stencil';

const cubeVertices = toVertices({ positions: Cube.positions, uvs: Cube.uvs } as Model);
const cubeIndices = toIndices(Cube);
const indexCount = cubeIndices.length;

// Store both index lists in the same buffer
const indices = new Uint16Array(indexCount * 2);
for (let i = 0; i < indexCount; ++i) {
  indices[i] = cubeIndices[i];
}
// Reverse face winding for skybox so that we can reuse the same pipeline
for (let i = 0; i < indexCount; i += 3) {
  indices[indexCount + i] = cubeIndices[i + 2];
  indices[indexCount + i + 1] = cubeIndices[i + 1];
  indices[indexCount + i + 2] = cubeIndices[i];
}

const texSize = TEX_SIZE;
const dataBufferSize = 64; // 20 floats, padding for 256 bytes alignment
const dataBufferByteSize = dataBufferSize * 4; // 4 bytes per float

export class StencilExample extends BaseExample {
  pass: RenderPass | null = null;

  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  // Store data for all 3 data bind groups in the same buffer and use dynamic offset to reference them
  data: Float32Array = new Float32Array(dataBufferSize * 3);
  dataBuffer: Buffer | null = null;

  texture: Texture | null = null;
  sampler: Sampler | null = null;

  cubePipeline: RenderPipeline | null = null;
  cubeOutlinePipeline: RenderPipeline | null = null;

  textureBindGroup: BindGroup | null = null;
  dataBindGroup: BindGroup | null = null;

  constructor(
    private readonly device: Device,
    useWebGPU: boolean
  ) {
    super(useWebGPU);
  }

  init(): void {
    this.pass = this.gpu.createRenderPass(this.device, { clearDepth: 1, clearStencil: 0 });
    const bindGroupLayouts = this.initPipelines();

    // Create buffers
    this.vertBuffer = createBuffer(this.gpu, this.device, cubeVertices);
    this.indexBuffer = createBuffer(this.gpu, this.device, indices, BufferUsage.Index);
    this.dataBuffer = createBuffer(this.gpu, this.device, this.data, BufferUsage.Uniform | BufferUsage.Stream);

    // Create texture
    this.texture = this.gpu.createTexture(this.device, {
      size: [texSize, texSize, 1],
      usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment,
    });
    const image = getImage('airplane');
    if (image) {
      this.gpu.copyExternalImageToTexture(this.device, { src: image }, { texture: this.texture! });
    }
    this.sampler = this.gpu.createSampler(this.device, {});

    // Bind buffer and texture
    this.dataBindGroup = this.gpu.createBindGroup(this.device, {
      layout: bindGroupLayouts[0],
      entries: [{ buffer: this.dataBuffer, bufferSize: dataBufferByteSize }]
    });
    this.textureBindGroup = this.gpu.createBindGroup(this.device, {
      layout: bindGroupLayouts[1],
      entries: [{ binding: 0, texture: this.texture }, { binding: 1, sampler: this.sampler }]
    });

    this.register([
      this.pass!,
      this.vertBuffer!, this.indexBuffer!, this.dataBuffer!, this.texture!, this.sampler!,
      this.textureBindGroup!, this.dataBindGroup!,
    ]);
  }

  initPipelines(): BindGroupLayout[] {
    const vs = this.gpu.createShader(this.device, { code: vert(this.useWebGPU), usage: ShaderStage.Vertex });
    const cubeFs = this.gpu.createShader(this.device, { code: frag(this.useWebGPU), usage: ShaderStage.Fragment });
    const outlineFs = this.gpu.createShader(this.device, { code: fragOutline(this.useWebGPU), usage: ShaderStage.Fragment });

    const dataLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [{ label: 'Data', type: BindingType.Buffer, bufferDynamicOffset: true }]
    });
    const textureLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'tex', type: BindingType.Texture },
        { binding: 1, label: 'tex', type: BindingType.Sampler },
      ]
    });

    this.cubePipeline = this.gpu.createRenderPipeline(this.device, {
      vertex: vs,
      fragment: cubeFs,
      buffers: vertexBufferLayouts([{ attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }]),
      bindGroups: [dataLayout, textureLayout],
      depthStencil: {
        format: TextureFormat.Depth24Stencil8,
        depthWrite: true,
        depthCompare: CompareFunction.LessEqual,
        stencilBack: { compare: CompareFunction.Always, passOp: StencilOperation.Replace },
        stencilFront: { compare: CompareFunction.Always, passOp: StencilOperation.Replace }
      },
      primitive: { cullMode: CullMode.Back }
    });

    this.cubeOutlinePipeline = this.gpu.createRenderPipeline(this.device, {
      vertex: vs,
      fragment: outlineFs,
      buffers: vertexBufferLayouts([{ attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }]),
      bindGroups: [dataLayout],
      depthStencil: {
        format: TextureFormat.Depth24Stencil8,
        depthWrite: true,
        stencilBack: { compare: CompareFunction.NotEqual },
        stencilFront: { compare: CompareFunction.NotEqual },
        stencilWriteMask: 0,
      },
      primitive: { cullMode: CullMode.Back }
    });

    this.register([this.cubePipeline!, this.cubeOutlinePipeline!, vs, cubeFs, outlineFs, textureLayout, dataLayout]);

    return [dataLayout, textureLayout];
  }

  render(t: Float): boolean {
    // Set uniforms
    {
      const proj = perspective((this.width as Float) / (this.height as Float), Math.PI / 4 as Float, 0.01, 100);
      const view = lookAt([10 * Math.cos(t) as Float, 5 * Math.sin(t) as Float, 10 * Math.sin(t) as Float], [0, 0, 0]);
      const vp = mat4.mul(proj, view);

      let mvp = vp; // Cube at (0, 0, 0)
      mat.copy(mvp, this.data, 0, 0, 16);

      mvp = mat4.mul(vp, scale([1.1, 1.1, 1.1])); // Scale up for outline
      mat.copy(mvp, this.data, 0, dataBufferSize, 16);
      mat.copy([0.1 as Float, 0.3, 0.2, 1.0], this.data, 0, dataBufferSize + 16, 4); // Set outline color

      mvp = mat4.mul(vp, scale([10, 10, 10])); // Scale up even more for skybox
      mat.copy(mvp, this.data, 0, dataBufferSize * 2, 16);
    }
    this.gpu.writeBuffer(this.device, this.dataBuffer!, this.data);

    this.gpu.beginRenderPass(this.device, this.pass!);

    // Draw cube
    this.gpu.setRenderPipeline(this.device, this.cubePipeline!);
    this.gpu.setIndex(this.device, this.indexBuffer!);
    this.gpu.setVertex(this.device, 0, this.vertBuffer!);
    this.gpu.setBindGroup(this.device, 0, this.dataBindGroup!, [0]);
    this.gpu.setBindGroup(this.device, 1, this.textureBindGroup!);
    this.gpu.setStencilRef(this.device, 1);
    this.gpu.drawIndexed(this.device, indexCount);

    // Draw skybox, reusing the same pipeline and buffers
    this.gpu.setBindGroup(this.device, 0, this.dataBindGroup!, [dataBufferByteSize * 2]);
    this.gpu.setStencilRef(this.device, 0); // Use a different stencil value so that the outline can be drawn on top of it
    this.gpu.drawIndexed(this.device, indexCount, 1, indexCount); // Use the reversed indices

    // Draw outline
    this.gpu.setRenderPipeline(this.device, this.cubeOutlinePipeline!);
    this.gpu.setIndex(this.device, this.indexBuffer!);
    this.gpu.setVertex(this.device, 0, this.vertBuffer!);
    this.gpu.setBindGroup(this.device, 0, this.dataBindGroup!, [dataBufferByteSize]);
    this.gpu.setStencilRef(this.device, 1);
    this.gpu.drawIndexed(this.device, indexCount);

    this.gpu.submitRenderPass(this.device);

    return true;
  }
}
