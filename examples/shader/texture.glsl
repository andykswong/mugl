vec2 getTexCoord(float texCoord) {
  return mix(vTexCoord0, vTexCoord1, step(1., texCoord));
}

vec4 sampleTexture(sampler2D tex, float texCoord) {
  return texture(tex, getTexCoord(texCoord));
}

vec4 sampleTexture(sampler2D tex, float texCoord, vec4 defaultValue) {
  return mix(defaultValue, texture(tex, getTexCoord(texCoord)), step(0., texCoord));
}
