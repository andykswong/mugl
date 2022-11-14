vec3 getTargetPosition() {
  vec3 v = vec3(0.);

#ifdef USE_POSITION_0
  v += targetWeights[0].x * POSITION_0;
#endif
#ifdef USE_POSITION_1
  v += targetWeights[0].y * POSITION_1;
#endif
#ifdef USE_POSITION_2
  v += targetWeights[0].z * POSITION_2;
#endif
#ifdef USE_POSITION_3
  v += targetWeights[0].w * POSITION_3;
#endif
#ifdef USE_POSITION_4
  v += targetWeights[1].x * POSITION_4;
#endif
#ifdef USE_POSITION_5
  v += targetWeights[1].y * POSITION_5;
#endif
#ifdef USE_POSITION_6
  v += targetWeights[1].z * POSITION_6;
#endif
#ifdef USE_POSITION_7
  v += targetWeights[1].w * POSITION_7;
#endif

  return v;
}

#pragma glslify: export(getTargetPosition)
