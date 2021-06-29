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
#define NUM_JOINTS 32
#endif

uniform mat4 jointMatrix[NUM_JOINTS];
uniform mat4 jointNormalMatrix[NUM_JOINTS];

mat4 getSkinMatrix() {
  mat4 skin =
    WEIGHTS_0.x * jointMatrix[int(JOINTS_0.x)] +
    WEIGHTS_0.y * jointMatrix[int(JOINTS_0.y)] +
    WEIGHTS_0.z * jointMatrix[int(JOINTS_0.z)] +
    WEIGHTS_0.w * jointMatrix[int(JOINTS_0.w)];

  return skin;
}

mat4 getSkinNormalMatrix() {
  mat4 skin =
    WEIGHTS_0.x * jointNormalMatrix[int(JOINTS_0.x)] +
    WEIGHTS_0.y * jointNormalMatrix[int(JOINTS_0.y)] +
    WEIGHTS_0.z * jointNormalMatrix[int(JOINTS_0.z)] +
    WEIGHTS_0.w * jointNormalMatrix[int(JOINTS_0.w)];

  return skin;
}
#endif

#ifdef USE_TARGET_POSITION_0
in vec3 TARGET_POSITION_0;
#endif

#ifdef USE_TARGET_POSITION_1
in vec3 TARGET_POSITION_1;
#endif

#ifdef USE_TARGET_POSITION_2
in vec3 TARGET_POSITION_2;
#endif

#ifdef USE_TARGET_POSITION_3
in vec3 TARGET_POSITION_3;
#endif

#ifdef USE_TARGET_POSITION_4
in vec3 TARGET_POSITION_4;
#endif

#ifdef USE_TARGET_POSITION_5
in vec3 TARGET_POSITION_5;
#endif

#ifdef USE_TARGET_POSITION_6
in vec3 TARGET_POSITION_6;
#endif

#ifdef USE_TARGET_POSITION_7
in vec3 TARGET_POSITION_7;
#endif

#ifdef USE_TARGET_NORMAL_0
in vec3 TARGET_NORMAL_0;
#endif

#ifdef USE_TARGET_NORMAL_1
in vec3 TARGET_NORMAL_1;
#endif

#ifdef USE_TARGET_NORMAL_2
in vec3 TARGET_NORMAL_2;
#endif

#ifdef USE_TARGET_NORMAL_3
in vec3 TARGET_NORMAL_3;
#endif

#ifdef USE_TARGET_NORMAL_4
in vec3 TARGET_NORMAL_4;
#endif

#ifdef USE_TARGET_NORMAL_5
in vec3 TARGET_NORMAL_5;
#endif

#ifdef USE_TARGET_NORMAL_6
in vec3 TARGET_NORMAL_6;
#endif

#ifdef USE_TARGET_NORMAL_7
in vec3 TARGET_NORMAL_7;
#endif

#ifdef USE_TARGET_TANGENT_0
in vec3 TARGET_TANGENT_0;
#endif

#ifdef USE_TARGET_TANGENT_1
in vec3 TARGET_TANGENT_1;
#endif

#ifdef USE_TARGET_TANGENT_2
in vec3 TARGET_TANGENT_2;
#endif

#ifdef USE_TARGET_TANGENT_3
in vec3 TARGET_TANGENT_3;
#endif

#ifdef USE_TARGET_TANGENT_4
in vec3 TARGET_TANGENT_4;
#endif

#ifdef USE_TARGET_TANGENT_5
in vec3 TARGET_TANGENT_5;
#endif

#ifdef USE_TARGET_TANGENT_6
in vec3 TARGET_TANGENT_6;
#endif

#ifdef USE_TARGET_TANGENT_7
in vec3 TARGET_TANGENT_7;
#endif


#if defined(USE_TARGET_POSITION_0) || defined(USE_TARGET_NORMAL_0) || defined(USE_TARGET_TANGENT_0)
#define USE_MORPHING
#ifndef NUM_MORPHS
#define NUM_MORPHS 8
#endif

uniform float targetWeights[NUM_MORPHS];

vec4 getTargetPosition() {
  vec4 pos = vec4(0);

#ifdef USE_TARGET_POSITION_0
  pos.xyz += targetWeights[0] * TARGET_POSITION_0;
#endif

#ifdef USE_TARGET_POSITION_1
  pos.xyz += targetWeights[1] * TARGET_POSITION_1;
#endif

#ifdef USE_TARGET_POSITION_2
  pos.xyz += targetWeights[2] * TARGET_POSITION_2;
#endif

#ifdef USE_TARGET_POSITION_3
  pos.xyz += targetWeights[3] * TARGET_POSITION_3;
#endif

#ifdef USE_TARGET_POSITION_4
  pos.xyz += targetWeights[4] * TARGET_POSITION_4;
#endif

#ifdef USE_TARGET_POSITION_5
  pos.xyz += targetWeights[5] * TARGET_POSITION_5;
#endif

#ifdef USE_TARGET_POSITION_6
  pos.xyz += targetWeights[6] * TARGET_POSITION_6;
#endif

#ifdef USE_TARGET_POSITION_7
  pos.xyz += targetWeights[7] * TARGET_POSITION_7;
#endif

  return pos;
}

vec3 getTargetNormal() {
  vec3 normal = vec3(0);

#ifdef USE_TARGET_NORMAL_0
  normal += targetWeights[0] * TARGET_NORMAL_0;
#endif

#ifdef USE_TARGET_NORMAL_1
  normal += targetWeights[1] * TARGET_NORMAL_1;
#endif

#ifdef USE_TARGET_NORMAL_2
  normal += targetWeights[2] * TARGET_NORMAL_2;
#endif

#ifdef USE_TARGET_NORMAL_3
  normal += targetWeights[3] * TARGET_NORMAL_3;
#endif

#ifdef USE_TARGET_NORMAL_4
  normal += targetWeights[4] * TARGET_NORMAL_4;
#endif

#ifdef USE_TARGET_NORMAL_5
  normal += targetWeights[5] * TARGET_NORMAL_5;
#endif

#ifdef USE_TARGET_NORMAL_6
  normal += targetWeights[6] * TARGET_NORMAL_6;
#endif

#ifdef USE_TARGET_NORMAL_7
  normal += targetWeights[7] * TARGET_NORMAL_7;
#endif

  return normal;
}

vec3 getTargetTangent() {
  vec3 tangent = vec3(0);

#ifdef USE_TARGET_TANGENT_0
  tangent += targetWeights[0] * TARGET_TANGENT_0;
#endif

#ifdef USE_TARGET_TANGENT_1
  tangent += targetWeights[1] * TARGET_TANGENT_1;
#endif

#ifdef USE_TARGET_TANGENT_2
  tangent += targetWeights[2] * TARGET_TANGENT_2;
#endif

#ifdef USE_TARGET_TANGENT_3
  tangent += targetWeights[3] * TARGET_TANGENT_3;
#endif

#ifdef USE_TARGET_TANGENT_4
  tangent += targetWeights[4] * TARGET_TANGENT_4;
#endif

#ifdef USE_TARGET_TANGENT_5
  tangent += targetWeights[5] * TARGET_TANGENT_5;
#endif

#ifdef USE_TARGET_TANGENT_6
  tangent += targetWeights[6] * TARGET_TANGENT_6;
#endif

#ifdef USE_TARGET_TANGENT_7
  tangent += targetWeights[7] * TARGET_TANGENT_7;
#endif

  return tangent;
}

#endif
`;
