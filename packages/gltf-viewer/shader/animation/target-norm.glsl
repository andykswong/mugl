vec3 getTargetNormal() {
  vec3 v = vec3(0.);

#ifdef USE_NORMAL_0
  v += targetWeights[0].x * NORMAL_0;
#endif
#ifdef USE_NORMAL_1
  v += targetWeights[0].y * NORMAL_1;
#endif
#ifdef USE_NORMAL_2
  v += targetWeights[0].z * NORMAL_2;
#endif
#ifdef USE_NORMAL_3
  v += targetWeights[0].w * NORMAL_3;
#endif

  return v;
}

#pragma glslify: export(getTargetNormal)
