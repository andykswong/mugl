export const PRIMITIVE_VERTEX_CODE = `#version 300 es
precision highp float;
layout(std140)uniform Model{mat4 A,B,C;vec4 D;};layout(std140)uniform Morph{vec4 E[2];};uniform sampler2D jointTexture;layout(location=0)in vec3 F;out vec3 vPosition;out vec2 vTexCoord0,vTexCoord1;
#ifdef USE_NORMAL
layout(location=1)in vec3 G;
#ifdef USE_TANGENT
layout(location=2)in vec4 H;out mat3 vTBN;
#else
out vec3 vNormal;
#endif
#endif 
#ifdef USE_TEXCOORD_0
layout(location=3)in vec2 I;
#endif
#ifdef USE_TEXCOORD_1
layout(location=4)in vec2 J;
#endif
#ifdef USE_COLOR_0
out vec4 vColor0;
#if defined(COLOR_0_VEC3)
layout(location=5)in vec3 K;
#else
layout(location=5)in vec4 K;
#endif
#endif 
#if defined(USE_WEIGHTS_0) && defined(USE_JOINTS_0)
#define USE_SKIN 
layout(location=6)in vec4 L;layout(location=7)in vec4 M;mat4 N(int O){return mat4(texelFetch(jointTexture,ivec2(0,O),0),texelFetch(jointTexture,ivec2(1,O),0),texelFetch(jointTexture,ivec2(2,O),0),texelFetch(jointTexture,ivec2(3,O),0));}mat4 P(){mat4 Q=M.x*N(int(L.x))+M.y*N(int(L.y))+M.z*N(int(L.z))+M.w*N(int(L.w));return Q;}
#endif 
#if defined(USE_POSITION_0)
#define USE_MORPH 
#ifdef USE_POSITION_0
layout(location=8)in vec3 R;
#endif
#ifdef USE_POSITION_1
layout(location=9)in vec3 S;
#endif
#if !defined(USE_TANGENT_0)
#ifdef USE_POSITION_2
layout(location=10)in vec3 T;
#endif
#ifdef USE_POSITION_3
layout(location=11)in vec3 U;
#endif
#if !defined(USE_NORMAL_0)
#ifdef USE_POSITION_4
layout(location=12)in vec3 V;
#endif
#ifdef USE_POSITION_5
layout(location=13)in vec3 W;
#endif
#ifdef USE_POSITION_6
layout(location=14)in vec3 X;
#endif
#ifdef USE_POSITION_7
layout(location=15)in vec3 Y;
#endif
#endif 
#endif 
#ifdef USE_NORMAL_0
layout(location=12)in vec3 Z;
#endif
#ifdef USE_NORMAL_1
layout(location=13)in vec3 a;
#endif
#if !defined(USE_TANGENT_0)
#ifdef USE_NORMAL_2
layout(location=14)in vec3 b;
#endif
#ifdef USE_NORMAL_3
layout(location=15)in vec3 c;
#endif
#endif 
#ifdef USE_TANGENT_0
layout(location=14)in vec3 d;
#endif
#ifdef USE_TANGENT_1
layout(location=15)in vec3 e;
#endif
vec3 f(){vec3 g=vec3(0.);
#ifdef USE_POSITION_0
g+=E[0].x*R;
#endif
#ifdef USE_POSITION_1
g+=E[0].y*S;
#endif
#ifdef USE_POSITION_2
g+=E[0].z*T;
#endif
#ifdef USE_POSITION_3
g+=E[0].w*U;
#endif
#ifdef USE_POSITION_4
g+=E[1].x*V;
#endif
#ifdef USE_POSITION_5
g+=E[1].y*W;
#endif
#ifdef USE_POSITION_6
g+=E[1].z*X;
#endif
#ifdef USE_POSITION_7
g+=E[1].w*Y;
#endif
return g;}vec3 h(){vec3 g=vec3(0.);
#ifdef USE_NORMAL_0
g+=E[0].x*Z;
#endif
#ifdef USE_NORMAL_1
g+=E[0].y*a;
#endif
#ifdef USE_NORMAL_2
g+=E[0].z*b;
#endif
#ifdef USE_NORMAL_3
g+=E[0].w*c;
#endif
return g;}vec3 i(){vec3 g=vec3(0.);
#ifdef USE_TANGENT_0
g+=E[0].x*d;
#endif
#ifdef USE_TANGENT_1
g+=E[0].y*e;
#endif
return g;}
#endif 
vec4 j(){vec4 k=vec4(F,1.);
#ifdef USE_MORPH
k+=vec4(f(),0.);
#endif
#ifdef USE_SKIN
k=P()*k;
#endif
return k;}
#ifdef USE_NORMAL
vec3 l(){vec3 m=G;
#ifdef USE_MORPH
m+=h();
#endif
#ifdef USE_SKIN
m=mat3(P())*m;
#endif
return normalize(m);}
#ifdef USE_TANGENT
vec3 n(){vec3 tan=H.xyz;
#ifdef USE_MORPH
tan+=i();
#endif
#ifdef USE_SKIN
tan=mat3(P())*tan;
#endif
return normalize(tan);}
#endif 
#endif 
void main(){vec4 k=A*j();vPosition=k.xyz/k.w;
#ifdef USE_NORMAL
mat3 o=mat3(B);
#ifdef USE_TANGENT
vec3 tan=n();vec3 p=normalize(o*l());vec3 q=normalize(o*tan);vec3 r=cross(p,q)*H.w;vTBN=mat3(q,r,p);
#else
vNormal=normalize(o*G);
#endif 
#endif 
#ifdef USE_COLOR_0
#if defined(COLOR_0_VEC3)
vColor0=vec4(K,1.);
#else
vColor0=K;
#endif
#endif 
vTexCoord0=vec2(0.);vTexCoord1=vec2(0.);
#ifdef USE_TEXCOORD_0
vTexCoord0=I;
#endif
#ifdef USE_TEXCOORD_1
vTexCoord1=J;
#endif
gl_Position=C*k;gl_PointSize=1.;}`;
