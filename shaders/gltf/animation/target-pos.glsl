vec3 getTargetPosition() {
  vec3 v = vec3(0.);

#ifdef USE_POSITION_0
  v += targetWeights[0] * POSITION_0;
#endif
#ifdef USE_POSITION_1
  v += targetWeights[1] * POSITION_1;
#endif
#ifdef USE_POSITION_2
  v += targetWeights[2] * POSITION_2;
#endif
#ifdef USE_POSITION_3
  v += targetWeights[3] * POSITION_3;
#endif
#ifdef USE_POSITION_4
  v += targetWeights[4] * POSITION_4;
#endif
#ifdef USE_POSITION_5
  v += targetWeights[5] * POSITION_5;
#endif
#ifdef USE_POSITION_6
  v += targetWeights[6] * POSITION_6;
#endif
#ifdef USE_POSITION_7
  v += targetWeights[7] * POSITION_7;
#endif

  return v;
}

#pragma glslify: export(getTargetPosition)
