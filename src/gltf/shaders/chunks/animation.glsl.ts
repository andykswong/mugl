
function addTarget(out: string, attr: string): string {
  let frag = '';
  for (let i = 0; i < 8; ++i) {
    frag += `
#ifdef USE_TARGET_${attr}_${i}
  ${out} += targetWeights[${i}] * TARGET_${attr}_${i};
#endif
`;
  }
  return frag;
}

// TODO: Do we need inverse transpose joint matrix for normal matrix?
// TODO: To support min MAX_VERTEX_UNIFORM_VECTORS = 128, use bone texture instead?
export default `
#ifdef USE_JOINTS_0
attribute vec4 JOINTS_0;
#endif

#ifdef USE_WEIGHTS_0
attribute vec4 WEIGHTS_0;
#endif

#if defined(USE_WEIGHTS_0) && defined(USE_JOINTS_0)
#define USE_SKINNING

#ifndef NUM_JOINTS
#define NUM_JOINTS 24
#endif

uniform mat4 jointMatrix[NUM_JOINTS];

mat4 getSkinMatrix() {
  mat4 skin =
    WEIGHTS_0.x * jointMatrix[int(JOINTS_0.x)] +
    WEIGHTS_0.y * jointMatrix[int(JOINTS_0.y)] +
    WEIGHTS_0.z * jointMatrix[int(JOINTS_0.z)] +
    WEIGHTS_0.w * jointMatrix[int(JOINTS_0.w)];

  return skin;
}
#endif

${['POSITION', 'NORMAL', 'TANGENT'].map(attr => {
  let frag = '';
  for (let i = 0; i < 8; ++i) {
    frag += `
#ifdef USE_TARGET_${attr}_${i}
  attribute vec3 TARGET_${attr}_${i};
#endif
`;
  }
  return frag;
}).join('\n')}

#if defined(USE_TARGET_POSITION_0) || defined(USE_TARGET_NORMAL_0) || defined(USE_TARGET_TANGENT_0)
#define USE_MORPHING
#ifndef NUM_MORPHS
#define NUM_MORPHS 8
#endif

uniform float targetWeights[NUM_MORPHS];

vec4 getTargetPosition() {
  vec4 pos = vec4(0);
  ${addTarget('pos.xyz', 'POSITION')}
  return pos;
}

vec3 getTargetNormal() {
  vec3 normal = vec3(0);
  ${addTarget('normal', 'NORMAL')}
  return normal;
}

vec3 getTargetTangent() {
  vec3 tangent = vec3(0);
  ${addTarget('tangent', 'TANGENT')}
  return tangent;
}

#endif
`;