import { lookAt, mat, mat4, Mat4, perspective, scale } from 'munum/assembly';
import {
  AddressMode, BaseGPU, BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  FilterMode, Float, RenderPipeline, RenderPipelineDescriptor, Sampler, ShaderStage, Texture,
  TextureDimension, UInt, vertexBufferLayouts, VertexFormat, getImage, RenderPass, TextureFormat, TextureUsage
} from '../interop/mugl';
import { BaseExample, createBuffer, Cube, Model, TEX_SIZE, toIndices, toVertices } from '../common';

const texSize = TEX_SIZE;

// Double the cube UVs for repeating effect
const cubeUvs: Float[][] = [];
for (let i = 0; i < Cube.uvs!.length; ++i) {
  const uv = Cube.uvs![i];
  cubeUvs.push([uv[0] * 2, uv[1] * 2]);
}
const cubeVertices = toVertices({
  positions: Cube.positions,
  uvs: cubeUvs
} as Model);
const cubeIndices = toIndices(Cube);

const vert = `#version 300 es
layout(std140) uniform Camera {
  mat4 mvp;
};
layout (location=0) in vec3 position;
layout (location=1) in vec2 uv;
out vec2 vUv;
out vec3 vNormal;
void main(void) {
  vUv = uv;
  vNormal = normalize(position);
  gl_Position = mvp * vec4(position, 1.0);
}
`;

const fragCube = `#version 300 es
precision mediump float;
uniform sampler2D tex;
in vec2 vUv;
out vec4 outColor;
void main () {
  outColor = texture(tex, vUv);
}
`;

const fragSky = `#version 300 es
precision mediump float;
uniform samplerCube tex;
in vec3 vNormal;
out vec4 outColor;
void main () {
  outColor = texture(tex, normalize(vNormal));
}
`;

const dataUniformWGPU = `
struct Data {
  mvp: mat4x4<f32>,
};
@group(1) @binding(0) var<uniform> data: Data;
`;

const vertOutWGPU = `
struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) normal: vec3<f32>,
};
`;

const vertWGPU = `
${dataUniformWGPU}
${vertOutWGPU}

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
};

@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.clip_position = data.mvp * vec4<f32>(model.position, 1.0);
  out.uv = model.uv;
  out.normal = normalize(model.position);
  return out;
}
`;

const fragCubeWGPU = `
${vertOutWGPU}

@group(0) @binding(0) var tex: texture_2d<f32>;
@group(0) @binding(1) var tex_sampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(tex, tex_sampler, in.uv);
}
`;

const fragSkyWGPU = `
${vertOutWGPU}

@group(0) @binding(0) var tex: texture_cube<f32>;
@group(0) @binding(1) var tex_sampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(tex, tex_sampler, normalize(in.normal));
}
`;

class TextureRenderBundle {
  public pipeline: RenderPipeline;
  public texture: Texture;
  public sampler: Sampler;
  public cameraData: Float32Array = new Float32Array(16);
  public cameraBuffer!: Buffer;
  public textureBindGroup!: BindGroup;
  public cameraBindGroup!: BindGroup;

  public constructor(
    private readonly gpu: BaseGPU,
    public device: Device,
    pipelineDesc: RenderPipelineDescriptor,
    textureType: TextureDimension,
    public vertexBuffer: Buffer,
    public indexBuffer: Buffer,
    public indexCount: UInt
  ) {
    const textureLayout = gpu.createBindGroupLayout(device, {
      entries: [
        { label: 'tex', type: BindingType.Texture, textureDimension: textureType, binding: 0 },
        { label: 'tex', type: BindingType.Sampler, binding: 1 },
      ]
    });
    const cameraLayout = gpu.createBindGroupLayout(device, {
      entries: [{ label: 'Camera', type: BindingType.Buffer }]
    });

    pipelineDesc.bindGroups = [textureLayout, cameraLayout];
    this.pipeline = gpu.createRenderPipeline(device, pipelineDesc);

    this.texture = gpu.createTexture(device, {
      dimension: textureType,
      size: [texSize, texSize, 1],
      usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment,
    });
    this.sampler = gpu.createSampler(device, {
      magFilter: FilterMode.Linear,
      minFilter: FilterMode.Linear,
      mipmapFilter: FilterMode.Linear,
      addressModeU: AddressMode.Repeat,
      addressModeV: AddressMode.Repeat,
      maxAnisotropy: 16
    });
    this.cameraBuffer = createBuffer(gpu, device, this.cameraData, BufferUsage.Uniform | BufferUsage.Stream);

    this.textureBindGroup = gpu.createBindGroup(device, {
      layout: textureLayout,
      entries: [{ binding: 0, texture: this.texture }, { binding: 1, sampler: this.sampler }]
    });
    this.cameraBindGroup = gpu.createBindGroup(device, {
      layout: cameraLayout,
      entries: [{ buffer: this.cameraBuffer }]
    });

    textureLayout.destroy();
    cameraLayout.destroy();
  }

