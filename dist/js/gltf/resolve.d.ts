import { GlTFFile, ResolvedGlTF, GlTFResourceLoader } from './types';
/**
 * Fetch a GlTF model and resolve its external resources (binary buffers and images).
 */
export declare function resolveGlTF(file: GlTFFile, loader?: GlTFResourceLoader): Promise<ResolvedGlTF>;
export declare function glTFResourceFetch(uri: string, type: 'bin'): Promise<Uint8Array>;
export declare function glTFResourceFetch(uri: string, type: 'img'): Promise<TexImageSource>;
//# sourceMappingURL=resolve.d.ts.map