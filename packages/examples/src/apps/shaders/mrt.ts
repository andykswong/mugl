const wgslVertex = `
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
};

struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
};
`;

const wgslDataType = `
struct Data { model: mat4x4<f32>, vp: mat4x4<f32>, color: vec3<f32> };
@group(0) @binding(0) var<uniform> data: Data;
`;

const glslDataType = `
layout(std140) uniform Data { mat4 model, vp; vec3 color; };
`;

export function vertCube(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslVertex} ${wgslDataType}
@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  let world = data.model * vec4(model.position, 1.0);
  out.clip_position = data.vp * world;
  out.position = world.xyz;
  out.uv = model.uv;
  return out;
}
`
:
`#version 300 es
precision mediump float;
${glslDataType}
layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;
out vec3 vPosition;
out vec2 vUv;

void main() {
  vec4 worldPos = model * vec4(position, 1.0);
  vPosition = worldPos.xyz;
  vUv = uv;
  gl_Position = vp * worldPos;
}
`;
}

export function fragCube(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslVertex} ${wgslDataType}
struct FragmentOutput {
  @location(0) color: vec4<f32>,
  @location(1) uv: vec4<f32>,
  @location(2) position: vec4<f32>,
};

@fragment
fn fs_main(in: VertexOutput) -> FragmentOutput {
  var out: FragmentOutput;
  out.color = vec4(data.color, 1);
  out.uv = vec4(in.uv, 0, 0);
  out.position = vec4(in.position, 1);
  return out;
}
`
:
`#version 300 es
precision mediump float;
${glslDataType}
in vec3 vPosition;
in vec2 vUv;
layout(location = 0) out vec4 out0;
layout(location = 1) out vec4 out1;
layout(location = 2) out vec4 out2;

void main() {
  out0 = vec4(color, 1.0);
  out1 = vec4(vUv, 0.0, 0.0);
  out2 = vec4(vPosition, 1.0);
}
`;
}

export function vertQuad(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslVertex}
@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.clip_position = vec4(model.position, 1);
  out.uv = model.uv;
  return out;
}
`
:
`#version 300 es
layout (location=0) in vec3 position;
layout (location=1) in vec2 uv;
out vec2 vUv;

void main() {
  gl_Position = vec4(position, 1.0);
  vUv = uv;
}
`;
}

export function fragQuad(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslVertex}
@group(0) @binding(0) var tex0: texture_2d<f32>;
@group(0) @binding(1) var tex0_sampler: sampler;
@group(0) @binding(2) var tex1: texture_2d<f32>;
@group(0) @binding(3) var tex1_sampler: sampler;
@group(0) @binding(4) var tex2: texture_2d<f32>;
@group(0) @binding(5) var tex2_sampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let texUV = in.uv * vec2(1, -1) + vec2(0, 1);
  let colorSum =
    textureSample(tex0, tex0_sampler, texUV) * step(0.5, 1.0 - in.uv.x) * step(0.5, in.uv.y) +
    textureSample(tex0, tex0_sampler, texUV) * step(0.5, in.uv.x) * step(0.5, 1.0 - in.uv.y) +
    textureSample(tex1, tex1_sampler, texUV) * step(0.5, 1.0 - in.uv.x) * step(0.5, 1.0 - in.uv.y) +
    textureSample(tex2, tex2_sampler, texUV) * step(0.5, in.uv.x) * step(0.5, in.uv.y);
  return vec4(colorSum.rgb, 1);
}
`
:
`#version 300 es
precision mediump float;
uniform sampler2D tex0, tex1, tex2;
in vec2 vUv;
out vec4 outColor;

void main() {
  vec4 colorSum =
    texture(tex0, vUv) * step(0.5, 1.0 - vUv.x) * step(0.5, vUv.y) +
    texture(tex0, vUv) * step(0.5, vUv.x) * step(0.5, 1.0 - vUv.y) +
    texture(tex1, vUv) * step(0.5, 1.0 - vUv.x) * step(0.5, 1.0 - vUv.y) +
    texture(tex2, vUv) * step(0.5, vUv.x) * step(0.5, vUv.y);
  outColor = vec4(colorSum.rgb, 1.0);
}
`;
}
