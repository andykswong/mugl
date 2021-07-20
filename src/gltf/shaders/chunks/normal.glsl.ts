export default `
uniform TextureInfo normalTexture;

#ifdef USE_NORMAL
#ifdef USE_TANGENT
varying mat3 vTBN;
#else
varying vec3 vNormal;
#endif
#endif

struct NormalInfo {
  vec3 ng;
  vec3 n;
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
  vec2 UV = getTexCoord(normalTexture);
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
  if (normalTexture.texCoord >= 0.) {
    n = texture(normalTexture).rgb * 2. - vec3(1.);
    n *= vec3(normalTexture.scale, normalTexture.scale, 1.);
    n = mat3(t, b, ng) * normalize(n);
  }

  NormalInfo ni;
  ni.ng = ng;
  ni.t = t;
  ni.b = b;
  ni.n = n;
  return ni;
}
`;
