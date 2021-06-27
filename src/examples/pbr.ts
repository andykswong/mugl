import { mat4, vec3 } from 'gl-matrix';
import {
  BufferType, CompareFunc, CullMode, RenderingDevice, VertexFormat, TexType, UniformFormat, UniformType, PipelineDescriptor
} from '..';
import { BaseExample, bufferWithData, flatMap } from './common';
import { airplane, Cube, skyBox } from './data';

const texSize = 512;

const cubeVertices = new Float32Array(flatMap(Cube.positions, (p, i) => [...p, ...Cube.uvs[i]]));
const cubeIndices = new Uint16Array(flatMap(Cube.indices, v => v));

const vert = `#version 300 es
precision mediump float;
uniform mat4 model, viewProj;
in vec3 position;
in vec2 uv;
out vec3 vPosition;
out vec2 vUv;
out vec3 vNormal;

void main(void) {
  vec4 worldPos = model * vec4(position, 1.0);
  vPosition = worldPos.xyz / worldPos.w;
  vNormal = mat3(model) * normalize(position);
  vUv = uv;
  gl_Position = viewProj * worldPos;
}
`;

const fragCube = `#version 300 es
precision mediump float;
uniform sampler2D tex;
uniform vec3 camPos;
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
  vec3 v = normalize(camPos - vPosition);
  vec3 l = normalize(-lightDir.xyz);
  vec3 h = normalize(l + v);

  float nDotL = clamp(dot(n, l), 0.001, 1.0);
  float nDotV = clamp(abs(dot(n, v)), 0.001, 1.0);
  float nDotH = clamp(dot(n, h), 0.0, 1.0);
  float vDotH = clamp(dot(v, h), 0.0, 1.0);

  vec4 baseColor = toLinear(texture(tex, vUv)) * albedo;

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

  color = vec4(toSrgb(color0), baseColor.a);
}
`;

const fragSky = `#version 300 es
precision mediump float;
uniform samplerCube tex;
in vec3 vNormal;
out vec4 color;

void main () {
  color = texture(tex, normalize(vNormal));
}
`;

export class PbrExample extends BaseExample {
  pass: any;
  vertBuffer: any;
  indexBuffer: any;
  matBuffer: any;
  envBuffer: any;
  cubePipeline: any;
  cubeTex: any;
  skyPipeline: any;
  skyTex: any;
  loaded = false;

  constructor(private readonly device: RenderingDevice) {
    super();
  }

  init(): void {
    const ctx = this.device;

    this.vertBuffer = bufferWithData(ctx, BufferType.Vertex, cubeVertices);

    // Setup the cube
    this.indexBuffer = bufferWithData(ctx, BufferType.Index, cubeIndices);
    this.cubeTex = ctx.texture({
      type: TexType.Tex2D,
      size: [texSize, texSize]
    });

    this.matBuffer = bufferWithData(ctx, BufferType.Uniform, new Float32Array([
      1.0, 1.0, 1.0, 1.0, // albedo
      0.2, // metallic
      0.5, // roughness
      0, 0 // padding
    ]));

    this.envBuffer = bufferWithData(ctx, BufferType.Uniform, new Float32Array([
      0xdf / 0xff * .75, 0xf6 / 0xff * .75, 0xf5 / 0xff * .75, 1.0, // ambient
      1.0, -3.0, 1.0, 0.0, // lightDir
      0xfc / 0xff, 0xcb / 0xff, 0xcb / 0xff, 2.0, // lightColor / intensity
    ]));

    const cubePipelineDesc: PipelineDescriptor = {
      vert,
      frag: fragCube,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: {
        'model': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'viewProj': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'tex': { type: UniformType.Tex, format: this.cubeTex.type },
        'camPos': { type: UniformType.Value, format: UniformFormat.Vec3 },
        'material': { type: UniformType.Buffer },
        'env': { type: UniformType.Buffer },
      },
      depth: {
        compare: CompareFunc.LEqual,
        writeEnabled: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = ctx.pipeline(cubePipelineDesc);

    // Setup the sky box
    this.skyTex = ctx.texture({
      type: TexType.Cube,
      size: [texSize, texSize]
    });
    this.skyPipeline = ctx.pipeline({
      ...cubePipelineDesc,
      frag: fragSky,
      uniforms: {
        'model': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'viewProj': { type: UniformType.Value, format: UniformFormat.Mat4 },
        'tex': { type: UniformType.Tex, format: this.skyTex.type }
      },
      raster: {
        cullMode: CullMode.Front // Render back face for sky box
      }
    });

    this.pass = ctx.pass({ clearDepth: 1 });

    // Load textures
    this.loaded = false;
    Promise.all([
      airplane(),
      skyBox(texSize)
    ]).then(([cubeImg, skyImgs]) => {
      this.skyTex.data([skyImgs[0], ...skyImgs, skyImgs[0], skyImgs[0]]);
      this.cubeTex.data(cubeImg);
      this.loaded = true;
    });

    this.register(
      this.pass, this.vertBuffer,
      this.cubePipeline, this.indexBuffer, this.cubeTex,
      this.skyPipeline, this.skyTex,
      this.matBuffer, this.envBuffer
    );
  }

  render(t: number): boolean {
    if (!this.loaded) {
      // To avoid errors, skip rendering until textures are ready
      // Alternatively you can use a placeholder texture
      return true;
    }

    const camPos = vec3.fromValues(10 * Math.cos(t), 5 * Math.sin(t), 10 * Math.sin(t));
    const proj = mat4.perspective(mat4.create(), Math.PI / 4, this.device.canvas.width / this.device.canvas.height, 0.01, 100);
    const view = mat4.lookAt(mat4.create(), camPos, [0, 0, 0], [0, 1, 0]);
    const vp = mat4.mul(view, proj, view);

    const ctx = this.device.render(this.pass);

    // Draw cube
    ctx.pipeline(this.cubePipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms({
        'model': mat4.create(),
        'viewProj': vp,
        'tex': this.cubeTex,
        'camPos': camPos,
        'material': { buffer: this.matBuffer },
        'env': { buffer: this.envBuffer },
      })
      .drawIndexed(cubeIndices.length);

    // Draw skybox
    ctx.pipeline(this.skyPipeline)
      .vertex(0, this.vertBuffer)
      .index(this.indexBuffer)
      .uniforms({
        'model': mat4.fromScaling(mat4.create(), [10, 10, 10]),
        'viewProj': vp,
        'tex': this.skyTex
      })
      .drawIndexed(cubeIndices.length)
      .end();

    return true;
  }
}
