precision highp float;

uniform mat4 model, viewProj;
uniform mat3 normalMatrix;

#ifdef USE_COLOR_0
#if defined(COLOR_0_VEC3)
attribute vec3 COLOR_0;
#else
// !defined(COLOR_0_VEC3)
attribute vec4 COLOR_0;
#endif
// endif defined(COLOR_0_VEC3)

varying vec4 vColor0;
#endif
// endif USE_COLOR_0

#ifdef USE_TEXCOORD_0
attribute vec2 TEXCOORD_0;
#endif

#ifdef USE_TEXCOORD_1
attribute vec2 TEXCOORD_1;
#endif

varying vec2 vTexCoord0, vTexCoord1;

attribute vec3 POSITION;
varying vec3 vPosition;

#pragma glslify: import('./animation')

vec4 getPosition() {
  vec4 pos = vec4(POSITION, 1.);

#ifdef USE_MORPH
  pos += vec4(getTargetPosition(), 0.);
#endif

#ifdef USE_SKIN
  pos = getSkinMatrix() * pos;
#endif

  return pos;
}

#ifdef USE_NORMAL
attribute vec3 NORMAL;

#ifdef USE_TANGENT
attribute vec4 TANGENT;
varying mat3 vTBN;

vec3 getTangent() {
  vec3 tan = TANGENT.xyz;

#ifdef USE_MORPH
  tan += getTargetTangent();
#endif

#ifdef USE_SKIN
  tan = mat3(getSkinMatrix()) * tan;
#endif

  return normalize(tan);
}
#else
// !USE_TANGENT
varying vec3 vNormal;
#endif
// endif USE_TANGENT

vec3 getNormal() {
  vec3 norm = NORMAL;

#ifdef USE_MORPH
  norm += getTargetNormal();
#endif

#ifdef USE_SKIN
  // TODO: Use inverse transpose joint matrix?
  norm = mat3(getSkinMatrix()) * norm;
#endif

  return normalize(norm);
}

#endif
// endif USE_NORMAL

void main(void) {
  vec4 pos = model * getPosition();
  vPosition = pos.xyz / pos.w;

#ifdef USE_NORMAL
#ifdef USE_TANGENT
  vec3 tan = getTangent();
  vec3 normW = normalize(normalMatrix * getNormal());
  vec3 tanW = normalize(normalMatrix * tan);
  vec3 bitanW = cross(normW, tanW) * TANGENT.w;
  vTBN = mat3(tanW, bitanW, normW);
#else
// !USE_TANGENT
  vNormal = normalize(normalMatrix * NORMAL);
#endif
// endif USE_TANGENT
#endif
// endif USE_NORMAL

#ifdef USE_COLOR_0
#if defined(COLOR_0_VEC3)
  vColor0 = vec4(COLOR_0, 1.);
#else
// !defined(COLOR_0_VEC3)
  vColor0 = COLOR_0;
#endif
#endif
// endif USE_COLOR_0

  vTexCoord0 = vec2(0.);
  vTexCoord1 = vec2(0.);

#ifdef USE_TEXCOORD_0
  vTexCoord0 = TEXCOORD_0;
#endif

#ifdef USE_TEXCOORD_1
  vTexCoord1 = TEXCOORD_1;
#endif

  gl_Position = viewProj * pos;
  gl_PointSize = 1.;
}
