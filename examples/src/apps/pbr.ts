import { lookAt, mat4, perspective, scale, vec3 } from 'munum';
import {
  Buffer, BufferType, CompareFunc, CullMode, VertexFormat, TexType, UniformFormat, UniformType, PipelineDescriptor, RenderingDevice, ShaderType, Float, UniformLayout, UniformBindings, Pipeline, RenderPass, Texture
} from 'mugl';
import { BaseExample, createBuffer, createFloat32Array, Cube, getImageById, Model, TEX_SIZE, toIndices, toVertices, USE_NGL } from '../common';

const texSize = TEX_SIZE;

const cubeVertices = toVertices({
  positions: Cube.positions,
  normals: Cube.normals,
  uvs: Cube.uvs
} as Model);
const cubeIndices = toIndices(Cube);

function vert(gl2: boolean = false): string {
  return `${gl2 ? `#version 300 es
in vec3 position;
in vec3 normal;
in vec2 uv;
out vec3 vPosition;
out vec3 vNormal;
out vec2 vUv;
` : `
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
`}

uniform mat4 model, viewProj;

void main(void) {
  vec4 worldPos = model * vec4(position, 1.0);
  vPosition = worldPos.xyz / worldPos.w;
  vNormal = mat3(model) * normalize(normal);
  vUv = uv;
  gl_Position = viewProj * worldPos;
}
`;
};

function fragCube(gl2: boolean = false): string {
  return `${gl2 ? `#version 300 es
precision mediump float;
in vec3 vPosition;
in vec2 vUv;
in vec3 vNormal;
out vec4 color;
layout (std140) uniform material {
  vec4 albedo;
  float metallic;
  float roughness;
};
layout (std140) uniform env {
  vec4 ambient;
  vec4 lightDir;
  vec4 lightColor;
};
` : `
precision mediump float;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
uniform vec4 albedo;
uniform float metallic;
uniform float roughness;
uniform vec4 ambient;
uniform vec4 lightDir;
uniform vec4 lightColor;
`}

uniform sampler2D tex;
uniform vec3 camPos;

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
  vec3 v = normalize(camPos - vPosition);
  vec3 l = normalize(-lightDir.xyz);
  vec3 h = normalize(l + v);

  float nDotL = clamp(dot(n, l), 0.001, 1.0);
  float nDotV = clamp(abs(dot(n, v)), 0.001, 1.0);
  float nDotH = clamp(dot(n, h), 0.0, 1.0);
  float vDotH = clamp(dot(v, h), 0.0, 1.0);

  vec4 baseColor = toLinear(${gl2 ? 'texture' : 'texture2D'}(tex, vUv)) * albedo;

  vec3 f0 = vec3(0.04);
  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);
  vec3 specularColor = mix(f0, baseColor.rgb, metallic);

  float r0 = max(max(specularColor.r, specularColor.g), specularColor.b);
  float r90 = clamp(r0 * 25.0, 0.0, 1.0);
  vec3 specularEnvR0 = specularColor.rgb;
  vec3 specularEnvR90 = vec3(1.0, 1.0, 1.0) * r90;

  float a = clamp(roughness, 0.04, 1.0);
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

  ${gl2 ? 'color' : 'gl_FragColor'} = vec4(toSrgb(color0), baseColor.a);
}
`;
}

const fragSky = `
precision mediump float;
uniform samplerCube tex;
varying vec3 vNormal;

void main () {
  gl_FragColor = textureCube(tex, normalize(vNormal));
}
`;

export class PbrExample extends BaseExample {
  pass: RenderPass | null = null;
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  matBuffer: Buffer | null = null;
  envBuffer: Buffer | null = null;
  cubePipeline: Pipeline | null = null;
  cubeTex: Texture | null = null;
  skyPipeline: Pipeline | null = null;
  skyTex: Texture | null = null;

  constructor(private readonly device: RenderingDevice, private readonly webgl2: boolean) {
    super();
  }

