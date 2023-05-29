import { lookAt, mat, mat4, perspective, scale, vec3 } from 'munum/assembly';
import {
  BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  FilterMode, Float, RenderPipeline, RenderPipelineDescriptor, Sampler, ShaderStage, Texture,
  TextureDimension, vertexBufferLayouts, VertexFormat, getImage, RenderPass, TextureFormat, TextureUsage
} from '../interop/mugl';
import { BaseExample, createBuffer, createFloat32Array, Cube, Model, TEX_SIZE, toIndices, toVertices } from '../common';
import { frag, fragSky, vert } from './shaders/pbr';

const texSize = TEX_SIZE;
const cubeVertices = toVertices({ positions: Cube.positions, normals: Cube.normals, uvs: Cube.uvs } as Model);
const cubeIndices = toIndices(Cube);

export class PbrExample extends BaseExample {
  pass: RenderPass | null = null;
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  matBuffer: Buffer | null = null;
  envBuffer: Buffer | null = null;
  cubeDataBuffer: Buffer | null = null;
  skyDataBuffer: Buffer | null = null;
  cubePipeline: RenderPipeline | null = null;
  cubeTex: Texture | null = null;
  skyPipeline: RenderPipeline | null = null;
  skyTex: Texture | null = null;
  sampler: Sampler | null = null;
  envBindGroup: BindGroup | null = null;
  cubeTexBindGroup: BindGroup | null = null;
  cubeDataBindGroup: BindGroup | null = null;
  skyTexBindGroup: BindGroup | null = null;
  skyDataBindGroup: BindGroup | null = null;

  cubeData: Float32Array = new Float32Array(36);
  skyData: Float32Array = new Float32Array(36);

  constructor(
    private readonly device: Device,
    useWebGPU: boolean,
  ) {
    super(useWebGPU);
  }

