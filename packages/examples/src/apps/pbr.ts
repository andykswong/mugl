import { lookAt, mat, mat4, perspective, scale, vec3 } from 'munum/assembly';
import {
  BindGroup, BindingType, Buffer, BufferUsage, CompareFunction, CullMode, Device,
  FilterMode, Float, RenderPipeline, RenderPipelineDescriptor, Sampler, ShaderStage, Texture,
  TextureDimension, vertexBufferLayouts, VertexFormat, WebGL, getImage
} from '../interop/mugl';
import { BaseExample, createBuffer, createFloat32Array, Cube, Model, TEX_SIZE, toIndices, toVertices } from '../common';

const texSize = TEX_SIZE;

const cubeVertices = toVertices({
  positions: Cube.positions,
  normals: Cube.normals,
  uvs: Cube.uvs
} as Model);
const cubeIndices = toIndices(Cube);

const vert = `#version 300 es
precision mediump float;
layout(std140) uniform Data {
  mat4 model, viewProj;
  vec4 camPos;
};
layout (location=0) in vec3 position;
layout (location=1) in vec2 uv;
layout (location=2) in vec3 normal;
out vec3 vPosition;
out vec2 vUv;
out vec3 vNormal;

void main(void) {
  vec4 worldPos = model * vec4(position, 1.0);
  vPosition = worldPos.xyz / worldPos.w;
  vNormal = mat3(model) * normalize(normal);
  vUv = uv;
  gl_Position = viewProj * worldPos;
}
`

const fragCube = `#version 300 es
precision mediump float;
uniform sampler2D tex;
layout(std140) uniform Data {
  mat4 model, viewProj;
  vec4 camPos;
};
layout(std140) uniform Material {
  vec4 albedo;
  vec2 metallicRoughness;
};
layout(std140) uniform Env {
  vec4 ambient;
  vec4 lightDir;
  vec4 lightColor;
};

in vec3 vPosition;
in vec2 vUv;
in vec3 vNormal;
out vec4 color;

const float PI = 3.14159265359;

vec3 toSrgb(vec3 color) {
  return pow(color, vec3(1.0/2.2));
}

vec4 toLinear(vec4 srgbIn) {
  return vec4(pow(srgbIn.rgb, vec3(2.2)), srgbIn.a);
}

vec3 diffuse(vec3 color) {
  return color / PI;
}

float specularD(float aSqr, float nDotH) {
  float f = (nDotH * nDotH) * (aSqr - 1.0) + 1.0;
  return aSqr / (PI * f * f);
}

vec3 specularF(vec3 r0, vec3 r90, float vDotH) {
  return r0 + (r90 - r0) * pow(clamp(1.0 - vDotH, 0.0, 1.0), 5.0);
}

float specularG(float aSqr, float nDotL, float nDotV) {
  float gl = 2.0 * nDotL / (nDotL + sqrt(aSqr + (1.0 - aSqr) * (nDotL * nDotL)));
  float gv = 2.0 * nDotV / (nDotV + sqrt(aSqr + (1.0 - aSqr) * (nDotV * nDotV)));
  return gl * gv;
}

void main () {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(camPos.xyz - vPosition);
  vec3 l = normalize(-lightDir.xyz);
  vec3 h = normalize(l + v);

  float nDotL = clamp(dot(n, l), 0.001, 1.0);
  float nDotV = clamp(abs(dot(n, v)), 0.001, 1.0);
  float nDotH = clamp(dot(n, h), 0.0, 1.0);
  float vDotH = clamp(dot(v, h), 0.0, 1.0);

  vec4 baseColor = toLinear(texture(tex, vUv)) * albedo;

  vec3 f0 = vec3(0.04);
  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallicRoughness.x);
  vec3 specularColor = mix(f0, baseColor.rgb, metallicRoughness.x);

  float r0 = max(max(specularColor.r, specularColor.g), specularColor.b);
  float r90 = clamp(r0 * 25.0, 0.0, 1.0);
  vec3 specularEnvR0 = specularColor.rgb;
  vec3 specularEnvR90 = vec3(1.0, 1.0, 1.0) * r90;

  float a = clamp(metallicRoughness.y, 0.04, 1.0);
  a *= a;
  float aSqr = a * a;

  vec3 color0 = vec3(0.0);

  vec3 F = specularF(specularEnvR0, specularEnvR90, vDotH);
  float D = specularD(aSqr, nDotH);
  float G = specularG(aSqr, nDotL, nDotV);

  vec3 diffuse = (1.0 - F) * diffuse(diffuseColor);
  vec3 specular = F * G * D / (4.0 * nDotL * nDotV);

  color0 += nDotL * lightColor.rgb * lightColor.a * (diffuse + specular);
  color0 += ambient.rgb * diffuseColor;

  color = vec4(toSrgb(color0), baseColor.a);
}`;