  public updateCamera(mvp: Mat4): void {
    mat.copy(mvp, this.cameraData, 0, 0, 16);
    this.gpu.writeBuffer(this.device, this.cameraBuffer, this.cameraData);
  }

  public render(device: Device): void {
    this.gpu.setRenderPipeline(device, this.pipeline);
    this.gpu.setIndex(device, this.indexBuffer);
    this.gpu.setVertex(device, 0, this.vertexBuffer);
    this.gpu.setBindGroup(device, 0, this.textureBindGroup);
    this.gpu.setBindGroup(device, 1, this.cameraBindGroup);
    this.gpu.drawIndexed(device, this.indexCount);
  }

  public destroy(): void {
    this.pipeline.destroy();
    this.textureBindGroup.destroy();
    this.cameraBindGroup.destroy();
    this.texture.destroy();
    this.sampler.destroy();
    this.cameraBuffer.destroy();
  }
}

export class TextureExample extends BaseExample {
  pass: RenderPass | null = null;

  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;

  cube: TextureRenderBundle | null = null;
  skybox: TextureRenderBundle | null = null;

  constructor(
    private readonly device: Device,
    useWebGPU: boolean
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
    const vs = this.gpu.createShader(this.device, { code: this.useWebGPU ? vertWGPU : vert, usage: ShaderStage.Vertex });
    const cubeFs = this.gpu.createShader(this.device, { code: this.useWebGPU ? fragCubeWGPU : fragCube, usage: ShaderStage.Fragment });
    const skyFs = this.gpu.createShader(this.device, { code: this.useWebGPU ? fragSkyWGPU : fragSky, usage: ShaderStage.Fragment });

    // Create buffers
    this.vertBuffer = createBuffer(this.gpu, this.device, cubeVertices);
    this.indexBuffer = createBuffer(this.gpu, this.device, cubeIndices, BufferUsage.Index);

    // Create the cube
    const cubePipelineDesc: RenderPipelineDescriptor = {
      vertex: vs,
      fragment: cubeFs,
      buffers: vertexBufferLayouts([
        { attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }
      ]),
      depthStencil: {
        format: TextureFormat.Depth24Stencil8,
        depthWrite: true,
        depthCompare: CompareFunction.LessEqual
      },
      primitive: {
        cullMode: CullMode.Back
      }
    };
    this.cube = new TextureRenderBundle(
      this.gpu, this.device,
      cubePipelineDesc, TextureDimension.D2, this.vertBuffer!, this.indexBuffer!, cubeIndices.length
    );
    if (airplane) {
      this.gpu.copyExternalImageToTexture(this.device, { src: airplane }, { texture: this.cube!.texture });
      // TODO: no auto mipmap for WebGPU
      // this.gpu.generateMipmap(this.device, this.cube!.texture);
    }

    // Create the skybox
    const skyboxPipelineDesc: RenderPipelineDescriptor = {
      vertex: vs,
      fragment: skyFs,
      buffers: cubePipelineDesc.buffers,
      depthStencil: cubePipelineDesc.depthStencil,
      primitive: {
        cullMode: CullMode.Front // Render back face for sky box
      }
    };
    this.skybox = new TextureRenderBundle(
      this.gpu, this.device,
      skyboxPipelineDesc, TextureDimension.CubeMap, this.vertBuffer!, this.indexBuffer!, cubeIndices.length
    );
    if (sky0 && sky1 && sky2) {
      const cubeImages = [sky0, sky0, sky1, sky2, sky0, sky0];
      for (let z = 0; z < 6; ++z) {
        this.gpu.copyExternalImageToTexture(this.device, { src: cubeImages[z] }, { texture: this.skybox!.texture, origin: [0, 0, z] });
      }
      // TODO: no auto mipmap for WebGPU
      // this.gpu.generateMipmap(this.device, this.skybox!.texture);
    }

    this.pass = this.gpu.createRenderPass(this.device, { clearColor: [0.1, 0.2, 0.3, 1], clearDepth: 1 });

    this.register([
      this.vertBuffer!, this.indexBuffer!, this.pass!, vs, cubeFs, skyFs,
    ]);
  }

  render(t: Float): boolean {
    const proj = perspective((this.width as Float) / (this.height as Float), Math.PI / 4 as Float, 0.01, 100);
    const view = lookAt([10 * Math.cos(t) as Float, 5 * Math.sin(t) as Float, 10 * Math.sin(t) as Float], [0, 0, 0]);
    const vp = mat4.mul(proj, view);

    let mvp = vp; // Cube at (0, 0, 0)
    this.cube!.updateCamera(mvp);

    mvp = mat4.mul(vp, scale([10, 10, 10]), vp);  // Make the skybox bigger
    this.skybox!.updateCamera(mvp);

    this.gpu.beginRenderPass(this.device, this.pass!);
    this.cube!.render(this.device);
    this.skybox!.render(this.device);
    this.gpu.submitRenderPass(this.device);

    return true;
  }

  destroy(): void {
    super.destroy();
    this.cube!.destroy();
    this.skybox!.destroy();
  }
}
