vec3 getTargetTangent() {
  vec3 v = vec3(0.);

#ifdef USE_TANGENT_0
  v += targetWeights[0].x * TANGENT_0;
#endif
#ifdef USE_TANGENT_1
  v += targetWeights[0].y * TANGENT_1;
#endif

  return v;
}

#pragma glslify: export(getTargetTangent)
