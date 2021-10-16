export const PBR_FS_SRC=`
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;uniform float alphaCutoff;uniform vec3 cameraPosition;varying vec3 vPosition;const float a=2.2;const float b=3.141592653589793;vec3 c(vec3 d){return pow(d,vec3(1./a));}vec3 e(vec3 f){return pow(f.xyz,vec3(a));}vec4 e(vec4 f){return vec4(e(f.xyz),f.w);}vec3 g(vec3 h,vec3 i,float j){return h+(i-h)*pow(clamp(1.-j,0.,1.),5.);}float k(float l,float m){float n=(m*m)*(l-1.)+1.;return l/(b*n*n);}float o(float l,float p,float q){float r=1./(p+sqrt(l+(1.-l)*(p*p)));float s=1./(q+sqrt(l+(1.-l)*(q*q)));return r*s;}float t(float l,float p,float q,float m){return o(l,p,q)*k(l,m);}vec3 u(vec3 d){return d/b;}varying vec2 vTexCoord0,vTexCoord1;struct v{sampler2D tex;float texCoord;float scale;};vec2 w(v tex){return mix(vTexCoord0,vTexCoord1,step(1.,tex.texCoord));}vec4 x(v tex){return texture2D(tex.tex,w(tex));}vec4 x(v tex,vec4 y){return mix(y,texture2D(tex.tex,w(tex)),step(0.,tex.texCoord));}uniform v normalTexture;
#ifdef USE_NORMAL
#ifdef USE_TANGENT
varying mat3 vTBN;
#else
varying vec3 vNormal;
#endif
#endif
struct z{vec3 A;vec3 B;vec3 t;vec3 b;};z C(vec3 D){vec3 B,t,b,A;
#ifdef USE_TANGENT
t=normalize(vTBN[0]);b=normalize(vTBN[1]);A=normalize(vTBN[2]);
#else
#ifdef USE_NORMAL
A=normalize(vNormal);
#else
A=normalize(cross(dFdx(D),dFdy(D)));
#endif
vec2 E=w(normalTexture);vec3 F=dFdx(vec3(E,0.));vec3 G=dFdy(vec3(E,0.));vec3 H=(G.t*dFdx(D)-F.t*dFdy(D))/(F.s*G.t-G.s*F.t);t=normalize(H-A*dot(A,H));b=cross(A,t);
#endif
if(gl_FrontFacing==false){t*=-1.;b*=-1.;A*=-1.;}B=A;if(normalTexture.texCoord>=0.){B=x(normalTexture).rgb*2.-vec3(1.);B*=vec3(normalTexture.scale,normalTexture.scale,1.);B=mat3(t,b,A)*normalize(B);}z I;I.A=A;I.t=t;I.b=b;I.B=B;return I;}
#ifdef USE_COLOR_0
varying vec4 vColor0;
#endif
uniform vec4 baseColorFactor;uniform v baseColorTexture;uniform float metallicFactor,roughnessFactor;uniform v metallicRoughnessTexture;uniform v occlusionTexture;uniform vec3 emissiveFactor;uniform v emissiveTexture;vec4 J(){vec4 d=vec4(1.);
#ifdef USE_COLOR_0
d=vColor0;
#endif
return d;}vec4 K(){vec4 L=vec4(1.);L*=baseColorFactor;L*=e(x(baseColorTexture,vec4(1.)));return L*J();}vec2 M(){vec4 N=x(metallicRoughnessTexture,vec4(1.));return vec2(clamp(metallicFactor*N.b,0.,1.),clamp(roughnessFactor*N.g,.04,1.));}float O(){return x(occlusionTexture,vec4(1.)).r;}vec3 P(){return emissiveFactor*e(x(emissiveTexture,vec4(0.)).rgb);}
#define LIGHT_DIRECTIONAL 0
#define LIGHT_POINT 1
#define LIGHT_SPOT 2
int Q(mat4 R){return int(R[0].x);}vec2 S(mat4 R){return R[0].yz;}vec4 T(mat4 R){return R[1];}float U(mat4 R){return R[2].w;}vec3 V(mat4 R){return R[2].xyz;}vec3 W(mat4 R){return R[3].xyz;}float X(float Y,float Z){if(Y<=0.){return 1./pow(Z,2.);}return max(min(1.0-pow(Z/Y,4.),1.),0.)/pow(Z,2.);}float ba(vec3 bb,vec3 bc,vec2 bd){float be=dot(normalize(bc),normalize(-bb));float scale=1./max(.001,bd[0]-bd[1]);float bf=-bd[1]*scale;float bg=clamp(be*scale+bf,0.,1.);return bg*bg;}vec3 bh(mat4 R,vec3 bi){return Q(R)!=LIGHT_DIRECTIONAL?W(R)-bi:-V(R);}vec3 bj(mat4 R,vec3 bb){vec4 d=T(R);vec3 bk=d.rgb*d.a;if(Q(R)!=LIGHT_DIRECTIONAL){bk*=X(U(R),length(bb));}if(Q(R)==LIGHT_SPOT){bk*=ba(bb,V(R),S(R));}return bk;}void main(){vec4 L=K();
#ifdef ALPHAMODE_OPAQUE
L.a=1.;
#endif
#ifdef MATERIAL_UNLIT
gl_FragColor=(vec4(c(L.rgb),L.a));return;
#endif
vec3 D=normalize(cameraPosition-vPosition);z bl=C(vPosition);vec3 B=bl.B;vec3 bm=-normalize(reflect(D,B));float q=clamp(abs(dot(B,D)),0.001,1.);vec2 bn=M();float bo=bn[0];float bp=bn[1];float bq=bp*bp;float l=bq*bq;vec3 br=vec3(0.04);vec3 bs=L.rgb*(vec3(1.)-br)*(1.-bo);vec3 bt=mix(br,L.rgb,bo);float h=max(max(bt.r,bt.g),bt.b);float i=clamp(h*25.,0.,1.);vec3 bu=bt.rgb;vec3 bv=vec3(1.,1.,1.)*i;vec3 bw=vec3(0.);vec3 bx=vec3(0.);
#define NUM_LIGHTS 4
mat4 by[4];by[0]=mat4(0.,0.,0.,0.,1.,1.,1.,1.,.5,-.707,-.5,0.,0.,0.,0.,0.);by[1]=mat4(0.,0.,0.,0.,1.,1.,1.,.5,-.5,.707,.5,0.,0.,0.,0.,0.);by[2]=mat4(0.,0.,0.,0.,1.,1.,1.,.25,.5,.707,-.5,0.,0.,0.,0.,0.);by[3]=mat4(0.,0.,0.,0.,1.,1.,1.,.25,-.5,-.707,.5,0.,0.,0.,0.,0.);
#ifdef NUM_LIGHTS
for(int bz=0;bz<NUM_LIGHTS;++bz){vec3 bb=bh(by[bz],vPosition);vec3 bk=bj(by[bz],bb);vec3 bA=normalize(bb);vec3 bB=normalize(bA+D);float p=clamp(dot(B,bA),0.001,1.);float m=clamp(dot(B,bB),0.,1.);float j=clamp(dot(D,bB),0.,1.);vec3 bC=g(bu,bv,j);vec3 bD=(1.-bC)*u(bs);vec3 bE=max(vec3(0.),bC*t(l,p,q,m));bw+=bk*p*bD;bx+=bk*p*bE;}
#endif
vec4 bF=vec4(.1);vec3 bG=bF.rgb*u(bs);bw+=bG;vec3 bH=bw+bx;float bI=O();bH=mix(bH,bH*bI,occlusionTexture.scale);vec3 bJ=P();bH+=bJ;
#ifdef ALPHAMODE_MASK
if(L.a<alphaCutoff){discard;}L.a=1.;
#else
alphaCutoff;
#endif
gl_FragColor=vec4(c(bH),L.a);}`;
//# sourceMappingURL=pbr.fs.glsl.js.map