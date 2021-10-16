vec3 getTargetNormal() {
  vec3 v = vec3(0.);

#ifdef USE_NORMAL_0
  v += targetWeights[0] * NORMAL_0;
#endif
#ifdef USE_NORMAL_1
  v += targetWeights[1] * NORMAL_1;
#endif
#ifdef USE_NORMAL_2
  v += targetWeights[2] * NORMAL_2;
#endif
#ifdef USE_NORMAL_3
  v += targetWeights[3] * NORMAL_3;
#endif
#ifdef USE_NORMAL_4
  v += targetWeights[4] * NORMAL_4;
#endif
#ifdef USE_NORMAL_5
  v += targetWeights[5] * NORMAL_5;
#endif
#ifdef USE_NORMAL_6
  v += targetWeights[6] * NORMAL_6;
#endif
#ifdef USE_NORMAL_7
  v += targetWeights[7] * NORMAL_7;
#endif

  return v;
}

#pragma glslify: export(getTargetNormal)
