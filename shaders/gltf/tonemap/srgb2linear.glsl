vec3 sRGBToLinear(vec3 srgbIn) {
  return pow(srgbIn.xyz, vec3(GAMMA));
}

vec4 sRGBToLinear(vec4 srgbIn) {
  return vec4(sRGBToLinear(srgbIn.xyz), srgbIn.w);
}

#pragma glslify: export(sRGBToLinear)
