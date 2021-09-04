import { MarkRequired } from 'ts-essentials';
import { GlTFFile } from './types';
/**
 * Check if data is in GLB format, by checking the header magic
 */
export declare function isGLB(data: BufferSource): boolean;
/**
 * Parse a GLB (binary glTF) binary blob into a GlTF JSON and binary data chunk.
 */
export declare function parseGLB(data: BufferSource): MarkRequired<GlTFFile, 'glTF'>;
//# sourceMappingURL=glb.d.ts.map