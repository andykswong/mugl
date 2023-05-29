const wgslTypes = `
struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) uv: vec2<f32>,
};
`;

export function vertCube(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
struct VertexInput {
  @location(0) position: vec4<f32>,
  @location(1) color: vec4<f32>,
};

struct Data { mvp: mat4x4<f32> };
@group(0) @binding(0) var<uniform> data: Data;

@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.clip_position = data.mvp * model.position;
  out.color = model.color;
  return out;
}
`
:
`#version 300 es
layout(std140) uniform Data { mat4 mvp; };
layout (location=0) in vec4 position;
layout (location=1) in vec4 color;
out vec4 vColor;

void main() {
  gl_Position = mvp * position;
  vColor = color;
}
`;
}

export function fragCube(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return in.color;
}
`
:
`#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;
}

export function vertQuad(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
struct VertexInput {
  @location(0) position: vec4<f32>,
  @location(1) uv: vec2<f32>,
};

@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.clip_position = model.position;
  out.uv = model.uv;
  return out;
}
`
:
`#version 300 es
layout (location=0) in vec4 position;
layout (location=1) in vec2 uv;
out vec2 vUv;

void main() {
  gl_Position = position;
  vUv = uv;
}
`;
}

export function fragQuad(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
@group(0) @binding(0) var tex: texture_2d<f32>;
@group(0) @binding(1) var tex_sampler: sampler;
struct Data { kernel: mat4x4<f32>, texSize: vec2<f32>, kernelWeight: f32 };
@group(1) @binding(0) var<uniform> data: Data;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let onePixel = vec2(1.0, 1.0) / data.texSize;
  let uv = in.uv * vec2(1, -1) + vec2(0, 1);
  let colorSum =
    textureSample(tex, tex_sampler, uv + onePixel * vec2(-1, -1)) * data.kernel[0][0] +
    textureSample(tex, tex_sampler, uv + onePixel * vec2( 0, -1)) * data.kernel[0][1] +
    textureSample(tex, tex_sampler, uv + onePixel * vec2( 1, -1)) * data.kernel[0][2] +
    textureSample(tex, tex_sampler, uv + onePixel * vec2(-1,  0)) * data.kernel[1][0] +
    textureSample(tex, tex_sampler, uv + onePixel * vec2( 0,  0)) * data.kernel[1][1] +
    textureSample(tex, tex_sampler, uv + onePixel * vec2( 1,  0)) * data.kernel[1][2] +
    textureSample(tex, tex_sampler, uv + onePixel * vec2(-1,  1)) * data.kernel[2][0] +
    textureSample(tex, tex_sampler, uv + onePixel * vec2( 0,  1)) * data.kernel[2][1] +
    textureSample(tex, tex_sampler, uv + onePixel * vec2( 1,  1)) * data.kernel[2][2] ;
  return vec4((colorSum / data.kernelWeight).rgb, 1);
}
`
:
`#version 300 es
precision mediump float;
uniform sampler2D tex;
layout(std140) uniform Data { mat4 kernel; vec2 texSize; float kernelWeight; };
in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 onePixel = vec2(1.0, 1.0) / texSize;
  vec4 colorSum =
    texture(tex, vUv + onePixel * vec2(-1, -1)) * kernel[0][0] +
    texture(tex, vUv + onePixel * vec2( 0, -1)) * kernel[0][1] +
    texture(tex, vUv + onePixel * vec2( 1, -1)) * kernel[0][2] +
    texture(tex, vUv + onePixel * vec2(-1,  0)) * kernel[1][0] +
    texture(tex, vUv + onePixel * vec2( 0,  0)) * kernel[1][1] +
    texture(tex, vUv + onePixel * vec2( 1,  0)) * kernel[1][2] +
    texture(tex, vUv + onePixel * vec2(-1,  1)) * kernel[2][0] +
    texture(tex, vUv + onePixel * vec2( 0,  1)) * kernel[2][1] +
    texture(tex, vUv + onePixel * vec2( 1,  1)) * kernel[2][2] ;
  outColor = vec4((colorSum / kernelWeight).rgb, 1);
}
`;
}
