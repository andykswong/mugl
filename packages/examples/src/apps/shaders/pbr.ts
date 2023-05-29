const wgslVertexOutput = `
struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
  @location(2) normal: vec3<f32>,
};
`;

const wgslData = `
struct Data { model: mat4x4<f32>, viewProj: mat4x4<f32>, camPos: vec4<f32> };
@group(0) @binding(0) var<uniform> data: Data;
`;

const glslData = `
layout(std140) uniform Data { mat4 model, viewProj; vec4 camPos; };
`;

export function vert(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslVertexOutput} ${wgslData}
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
  @location(2) normal: vec3<f32>,
};

@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  let world = data.model * vec4(model.position, 1);
  out.clip_position = data.viewProj * world;
  out.position = world.xyz / world.w;
  out.uv = model.uv;
  out.normal = (data.model * vec4(normalize(model.normal), 1)).xyz;
  return out;
}
`
: `#version 300 es
precision mediump float;
${glslData}
layout (location=0) in vec3 position;
layout (location=1) in vec2 uv;
layout (location=2) in vec3 normal;
out vec3 vPosition;
out vec2 vUv;
out vec3 vNormal;

void main() {
  vec4 worldPos = model * vec4(position, 1.0);
  vPosition = worldPos.xyz / worldPos.w;
  vNormal = mat3(model) * normalize(normal);
  vUv = uv;
  gl_Position = viewProj * worldPos;
}
`;
}

export function frag(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslVertexOutput} ${wgslData}
@group(1) @binding(0) var tex: texture_2d<f32>;
@group(1) @binding(1) var tex_sampler: sampler;
struct Material { albedo: vec4<f32>, metallicRoughness: vec2<f32> };
@group(2) @binding(0) var<uniform> material: Material;
struct Env { ambient: vec4<f32>, lightDir: vec4<f32>, lightColor: vec4<f32> };
@group(2) @binding(1) var<uniform> env: Env;
const PI: f32 = 3.14159265359;

fn toSrgb(color: vec3<f32>) -> vec3<f32> { return pow(color, vec3(1.0/2.2)); }
fn toLinear(color: vec4<f32>) -> vec4<f32> { return vec4(pow(color.rgb, vec3(2.2)), color.a); }
fn diffuse(color: vec3<f32>) -> vec3<f32> { return color / PI; }

fn specularF(r0: vec3<f32>, r90: vec3<f32>, vDotH: f32) -> vec3<f32> {
  return r0 + (r90 - r0) * pow(clamp(1.0 - vDotH, 0, 1), 5);
}
fn specularD(aSqr: f32, nDotH: f32) -> f32 {
  let f = (nDotH * nDotH) * (aSqr - 1) + 1;
  return aSqr / (PI * f * f);
}
fn specularG(aSqr: f32, nDotL: f32, nDotV: f32) -> f32 {
  let gl = 2.0 * nDotL / (nDotL + sqrt(aSqr + (1.0 - aSqr) * (nDotL * nDotL)));
  let gv = 2.0 * nDotV / (nDotV + sqrt(aSqr + (1.0 - aSqr) * (nDotV * nDotV)));
  return gl * gv;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let n = normalize(in.normal);
  let v = normalize(data.camPos.xyz - in.position);
  let l = normalize(-env.lightDir.xyz);
  let h = normalize(l + v);
  let nDotL = clamp(dot(n, l), 0.001, 1);
  let nDotV = clamp(abs(dot(n, v)), 0.001, 1);
  let nDotH = clamp(dot(n, h), 0, 1);
  let vDotH = clamp(dot(v, h), 0, 1);

  let baseColor = toLinear(textureSample(tex, tex_sampler, in.uv)) * material.albedo;

  const f0 = vec3(0.04);
  let diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1 - material.metallicRoughness.x);
  let specularColor = mix(f0, baseColor.rgb, material.metallicRoughness.x);

  let r0 = max(max(specularColor.r, specularColor.g), specularColor.b);
  let r90 = clamp(r0 * 25, 0, 1);
  let specularEnvR0 = specularColor.rgb;
  let specularEnvR90 = vec3(1.0) * r90;

  let aSqrt = clamp(material.metallicRoughness.y , 0.004, 1);
  let aSqr = pow(aSqrt, 4);

  var color0 = vec3(0.0);

  let F = specularF(specularEnvR0, specularEnvR90, vDotH);
  let D = specularD(aSqr, nDotH);
  let G = specularG(aSqr, nDotL, nDotV);

  let diffuseStr = (1.0 - F) * diffuse(diffuseColor);
  let specularStr = F * G * D / (4.0 * nDotL * nDotV);

  color0 += nDotL * env.lightColor.rgb * env.lightColor.a * (diffuseStr + specularStr);
  color0 += env.ambient.rgb * diffuseColor;

  return vec4(toSrgb(color0), baseColor.a);
}
`
: `#version 300 es
precision mediump float;
${glslData}
uniform sampler2D tex;
layout(std140) uniform Material { vec4 albedo; vec2 metallicRoughness;};
layout(std140) uniform Env { vec4 ambient; vec4 lightDir; vec4 lightColor; };
in vec3 vPosition;
in vec2 vUv;
in vec3 vNormal;
out vec4 color;
const float PI = 3.14159265359;

vec3 toSrgb(vec3 color) { return pow(color, vec3(1.0/2.2)); }
vec4 toLinear(vec4 srgbIn) { return vec4(pow(srgbIn.rgb, vec3(2.2)), srgbIn.a); }
vec3 diffuse(vec3 color) { return color / PI; }

vec3 specularF(vec3 r0, vec3 r90, float vDotH) { return r0 + (r90 - r0) * pow(clamp(1.0 - vDotH, 0.0, 1.0), 5.0); }
float specularD(float aSqr, float nDotH) {
  float f = (nDotH * nDotH) * (aSqr - 1.0) + 1.0;
  return aSqr / (PI * f * f);
}
float specularG(float aSqr, float nDotL, float nDotV) {
  float gl = 2.0 * nDotL / (nDotL + sqrt(aSqr + (1.0 - aSqr) * (nDotL * nDotL)));
  float gv = 2.0 * nDotV / (nDotV + sqrt(aSqr + (1.0 - aSqr) * (nDotV * nDotV)));
  return gl * gv;
}

void main() {
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
}
`;
}

export function fragSky(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslVertexOutput}
@group(1) @binding(0) var tex: texture_cube<f32>;
@group(1) @binding(1) var tex_sampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(tex, tex_sampler, normalize(in.position));
}
`
: `#version 300 es
precision mediump float;
uniform samplerCube tex;
in vec3 vPosition;
out vec4 outColor;

void main() {
  outColor = texture(tex, normalize(vPosition));
}
`;
}
