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
  baseColor *= sampleTexture(baseColorTexture, baseColorTexCoord, vec4(1.));

  return baseColor * getVertexColor();
}

vec2 getMetallicRoughness() {
  vec4 mrTex = sampleTexture(metallicRoughnessTexture, metallicRoughnessTexCoord, vec4(1.));
  return vec2(
    clamp(metallicFactor * mrTex.b, 0., 1.),
    clamp(roughnessFactor * mrTex.g, .04 /* min roughness */, 1.)
  );
}

float getOcculsion() {
  return sampleTexture(occlusionTexture, occlusionTexCoord, vec4(1.)).r;
}

vec3 getEmissiveFactor() {
  return emissiveFactorTexCoord.xyz * sampleTexture(emissiveTexture, emissiveFactorTexCoord.w, vec4(1.)).xyz;
}

struct NormalInfo {
  vec3 ng;
  vec3 nn;
  vec3 t;
  vec3 b;
};

NormalInfo getNormalInfo(vec3 v) {
  vec3 n, t, b, ng;

#ifdef USE_TANGENT
  t = normalize(vTBN[0]);
  b = normalize(vTBN[1]);
  ng = normalize(vTBN[2]);
#else
#ifdef USE_NORMAL
  ng = normalize(vNormal);
#else
  ng = normalize(cross(dFdx(v), dFdy(v)));
#endif
  vec2 UV = getTexCoord(normalTexCoord);
  vec3 uvDx = dFdx(vec3(UV, 0.));
  vec3 uvDy = dFdy(vec3(UV, 0.));
  vec3 t_ = (uvDy.t * dFdx(v) - uvDx.t * dFdy(v)) / (uvDx.s * uvDy.t - uvDy.s * uvDx.t);

  t = normalize(t_ - ng * dot(ng, t_));
  b = cross(ng, t);
#endif

  if (gl_FrontFacing == false) {
    t *= -1.;
    b *= -1.;
    ng *= -1.;
  }

  n = ng;
  if (normalTexCoord >= 0.) {
    n = sampleTexture(normalTexture, normalTexCoord).rgb * 2. - vec3(1.);
    n *= vec3(normalScale, normalScale, 1.);
    n = mat3(t, b, ng) * normalize(n);
  }

  NormalInfo ni;
  ni.ng = ng;
  ni.t = t;
  ni.b = b;
  ni.nn = n;
  return ni;
}
