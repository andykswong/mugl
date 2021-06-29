export default `
const float MIN_ROUGHNESS = 0.04;

#if defined(USE_COLOR_VEC4) || defined(USE_COLOR_VEC3)
varying vec4 vColor0;
#endif

uniform vec4 baseColorFactor;
uniform TextureInfo baseColorTexture;

uniform float metallicFactor;
uniform float roughnessFactor;
uniform TextureInfo metallicRoughnessTexture;

uniform TextureInfo occlusionTexture;

uniform vec3 emissiveFactor;
uniform TextureInfo emissiveTexture;

vec4 getVertexColor() {
  vec4 color = vec4(1.0);
#if defined(USE_COLOR_VEC4) || defined(USE_COLOR_VEC3)
  color = vColor0;
#endif
  return color;
}

vec4 getBaseColor() {
  vec4 baseColor = vec4(1.0);

  baseColor *= baseColorFactor;
  baseColor *= sRGBToLinear(texture(baseColorTexture, vec4(1.0)));

  return baseColor * getVertexColor();
}

vec2 getMetallicRoughness() {
  vec4 mrTex = texture(metallicRoughnessTexture, vec4(1.0));
  return vec2(
    clamp(metallicFactor * mrTex.b, 0.0, 1.0),
    clamp(roughnessFactor * mrTex.g, MIN_ROUGHNESS, 1.0)
  );
}

float getOcculsion() {
  return texture(occlusionTexture, vec4(1.0)).r;
}

vec3 getEmissiveFactor() {
  return emissiveFactor * texture(emissiveTexture, vec4(0.0)).rgb;
}

`;
