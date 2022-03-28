mat4 getJointMatrix(int jointIndex) {
  return mat4(
    texelFetch(jointTexture, ivec2(0, jointIndex), 0),
    texelFetch(jointTexture, ivec2(1, jointIndex), 0),
    texelFetch(jointTexture, ivec2(2, jointIndex), 0),
    texelFetch(jointTexture, ivec2(3, jointIndex), 0)
  );
}

mat4 getSkinMatrix() {
  mat4 skin =
    WEIGHTS_0.x * getJointMatrix(int(JOINTS_0.x)) +
    WEIGHTS_0.y * getJointMatrix(int(JOINTS_0.y)) +
    WEIGHTS_0.z * getJointMatrix(int(JOINTS_0.z)) +
    WEIGHTS_0.w * getJointMatrix(int(JOINTS_0.w));

  return skin;
}

#pragma glslify: export(getSkinMatrix)