const fragSky = `#version 300 es
precision mediump float;
uniform samplerCube tex;
in vec3 vPosition;
out vec4 color;
void main () {
  color = texture(tex, normalize(vPosition));
}`;

export class PbrExample extends BaseExample {
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

  constructor(private readonly device: Device) {
    super();
  }

  init(): void {
    // Get texture images
    const airplane = getImage('airplane');
    const sky0 = getImage('sky0');
    const sky1 = getImage('sky1');
    const sky2 = getImage('sky2');

    // Create shaders
    const vs = WebGL.createShader(this.device, { code: vert, usage: ShaderStage.Vertex });
    const cubeFs = WebGL.createShader(this.device, { code: fragCube, usage: ShaderStage.Fragment });
    const skyFs = WebGL.createShader(this.device, { code: fragSky, usage: ShaderStage.Fragment });

    // Create buffers
    this.matBuffer = createBuffer(this.device, createFloat32Array([
      1.0, 1.0, 1.0, 1.0, // albedo
      0.5, // metallic
      0.5, // roughness
      0, 0 // padding
    ]), BufferUsage.Uniform);
    this.envBuffer = createBuffer(this.device, createFloat32Array([
      0xdf / 0xff * .75, 0xf6 / 0xff * .75, 0xf5 / 0xff * .75, 1.0, // ambient
      1.0, -2.0, 1.0, 0.0, // lightDir
      0xfc / 0xff, 0xcb / 0xff, 0xcb / 0xff, 5.0, // lightColor / intensity
    ]), BufferUsage.Uniform);
    this.vertBuffer = createBuffer(this.device, cubeVertices);
    this.indexBuffer = createBuffer(this.device, cubeIndices, BufferUsage.Index);
    this.cubeDataBuffer = createBuffer(this.device, this.cubeData, BufferUsage.Uniform | BufferUsage.Stream);
    this.skyDataBuffer = createBuffer(this.device, this.skyData, BufferUsage.Uniform | BufferUsage.Stream);

    // Create bind groups
    const textureLayout = WebGL.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'tex', type: BindingType.Texture },
        { binding: 1, label: 'tex', type: BindingType.Sampler },
      ]
    });
    const envLayout = WebGL.createBindGroupLayout(this.device, {
      entries: [
        { binding: 0, label: 'Material', type: BindingType.Buffer },
        { binding: 1, label: 'Env', type: BindingType.Buffer },
      ]
    });
    const dataLayout = WebGL.createBindGroupLayout(this.device, {
      entries: [{ label: 'Data', type: BindingType.Buffer }]
    });

    // Setup the cube
    this.cubeTex = WebGL.createTexture(this.device, { size: [texSize, texSize, 1] });
    if (airplane) {
      WebGL.copyExternalImageToTexture(this.device, { src: airplane }, { texture: this.cubeTex! });
      WebGL.generateMipmap(this.device, this.cubeTex!);
    }

    this.sampler = WebGL.createSampler(this.device, {
      magFilter: FilterMode.Linear,
      minFilter: FilterMode.Linear,
      mipmapFilter: FilterMode.Linear,
      maxAnisotropy: 16
    });

    this.cubeTexBindGroup = WebGL.createBindGroup(this.device, {
      layout: textureLayout,
      entries: [{ binding: 0, texture: this.cubeTex }, { binding: 1, sampler: this.sampler }]
    });
    this.envBindGroup = WebGL.createBindGroup(this.device, {
      layout: envLayout,
      entries: [{ binding: 0, buffer: this.matBuffer }, { binding: 1, buffer: this.envBuffer }]
    });
    this.cubeDataBindGroup = WebGL.createBindGroup(this.device, {
      layout: dataLayout,
      entries: [{ buffer: this.cubeDataBuffer }]
    });

    const cubePipelineDesc: RenderPipelineDescriptor = {
      vertex: vs,
      fragment: cubeFs,
      buffers: vertexBufferLayouts([
        { attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2, /* normal */ VertexFormat.F32x3] }
      ]),
      bindGroups: [textureLayout, envLayout, dataLayout],
      depthStencil: {
        depthWrite: true,
        depthCompare: CompareFunction.LessEqual
      },
      primitive: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = WebGL.createRenderPipeline(this.device, cubePipelineDesc);

    // Setup the sky box
    {
      this.skyTex = WebGL.createTexture(this.device, {
        dimension: TextureDimension.CubeMap,
        size: [texSize, texSize, 1]
      });
      if (sky0 && sky1 && sky2) {
        const cubeImages = [sky0, sky0, sky1, sky2, sky0, sky0];
        for (let z = 0; z < 6; ++z) {
          WebGL.copyExternalImageToTexture(this.device, { src: cubeImages[z] }, { texture: this.skyTex!, origin: [0, 0, z] });
        }
        WebGL.generateMipmap(this.device, this.skyTex!);
      }

      this.skyTexBindGroup = WebGL.createBindGroup(this.device, {
        layout: textureLayout,
        entries: [{ binding: 0, texture: this.skyTex }, { binding: 1, sampler: this.sampler }]
      });
      this.skyDataBindGroup = WebGL.createBindGroup(this.device, {
        layout: dataLayout,
        entries: [{ buffer: this.skyDataBuffer }]
      });

      this.skyPipeline = WebGL.createRenderPipeline(this.device, {
        vertex: vs,
        fragment: skyFs,
        buffers: cubePipelineDesc.buffers,
        bindGroups: [textureLayout, dataLayout],
        depthStencil: cubePipelineDesc.depthStencil,
        primitive: {
          cullMode: CullMode.Front // Render back face for sky box
        }
      });
    }

    this.register([
      this.vertBuffer!, this.indexBuffer!, this.matBuffer!, this.envBuffer!, this.cubeDataBuffer!, this.skyDataBuffer!,
      this.cubePipeline!, this.cubeTex!, this.skyPipeline!, this.skyTex!, this.sampler!,
      this.envBindGroup!, this.cubeDataBindGroup!, this.cubeTexBindGroup!, this.skyDataBindGroup!, this.skyTexBindGroup!,
      vs, cubeFs, skyFs, textureLayout, envLayout, dataLayout
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
      WebGL.writeBuffer(this.device, this.cubeDataBuffer!, this.cubeData);

      mat.copy(scale([10, 10, 10]), this.skyData, 0, 0, 16);
      mat.copy(vp, this.skyData, 0, 16, 16);
      mat.copy(camPos, this.skyData, 0, 32, 3);
      WebGL.writeBuffer(this.device, this.skyDataBuffer!, this.skyData);
    }

    WebGL.beginDefaultPass(this.device, { clearColor: [0, 0, 0, 1], clearDepth: 1 });

    // Draw cube
    WebGL.setRenderPipeline(this.device, this.cubePipeline!);
    WebGL.setIndex(this.device, this.indexBuffer!);
    WebGL.setVertex(this.device, 0, this.vertBuffer!);
    WebGL.setBindGroup(this.device, 0, this.cubeTexBindGroup!);
    WebGL.setBindGroup(this.device, 1, this.envBindGroup!);
    WebGL.setBindGroup(this.device, 2, this.cubeDataBindGroup!);
    WebGL.drawIndexed(this.device, cubeIndices.length);

    // Draw skybox
    WebGL.setRenderPipeline(this.device, this.skyPipeline!);
    WebGL.setIndex(this.device, this.indexBuffer!);
    WebGL.setVertex(this.device, 0, this.vertBuffer!);
    WebGL.setBindGroup(this.device, 0, this.skyTexBindGroup!);
    WebGL.setBindGroup(this.device, 1, this.skyDataBindGroup!);
    WebGL.drawIndexed(this.device, cubeIndices.length);

    WebGL.submitRenderPass(this.device);

    return true;
  }
}
