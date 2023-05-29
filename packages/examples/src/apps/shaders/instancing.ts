const wgslTypes = `
struct VertexInput {
  @location(0) position: vec2<f32>,
  @location(1) offset: vec2<f32>,
  @location(2) color: vec3<f32>,
  @location(3) angle: f32,
};

struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) color: vec3<f32>,
};
`;

export function vert(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.color = model.color;
  out.clip_position = vec4<f32>(
    cos(model.angle) * model.position[0] + sin(model.angle) * model.position[1] + model.offset[0],
    -sin(model.angle) * model.position[0] + cos(model.angle) * model.position[1] + model.offset[1],
    0.0,
    1.0
  );
  return out;
}
`
:
`#version 300 es
layout (location=0) in vec2 position;
layout (location=1) in vec2 offset;
layout (location=2) in vec3 color;
layout (location=3) in float angle;
out vec3 vColor;

void main() {
  gl_Position = vec4(
    cos(angle) * position.x + sin(angle) * position.y + offset.x,
    -sin(angle) * position.x + cos(angle) * position.y + offset.y,
    0, 1);
  vColor = color;
}
`;
}

export function frag(useWebGPU: boolean = false): string {
  return useWebGPU ? `${wgslTypes}
struct Data { ambient: vec4<f32> };
@group(0) @binding(0) var<uniform> data: Data;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(data.ambient.rgb + in.color, data.ambient[3]);
}
`
:
`#version 300 es
precision mediump float;
layout(std140) uniform Data { vec3 ambient; };
in vec3 vColor;
out vec4 outColor;

void main () {
  outColor = vec4(ambient + vColor, 1.0);
}
`;
}
