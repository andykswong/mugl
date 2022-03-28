import { array, lookAt, mat4, Mat4, perspective, scale } from 'munum';
import {
  AddressMode, BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  FilterMode, Float, RenderPipeline, RenderPipelineDescriptor, Resource, Sampler, ShaderStage, Texture,
  TextureDimension, UInt, vertexBufferLayouts, VertexFormat, WebGL
} from 'mugl';
import { API, BaseExample, createBuffer, Cube, getImageById, Model, TEX_SIZE, toIndices, toVertices } from '../common';

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

class TextureRenderBundle {
  public pipeline: RenderPipeline;
  public texture: Texture;
  public sampler: Sampler;
  public cameraData: Float32Array = new Float32Array(16);
  public cameraBuffer: Buffer;
  public textureBindGroup: BindGroup;
  public cameraBindGroup: BindGroup;

  public constructor(
    public device: Device,
    pipelineDesc: RenderPipelineDescriptor,
    textureType: TextureDimension,
    public vertexBuffer: Buffer,
    public indexBuffer: Buffer,
    public indexCount: UInt
  ) {
    const textureLayout = API.createBindGroupLayout(device, {
      entries: [
        { label: 'tex', type: BindingType.Texture, binding: 0 },
        { label: 'tex', type: BindingType.Sampler, binding: 1 },
      ]
    });
    const cameraLayout = API.createBindGroupLayout(device, {
      entries: [{ label: 'Camera', type: BindingType.Buffer }]
    });

    pipelineDesc.bindGroups = [textureLayout, cameraLayout];
    this.pipeline = API.createRenderPipeline(device, pipelineDesc);

    this.texture = API.createTexture(device, {
      dimension: textureType,
      size: [texSize, texSize, 1]
    });
    this.sampler = API.createSampler(device, {
      magFilter: FilterMode.Linear,
      minFilter: FilterMode.Linear,
      mipmapFilter: FilterMode.Linear,
      addressModeU: AddressMode.Repeat,
      addressModeV: AddressMode.Repeat,
      maxAnisotropy: 16
    });
    this.cameraBuffer = createBuffer(device, this.cameraData, BufferUsage.Uniform | BufferUsage.Stream);

    this.textureBindGroup = API.createBindGroup(device, {
      layout: textureLayout,
      entries: [{ binding: 0, texture: this.texture }, { binding: 1, sampler: this.sampler }]
    });
    this.cameraBindGroup = API.createBindGroup(device, {
      layout: cameraLayout,
      entries: [{ buffer: this.cameraBuffer }]
    });

    textureLayout.destroy();
    cameraLayout.destroy();
  }

  public updateCamera(mvp: Mat4): void {
    array.copyEx(mvp, this.cameraData, 0, 0, 16);
    API.writeBuffer(this.device, this.cameraBuffer, this.cameraData);
  }

  public render(device: Device): void {
    API.setRenderPipeline(device, this.pipeline);
    API.setIndex(device, this.indexBuffer);
    API.setVertex(device, 0, this.vertexBuffer);
    API.setBindGroup(device, 0, this.textureBindGroup);
    API.setBindGroup(device, 1, this.cameraBindGroup);
    API.drawIndexed(device, this.indexCount);
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
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;

  cube: TextureRenderBundle | null = null;
  skybox: TextureRenderBundle | null = null;

  constructor(private readonly device: Device) {
    super();
  }

  init(): void {
    // Get texture images
    const airplane = getImageById('airplane');
    const sky0 = getImageById('sky0');
    const sky1 = getImageById('sky1');
    const sky2 = getImageById('sky2');

    // Create shaders
    const vs = API.createShader(this.device, { code: vert, usage: ShaderStage.Vertex });
    const cubeFs = API.createShader(this.device, { code: fragCube, usage: ShaderStage.Fragment });
    const skyFs = API.createShader(this.device, { code: fragSky, usage: ShaderStage.Fragment });

    // Create buffers
    this.vertBuffer = createBuffer(this.device, cubeVertices);
    this.indexBuffer = createBuffer(this.device, cubeIndices, BufferUsage.Index);

    // Create the cube
    const cubePipelineDesc: RenderPipelineDescriptor = {
      vertex: vs,
      fragment: cubeFs,
      buffers: vertexBufferLayouts([
        { attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }
      ]),
      depthStencil: {
        depthWrite: true,
        depthCompare: CompareFunction.LessEqual
      },
      primitive: {
        cullMode: CullMode.Back
      }
    };
    this.cube = new TextureRenderBundle(
      this.device, cubePipelineDesc, TextureDimension.D2, this.vertBuffer!, this.indexBuffer!, cubeIndices.length
    );
    if (airplane) {
      API.copyExternalImageToTexture(this.device, { src: airplane }, { texture: this.cube!.texture });
      WebGL.generateMipmap(this.device, this.cube!.texture);
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
      this.device, skyboxPipelineDesc, TextureDimension.CubeMap, this.vertBuffer!, this.indexBuffer!, cubeIndices.length
    );
    if (sky0 && sky1 && sky2) {
      const cubeImages = [sky0, sky0, sky1, sky2, sky0, sky0];
      for (let z = 0; z < 6; ++z) {
        API.copyExternalImageToTexture(this.device, { src: cubeImages[z] }, { texture: this.skybox!.texture, origin: [0, 0, z] });
      }
      WebGL.generateMipmap(this.device, this.skybox!.texture);
    }

    this.register([
      this.vertBuffer!, this.indexBuffer!, vs, cubeFs, skyFs,
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

    API.beginDefaultPass(this.device, { clearColor: [0.1, 0.2, 0.3, 1], clearDepth: 1 });
    this.cube!.render(this.device);
    this.skybox!.render(this.device);
    API.submitRenderPass(this.device);

    return true;
  }

  destroy(): void {
    super.destroy();
    this.cube!.destroy();
    this.skybox!.destroy();
  }
}