  init(): void {
    // Get texture images
    const airplane = getImageById('airplane');
    const sky0 = getImageById('sky0');
    const sky1 = getImageById('sky1');
    const sky2 = getImageById('sky2');

    const ctx = this.device;

    const vs = this.device.shader({ type: ShaderType.Vertex, source: vert(this.webgl2) });
    const cubeFs = this.device.shader({ type: ShaderType.Fragment, source: fragCube(this.webgl2) });
    const skyVs = this.device.shader({ type: ShaderType.Vertex, source: vert(false) });
    const skyFs = this.device.shader({ type: ShaderType.Fragment, source: fragSky });

    this.vertBuffer = createBuffer(ctx, cubeVertices);

    // Setup the cube
    this.indexBuffer = createBuffer(ctx, cubeIndices, BufferType.Index);
    this.cubeTex = ctx.texture({
      type: TexType.Tex2D,
      width: texSize,
      height: texSize
    });
    if (airplane) {
      this.cubeTex!
        .data({ image: airplane })
        .mipmap();
    }

    if (this.webgl2) {
      this.matBuffer = createBuffer(ctx, createFloat32Array([
        1.0, 1.0, 1.0, 1.0, // albedo
        0.5, // metallic
        0.5, // roughness
        0, 0 // padding
      ]), BufferType.Uniform);

      this.envBuffer = createBuffer(ctx, createFloat32Array([
        0xdf / 0xff * .75, 0xf6 / 0xff * .75, 0xf5 / 0xff * .75, 1.0, // ambient
        1.0, -2.0, 1.0, 0.0, // lightDir
        0xfc / 0xff, 0xcb / 0xff, 0xcb / 0xff, 2.0, // lightColor / intensity
      ]), BufferType.Uniform);
    }

    const uniforms: UniformLayout = ([
      { name: 'model', valueFormat: UniformFormat.Mat4 },
      { name: 'viewProj', valueFormat: UniformFormat.Mat4 },
      { name: 'camPos', valueFormat: UniformFormat.Vec3 },
      { name: 'tex', type: UniformType.Tex, texType: this.cubeTex!.props.type },
    ] as UniformLayout).concat(this.webgl2 ? [
      { name: 'material', type: UniformType.Buffer },
      { name: 'env', type: UniformType.Buffer }
    ] as UniformLayout : [
      { name: 'albedo', valueFormat: UniformFormat.Vec4 },
      { name: 'metallic' },
      { name: 'roughness' },
      { name: 'ambient', valueFormat: UniformFormat.Vec4 },
      { name: 'lightDir', valueFormat: UniformFormat.Vec4 },
      { name: 'lightColor', valueFormat: UniformFormat.Vec4 },
    ] as UniformLayout);

    const cubePipelineDesc: PipelineDescriptor = {
      vert: vs,
      frag: cubeFs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 },
            { name: 'normal', format: VertexFormat.Float3 }
          ]
        }
      ],
      uniforms,
      depth: {
        compare: CompareFunc.LEqual,
        write: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = ctx.pipeline(cubePipelineDesc);

    // Setup the sky box (Cube texture not supported for NGL)
    if (!USE_NGL) {
      this.skyTex = ctx.texture({
        type: TexType.Cube,
        width: texSize,
        height: texSize
      });
      if (sky0 && sky1 && sky2) {
        this.skyTex!
          .data({ images: [sky0, sky0, sky1, sky2, sky0, sky0] });
      }

      this.skyPipeline = ctx.pipeline({
        buffers: cubePipelineDesc.buffers,
        vert: skyVs,
        frag: skyFs,
        uniforms: [
          { name: 'model', valueFormat: UniformFormat.Mat4 },
          { name: 'viewProj', valueFormat: UniformFormat.Mat4 },
          { name: 'tex', type: UniformType.Tex, texType: this.skyTex!.props.type }
        ],
        depth: {
          compare: CompareFunc.LEqual,
          write: true
        },
        raster: {
          cullMode: CullMode.Front // Render back face for sky box
        }
      });
    }

    this.pass = ctx.pass({
      clearColor: [0.3, 0.3, 0.3, 1],
      clearDepth: 1
    });

    this.register([
      this.pass!, this.vertBuffer!,
      this.cubePipeline!, this.indexBuffer!, this.cubeTex!,
      vs, cubeFs, skyVs, skyFs
    ]);
    if (this.skyPipeline) {
      this.register([this.skyPipeline!, this.skyTex!]);
    }
    if (this.webgl2) {
      this.register([this.matBuffer!, this.envBuffer!]);
    }
  }

  render(t: Float): boolean {
    const camPos = vec3.create(10 * Math.cos(t) as Float, 5 * Math.sin(t) as Float, 10 * Math.sin(t) as Float);
    const model = mat4.create();
    const proj = perspective((this.device.width as Float) / (this.device.height as Float), Math.PI / 4 as Float, 0.01, 100);
    const view = lookAt(camPos, [0, 0, 0]);
    const vp = mat4.mul(proj, view);

    const ctx = this.device.render(this.pass!);

    const uniforms: UniformBindings = ([
      { name: 'model', values: model },
      { name: 'viewProj', values: vp },
      { name: 'tex', tex: this.cubeTex },
      { name: 'camPos', values: camPos },
    ] as UniformBindings).concat(this.webgl2 ? [
      { name: 'material', buffer: this.matBuffer },
      { name: 'env', buffer: this.envBuffer },
    ] as UniformBindings : [
      { name: 'albedo', values: [1, 1, 1, 1] },
      { name: 'metallic', value: 0.2 },
      { name: 'roughness', value: 0.5 },
      { name: 'ambient', values: [0xdf / 0xff * .75, 0xf6 / 0xff * .75, 0xf5 / 0xff * .75, 1.0] },
      { name: 'lightDir', values: [1.0, -3.0, 1.0, 0.0] },
      { name: 'lightColor', values: [0xfc / 0xff, 0xcb / 0xff, 0xcb / 0xff, 2.0] },
    ] as UniformBindings);

    // Draw cube
    ctx.pipeline(this.cubePipeline!)
      .vertex(0, this.vertBuffer!)
      .index(this.indexBuffer!)
      .uniforms(uniforms)
      .drawIndexed(cubeIndices.length);

    // Draw skybox
    if (!USE_NGL) {
      ctx.pipeline(this.skyPipeline!)
        .vertex(0, this.vertBuffer!)
        .index(this.indexBuffer!)
        .uniforms([
          { name: 'model', values: scale([10, 10, 10]) },
          { name: 'viewProj', values: vp },
          { name: 'tex', tex: this.skyTex }
        ])
        .drawIndexed(cubeIndices.length)
        .end();
    }

    return true;
  }
}
