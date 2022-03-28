export const PBR_FRAGMENT_CODE = `#version 300 es
precision highp float;
layout(std140)uniform Model{mat4 A,B,C;vec4 D;};layout(std140)uniform Material{vec4 E;float F,G;float H,I;float J,K;float L,M;vec4 N;float O;};uniform sampler2D baseColorTexture;uniform sampler2D metallicRoughnessTexture;uniform sampler2D normalTexture;uniform sampler2D occlusionTexture;uniform sampler2D emissiveTexture;in vec3 vPosition;in vec2 vTexCoord0,vTexCoord1;
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
out vec4 fragColor;const float P=2.2;const float Q=3.141592653589793;vec3 R(vec3 S){return pow(S,vec3(1./P));}vec2 T(float U){return mix(vTexCoord0,vTexCoord1,step(1.,U));}vec4 V(sampler2D W,float U){return texture(W,T(U));}vec4 V(sampler2D W,float U,vec4 X){return mix(X,texture(W,T(U)),step(0.,U));}vec3 Y(vec3 Z,vec3 a,float b){return Z+(a-Z)*pow(clamp(1.-b,0.,1.),5.);}float c(float d,float e){float f=(e*e)*(d-1.)+1.;return d/(Q*f*f);}float g(float d,float h,float i){float j=1./(h+sqrt(d+(1.-d)*(h*h)));float k=1./(i+sqrt(d+(1.-d)*(i*i)));return j*k;}float l(float d,float h,float i,float e){return g(d,h,i)*c(d,e);}vec3 m(vec3 S){return S/Q;}vec4 n(){vec4 S=vec4(1.);
#ifdef USE_COLOR_0
S=vColor0;
#endif
return S;}vec4 o(){vec4 p=vec4(1.);p*=E;p*=V(baseColorTexture,H,vec4(1.));return p*n();}vec2 q(){vec4 r=V(metallicRoughnessTexture,I,vec4(1.));return vec2(clamp(F*r.b,0.,1.),clamp(G*r.g,.04,1.));}float s(){return V(occlusionTexture,M,vec4(1.)).r;}vec3 t(){return N.xyz*V(emissiveTexture,N.w,vec4(1.)).xyz;}struct u{vec3 ng;vec3 n;vec3 t;vec3 b;};u v(vec3 w){vec3 n,t,b,ng;
#ifdef USE_TANGENT
t=normalize(vTBN[0]);b=normalize(vTBN[1]);ng=normalize(vTBN[2]);
#else
#ifdef USE_NORMAL
ng=normalize(vNormal);
#else
ng=normalize(cross(dFdx(w),dFdy(w)));
#endif
vec2 x=T(K);vec3 y=dFdx(vec3(x,0.));vec3 z=dFdy(vec3(x,0.));vec3 AA=(z.t*dFdx(w)-y.t*dFdy(w))/(y.s*z.t-z.s*y.t);t=normalize(AA-ng*dot(ng,AA));b=cross(ng,t);
#endif
if(gl_FrontFacing==false){t*=-1.;b*=-1.;ng*=-1.;}n=ng;if(K>=0.){n=V(normalTexture,K).rgb*2.-vec3(1.);n*=vec3(J,J,1.);n=mat3(t,b,ng)*normalize(n);}u AB;AB.ng=ng;AB.t=t;AB.b=b;AB.n=n;return AB;}
#define LIGHT_DIRECTIONAL  0
#define LIGHT_POINT  1
#define LIGHT_SPOT  2
int AC(mat4 AD){return int(AD[0].x);}vec2 AE(mat4 AD){return AD[0].zw;}vec4 AF(mat4 AD){return AD[1];}float AG(mat4 AD){return AD[2].w;}vec3 AH(mat4 AD){return AD[2].xyz;}vec3 AI(mat4 AD){return AD[3].xyz;}float AJ(float AK,float AL){if(AK<=0.){return 1./pow(AL,2.);}return max(min(1.-pow(AL/AK,4.),1.),0.)/pow(AL,2.);}float AM(vec3 AN,vec3 AO,vec2 AP){float AQ=dot(normalize(AO),normalize(-AN));float AR=1./max(.001,AP[0]-AP[1]);float AS=-AP[1]*AR;float AT=clamp(AQ*AR+AS,0.,1.);return AT*AT;}vec3 AU(mat4 AD,vec3 AV){return AC(AD)!=LIGHT_DIRECTIONAL?AI(AD)-AV:-AH(AD);}vec3 AW(mat4 AD,vec3 AN){vec4 S=AF(AD);vec3 AX=S.rgb*S.a;if(AC(AD)!=LIGHT_DIRECTIONAL){AX*=AJ(AG(AD),length(AN));}if(AC(AD)==LIGHT_SPOT){AX*=AM(AN,AH(AD),AE(AD));}return AX;}void main(){vec4 p=o();
#ifdef ALPHAMODE_OPAQUE
p.a=1.;
#endif
#ifdef MATERIAL_UNLIT
gl_FragColor=(vec4(R(p.rgb),p.a));return;
#endif
vec3 w=normalize(D.xyz-vPosition);u AY=v(vPosition);vec3 n=AY.n;vec3 AZ=-normalize(reflect(w,n));float i=clamp(abs(dot(n,w)),0.001,1.);vec2 Aa=q();float Ab=Aa[0];float Ac=Aa[1];float Ad=Ac*Ac;float d=Ad*Ad;vec3 Ae=vec3(0.04);vec3 Af=p.rgb*(vec3(1.)-Ae)*(1.-Ab);vec3 Ag=mix(Ae,p.rgb,Ab);float Z=max(max(Ag.r,Ag.g),Ag.b);float a=clamp(Z*25.,0.,1.);vec3 Ah=Ag.rgb;vec3 Ai=vec3(1.,1.,1.)*a;vec3 Aj=vec3(0.);vec3 Ak=vec3(0.);
#define NUM_LIGHTS  4
mat4 Al[4];Al[0]=mat4(0.,0.,0.,0.,1.,1.,1.,1.,.5,-.707,-.5,0.,0.,0.,0.,0.);Al[1]=mat4(0.,0.,0.,0.,1.,1.,1.,.75,-.5,.707,.5,0.,0.,0.,0.,0.);Al[2]=mat4(0.,0.,0.,0.,1.,1.,1.,.75,.5,.707,-.5,0.,0.,0.,0.,0.);Al[3]=mat4(0.,0.,0.,0.,1.,1.,1.,.75,-.5,-.707,.5,0.,0.,0.,0.,0.);
#ifdef NUM_LIGHTS
for(int Am=0;Am<NUM_LIGHTS;++Am){vec3 AN=AU(Al[Am],vPosition);vec3 AX=AW(Al[Am],AN);vec3 An=normalize(AN);vec3 Ao=normalize(An+w);float h=clamp(dot(n,An),0.001,1.);float e=clamp(dot(n,Ao),0.,1.);float b=clamp(dot(w,Ao),0.,1.);vec3 Ap=Y(Ah,Ai,b);vec3 Aq=(1.-Ap)*m(Af);vec3 Ar=max(vec3(0.),Ap*l(d,h,i,e));Aj+=AX*h*Aq;Ak+=AX*h*Ar;}
#endif
vec4 As=vec4(.1);vec3 At=As.rgb*m(Af);Aj+=At;vec3 Au=Aj+Ak;float Av=s();Au=mix(Au,Au*Av,L);vec3 Aw=t();Au+=Aw;
#ifdef ALPHAMODE_MASK
if(p.a<O){discard;}p.a=1.;
#endif
fragColor=vec4(R(Au),p.a);}`;
