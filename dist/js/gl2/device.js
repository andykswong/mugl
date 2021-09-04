import{MUGL_DEBUG}from"../../common/config.js";import{BYTE_MASK,ColorMask,GLenum,IndexFormat,indexSize,PrimitiveType,vertexNormalized,vertexSize,vertexType,UniformType}from"../../common/index.js";import{GL1Feature,GL2Feature,UniformFormat}from"../device/index.js";import{MAX_VERTEX_ATTRIBS}from"./const.js";import{GLBuffer}from"./buffer.js";import{GLPipeline}from"./pipeline.js";import{applyColorMask,applyDepthMask,applyPipelineState,applyStencilMask,DEFAULT_BLEND_STATE,DEFAULT_DEPTH_STATE,DEFAULT_STENCIL_STATE,mergePipelineState,newGLPipelineState}from"./pipestate.js";import{GLRenderPass}from"./renderpass.js";import{GLTexture}from"./texture.js";import{GLShader}from"./shader.js";export const getGLDevice=(canvas,options={})=>{let gl=null;let isWebGL2=false;if(options.webgl2){isWebGL2=!!(gl=canvas.getContext("webgl2",options))}if(!gl){gl=canvas.getContext("webgl",options)||canvas.getContext("experimental-webgl",options)}if(!gl){return null}return new WebGLRenderingDevice(gl,isWebGL2)};class WebGLRenderingDevice{constructor(gl,webgl2){this.gl=gl;this.webgl2=webgl2;this.canvas=gl.canvas;this.maxAttr=Math.min(gl.getParameter(GLenum.MAX_VERTEX_ATTRIBS),MAX_VERTEX_ATTRIBS);for(const ext of Object.values(webgl2?GL2Feature:GL1Feature)){this.feature(ext)}this.state=this.reset();this.renderCtx=new WebGLRenderPassContext(gl,webgl2,this.state,this.maxAttr,this.feature(GL1Feature.Instancing))}get width(){return this.gl.drawingBufferWidth}get height(){return this.gl.drawingBufferHeight}buffer(desc){return new GLBuffer(this,desc)}texture(desc,sampler){return new GLTexture(this,desc,sampler)}shader(desc){return new GLShader(this,desc)}pipeline(desc){return new GLPipeline(this,desc)}pass(desc){return new GLRenderPass(this,desc)}render(pass){let width=this.width;let height=this.height;if(pass.props.color.length){width=pass.props.color[0].tex.props.width;height=pass.props.color[0].tex.props.height}this.gl.bindFramebuffer(GLenum.FRAMEBUFFER,pass.glfb);this.gl.viewport(0,0,width,height);this.gl.depthRange(0,1);if(this.state.scissor){this.state.scissor=false;this.gl.disable(GLenum.SCISSOR_TEST)}const blend=this.state.pipe.blend||DEFAULT_BLEND_STATE;const depth=this.state.pipe.depth||DEFAULT_DEPTH_STATE;const stencil=this.state.pipe.stencil||DEFAULT_STENCIL_STATE;let clearMask=0;if(pass.props.clearColor){clearMask|=GLenum.COLOR_BUFFER_BIT;this.gl.clearColor(...pass.props.clearColor);applyColorMask(this.gl,blend.colorMask,ColorMask.All)}if(!isNaN(pass.props.clearDepth)){clearMask|=GLenum.DEPTH_BUFFER_BIT;this.gl.clearDepth(pass.props.clearDepth);applyDepthMask(this.gl,depth.write,true)}if(!isNaN(pass.props.clearStencil)){clearMask|=GLenum.STENCIL_BUFFER_BIT;this.gl.clearStencil(pass.props.clearStencil);applyStencilMask(this.gl,stencil.writeMask,BYTE_MASK)}if(clearMask){this.gl.clear(clearMask);if(clearMask&GLenum.COLOR_BUFFER_BIT){applyColorMask(this.gl,ColorMask.All,blend.colorMask)}if(clearMask&GLenum.DEPTH_BUFFER_BIT){applyDepthMask(this.gl,true,depth.write)}if(clearMask&GLenum.STENCIL_BUFFER_BIT){applyStencilMask(this.gl,BYTE_MASK,stencil.writeMask)}}this.renderCtx.pass=pass;return this.renderCtx}feature(feature){return this.gl.getExtension(feature)}reset(){return Object.assign(this.state||{},initState(this.gl,this.maxAttr))}}class WebGLRenderPassContext{constructor(gl,webgl2,state,maxAttr,extInst){this.pass=null;this.gl=gl;this.webgl2=webgl2;this.state=state;this.maxAttr=maxAttr;this.extInst=extInst}pipeline(pipeline){if(this.state.pipeObj===pipeline){return this}if(!this.state.pipeObj||this.state.pipeObj.glp!==pipeline.glp){this.gl.useProgram(pipeline.glp)}this.state.pipeObj=pipeline;const prevPipeState=this.state.pipe;applyPipelineState(this.gl,prevPipeState,pipeline.props,this.state.stencilRef);mergePipelineState(prevPipeState,pipeline.props);const bufs=this.state.bufs=Array(pipeline.props.buffers.length);const newAttrs=Array(this.maxAttr).fill(null);const oldAttrs=this.state.attrs;this.state.attrs=newAttrs;for(let slot=0;slot<pipeline.props.buffers.length;++slot){const{attrs,stride,instanced}=pipeline.props.buffers[slot];const bufAttrs=[];bufs[slot]={glb:null,attrs:bufAttrs};for(const{format,offset,shaderLoc}of attrs){bufAttrs.push(newAttrs[shaderLoc]={buf:slot,ptr:[shaderLoc,vertexSize(format),vertexType(format),vertexNormalized(format),stride,offset],step:instanced?1:0})}}for(let i=0;i<this.maxAttr;++i){if(newAttrs[i]&&!oldAttrs[i]){this.gl.enableVertexAttribArray(i)}else if(!newAttrs[i]&&oldAttrs[i]){this.gl.disableVertexAttribArray(i)}}this.state.idxFmt=pipeline.props.indexFormat;this.state.mode=pipeline.props.mode;return this}index({glb}){if(glb!==this.state.idx){this.gl.bindBuffer(GLenum.ELEMENT_ARRAY_BUFFER,this.state.idx=glb)}return this}vertex(slot,{glb}){const buf=this.state.bufs[slot];if(buf&&buf.glb!==glb){this.gl.bindBuffer(GLenum.ARRAY_BUFFER,buf.glb=glb);for(let i=0;i<buf.attrs.length;++i){const{ptr,step}=buf.attrs[i];this.gl.vertexAttribPointer(...ptr);if(this.webgl2){this.gl.vertexAttribDivisor(ptr[0],step)}else{var _this$extInst;(_this$extInst=this.extInst)===null||_this$extInst===void 0?void 0:_this$extInst.vertexAttribDivisorANGLE(ptr[0],step)}}}return this}uniforms(bindings){if(!this.state.pipeObj){return this}for(let i=0;i<bindings.length;++i){const binding=bindings[i];const uniformInfo=this.state.pipeObj.cache[binding.name];if(!uniformInfo){if(MUGL_DEBUG){console.warn(`Unknown uniform: ${binding.name}`)}continue}if(uniformInfo.type===UniformType.Value){if(binding.values){switch(uniformInfo.valueFormat){case UniformFormat.Mat4:this.gl.uniformMatrix4fv(uniformInfo.loc,false,binding.values);break;case UniformFormat.Mat3:this.gl.uniformMatrix3fv(uniformInfo.loc,false,binding.values);break;case UniformFormat.Mat2:this.gl.uniformMatrix2fv(uniformInfo.loc,false,binding.values);break;case UniformFormat.Vec4:this.gl.uniform4fv(uniformInfo.loc,binding.values);break;case UniformFormat.Vec3:this.gl.uniform3fv(uniformInfo.loc,binding.values);break;case UniformFormat.Vec2:this.gl.uniform2fv(uniformInfo.loc,binding.values);break;case UniformFormat.Float:this.gl.uniform1fv(uniformInfo.loc,binding.values);break;default:if(MUGL_DEBUG){console.warn(`Cannot bind a number array to uniform: ${binding.name}`)}}}else if(binding.value||binding.value===0){if(uniformInfo.valueFormat===UniformFormat.Float){this.gl.uniform1f(uniformInfo.loc,binding.value)}else if(MUGL_DEBUG){console.warn(`Cannot bind a number to uniform: ${binding.name}`)}}else if(MUGL_DEBUG){console.warn(`Invalid value bound to value uniform: ${binding.name}`)}}else if(uniformInfo.type===UniformType.Tex){if(binding.tex){this.gl.activeTexture(GLenum.TEXTURE0+uniformInfo.binding);this.gl.bindTexture(binding.tex.props.type,binding.tex.glt);this.gl.uniform1i(uniformInfo.loc,uniformInfo.binding)}else if(MUGL_DEBUG){console.warn(`Invalid value bound to texture uniform: ${binding.name}`)}}else if(uniformInfo.type===UniformType.Buffer){var _binding$buffer;if(((_binding$buffer=binding.buffer)===null||_binding$buffer===void 0?void 0:_binding$buffer.props.type)===GLenum.UNIFORM_BUFFER){const offset=binding.bufferOffset||0;this.gl.bindBufferRange(GLenum.UNIFORM_BUFFER,uniformInfo.index,binding.buffer.glb,offset,binding.bufferSize||binding.buffer.props.size-offset)}else if(MUGL_DEBUG){console.warn(`Invalid value bound to uniform buffer: ${binding.name}`)}}}return this}draw(vertexCount,instanceCount=1,firstVertex=0){if(!this.state.pipeObj){return this}if(this.state.pipeObj.instanced&&(this.webgl2||this.extInst)){if(this.webgl2){this.gl.drawArraysInstanced(this.state.mode,firstVertex,vertexCount,instanceCount)}else{this.extInst.drawArraysInstancedANGLE(this.state.mode,firstVertex,vertexCount,instanceCount)}}else{this.gl.drawArrays(this.state.mode,firstVertex,vertexCount)}return this}drawIndexed(indexCount,instanceCount=1,firstIndex=0){if(!this.state.pipeObj){return this}const{mode,idxFmt}=this.state;const offset=firstIndex*indexSize(idxFmt);if(this.state.pipeObj.instanced&&(this.webgl2||this.extInst)){if(this.webgl2){this.gl.drawElementsInstanced(mode,indexCount,idxFmt,offset,instanceCount)}else{this.extInst.drawElementsInstancedANGLE(mode,indexCount,idxFmt,offset,instanceCount)}}else{this.gl.drawElements(mode,indexCount,idxFmt,offset)}return this}viewport(x,y,width,height,minDepth=0,maxDepth=1){this.gl.viewport(x,y,width,height);this.gl.depthRange(minDepth,maxDepth);return this}scissor(x,y,width,height){if(!this.state.scissor){this.gl.enable(GLenum.SCISSOR_TEST);this.state.scissor=true}this.gl.scissor(x,y,width,height);return this}blendColor(color){this.gl.blendColor(...color);return this}stencilRef(ref){if(this.state.stencilRef!==ref){const{frontCompare,backCompare,readMask}=this.state.pipe.stencil||DEFAULT_STENCIL_STATE;this.gl.stencilFuncSeparate(GLenum.FRONT,frontCompare,ref,readMask);this.gl.stencilFuncSeparate(GLenum.BACK,backCompare,ref,readMask);this.state.stencilRef=ref}return this}end(){var _this$pass;(_this$pass=this.pass)===null||_this$pass===void 0?void 0:_this$pass.resolve();this.pass=null}}function initState(gl,maxAttr){const pipe=newGLPipelineState();const blend=[1,1,1,1];const stencilRef=0;gl.useProgram(null);gl.blendColor(...blend);applyPipelineState(gl,pipe,pipe,stencilRef,true);for(let i=0;i<maxAttr;++i){gl.disableVertexAttribArray(i)}return{pipeObj:null,bufs:[],attrs:[],idx:null,idxFmt:IndexFormat.UInt16,mode:PrimitiveType.Tri,pipe,blend,stencilRef,scissor:false}}
//# sourceMappingURL=device.js.map