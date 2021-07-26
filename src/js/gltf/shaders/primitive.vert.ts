import animationGlsl from './chunks/animation.glsl';

export default `
precision highp float;

uniform mat4 model;
uniform mat4 viewProj;
uniform mat3 normalMatrix;

#ifdef USE_COLOR_0
#if defined(COLOR_0_VEC3)
attribute vec3 COLOR_0;
#else
attribute vec4 COLOR_0;
#endif
varying vec4 vColor0;
#endif

#ifdef USE_TEXCOORD_0
attribute vec2 TEXCOORD_0;
#endif
#ifdef USE_TEXCOORD_1
attribute vec2 TEXCOORD_1;
#endif

varying vec2 vTexCoord0;
varying vec2 vTexCoord1;

${animationGlsl}

attribute vec3 POSITION;
varying vec3 vPosition;

vec4 getPosition() {
  vec4 pos = vec4(POSITION, 1.0);

#ifdef USE_MORPH
  pos += getTargetPosition();
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
varying vec3 vNormal;
#endif

vec3 getNormal() {
  vec3 norm = NORMAL;

#ifdef USE_MORPH
  norm += getTargetNormal();
#endif
#ifdef USE_SKIN
  norm = mat3(getSkinMatrix()) * norm;
#endif

  return normalize(norm);
}

#endif

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
  vNormal = normalize(normalMatrix * NORMAL);
#endif
#endif

#ifdef USE_COLOR_0
#if defined(COLOR_0_VEC3)
  vColor0 = vec4(COLOR_0, 1.0);
#else
  vColor0 = COLOR_0;
#endif
#endif

  vTexCoord0 = vec2(0.0, 0.0);
  vTexCoord1 = vec2(0.0, 0.0);
#ifdef USE_TEXCOORD_0
  vTexCoord0 = TEXCOORD_0;
#endif
#ifdef USE_TEXCOORD_1
  vTexCoord1 = TEXCOORD_1;
#endif

  gl_Position = viewProj * pos;
  gl_PointSize = 1.0;
}
`;
