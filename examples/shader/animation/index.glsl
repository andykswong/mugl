#if defined(USE_WEIGHTS_0) && defined(USE_JOINTS_0)
#define USE_SKIN

layout (location=6) in vec4 JOINTS_0;
layout (location=7) in vec4 WEIGHTS_0;

#pragma glslify: import('./skin.glsl)

#endif // USE_SKIN

#if defined(USE_POSITION_0)
#define USE_MORPH

#ifdef USE_POSITION_0
layout (location=8) in vec3 POSITION_0;
#endif
#ifdef USE_POSITION_1
layout (location=9) in vec3 POSITION_1;
#endif

#if !defined(USE_TANGENT_0)

#ifdef USE_POSITION_2
layout (location=10) in vec3 POSITION_2;
#endif
#ifdef USE_POSITION_3
layout (location=11) in vec3 POSITION_3;
#endif

#if !defined(USE_NORMAL_0)

#ifdef USE_POSITION_4
layout (location=12) in vec3 POSITION_4;
#endif
#ifdef USE_POSITION_5
layout (location=13) in vec3 POSITION_5;
#endif
#ifdef USE_POSITION_6
layout (location=14) in vec3 POSITION_6;
#endif
#ifdef USE_POSITION_7
layout (location=15) in vec3 POSITION_7;
#endif

#endif // !defined(USE_NORMAL_0)
#endif // !defined(USE_TANGENT_0)

#ifdef USE_NORMAL_0
layout (location=12) in vec3 NORMAL_0;
#endif
#ifdef USE_NORMAL_1
layout (location=13) in vec3 NORMAL_1;
#endif

#if !defined(USE_TANGENT_0)
#ifdef USE_NORMAL_2
layout (location=14) in vec3 NORMAL_2;
#endif
#ifdef USE_NORMAL_3
layout (location=15) in vec3 NORMAL_3;
#endif
#endif // !defined(USE_TANGENT_0)

#ifdef USE_TANGENT_0
layout (location=14) in vec3 TANGENT_0;
#endif
#ifdef USE_TANGENT_1
layout (location=15) in vec3 TANGENT_1;
#endif

#pragma glslify: import('./target-pos.glsl')
#pragma glslify: import('./target-norm.glsl')
#pragma glslify: import('./target-tan.glsl')

#endif // USE_MORPH
