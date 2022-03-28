#version 300 es
precision highp float;

layout(std140) uniform Model {
  mat4 model, normalMatrix, viewProj;
  vec4 cameraPosition;
};

// For simplicity, morph target and joints uniforms always exist even if they are unused
layout(std140) uniform Morph {
  // 8 weights packed as 2 vec4
  vec4 targetWeights[2];
};
uniform sampler2D jointTexture;

layout (location=0) in vec3 POSITION;
out vec3 vPosition;
out vec2 vTexCoord0, vTexCoord1;

#ifdef USE_NORMAL
layout (location=1) in vec3 NORMAL;

#ifdef USE_TANGENT
layout (location=2) in vec4 TANGENT;
out mat3 vTBN;
#else
out vec3 vNormal;
#endif

#endif // USE_NORMAL

#ifdef USE_TEXCOORD_0
layout (location=3) in vec2 TEXCOORD_0;
#endif
#ifdef USE_TEXCOORD_1
layout (location=4) in vec2 TEXCOORD_1;
#endif

#ifdef USE_COLOR_0
out vec4 vColor0;

#if defined(COLOR_0_VEC3)
layout (location=5) in vec3 COLOR_0;
#else
layout (location=5) in vec4 COLOR_0;
#endif

#endif // USE_COLOR_0

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

#ifdef USE_TANGENT
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
#endif // USE_TANGENT

#endif // endif USE_NORMAL

void main() {
  vec4 pos = model * getPosition();
  vPosition = pos.xyz / pos.w;

#ifdef USE_NORMAL
  mat3 normalMat3 = mat3(normalMatrix);
#ifdef USE_TANGENT
  vec3 tan = getTangent();
  vec3 normW = normalize(normalMat3 * getNormal());
  vec3 tanW = normalize(normalMat3 * tan);
  vec3 bitanW = cross(normW, tanW) * TANGENT.w;
  vTBN = mat3(tanW, bitanW, normW);
#else
  vNormal = normalize(normalMat3 * NORMAL);
#endif // USE_TANGENT
#endif // USE_NORMAL

#ifdef USE_COLOR_0
#if defined(COLOR_0_VEC3)
  vColor0 = vec4(COLOR_0, 1.);
#else
  vColor0 = COLOR_0;
#endif
#endif // USE_COLOR_0

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
