import { Int } from 'munum';
import { IndexFormat, PixelFormat, TexType, VertexFormat } from './enums';
/**
 * Byte mask = 0xFF.
 * @internal
 */
export declare const BYTE_MASK = 255;
/**
 * Check if given texture type is a 3D or 2D array texture.
 *
 * @param type texture type
 * @return whether the texture type is 3D
 */
export declare function is3DTexture(type: TexType): boolean;
/**
 * Check if given pixel format is a depth/stencil format.
 *
 * @param format pixel format
 * @returns whether the pixel format is a depth/stencil format
 */
export declare function isDepthStencil(format: PixelFormat): boolean;
/**
 * Check if given pixel format has stencil component.
 *
 * @param format pixel format
 * @returns whether the pixel format has stencil component
 */
export declare function hasStencil(format: PixelFormat): boolean;
/**
 * Returns the byte size of a vertex format.
 * @internal
 * @param format vertex format
 * @returns byte size
 */
export declare function vertexByteSize(format: VertexFormat): Int;
/**
 * Returns the number of components of a vertex format.
 * @internal
 * @param format vertex format
 * @returns number of components
 */
export declare function vertexSize(format: VertexFormat): Int;
/**
 * Returns the data type of a vertex format.
 * @internal
 * @param format vertex format
 * @returns GL data type
 */
export declare function vertexType(format: VertexFormat): Int;
/**
 * Returns if a vertex format is normalized.
 * @internal
 * @param format vertex format
 * @returns number of components
 */
export declare function vertexNormalized(format: VertexFormat): boolean;
/**
 * Returns the byte size of a index format.
 * @internal
 * @param format index format
 * @returns byte size of the format
 */
export declare function indexSize(format: IndexFormat): Int;
/**
 * Convert PixelFormat to GL texture internal format.
 * @internal
 * @param format pixel format
 * @param isRenderbuffer if this is a renderbuffer
 * @param isWebGL2 if WebGL2 is used
 * @returns GL texture internal format
 */
export declare function glTexInternalFormat(format: PixelFormat, isWebGL2?: boolean): Int;
/**
 * Convert PixelFormat to GL texture image format.
 * @internal
 * @param format pixel format
 * @returns GL texture image format
 */
export declare function glTexFormat(format: PixelFormat): Int;
/**
 * Convert PixelFormat to GL texture size type.
 * @internal
 * @param format pixel format
 * @param isWebGL2 if WebGL2 is used
 * @returns GL texture size type
 */
export declare function glTexType(format: PixelFormat, isWebGL2?: boolean): Int;
//# sourceMappingURL=utils.d.ts.map