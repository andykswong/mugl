export const PBR_FRAGMENT_CODE = `#version 300 es
precision highp float;
layout(std140)uniform Model{mat4 A,B,C;vec4 D;};layout(std140)uniform Morph{vec4 E[2];};layout(std140)uniform Material{vec4 F;float G,H;float I,J;float K,L;float M,N;vec4 O;float P;};uniform sampler2D baseColorTexture;uniform sampler2D metallicRoughnessTexture;uniform sampler2D normalTexture;uniform sampler2D occlusionTexture;uniform sampler2D emissiveTexture;in vec3 vPosition;in vec2 vTexCoord0,vTexCoord1;
#ifdef USE_COLOR_0
in vec4 vColor0;
#endif
#ifdef USE_NORMAL
#ifdef USE_TANGENT
in mat3 vTBN;
#else
in vec3 vNormal;
#endif
#endif
out vec4 fragColor;const float Q=2.2;const float R=3.141592653589793;vec3 S(vec3 T){return pow(T,vec3(1./Q));}vec2 U(float V){return mix(vTexCoord0,vTexCoord1,step(1.,V));}vec4 W(sampler2D X,float V){return texture(X,U(V));}vec4 W(sampler2D X,float V,vec4 Y){return mix(Y,texture(X,U(V)),step(0.,V));}vec3 Z(vec3 a,vec3 b,float c){return a+(b-a)*pow(clamp(1.-c,0.,1.),5.);}float d(float e,float f){float g=(f*f)*(e-1.)+1.;return e/(R*g*g);}float h(float e,float i,float j){float k=1./(i+sqrt(e+(1.-e)*(i*i)));float l=1./(j+sqrt(e+(1.-e)*(j*j)));return k*l;}float m(float e,float i,float j,float f){return h(e,i,j)*d(e,f);}vec3 n(vec3 T){return T/R;}vec4 o(){vec4 T=vec4(1.);
#ifdef USE_COLOR_0
T=vColor0;
#endif
return T;}vec4 p(){vec4 q=vec4(1.);q*=F;q*=W(baseColorTexture,I,vec4(1.));return q*o();}vec2 r(){vec4 s=W(metallicRoughnessTexture,J,vec4(1.));return vec2(clamp(G*s.b,0.,1.),clamp(H*s.g,.04,1.));}float t(){return W(occlusionTexture,N,vec4(1.)).r;}vec3 u(){return O.xyz*W(emissiveTexture,O.w,vec4(1.)).xyz;}struct v{vec3 ng;vec3 nn;vec3 t;vec3 b;};v w(vec3 x){vec3 y,t,b,ng;
#ifdef USE_TANGENT
t=normalize(vTBN[0]);b=normalize(vTBN[1]);ng=normalize(vTBN[2]);
#else
#ifdef USE_NORMAL
ng=normalize(vNormal);
#else
ng=normalize(cross(dFdx(x),dFdy(x)));
#endif
vec2 z=U(L);vec3 AA=dFdx(vec3(z,0.));vec3 AB=dFdy(vec3(z,0.));vec3 AC=(AB.t*dFdx(x)-AA.t*dFdy(x))/(AA.s*AB.t-AB.s*AA.t);t=normalize(AC-ng*dot(ng,AC));b=cross(ng,t);
#endif
if(gl_FrontFacing==false){t*=-1.;b*=-1.;ng*=-1.;}y=ng;if(L>=0.){y=W(normalTexture,L).rgb*2.-vec3(1.);y*=vec3(K,K,1.);y=mat3(t,b,ng)*normalize(y);}v AD;AD.ng=ng;AD.t=t;AD.b=b;AD.nn=y;return AD;}
#define LIGHT_DIRECTIONAL  0
#define LIGHT_POINT  1
#define LIGHT_SPOT  2
int AE(mat4 AF){return int(AF[0].x);}vec2 AG(mat4 AF){return AF[0].zw;}vec4 AH(mat4 AF){return AF[1];}float AI(mat4 AF){return AF[2].w;}vec3 AJ(mat4 AF){return AF[2].xyz;}vec3 AK(mat4 AF){return AF[3].xyz;}float AL(float AM,float AN){if(AM<=0.){return 1./pow(AN,2.);}return max(min(1.-pow(AN/AM,4.),1.),0.)/pow(AN,2.);}float AO(vec3 AP,vec3 AQ,vec2 AR){float AS=dot(normalize(AQ),normalize(-AP));float AT=1./max(.001,AR[0]-AR[1]);float AU=-AR[1]*AT;float AV=clamp(AS*AT+AU,0.,1.);return AV*AV;}vec3 AW(mat4 AF,vec3 AX){return AE(AF)!=LIGHT_DIRECTIONAL?AK(AF)-AX:-AJ(AF);}vec3 AY(mat4 AF,vec3 AP){vec4 T=AH(AF);vec3 AZ=T.rgb*T.a;if(AE(AF)!=LIGHT_DIRECTIONAL){AZ*=AL(AI(AF),length(AP));}if(AE(AF)==LIGHT_SPOT){AZ*=AO(AP,AJ(AF),AG(AF));}return AZ;}void main(){vec4 q=p();
#ifdef ALPHAMODE_OPAQUE
q.a=1.;
#endif
#ifdef MATERIAL_UNLIT
gl_FragColor=(vec4(S(q.rgb),q.a));return;
#endif
vec3 x=normalize(D.xyz-vPosition);v Aa=w(vPosition);vec3 y=Aa.nn;vec3 Ab=-normalize(reflect(x,y));float j=clamp(abs(dot(y,x)),0.001,1.);vec2 Ac=r();float Ad=Ac[0];float Ae=Ac[1];float Af=Ae*Ae;float e=Af*Af;vec3 Ag=vec3(0.04);vec3 Ah=q.rgb*(vec3(1.)-Ag)*(1.-Ad);vec3 Ai=mix(Ag,q.rgb,Ad);float a=max(max(Ai.r,Ai.g),Ai.b);float b=clamp(a*25.,0.,1.);vec3 Aj=Ai.rgb;vec3 Ak=vec3(1.,1.,1.)*b;vec3 Al=vec3(0.);vec3 Am=vec3(0.);
#define NUM_LIGHTS  4
mat4 An[4];An[0]=mat4(0.,0.,0.,0.,1.,1.,1.,1.,.5,-.707,-.5,0.,0.,0.,0.,0.);An[1]=mat4(0.,0.,0.,0.,1.,1.,1.,.75,-.5,.707,.5,0.,0.,0.,0.,0.);An[2]=mat4(0.,0.,0.,0.,1.,1.,1.,.75,.5,.707,-.5,0.,0.,0.,0.,0.);An[3]=mat4(0.,0.,0.,0.,1.,1.,1.,.75,-.5,-.707,.5,0.,0.,0.,0.,0.);
#ifdef NUM_LIGHTS
for(int Ao=0;Ao<NUM_LIGHTS;++Ao){vec3 AP=AW(An[Ao],vPosition);vec3 AZ=AY(An[Ao],AP);vec3 Ap=normalize(AP);vec3 Aq=normalize(Ap+x);float i=clamp(dot(y,Ap),0.001,1.);float f=clamp(dot(y,Aq),0.,1.);float c=clamp(dot(x,Aq),0.,1.);vec3 Ar=Z(Aj,Ak,c);vec3 As=(1.-Ar)*n(Ah);vec3 At=max(vec3(0.),Ar*m(e,i,j,f));Al+=AZ*i*As;Am+=AZ*i*At;}
#endif
vec4 Au=vec4(.1);vec3 Av=Au.rgb*n(Ah);Al+=Av;vec3 Aw=Al+Am;float Ax=t();Aw=mix(Aw,Aw*Ax,M);vec3 Ay=u();Aw+=Ay;
#ifdef ALPHAMODE_MASK
if(q.a<P){discard;}q.a=1.;
#endif
fragColor=vec4(S(Aw),q.a);}`;
