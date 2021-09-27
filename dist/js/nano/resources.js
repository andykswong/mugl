import{MUGL_DEBUG}from"../../common/config.js";import{BYTE_MASK,vertexByteSize}from"../device/index.js";import{GLenum}from"../../common/gl/index.js";import{COLOR_PIXEL_FORMAT,DEPTH_PIXEL_FORMAT}from"./const.js";import{NGL_ENABLE_OFFSCREEN,NGL_ENABLE_STENCIL,NGL_ENABLE_RASTER,NGL_ENABLE_BLEND,NGL_ENABLE_MRT}from"./config.js";export class GLBuffer{constructor(gl,props){this.gl=gl;this.props={type:GLenum.ARRAY_BUFFER,usage:GLenum.STATIC_DRAW,...props};gl.bindBuffer(this.props.type,this.glb=gl.createBuffer());gl.bufferData(this.props.type,this.props.size,this.props.usage)}data(data,offset=0){this.gl.bindBuffer(this.props.type,this.glb);this.gl.bufferSubData(this.props.type,offset,data);return this}destroy(){this.gl.deleteBuffer(this.glb)}}export class GLTexture{constructor(gl,props,sampler){this.glt=null;this.glrb=null;this.gl=gl;const p=this.props={type:GLenum.TEXTURE_2D,format:COLOR_PIXEL_FORMAT,width:1,height:1,...props};const s=this.sampler={wrapU:GLenum.CLAMP_TO_EDGE,wrapV:GLenum.CLAMP_TO_EDGE,magFilter:GLenum.NEAREST,minFilter:GLenum.NEAREST,...sampler};if(p.format<=DEPTH_PIXEL_FORMAT){if(NGL_ENABLE_OFFSCREEN){gl.bindRenderbuffer(GLenum.RENDERBUFFER,this.glrb=gl.createRenderbuffer());gl.renderbufferStorage(GLenum.RENDERBUFFER,NGL_ENABLE_STENCIL?GLenum.DEPTH_STENCIL:GLenum.DEPTH_COMPONENT16,p.width,p.height)}}else{gl.bindTexture(p.type,this.glt=gl.createTexture());gl.texParameteri(p.type,GLenum.TEXTURE_MIN_FILTER,s.minFilter);gl.texParameteri(p.type,GLenum.TEXTURE_MAG_FILTER,s.magFilter);gl.texParameteri(p.type,GLenum.TEXTURE_WRAP_S,s.wrapU);gl.texParameteri(p.type,GLenum.TEXTURE_WRAP_T,s.wrapV);gl.texImage2D(p.type,0,GLenum.RGBA,p.width,p.height,0,GLenum.RGBA,GLenum.UNSIGNED_BYTE,null)}}data(data,[x,y]=[0,0,0],[width,height]=[this.props.width-x,this.props.height-y,0]){this.gl.bindTexture(this.props.type,this.glt);if(data.buffer){this.gl.texSubImage2D(this.props.type,0,x,y,width,height,GLenum.RGBA,GLenum.UNSIGNED_BYTE,data.buffer)}else if(data.image){this.gl.texSubImage2D(this.props.type,0,x,y,GLenum.RGBA,GLenum.UNSIGNED_BYTE,data.image)}return this}mipmap(){this.gl.bindTexture(this.props.type,this.glt);this.gl.generateMipmap(this.props.type);return this}destroy(){this.gl.deleteTexture(this.glt);this.gl.deleteRenderbuffer(this.glrb)}}export class GLRenderPass{constructor(gl,props,drawBuffersExt){this.glfb=null;this.gl=gl;this.props=props;if(props.color&&props.color.length){gl.bindFramebuffer(GLenum.FRAMEBUFFER,this.glfb=gl.createFramebuffer());const count=NGL_ENABLE_MRT&&drawBuffersExt?props.color.length:1;for(let i=0;i<count;++i){gl.framebufferTexture2D(GLenum.FRAMEBUFFER,GLenum.COLOR_ATTACHMENT0+i,props.color[i].tex.props.type,props.color[i].tex.glt,0)}if(NGL_ENABLE_MRT&&count>1){drawBuffersExt.drawBuffersWEBGL(props.color.map((_,i)=>GLenum.COLOR_ATTACHMENT0+i))}if(props.depth){gl.framebufferRenderbuffer(GLenum.FRAMEBUFFER,NGL_ENABLE_STENCIL?GLenum.DEPTH_STENCIL_ATTACHMENT:GLenum.DEPTH_ATTACHMENT,GLenum.RENDERBUFFER,props.depth.tex.glrb)}if(MUGL_DEBUG){console.assert(gl.checkFramebufferStatus(GLenum.FRAMEBUFFER)===GLenum.FRAMEBUFFER_COMPLETE||gl.isContextLost(),"Framebuffer completeness check failed")}}}destroy(){this.gl.deleteFramebuffer(this.glfb)}resolve(){}}export class GLShader{constructor(gl,props){this.gl=gl;const shader=this.gls=gl.createShader(this.type=props.type);gl.shaderSource(shader,this.source=props.source);gl.compileShader(shader);if(MUGL_DEBUG){console.assert(gl.getShaderParameter(shader,GLenum.COMPILE_STATUS)||gl.isContextLost(),`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`)}}destroy(){this.gl.deleteShader(this.gls)}}export class GLPipeline{constructor(gl,props){this.gl=gl;let curShaderLoc=0;this.props={mode:GLenum.TRIANGLES,indexFormat:GLenum.UNSIGNED_SHORT,...props,buffers:props.buffers.map(({attrs:descAttrs,stride,instanced=false})=>{this.i=this.i||instanced;const attrs=Array(descAttrs.length);let maxOffset=0;for(let j=0;j<descAttrs.length;++j,++curShaderLoc){const{name,format,offset=maxOffset,shaderLoc=curShaderLoc}=descAttrs[j];attrs[j]={name,format,offset,shaderLoc};maxOffset=Math.max(maxOffset,offset)+vertexByteSize(format)}return{attrs,stride:stride||maxOffset,instanced}})};this.glp=createProgram(gl,props.vert,props.frag,this.props.buffers)}destroy(){this.gl.deleteProgram(this.glp)}}export function applyPipelineState(gl,state,stencilRef=0){const{blend,depth,stencil}=state;const raster=state.raster||{};if(NGL_ENABLE_RASTER){glToggle(gl,GLenum.SAMPLE_ALPHA_TO_COVERAGE,!!raster.alphaToCoverage);glToggle(gl,GLenum.CULL_FACE,!!raster.cullMode);glToggle(gl,GLenum.POLYGON_OFFSET_FILL,!!(raster.depthBiasSlopeScale||raster.depthBias));gl.polygonOffset(raster.depthBiasSlopeScale||0,raster.depthBias||0);if(raster.cullMode){gl.cullFace(raster.cullMode)}gl.frontFace(raster.frontFace||GLenum.CCW)}glToggle(gl,GLenum.DEPTH_TEST,!!depth);if(depth){gl.depthMask(!!depth.write);gl.depthFunc(depth.compare||GLenum.ALWAYS)}if(NGL_ENABLE_STENCIL){glToggle(gl,GLenum.STENCIL_TEST,!!stencil);if(stencil){var _stencil$writeMask,_stencil$readMask;gl.stencilMask((_stencil$writeMask=stencil.writeMask)!==null&&_stencil$writeMask!==void 0?_stencil$writeMask:BYTE_MASK);const mask=(_stencil$readMask=stencil.readMask)!==null&&_stencil$readMask!==void 0?_stencil$readMask:BYTE_MASK;gl.stencilFuncSeparate(GLenum.FRONT,stencil.frontCompare||GLenum.ALWAYS,stencilRef,mask);gl.stencilFuncSeparate(GLenum.BACK,stencil.backCompare||GLenum.ALWAYS,stencilRef,mask);gl.stencilOpSeparate(GLenum.FRONT,stencil.frontFailOp||GLenum.KEEP,stencil.frontZFailOp||GLenum.KEEP,stencil.frontPassOp||GLenum.KEEP);gl.stencilOpSeparate(GLenum.BACK,stencil.backFailOp||GLenum.KEEP,stencil.backZFailOp||GLenum.KEEP,stencil.backPassOp||GLenum.KEEP)}}if(NGL_ENABLE_BLEND){glToggle(gl,GLenum.BLEND,!!blend);if(blend){const mask=blend.colorMask||BYTE_MASK;gl.colorMask(!!(mask&1),!!(mask&2),!!(mask&4),!!(mask&8));gl.blendFuncSeparate(blend.srcFactorRGB||GLenum.ONE,blend.dstFactorRGB||GLenum.ZERO,blend.srcFactorAlpha||GLenum.ONE,blend.dstFactorAlpha||GLenum.ZERO);gl.blendEquationSeparate(blend.opRGB||GLenum.FUNC_ADD,blend.opAlpha||GLenum.FUNC_ADD)}}}function glToggle(gl,flag,enable){enable?gl.enable(flag):gl.disable(flag)}export function createProgram(gl,vs,fs,buffers){const program=gl.createProgram();gl.attachShader(program,vs.gls);gl.attachShader(program,fs.gls);for(const{attrs}of buffers){for(const attr of attrs){gl.bindAttribLocation(program,attr.shaderLoc,attr.name)}}gl.linkProgram(program);if(MUGL_DEBUG){console.assert(gl.getProgramParameter(program,GLenum.LINK_STATUS)||gl.isContextLost(),`Failed to link program: ${gl.getProgramInfoLog(program)}`)}return program}
//# sourceMappingURL=resources.js.map