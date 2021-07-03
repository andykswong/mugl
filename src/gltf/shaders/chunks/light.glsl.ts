/*
Light matrix uniform is a mat4. Layout:
struct Light {
 float type;
 vec2 innerOuterConeCos;
 float padding;
 vec4 colorIntensity;
 vec3 direction;
 float range;
 vec3 position;
 float padding;
};
*/

export default `
#define LIGHT_DIRECTIONAL 0
#define LIGHT_POINT 1
#define LIGHT_SPOT 2

int getLightType(mat4 light) {
  return int(light[0].x);
}

vec2 getLightConeCos(mat4 light) {
  return light[0].yz;
}

vec4 getLightColor(mat4 light) {
  return light[1];
}

float getLightRange(mat4 light) {
  return light[2].w;
}

vec3 getLightDirection(mat4 light) {
  return light[2].xyz;
}

vec3 getLightPosition(mat4 light) {
  return light[3].xyz;
}

float getRangeAttenuation(float range, float distance) {
  if (range <= 0.) {
    return 1. / pow(distance, 2.);
  }
  return max(min(1.0 - pow(distance / range, 4.), 1.), 0.) / pow(distance, 2.);
}

float getSpotAttenuation(vec3 pointToLight, vec3 direction, vec2 coneCos) {
  float actualCos = dot(normalize(direction), normalize(-pointToLight));
  float scale = 1. / max(.001, coneCos[0] - coneCos[1]);
  float offset = -coneCos[1] * scale;
  float att = clamp(actualCos * scale + offset, 0., 1.);
  return att * att;
}

vec3 getPointToLight(mat4 light, vec3 position) {
  return getLightType(light) != LIGHT_DIRECTIONAL ? getLightPosition(light) - position : -getLightDirection(light);
}

vec3 getLighIntensity(mat4 light, vec3 pointToLight) {
  vec4 color = getLightColor(light);
  vec3 intensity = color.rgb * color.a;

  if (getLightType(light) != LIGHT_DIRECTIONAL) {
    intensity *= getRangeAttenuation(getLightRange(light), length(pointToLight));
  }
  if (getLightType(light) == LIGHT_SPOT) {
    intensity *= getSpotAttenuation(pointToLight, getLightDirection(light), getLightConeCos(light));
  }

  return intensity;
}
`;
