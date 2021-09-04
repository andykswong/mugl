declare const _default: "\nconst float GAMMA = 2.2;\n\nvec3 linearTosRGB(vec3 color) {\n  return pow(color, vec3(1./GAMMA));\n}\n\nvec3 sRGBToLinear(vec3 srgbIn) {\n  return vec3(pow(srgbIn.xyz, vec3(GAMMA)));\n}\n\nvec4 sRGBToLinear(vec4 srgbIn) {\n  return vec4(sRGBToLinear(srgbIn.xyz), srgbIn.w);\n}\n";
export default _default;
//# sourceMappingURL=tonemap.glsl.d.ts.map