  init(): void {
    // Get texture images
    const airplane = getImage('airplane');
    const sky0 = getImage('sky0');
    const sky1 = getImage('sky1');
    const sky2 = getImage('sky2');

    // Create shaders
    const vs = this.gpu.createShader(this.device, { code: vert(this.useWebGPU), usage: ShaderStage.Vertex });
    const cubeFs = this.gpu.createShader(this.device, { code: frag(this.useWebGPU), usage: ShaderStage.Fragment });
    const skyFs = this.gpu.createShader(this.device, { code: fragSky(this.useWebGPU), usage: ShaderStage.Fragment });

    // Create buffers
    this.matBuffer = createBuffer(this.gpu, this.device, createFloat32Array([
      1.0, 1.0, 1.0, 1.0, // albedo
      0.5, // metallic
      0.5, // roughness
      0, 0 // padding
    ]), BufferUsage.Uniform);
    this.envBuffer = createBuffer(this.gpu, this.device, createFloat32Array([
      0xdf / 0xff * .75, 0xf6 / 0xff * .75, 0xf5 / 0xff * .75, 1.0, // ambient
      1.0, -2.0, 1.0, 0.0, // lightDir
      0xfc / 0xff, 0xcb / 0xff, 0xcb / 0xff, 5.0, // lightColor / intensity
    ]), BufferUsage.Uniform);
    this.vertBuffer = createBuffer(this.gpu, this.device, cubeVertices);
    this.indexBuffer = createBuffer(this.gpu, this.device, cubeIndices, BufferUsage.Index);
    this.cubeDataBuffer = createBuffer(this.gpu, this.device, this.cubeData, BufferUsage.Uniform | BufferUsage.Stream);
    this.skyDataBuffer = createBuffer(this.gpu, this.device, this.skyData, BufferUsage.Uniform | BufferUsage.Stream);

    // Create bind groups
    const textureLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'tex', type: BindingType.Texture },
        { binding: 1, label: 'tex', type: BindingType.Sampler },
      ]
    });
    const cubeTextureLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'tex', type: BindingType.Texture, textureDimension: TextureDimension.CubeMap },
        { binding: 1, label: 'tex', type: BindingType.Sampler },
      ]
    });
    const envLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'Material', type: BindingType.Buffer },
        { binding: 1, label: 'Env', type: BindingType.Buffer },
      ]
    });
    const dataLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [{ label: 'Data', type: BindingType.Buffer }]
    });

    // Setup the cube
    this.cubeTex = this.gpu.createTexture(this.device, {
      size: [texSize, texSize, 1],
      usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment,
    });
    if (airplane) {
      this.gpu.copyExternalImageToTexture(this.device, { src: airplane }, { texture: this.cubeTex! });
      // TODO: auto mipmap for WebGPU
      // this.gpu.generateMipmap(this.device, this.cubeTex!);
    }

    this.sampler = this.gpu.createSampler(this.device, {
      magFilter: FilterMode.Linear,
      minFilter: FilterMode.Linear,
      mipmapFilter: FilterMode.Linear,
      maxAnisotropy: 16
    });

    this.cubeDataBindGroup = this.gpu.createBindGroup(this.device, {
      layout: dataLayout,
      entries: [{ buffer: this.cubeDataBuffer }]
    });
    this.cubeTexBindGroup = this.gpu.createBindGroup(this.device, {
      layout: textureLayout,
      entries: [{ binding: 0, texture: this.cubeTex }, { binding: 1, sampler: this.sampler }]
    });
    this.envBindGroup = this.gpu.createBindGroup(this.device, {
      layout: envLayout,
      entries: [{ binding: 0, buffer: this.matBuffer }, { binding: 1, buffer: this.envBuffer }]
    });

    const cubePipelineDesc: RenderPipelineDescriptor = {
      vertex: vs,
      fragment: cubeFs,
      buffers: vertexBufferLayouts([
        { attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2, /* normal */ VertexFormat.F32x3] }
      ]),
      bindGroups: [dataLayout, textureLayout, envLayout],
      depthStencil: {
        format: TextureFormat.Depth24Stencil8,
        depthWrite: true,
        depthCompare: CompareFunction.LessEqual
      },
      primitive: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = this.gpu.createRenderPipeline(this.device, cubePipelineDesc);

    // Setup the sky box
    {
      this.skyTex = this.gpu.createTexture(this.device, {
        dimension: TextureDimension.CubeMap,
        size: [texSize, texSize, 1],
        usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment,
      });
      if (sky0 && sky1 && sky2) {
        const cubeImages = [sky0, sky0, sky1, sky2, sky0, sky0];
        for (let z = 0; z < 6; ++z) {
          this.gpu.copyExternalImageToTexture(this.device, { src: cubeImages[z] }, { texture: this.skyTex!, origin: [0, 0, z] });
        }
        // TODO: auto mipmap for WebGPU
        // this.gpu.generateMipmap(this.device, this.skyTex!);
      }

      this.skyDataBindGroup = this.gpu.createBindGroup(this.device, {
        layout: dataLayout,
        entries: [{ buffer: this.skyDataBuffer }]
      });
      this.skyTexBindGroup = this.gpu.createBindGroup(this.device, {
        layout: cubeTextureLayout,
        entries: [{ binding: 0, texture: this.skyTex }, { binding: 1, sampler: this.sampler }]
      });

      this.skyPipeline = this.gpu.createRenderPipeline(this.device, {
        vertex: vs,
        fragment: skyFs,
        buffers: cubePipelineDesc.buffers,
        bindGroups: [dataLayout, cubeTextureLayout],
        depthStencil: cubePipelineDesc.depthStencil,
        primitive: {
          cullMode: CullMode.Front // Render back face for sky box
        }
      });
    }

    this.pass = this.gpu.createRenderPass(this.device, { clearColor: [0, 0, 0, 1], clearDepth: 1 });

    this.register([
      this.vertBuffer!, this.indexBuffer!, this.matBuffer!, this.envBuffer!, this.cubeDataBuffer!, this.skyDataBuffer!,
      this.cubePipeline!, this.cubeTex!, this.skyPipeline!, this.skyTex!, this.sampler!,
      this.envBindGroup!, this.cubeDataBindGroup!, this.cubeTexBindGroup!, this.skyDataBindGroup!, this.skyTexBindGroup!,
      this.pass!, vs, cubeFs, skyFs, textureLayout, cubeTextureLayout, envLayout, dataLayout
    ]);
  }

  render(t: Float): boolean {
    // Write matrices
    {
      const camPos = vec3.create(10 * Math.cos(t) as Float, 5 * Math.sin(t) as Float, 10 * Math.sin(t) as Float);
      const model = mat4.create();
      const proj = perspective((this.width as Float) / (this.height as Float), Math.PI / 4 as Float, 0.01, 100);
      const view = lookAt(camPos, [0, 0, 0]);
      const vp = mat4.mul(proj, view);

      mat.copy(model, this.cubeData, 0, 0, 16);
      mat.copy(vp, this.cubeData, 0, 16, 16);
      mat.copy(camPos, this.cubeData, 0, 32, 3);
      this.gpu.writeBuffer(this.device, this.cubeDataBuffer!, this.cubeData);

      mat.copy(scale([10, 10, 10]), this.skyData, 0, 0, 16);
      mat.copy(vp, this.skyData, 0, 16, 16);
      mat.copy(camPos, this.skyData, 0, 32, 3);
      this.gpu.writeBuffer(this.device, this.skyDataBuffer!, this.skyData);
    }

    this.gpu.beginRenderPass(this.device, this.pass!);

    // Draw cube
    this.gpu.setRenderPipeline(this.device, this.cubePipeline!);
    this.gpu.setIndex(this.device, this.indexBuffer!);
    this.gpu.setVertex(this.device, 0, this.vertBuffer!);
    this.gpu.setBindGroup(this.device, 0, this.cubeDataBindGroup!);
    this.gpu.setBindGroup(this.device, 1, this.cubeTexBindGroup!);
    this.gpu.setBindGroup(this.device, 2, this.envBindGroup!);
    this.gpu.drawIndexed(this.device, cubeIndices.length);

    // Draw skybox
    this.gpu.setRenderPipeline(this.device, this.skyPipeline!);
    this.gpu.setIndex(this.device, this.indexBuffer!);
    this.gpu.setVertex(this.device, 0, this.vertBuffer!);
    this.gpu.setBindGroup(this.device, 0, this.skyDataBindGroup!);
    this.gpu.setBindGroup(this.device, 1, this.skyTexBindGroup!);
    this.gpu.drawIndexed(this.device, cubeIndices.length);

    this.gpu.submitRenderPass(this.device);

    return true;
  }
}
