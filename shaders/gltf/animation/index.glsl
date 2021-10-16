#if defined(NUM_JOINTS) && defined(USE_WEIGHTS_0) && defined(USE_JOINTS_0)
#define USE_SKIN

attribute vec4 JOINTS_0, WEIGHTS_0;
// TODO: Use bone texture to support more joints
uniform mat4 jointMatrix[NUM_JOINTS];

#pragma glslify: import('./skin.glsl)

#endif
// endif USE_SKIN

#if defined(NUM_MORPHS) && defined(USE_POSITION_0) || defined(USE_NORMAL_0) || defined(USE_TANGENT_0)
#define USE_MORPH

uniform float targetWeights[NUM_MORPHS];

#ifdef USE_POSITION_0
attribute vec3 POSITION_0;
#endif
#ifdef USE_POSITION_1
attribute vec3 POSITION_1;
#endif
#ifdef USE_POSITION_2
attribute vec3 POSITION_2;
#endif
#ifdef USE_POSITION_3
attribute vec3 POSITION_3;
#endif
#ifdef USE_POSITION_4
attribute vec3 POSITION_4;
#endif
#ifdef USE_POSITION_5
attribute vec3 POSITION_5;
#endif
#ifdef USE_POSITION_6
attribute vec3 POSITION_6;
#endif
#ifdef USE_POSITION_7
attribute vec3 POSITION_7;
#endif

#ifdef USE_NORMAL_0
attribute vec3 NORMAL_0;
#endif
#ifdef USE_NORMAL_1
attribute vec3 NORMAL_1;
#endif
#ifdef USE_NORMAL_2
attribute vec3 NORMAL_2;
#endif
#ifdef USE_NORMAL_3
attribute vec3 NORMAL_3;
#endif
#ifdef USE_NORMAL_4
attribute vec3 NORMAL_4;
#endif
#ifdef USE_NORMAL_5
attribute vec3 NORMAL_5;
#endif
#ifdef USE_NORMAL_6
attribute vec3 NORMAL_6;
#endif
#ifdef USE_NORMAL_7
attribute vec3 NORMAL_7;
#endif

#ifdef USE_TANGENT_0
attribute vec3 TANGENT_0;
#endif
#ifdef USE_TANGENT_1
attribute vec3 TANGENT_1;
#endif
#ifdef USE_TANGENT_2
attribute vec3 TANGENT_2;
#endif
#ifdef USE_TANGENT_3
attribute vec3 TANGENT_3;
#endif
#ifdef USE_TANGENT_4
attribute vec3 TANGENT_4;
#endif
#ifdef USE_TANGENT_5
attribute vec3 TANGENT_5;
#endif
#ifdef USE_TANGENT_6
attribute vec3 TANGENT_6;
#endif
#ifdef USE_TANGENT_7
attribute vec3 TANGENT_7;
#endif

#pragma glslify: import('./target-pos.glsl')
#pragma glslify: import('./target-norm.glsl')
#pragma glslify: import('./target-tan.glsl')

#endif
// endif USE_MORPH
