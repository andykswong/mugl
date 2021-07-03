import brdfGlsl from './chunks/brdf.glsl';
import lightGlsl from './chunks/light.glsl';
import materialGlsl from './chunks/material.glsl';
import normalGlsl from './chunks/normal.glsl';
import textureGlsl from './chunks/texture.glsl';
import tonemapGlsl from './chunks/tonemap.glsl';

export default `
#ifdef GL_OES_standard_derivatives
  #extension GL_OES_standard_derivatives : enable
#endif

precision highp float;

uniform float alphaCutoff;
uniform vec3 cameraPosition;

varying vec3 vPosition;

${tonemapGlsl}
${brdfGlsl}
${textureGlsl}
${normalGlsl}
${materialGlsl}
${lightGlsl}

void main () {
  vec4 baseColor = getBaseColor();
#ifdef ALPHAMODE_OPAQUE
  baseColor.a = 1.0;
#endif

#ifdef MATERIAL_UNLIT
  gl_FragColor = (vec4(linearTosRGB(baseColor.rgb), baseColor.a));
  return;
#endif

  vec3 v = normalize(cameraPosition - vPosition);
  NormalInfo normalInfo = getNormalInfo(vPosition);
  vec3 n = normalInfo.n;

  vec3 reflection = -normalize(reflect(v, n));
  float nDotV = clamp(abs(dot(n, v)), 0.001, 1.0);

  vec2 metallicRoughness = getMetallicRoughness();
  float metallic = metallicRoughness[0];
  float roughness = metallicRoughness[1];
  float alphaRoughness = roughness * roughness;
  float aSqr = alphaRoughness * alphaRoughness;

  vec3 f0 = vec3(0.04);
  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);
  vec3 specularColor = mix(f0, baseColor.rgb, metallic);

  float r0 = max(max(specularColor.r, specularColor.g), specularColor.b);
  float r90 = clamp(r0 * 25.0, 0.0, 1.0);
  vec3 specularEnvR0 = specularColor.rgb;
  vec3 specularEnvR90 = vec3(1.0, 1.0, 1.0) * r90;

  vec3 diffuseFinal = vec3(0.0);
  vec3 specularFinal = vec3(0.0);

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
    1., 1., 1., .5,
    -.5, .707, .5, 0.,
    0., 0., 0., 0.
  );
  lights[2] = mat4(
    0., 0., 0., 0.,
    1., 1., 1., .25,
    .5, .707, -.5, 0.,
    0., 0., 0., 0.
  );
  lights[3] = mat4(
    0., 0., 0., 0.,
    1., 1., 1., .25,
    -.5, -.707, .5, 0.,
    0., 0., 0., 0.
  );

#ifdef NUM_LIGHTS
  for (int i = 0; i < NUM_LIGHTS; ++i) {
    vec3 pointToLight = getPointToLight(lights[i], vPosition);
    vec3 intensity = getLighIntensity(lights[i], pointToLight);
    vec3 l = normalize(pointToLight);
    vec3 h = normalize(l + v);
    float nDotL = clamp(dot(n, l), 0.001, 1.0);
    float nDotH = clamp(dot(n, h), 0.0, 1.0);
    float vDotH = clamp(dot(v, h), 0.0, 1.0);
  
    vec3 F = specularF(specularEnvR0, specularEnvR90, vDotH);
    vec3 diffuse = (1.0 - F) * diffuseBRDF(diffuseColor);
    vec3 specular = max(vec3(0.0), F * specularBRDF(aSqr, nDotL, nDotV, nDotH));

    diffuseFinal += intensity * nDotL * diffuse;
    specularFinal += intensity * nDotL * specular;
  }
#endif

  vec4 ambient = vec4(0.1);

  vec3 ambientDiffuse = ambient.rgb * diffuseBRDF(diffuseColor);
  diffuseFinal += ambientDiffuse;

  vec3 colorFinal = diffuseFinal + specularFinal;

  float ao = getOcculsion();
  colorFinal = mix(colorFinal, colorFinal * ao, occlusionTexture.scale);

  vec3 emissive = getEmissiveFactor();
  colorFinal += emissive;

#ifdef ALPHAMODE_MASK
  if (baseColor.a < alphaCutoff) {
    discard;
  }
  baseColor.a = 1.0;
#else
  alphaCutoff;
#endif

  gl_FragColor = vec4(linearTosRGB(colorFinal), baseColor.a);
}
`;

// To debug, append:
// gl_FragColor = vec4(vec3(metallic), 1.0);
// gl_FragColor = vec4(vec3(roughness), 1.0);
// gl_FragColor = vec4((n + 1.0) / 2.0, 1.0);
// gl_FragColor = baseColor;
// gl_FragColor = vec4(vec3(ao), 1.0);
// gl_FragColor = vec4(emissive, 1.0);
// gl_FragColor = vec4(linearTosRGB(specularFinal), 1.0);
// gl_FragColor = vec4(linearTosRGB(diffuseFinal), 1.0);
// gl_FragColor = vec4(vec3(F), 1.0);
// gl_FragColor = vec4(specularColor, 1.0);