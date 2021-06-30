export default `
const float GAMMA = 2.2;

vec3 linearTosRGB(vec3 color) {
  return pow(color, vec3(1./GAMMA));
}

vec3 sRGBToLinear(vec3 srgbIn) {
  return vec3(pow(srgbIn.xyz, vec3(GAMMA)));
}

vec4 sRGBToLinear(vec4 srgbIn) {
  return vec4(sRGBToLinear(srgbIn.xyz), srgbIn.w);
}
`;
