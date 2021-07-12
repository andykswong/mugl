export default `
const float MIN_ROUGHNESS = .04;

#ifdef USE_COLOR_0
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
  vec4 color = vec4(1.);
#ifdef USE_COLOR_0
  color = vColor0;
#endif
  return color;
}

vec4 getBaseColor() {
  vec4 baseColor = vec4(1.);

  baseColor *= baseColorFactor;
  baseColor *= sRGBToLinear(texture(baseColorTexture, vec4(1.)));

  return baseColor * getVertexColor();
}

vec2 getMetallicRoughness() {
  vec4 mrTex = texture(metallicRoughnessTexture, vec4(1.));
  return vec2(
    clamp(metallicFactor * mrTex.b, 0., 1.),
    clamp(roughnessFactor * mrTex.g, MIN_ROUGHNESS, 1.)
  );
}

float getOcculsion() {
  return texture(occlusionTexture, vec4(1.)).r;
}

vec3 getEmissiveFactor() {
  return emissiveFactor * sRGBToLinear(texture(emissiveTexture, vec4(0)).rgb);
}

`;
