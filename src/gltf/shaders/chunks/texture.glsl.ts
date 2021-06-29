export default `
varying vec2 vTexCoord0;
varying vec2 vTexCoord1;

struct TextureInfo {
  sampler2D tex;
  float texCoord;
  float scale;
};

vec2 getTexCoord(TextureInfo tex) {
  return mix(vTexCoord0, vTexCoord1, step(1.0, tex.texCoord));
}

vec4 texture(TextureInfo tex) {
  return texture2D(tex.tex, getTexCoord(tex));
}

vec4 texture(TextureInfo tex, vec4 defaultValue) {
  return mix(defaultValue, texture2D(tex.tex, getTexCoord(tex)), step(0.0, tex.texCoord));
}
`;
