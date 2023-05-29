const wgslTypes = `
struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) normal: vec3<f32>,
};
`;

export function vert(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
};

struct Data { mvp: mat4x4<f32> };
@group(1) @binding(0) var<uniform> data: Data;

@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.clip_position = data.mvp * vec4(model.position, 1);
  out.uv = model.uv;
  out.normal = normalize(model.position);
  return out;
}
`
: `#version 300 es
layout(std140) uniform Data { mat4 mvp; };
layout (location=0) in vec3 position;
layout (location=1) in vec2 uv;
out vec2 vUv;
out vec3 vNormal;

void main() {
  vUv = uv;
  vNormal = normalize(position);
  gl_Position = mvp * vec4(position, 1.0);
}
`;
}

export function frag(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
@group(0) @binding(0) var tex: texture_2d<f32>;
@group(0) @binding(1) var tex_sampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(tex, tex_sampler, in.uv);
}
`
: `#version 300 es
precision mediump float;
uniform sampler2D tex;
in vec2 vUv;
out vec4 outColor;

void main() {
  outColor = texture(tex, vUv);
}
`;
}

export function fragSky(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
@group(0) @binding(0) var tex: texture_cube<f32>;
@group(0) @binding(1) var tex_sampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(tex, tex_sampler, normalize(in.normal));
}
`
: `#version 300 es
precision mediump float;
uniform samplerCube tex;
in vec3 vNormal;
out vec4 outColor;

void main() {
  outColor = texture(tex, normalize(vNormal));
}
`;
}
