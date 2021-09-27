import{decodeText}from"./utils.js";const GLB_HEADER_MAGIC=1179937895;const GLB_HEADER_LENGTH=12;const GLBChunkType={Json:1313821514,Bin:5130562};export function isGLB(data){return new DataView(data.buffer||data,data.byteOffset||0,4).getUint32(0,true)===GLB_HEADER_MAGIC}export function parseGLB(data){let glTF;let binaryChunk;const buffer=data.buffer||data;const bufferOffset=data.byteOffset||0;const headerView=new DataView(buffer,bufferOffset,GLB_HEADER_LENGTH);if(headerView.getUint32(0,true)!==GLB_HEADER_MAGIC){throw new Error("Invalid GLB format")}const version=headerView.getUint32(4,true);if(version!==2){throw new Error("Unsupported GLB version: "+version)}const chunkView=new DataView(buffer,bufferOffset+GLB_HEADER_LENGTH);let chunkIndex=0;while(chunkIndex<chunkView.byteLength){const chunkLength=chunkView.getUint32(chunkIndex,true);const chunkType=chunkView.getUint32(chunkIndex+4,true);chunkIndex+=8;if(chunkType===GLBChunkType.Json){const jsonChunk=new Uint8Array(buffer,bufferOffset+GLB_HEADER_LENGTH+chunkIndex,chunkLength);glTF=JSON.parse(decodeText(jsonChunk))}else if(chunkType===GLBChunkType.Bin){binaryChunk=new Uint8Array(buffer,bufferOffset+GLB_HEADER_LENGTH+chunkIndex,chunkLength)}chunkIndex+=chunkLength}if(!glTF){throw new Error("Invalid GLB format: missing JSON content")}if(!glTF.asset||glTF.asset.minVersion!=="2.0"&&glTF.asset.version!=="2.0"){throw new Error("Unsupported glTF version: 2.0 required")}return{glTF,binaryChunk}}
//# sourceMappingURL=glb.js.map