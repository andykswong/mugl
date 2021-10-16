vec3 getTargetTangent() {
  vec3 v = vec3(0.);

#ifdef USE_TANGENT_0
  v += targetWeights[0] * TANGENT_0;
#endif
#ifdef USE_TANGENT_1
  v += targetWeights[1] * TANGENT_1;
#endif
#ifdef USE_TANGENT_2
  v += targetWeights[2] * TANGENT_2;
#endif
#ifdef USE_TANGENT_3
  v += targetWeights[3] * TANGENT_3;
#endif
#ifdef USE_TANGENT_4
  v += targetWeights[4] * TANGENT_4;
#endif
#ifdef USE_TANGENT_5
  v += targetWeights[5] * TANGENT_5;
#endif
#ifdef USE_TANGENT_6
  v += targetWeights[6] * TANGENT_6;
#endif
#ifdef USE_TANGENT_7
  v += targetWeights[7] * TANGENT_7;
#endif

  return v;
}

#pragma glslify: export(getTargetTangent)
