vec3 linearTosRGB(vec3 color) {
  return pow(color, vec3(1./GAMMA));
}

#pragma glslify: export(linearTosRGB)
