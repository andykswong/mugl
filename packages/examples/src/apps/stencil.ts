import { lookAt, mat, mat4, perspective, scale } from 'munum/assembly';
import {
  BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  Float, RenderPipeline, RenderPipelineDescriptor, Sampler, ShaderStage, StencilOperation,
  Texture, vertexBufferLayouts, VertexFormat, getImage, RenderPass, TextureFormat, TextureUsage
} from '../interop/mugl';
import { BaseExample, createBuffer, Cube, Model, TEX_SIZE, toIndices, toVertices } from '../common';

const cubeVertices = toVertices({
  positions: Cube.positions,
  uvs: Cube.uvs
} as Model);
const cubeIndices = toIndices(Cube);
const indexCount = cubeIndices.length;

// Reverse face winding for skybox so that we can reuse the same pipeline
// Store both index lists in the same buffer
const indices = new Uint16Array(indexCount * 2);
for (let i = 0; i < indexCount; ++i) {
  indices[i] = cubeIndices[i];
}
for (let i = 0; i < indexCount; i += 3) {
  indices[indexCount + i] = cubeIndices[i + 2];
  indices[indexCount + i + 1] = cubeIndices[i + 1];
  indices[indexCount + i + 2] = cubeIndices[i];
}

const texSize = TEX_SIZE;

const dataBufferSize = 64; // 20 floats, padding for 256 bytes alignment
const dataBufferByteSize = dataBufferSize * 4; // 4 bytes per float

const vert = `#version 300 es
precision mediump float;
layout(std140) uniform Data {
  mat4 mvp;
  vec4 outline;
};
layout (location=0) in vec3 position;
layout (location=1) in vec2 uv;
out vec2 vUv;
void main(void) {
  vUv = uv;
  gl_Position = mvp * vec4(position, 1.0);
}
`;

const fragCube = `#version 300 es
precision mediump float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D tex;
void main () {
  outColor = texture(tex, vUv);
}
`;

const fragColor = `#version 300 es
precision mediump float;
layout(std140) uniform Data {
  mat4 mvp;
  vec4 outline;
};
out vec4 outColor;
void main () {
  outColor = outline;
}
`;

const dataUniformWGPU = `
struct Data {
  mvp: mat4x4<f32>,
  outline: vec4<f32>,
};
@group(0) @binding(0) var<uniform> data: Data;
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

@group(1) @binding(0) var tex: texture_2d<f32>;
@group(1) @binding(1) var tex_sampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(tex, tex_sampler, in.uv);
}
`;

const fragColorWGPU = `
${dataUniformWGPU}
${vertOutWGPU}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return data.outline;
}
`;

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
    // Create shaders
    const vs = this.gpu.createShader(this.device, { code: this.useWebGPU ? vertWGPU : vert, usage: ShaderStage.Vertex });
    const cubeFs = this.gpu.createShader(this.device, { code: this.useWebGPU ? fragCubeWGPU : fragCube, usage: ShaderStage.Fragment });
    const outlineFs = this.gpu.createShader(this.device, { code: this.useWebGPU ? fragColorWGPU : fragColor, usage: ShaderStage.Fragment });

    // Create buffers
    this.vertBuffer = createBuffer(this.gpu, this.device, cubeVertices);
    this.indexBuffer = createBuffer(this.gpu, this.device, indices, BufferUsage.Index);
    this.dataBuffer = createBuffer(this.gpu, this.device, this.data, BufferUsage.Uniform | BufferUsage.Stream);

    // Create cube texture
    this.texture = this.gpu.createTexture(this.device, {
      size: [texSize, texSize, 1],
      usage: TextureUsage.TextureBinding | TextureUsage.RenderAttachment,
    });
    const image = getImage('airplane');
    if (image) {
      this.gpu.copyExternalImageToTexture(this.device, { src: image }, { texture: this.texture! });
    }
    this.sampler = this.gpu.createSampler(this.device, {});

    const textureLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'tex', type: BindingType.Texture },
        { binding: 1, label: 'tex', type: BindingType.Sampler },
      ]
    });
    const dataLayout = this.gpu.createBindGroupLayout(this.device, {
      entries: [{ label: 'Data', type: BindingType.Buffer, bufferDynamicOffset: true }]
    });

    this.textureBindGroup = this.gpu.createBindGroup(this.device, {
      layout: textureLayout,
      entries: [{ binding: 0, texture: this.texture }, { binding: 1, sampler: this.sampler }]
    });

    this.dataBindGroup = this.gpu.createBindGroup(this.device, {
      layout: dataLayout,
      entries: [{ buffer: this.dataBuffer, bufferSize: dataBufferByteSize }]
    });

    const cubePipelineDesc: RenderPipelineDescriptor = {
      vertex: vs,
      fragment: cubeFs,
      buffers: vertexBufferLayouts([
        { attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }
      ]),
      bindGroups: [dataLayout, textureLayout],
      depthStencil: {
        format: TextureFormat.Depth24Stencil8,
        depthWrite: true,
        depthCompare: CompareFunction.LessEqual,
        stencilBack: {
          compare: CompareFunction.Always,
          passOp: StencilOperation.Replace,
        },
        stencilFront: {
          compare: CompareFunction.Always,
          passOp: StencilOperation.Replace
        }
      },
      primitive: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = this.gpu.createRenderPipeline(this.device, cubePipelineDesc);

    this.cubeOutlinePipeline = this.gpu.createRenderPipeline(this.device, {
      vertex: vs,
      fragment: outlineFs,
      buffers: cubePipelineDesc.buffers,
      bindGroups: [dataLayout],
      depthStencil: {
        format: TextureFormat.Depth24Stencil8,
        depthWrite: true,
        stencilBack: {
          compare: CompareFunction.NotEqual,
        },
        stencilFront: {
          compare: CompareFunction.NotEqual,
        },
        stencilWriteMask: 0,
      },
      primitive: cubePipelineDesc.primitive,
    });

    this.pass = this.gpu.createRenderPass(this.device, {
      clearDepth: 1,
      clearStencil: 0
    });

    this.register([
      this.vertBuffer!, this.indexBuffer!, this.dataBuffer!, this.texture!, this.sampler!,
      this.textureBindGroup!, this.dataBindGroup!, this.cubePipeline!, this.cubeOutlinePipeline!,
      this.pass!, vs, cubeFs, outlineFs, textureLayout, dataLayout
    ]);
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
