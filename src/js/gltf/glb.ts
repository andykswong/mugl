import { MarkRequired } from 'ts-essentials';
import { GlTF } from '../gltf-spec/glTF2';
import { GlTFFile } from './types';
import { decodeText } from './utils';

const GLB_HEADER_MAGIC = 0x46546C67; // ASCII string 'glTF' in little endian

const GLB_HEADER_LENGTH = 12;

const GLBChunkType = {
  Json: 0x4E4F534A,
  Bin: 0x004E4942
} as const;

/**
 * Check if data is in GLB format, by checking the header magic
 */
export function isGLB(data: BufferSource): boolean {
  return new DataView((data as ArrayBufferView).buffer || data, (data as ArrayBufferView).byteOffset || 0, 4)
    .getUint32(0, true) === GLB_HEADER_MAGIC;
}

/**
 * Parse a GLB (binary glTF) binary blob into a GlTF JSON and binary data chunk.
 */
 export function parseGLB(data: BufferSource): MarkRequired<GlTFFile, 'glTF'> {
  let glTF: GlTF | undefined;
  let binaryChunk: Uint8Array | undefined;

  // Get array buffer and offset from data
  const buffer: ArrayBuffer = (data as ArrayBufferView).buffer || data;
  const bufferOffset = (data as ArrayBufferView).byteOffset || 0;

  // Validate header magic and version
  const headerView = new DataView(buffer, bufferOffset, GLB_HEADER_LENGTH);
  if (headerView.getUint32(0, true) !== GLB_HEADER_MAGIC) {
    throw new Error('Invalid GLB format');
  }
  const version = headerView.getUint32(4, true);
  if (version !== 2) {
    throw new Error('Unsupported GLB version: ' + version);
  }

  // Parse binary chunks
  const chunkView = new DataView(buffer, bufferOffset + GLB_HEADER_LENGTH);
  let chunkIndex = 0;
  while (chunkIndex < chunkView.byteLength) {
    const chunkLength = chunkView.getUint32(chunkIndex, true);
    const chunkType = chunkView.getUint32(chunkIndex + 4, true);
    chunkIndex += 8;

    if (chunkType === GLBChunkType.Json) {
      const jsonChunk = new Uint8Array(buffer, bufferOffset + GLB_HEADER_LENGTH + chunkIndex, chunkLength);
      glTF = JSON.parse(decodeText(jsonChunk));
    } else if (chunkType === GLBChunkType.Bin) {
      binaryChunk = new Uint8Array(buffer, bufferOffset + GLB_HEADER_LENGTH + chunkIndex, chunkLength);
    }
    // else ignore chunk

    chunkIndex += chunkLength;
  }

  // Validate glTF JSON and version
  if (!glTF) {
      throw new Error('Invalid GLB format: missing JSON content');
  }
  if (!glTF.asset || (glTF.asset.minVersion !== '2.0' && glTF.asset.version !== '2.0')) {
    throw new Error('Unsupported glTF version: 2.0 required');
  }

  return { glTF, binaryChunk };
}
