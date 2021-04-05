import { IndexFormat, PixelFormat, TexType, VertexFormat } from './enums';
import {
  GL_BYTE, GL_DEPTH_COMPONENT, GL_DEPTH_COMPONENT16, GL_DEPTH_STENCIL, GL_FLOAT, GL_HALF_FLOAT, GL_HALF_FLOAT_OES,
  GL_NONE, GL_R16F, GL_R32F, GL_RED, GL_RG, GL_RG16F, GL_RG32F, GL_RGBA, GL_RGBA16F, GL_RGBA32F, GL_RGBA8, GL_SHORT,
  GL_TEXTURE_2D_ARRAY, GL_TEXTURE_3D, GL_UNSIGNED_BYTE, GL_UNSIGNED_INT, GL_UNSIGNED_INT_24_8_WEBGL, GL_UNSIGNED_SHORT
} from './glenums';

const TEX_INTERNAL_FORMAT_MAP = [
  GL_NONE,
  GL_DEPTH_COMPONENT16,
  GL_DEPTH_STENCIL,
  GL_DEPTH_STENCIL,
  GL_RGBA8,
  GL_RGBA32F,
  GL_RGBA16F,
  GL_R32F,
  GL_R16F,
  GL_RG32F,
  GL_RG16F
];

const TEX_FORMAT_MAP = [
  GL_NONE,
  GL_DEPTH_COMPONENT,
  GL_DEPTH_STENCIL,
  GL_DEPTH_STENCIL,
  GL_RGBA,
  GL_RED,
  GL_RG
];

const TEX_TYPE_MAP = [
  GL_NONE,
  GL_UNSIGNED_BYTE,
  GL_FLOAT,
  GL_HALF_FLOAT_OES,
  GL_UNSIGNED_INT,
  GL_UNSIGNED_INT_24_8_WEBGL
];

const VERTEX_TYPE_MAP = [
  GL_FLOAT,
  GL_BYTE,
  GL_UNSIGNED_BYTE,
  GL_SHORT,
  GL_UNSIGNED_SHORT
];

const VERTEX_TYPE_SIZE_MAP = [
  4,
  1,
  1,
  2,
  2
];

/**
 * Byte mask = 0xFF.
 * @internal
 */
export const BYTE_MASK = 0xFF;

/**
 * Check if given texture type is a 3D or 2D array texture.
 *
 * @param type texture type
 * @return whether the texture type is 3D
 */
export function is3DTexture(type: TexType): boolean {
  return type === GL_TEXTURE_3D || type === GL_TEXTURE_2D_ARRAY;
}

/**
 * Check if given pixel format is a depth/stencil format.
 *
 * @param format pixel format
 * @returns whether the pixel format is a depth/stencil format
 */
export const isDepthStencil = (format: PixelFormat): boolean => format > 0 && (format >> 16) <= 3;

/**
 * Check if given pixel format has stencil component.
 *
 * @param format pixel format
 * @returns whether the pixel format has stencil component
 */
export const hasStencil = (format: PixelFormat): boolean => (format & BYTE_MASK) === 5;

/**
 * Returns the byte size of a vertex format.
 * @internal
 * @param format vertex format
 * @returns byte size
 */
export const vertexByteSize = (format: VertexFormat): number =>
  VERTEX_TYPE_SIZE_MAP[format & BYTE_MASK] * vertexSize(format);

/**
 * Returns the number of components of a vertex format.
 * @internal
 * @param format vertex format
 * @returns number of components
 */
export const vertexSize = (format: VertexFormat): number => (format >> 8) & BYTE_MASK;

/**
 * Returns the data type of a vertex format.
 * @internal
 * @param format vertex format
 * @returns GL data type
 */
export const vertexType = (format: VertexFormat): GLenum => VERTEX_TYPE_MAP[format & BYTE_MASK];

/**
 * Returns if a vertex format is normalized.
 * @internal
 * @param format vertex format
 * @returns number of components
 */
export const vertexNormalized = (format: VertexFormat): boolean => !!(format >> 16);

/**
 * Returns the byte size of a index format.
 * @internal
 * @param format index format
 * @returns byte size of the format
 */
export const indexSize = (format: IndexFormat): number  => format ? (2 + (format - IndexFormat.UInt16)) : 0;

/**
 * Convert PixelFormat to GL texture internal format.
 * @internal
 * @param format pixel format
 * @param isRenderbuffer if this is a renderbuffer
 * @param isWebGL2 if WebGL2 is used
 * @returns GL texture internal format
 */
 export function glTexInternalFormat(format: PixelFormat, isWebGL2 = false): GLenum {
  return (isWebGL2 || isDepthStencil(format)) ? TEX_INTERNAL_FORMAT_MAP[format >> 16] : glTexFormat(format);
}

/**
 * Convert PixelFormat to GL texture image format.
 * @internal
 * @param format pixel format
 * @returns GL texture image format
 */
export const glTexFormat = (format: PixelFormat): GLenum => TEX_FORMAT_MAP[(format >> 8) & BYTE_MASK];

/**
 * Convert PixelFormat to GL texture size type.
 * @internal
 * @param format pixel format
 * @param isWebGL2 if WebGL2 is used
 * @returns GL texture size type
 */
export function glTexType(format: PixelFormat, isWebGL2 = false): GLenum {
  const type = TEX_TYPE_MAP[format & BYTE_MASK];
  if (isWebGL2 && type === GL_HALF_FLOAT_OES) {
    return GL_HALF_FLOAT; // WebGL2 uses a different enum value for half float
  }
  return type;
}
