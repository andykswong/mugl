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
  vec2 UV = getTexCoord(normalTexture);
  vec3 uvDx = dFdx(vec3(UV, 0.0));
  vec3 uvDy = dFdy(vec3(UV, 0.0));

  vec3 t_ = (uvDy.t * dFdx(v) - uvDx.t * dFdy(v)) / (uvDx.s * uvDy.t - uvDy.s * uvDx.t);

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
  t = normalize(t_ - ng * dot(ng, t_));
  b = cross(ng, t);
#endif

  if (gl_FrontFacing == false) {
    t *= -1.0;
    b *= -1.0;
    ng *= -1.0;
  }

  n = ng;
  if (normalTexture.texCoord >= 0.0) {
    n = texture(normalTexture).rgb * 2.0 - vec3(1.0);
    n *= vec3(normalTexture.scale, normalTexture.scale, 1.0);
    n = mat3(t, b, ng) * normalize(n);
  }

  NormalInfo info;
  info.ng = ng;
  info.t = t;
  info.b = b;
  info.n = n;
  return info;
}
`;
