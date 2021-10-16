export const PRIMITIVE_VS_SRC = `precision highp float;uniform mat4 model,viewProj;uniform mat3 normalMatrix;
#ifdef USE_COLOR_0
#if defined(COLOR_0_VEC3)
attribute vec3 COLOR_0;
#else
attribute vec4 COLOR_0;
#endif
varying vec4 vColor0;
#endif
#ifdef USE_TEXCOORD_0
attribute vec2 TEXCOORD_0;
#endif
#ifdef USE_TEXCOORD_1
attribute vec2 TEXCOORD_1;
#endif
varying vec2 vTexCoord0,vTexCoord1;attribute vec3 POSITION;varying vec3 vPosition;
#if defined(NUM_JOINTS) && defined(USE_WEIGHTS_0) && defined(USE_JOINTS_0)
#define USE_SKIN
attribute vec4 JOINTS_0,WEIGHTS_0;uniform mat4 jointMatrix[NUM_JOINTS];mat4 a(){mat4 b=WEIGHTS_0.x*jointMatrix[int(JOINTS_0.x)]+WEIGHTS_0.y*jointMatrix[int(JOINTS_0.y)]+WEIGHTS_0.z*jointMatrix[int(JOINTS_0.z)]+WEIGHTS_0.w*jointMatrix[int(JOINTS_0.w)];return b;}
#endif
#if defined(NUM_MORPHS) && defined(USE_POSITION_0) || defined(USE_NORMAL_0) || defined(USE_TANGENT_0)
#define USE_MORPH
uniform float targetWeights[NUM_MORPHS];
#ifdef USE_POSITION_0
attribute vec3 POSITION_0;
#endif
#ifdef USE_POSITION_1
attribute vec3 POSITION_1;
#endif
#ifdef USE_POSITION_2
attribute vec3 POSITION_2;
#endif
#ifdef USE_POSITION_3
attribute vec3 POSITION_3;
#endif
#ifdef USE_POSITION_4
attribute vec3 POSITION_4;
#endif
#ifdef USE_POSITION_5
attribute vec3 POSITION_5;
#endif
#ifdef USE_POSITION_6
attribute vec3 POSITION_6;
#endif
#ifdef USE_POSITION_7
attribute vec3 POSITION_7;
#endif
#ifdef USE_NORMAL_0
attribute vec3 NORMAL_0;
#endif
#ifdef USE_NORMAL_1
attribute vec3 NORMAL_1;
#endif
#ifdef USE_NORMAL_2
attribute vec3 NORMAL_2;
#endif
#ifdef USE_NORMAL_3
attribute vec3 NORMAL_3;
#endif
#ifdef USE_NORMAL_4
attribute vec3 NORMAL_4;
#endif
#ifdef USE_NORMAL_5
attribute vec3 NORMAL_5;
#endif
#ifdef USE_NORMAL_6
attribute vec3 NORMAL_6;
#endif
#ifdef USE_NORMAL_7
attribute vec3 NORMAL_7;
#endif
#ifdef USE_TANGENT_0
attribute vec3 TANGENT_0;
#endif
#ifdef USE_TANGENT_1
attribute vec3 TANGENT_1;
#endif
#ifdef USE_TANGENT_2
attribute vec3 TANGENT_2;
#endif
#ifdef USE_TANGENT_3
attribute vec3 TANGENT_3;
#endif
#ifdef USE_TANGENT_4
attribute vec3 TANGENT_4;
#endif
#ifdef USE_TANGENT_5
attribute vec3 TANGENT_5;
#endif
#ifdef USE_TANGENT_6
attribute vec3 TANGENT_6;
#endif
#ifdef USE_TANGENT_7
attribute vec3 TANGENT_7;
#endif
vec3 c(){vec3 d=vec3(0.);
#ifdef USE_POSITION_0
d+=targetWeights[0]*POSITION_0;
#endif
#ifdef USE_POSITION_1
d+=targetWeights[1]*POSITION_1;
#endif
#ifdef USE_POSITION_2
d+=targetWeights[2]*POSITION_2;
#endif
#ifdef USE_POSITION_3
d+=targetWeights[3]*POSITION_3;
#endif
#ifdef USE_POSITION_4
d+=targetWeights[4]*POSITION_4;
#endif
#ifdef USE_POSITION_5
d+=targetWeights[5]*POSITION_5;
#endif
#ifdef USE_POSITION_6
d+=targetWeights[6]*POSITION_6;
#endif
#ifdef USE_POSITION_7
d+=targetWeights[7]*POSITION_7;
#endif
return d;}vec3 e(){vec3 d=vec3(0.);
#ifdef USE_NORMAL_0
d+=targetWeights[0]*NORMAL_0;
#endif
#ifdef USE_NORMAL_1
d+=targetWeights[1]*NORMAL_1;
#endif
#ifdef USE_NORMAL_2
d+=targetWeights[2]*NORMAL_2;
#endif
#ifdef USE_NORMAL_3
d+=targetWeights[3]*NORMAL_3;
#endif
#ifdef USE_NORMAL_4
d+=targetWeights[4]*NORMAL_4;
#endif
#ifdef USE_NORMAL_5
d+=targetWeights[5]*NORMAL_5;
#endif
#ifdef USE_NORMAL_6
d+=targetWeights[6]*NORMAL_6;
#endif
#ifdef USE_NORMAL_7
d+=targetWeights[7]*NORMAL_7;
#endif
return d;}vec3 f(){vec3 d=vec3(0.);
#ifdef USE_TANGENT_0
d+=targetWeights[0]*TANGENT_0;
#endif
#ifdef USE_TANGENT_1
d+=targetWeights[1]*TANGENT_1;
#endif
#ifdef USE_TANGENT_2
d+=targetWeights[2]*TANGENT_2;
#endif
#ifdef USE_TANGENT_3
d+=targetWeights[3]*TANGENT_3;
#endif
#ifdef USE_TANGENT_4
d+=targetWeights[4]*TANGENT_4;
#endif
#ifdef USE_TANGENT_5
d+=targetWeights[5]*TANGENT_5;
#endif
#ifdef USE_TANGENT_6
d+=targetWeights[6]*TANGENT_6;
#endif
#ifdef USE_TANGENT_7
d+=targetWeights[7]*TANGENT_7;
#endif
return d;}
#endif
vec4 g(){vec4 h=vec4(POSITION,1.);
#ifdef USE_MORPH
h+=vec4(c(),0.);
#endif
#ifdef USE_SKIN
h=a()*h;
#endif
return h;}
#ifdef USE_NORMAL
attribute vec3 NORMAL;
#ifdef USE_TANGENT
attribute vec4 TANGENT;varying mat3 vTBN;vec3 i(){vec3 j=TANGENT.xyz;
#ifdef USE_MORPH
tan+=f();
#endif
#ifdef USE_SKIN
tan=mat3(a())*tan;
#endif
return normalize(tan);}
#else
varying vec3 vNormal;
#endif
vec3 k(){vec3 l=NORMAL;
#ifdef USE_MORPH
l+=e();
#endif
#ifdef USE_SKIN
l=mat3(a())*l;
#endif
return normalize(l);}
#endif
void main(void){vec4 h=model*g();vPosition=h.xyz/h.w;
#ifdef USE_NORMAL
#ifdef USE_TANGENT
vec3 j=i();vec3 m=normalize(normalMatrix*k());vec3 n=normalize(normalMatrix*tan);vec3 o=cross(m,n)*TANGENT.w;vTBN=mat3(n,o,m);
#else
vNormal=normalize(normalMatrix*NORMAL);
#endif
#endif
#ifdef USE_COLOR_0
#if defined(COLOR_0_VEC3)
vColor0=vec4(COLOR_0,1.);
#else
vColor0=COLOR_0;
#endif
#endif
vTexCoord0=vec2(0.);vTexCoord1=vec2(0.);
#ifdef USE_TEXCOORD_0
vTexCoord0=TEXCOORD_0;
#endif
#ifdef USE_TEXCOORD_1
vTexCoord1=TEXCOORD_1;
#endif
gl_Position=viewProj*h;gl_PointSize=1.;}`;
