const wgslTypes = `
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) color: vec4<f32>,
};

struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) color: vec4<f32>,
};
`;

export function vert(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.color = model.color;
  out.clip_position = vec4<f32>(model.position, 1.0);
  return out;
}
`
:
`#version 300 es
layout (location=0) in vec3 position;
layout (location=1) in vec4 color;
out vec4 vColor;
void main () {
  gl_Position = vec4(position, 1);
  vColor = color;
}
`;
}

export function frag(useWebGPU: boolean = false): string {
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
void main () {
  outColor = vColor;
}
`;
}
