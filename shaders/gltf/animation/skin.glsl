mat4 getSkinMatrix() {
  mat4 skin =
    WEIGHTS_0.x * jointMatrix[int(JOINTS_0.x)] +
    WEIGHTS_0.y * jointMatrix[int(JOINTS_0.y)] +
    WEIGHTS_0.z * jointMatrix[int(JOINTS_0.z)] +
    WEIGHTS_0.w * jointMatrix[int(JOINTS_0.w)];

  return skin;
}

#pragma glslify: export(getSkinMatrix)
