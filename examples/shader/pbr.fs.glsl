#version 300 es
precision highp float;

layout(std140) uniform Model {
  mat4 model, normalMatrix, viewProj;
  vec4 cameraPosition;
};

layout(std140) uniform Morph {
  // 8 weights packed as 2 vec4
  vec4 targetWeights[2];
};

layout(std140) uniform Material {
  vec4 baseColorFactor;
  float metallicFactor, roughnessFactor;
  float baseColorTexCoord, metallicRoughnessTexCoord;
  float normalScale, normalTexCoord;
  float occlusionStrength, occlusionTexCoord;
  vec4 emissiveFactorTexCoord;
  float alphaCutoff;
  // floatx3 padding
};

uniform sampler2D baseColorTexture;
uniform sampler2D metallicRoughnessTexture;
uniform sampler2D normalTexture;
uniform sampler2D occlusionTexture;
uniform sampler2D emissiveTexture;

in vec3 vPosition;
in vec2 vTexCoord0, vTexCoord1;
#ifdef USE_COLOR_0
in vec4 vColor0;
#endif

#ifdef USE_NORMAL
#ifdef USE_TANGENT
in mat3 vTBN;
#else
in vec3 vNormal;
#endif
#endif

out vec4 fragColor;

const float GAMMA = 2.2;
const float PI = 3.141592653589793;

#pragma glslify: linearTosRGB = require('./tonemap/linear2srgb.glsl',GAMMA=GAMMA)

#pragma glslify: import('./texture.glsl')
#pragma glslify: import('./brdf.glsl')
#pragma glslify: import('./material.glsl')
#pragma glslify: import('./light.glsl')

void main () {
  vec4 baseColor = getBaseColor();
#ifdef ALPHAMODE_OPAQUE
  baseColor.a = 1.;
#endif

#ifdef MATERIAL_UNLIT
  gl_FragColor = (vec4(linearTosRGB(baseColor.rgb), baseColor.a));
  return;
#endif

  vec3 v = normalize(cameraPosition.xyz - vPosition);
  NormalInfo normalInfo = getNormalInfo(vPosition);
  vec3 n = normalInfo.nn;

  vec3 reflection = -normalize(reflect(v, n));
  float nDotV = clamp(abs(dot(n, v)), 0.001, 1.);

  vec2 metallicRoughness = getMetallicRoughness();
  float metallic = metallicRoughness[0];
  float roughness = metallicRoughness[1];
  float alphaRoughness = roughness * roughness;
  float aSqr = alphaRoughness * alphaRoughness;

  vec3 f0 = vec3(0.04);
  vec3 diffuseColor = baseColor.rgb * (vec3(1.) - f0) * (1. - metallic);
  vec3 specularColor = mix(f0, baseColor.rgb, metallic);

  float r0 = max(max(specularColor.r, specularColor.g), specularColor.b);
  float r90 = clamp(r0 * 25., 0., 1.);
  vec3 specularEnvR0 = specularColor.rgb;
  vec3 specularEnvR90 = vec3(1., 1., 1.) * r90;

  vec3 diffuseFinal = vec3(0.);
  vec3 specularFinal = vec3(0.);

// TODO: support dynamic lights
#define NUM_LIGHTS 4

  mat4 lights[4];
  lights[0] = mat4(
    0., 0., 0., 0.,
    1., 1., 1., 1.,
    .5, -.707, -.5, 0.,
    0., 0., 0., 0.
  );
  lights[1] = mat4(
    0., 0., 0., 0.,
    1., 1., 1., .75,
    -.5, .707, .5, 0.,
    0., 0., 0., 0.
  );
  lights[2] = mat4(
    0., 0., 0., 0.,
    1., 1., 1., .75,
    .5, .707, -.5, 0.,
    0., 0., 0., 0.
  );
  lights[3] = mat4(
    0., 0., 0., 0.,
    1., 1., 1., .75,
    -.5, -.707, .5, 0.,
    0., 0., 0., 0.
  );

#ifdef NUM_LIGHTS
  for (int i = 0; i < NUM_LIGHTS; ++i) {
    vec3 pointToLight = getPointToLight(lights[i], vPosition);
    vec3 intensity = getLighIntensity(lights[i], pointToLight);
    vec3 l = normalize(pointToLight);
    vec3 h = normalize(l + v);
    float nDotL = clamp(dot(n, l), 0.001, 1.);
    float nDotH = clamp(dot(n, h), 0., 1.);
    float vDotH = clamp(dot(v, h), 0., 1.);
  
    vec3 F = specularF(specularEnvR0, specularEnvR90, vDotH);
    vec3 diffuse = (1. - F) * diffuseBRDF(diffuseColor);
    vec3 specular = max(vec3(0.), F * specularBRDF(aSqr, nDotL, nDotV, nDotH));

    diffuseFinal += intensity * nDotL * diffuse;
    specularFinal += intensity * nDotL * specular;
  }
#endif

  vec4 ambient = vec4(.1);

  vec3 ambientDiffuse = ambient.rgb * diffuseBRDF(diffuseColor);
  diffuseFinal += ambientDiffuse;

  vec3 colorFinal = diffuseFinal + specularFinal;

  float ao = getOcculsion();
  colorFinal = mix(colorFinal, colorFinal * ao, occlusionStrength);

  vec3 emissive = getEmissiveFactor();
  colorFinal += emissive;

#ifdef ALPHAMODE_MASK
  if (baseColor.a < alphaCutoff) {
    discard;
  }
  baseColor.a = 1.;
#endif

  fragColor = vec4(linearTosRGB(colorFinal), baseColor.a);
  // To debug, uncomment:
  // fragColor = vec4(vec3(metallic), 1.0);
  // fragColor = vec4(vec3(roughness), 1.0);
  // fragColor = vec4((n + 1.0) / 2.0, 1.0);
  // fragColor = baseColor;
  // fragColor = vec4(vec3(ao), 1.0);
  // fragColor = vec4(emissive, 1.0);
  // fragColor = vec4(linearTosRGB(specularFinal), 1.0);
  // fragColor = vec4(linearTosRGB(diffuseFinal), 1.0);
  // fragColor = vec4(vec3(F), 1.0);
  // fragColor = vec4(specularColor, 1.0);
}
