import{isGLB,parseGLB}from"./glb.js";import{decodeText,getBaseUrl,resolveRelativeUri}from"./utils.js";import{getBufferViewData,getExtras}from"./gltf-utils.js";export async function resolveGlTF(file,loader=glTFResourceFetch){const baseUrl=file.uri?getBaseUrl(file.uri):"";let glTF=file.glTF;let binaryChunk=file.binaryChunk;if(!glTF&&file.uri){const binContent=await loader(file.uri,"bin");if(isGLB(binContent)){const glTFContent=parseGLB(binContent);glTF=glTFContent.glTF;binaryChunk=glTFContent.binaryChunk}else{glTF=JSON.parse(decodeText(binContent))}}if(!glTF){throw new Error("Failed to load glTF JSON")}const resolvedGlTF=await resolveBuffers(glTF,binaryChunk,loader,baseUrl);return await resolveImages(resolvedGlTF,loader,baseUrl)}export function glTFResourceFetch(uri,type){if(type==="img"){return new Promise((resolve,reject)=>{const img=new Image;img.crossOrigin="anonymous";img.onerror=()=>reject(new Error("Failed to load: "+uri));img.onload=()=>resolve(img);img.src=uri})}return fetch(uri).then(data=>data.arrayBuffer()).then(buffer=>new Uint8Array(buffer))}async function resolveBuffers(glTF,binaryChunk,loader,baseUrl){if(glTF.buffers){for(let i=0;i<glTF.buffers.length;++i){const buffer=glTF.buffers[i];if(getExtras(buffer).buffer){continue}let bufferData;const uri=buffer.uri;if(!uri){if(i!==0||!binaryChunk){throw new Error("Invalid glTF: missing uri for buffer "+i)}bufferData=binaryChunk}else{bufferData=await loader(resolveRelativeUri(uri,baseUrl),"bin")}getExtras(buffer).buffer=bufferData}}return glTF}async function resolveImages(glTF,loader,baseUrl){if(glTF.images){for(let i=0;i<glTF.images.length;++i){const image=glTF.images[i];if(getExtras(image).image){continue}const bufferView=image.bufferView;let isObjectURL=false;let uri=image.uri;let imageData;if(bufferView){var _glTF$bufferViews;const bufferViewObj=(_glTF$bufferViews=glTF.bufferViews)===null||_glTF$bufferViews===void 0?void 0:_glTF$bufferViews[bufferView];if(!bufferViewObj){throw new Error("Invalid glTF: invalid bufferView for image "+i)}const blob=new Blob([getBufferViewData(glTF,bufferViewObj)],{type:image.mimeType});uri=URL.createObjectURL(blob);isObjectURL=true}if(uri){try{imageData=await loader(resolveRelativeUri(uri,baseUrl),"img")}finally{if(isObjectURL){URL.revokeObjectURL(uri)}}}else{throw new Error("Invalid glTF: missing uri or bufferView for image "+i)}getExtras(image).image=imageData}}return glTF}
//# sourceMappingURL=resolve.js.map