export default `
const float PI = 3.141592653589793;

vec3 specularF(vec3 r0, vec3 r90, float vDotH) {
  return r0 + (r90 - r0) * pow(clamp(1.0 - vDotH, 0.0, 1.0), 5.0);
}

float specularD(float aSqr, float nDotH) {
  float f = (nDotH * nDotH) * (aSqr - 1.0) + 1.0;
  return aSqr / (PI * f * f);
}

float specularV(float aSqr, float nDotL, float nDotV) {
  float gl = 1.0 / (nDotL + sqrt(aSqr + (1.0 - aSqr) * (nDotL * nDotL)));
  float gv = 1.0 / (nDotV + sqrt(aSqr + (1.0 - aSqr) * (nDotV * nDotV)));
  return gl * gv;
}

float specularBRDF(float aSqr, float nDotL, float nDotV, float nDotH) {
  return specularV(aSqr, nDotL, nDotV) * specularD(aSqr, nDotH);
}

vec3 diffuseBRDF(vec3 color) {
  return color / PI;
}
`;
