import { Int } from 'munum';
import { IndexFormat, PixelFormat, TexType, VertexFormat } from './enums';
import * as GLenum from '../gl/const';

const TEX_INTERNAL_FORMAT_MAP = [
  GLenum.NONE,
  GLenum.DEPTH_COMPONENT16,
  GLenum.DEPTH_STENCIL,
  GLenum.DEPTH_STENCIL,
  GLenum.RGBA8,
  GLenum.RGBA32F,
  GLenum.RGBA16F,
  GLenum.R32F,
  GLenum.R16F,
  GLenum.RG32F,
  GLenum.RG16F
];

const TEX_FORMAT_MAP = [
  GLenum.NONE,
  GLenum.DEPTH_COMPONENT,
  GLenum.DEPTH_STENCIL,
  GLenum.DEPTH_STENCIL,
  GLenum.RGBA,
  GLenum.RED,
  GLenum.RG
];

const TEX_TYPE_MAP = [
  GLenum.NONE,
  GLenum.UNSIGNED_BYTE,
  GLenum.FLOAT,
  GLenum.HALF_FLOAT_OES,
  GLenum.UNSIGNED_INT,
  GLenum.UNSIGNED_INT_24_8_WEBGL
];

const VERTEX_TYPE_MAP = [
  GLenum.FLOAT,
  GLenum.BYTE,
  GLenum.UNSIGNED_BYTE,
  GLenum.SHORT,
  GLenum.UNSIGNED_SHORT
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
  return type === GLenum.TEXTURE_3D || type === GLenum.TEXTURE_2D_ARRAY;
}

/**
 * Check if given pixel format is a depth/stencil format.
 *
 * @param format pixel format
 * @returns whether the pixel format is a depth/stencil format
 */
export function isDepthStencil(format: PixelFormat): boolean {
  return format > 0 && (format >> 16) <= 3;
}

/**
 * Check if given pixel format has stencil component.
 *
 * @param format pixel format
 * @returns whether the pixel format has stencil component
 */
export function hasStencil(format: PixelFormat): boolean {
  return (format & BYTE_MASK) === 5;
}

/**
 * Returns the byte size of a vertex format.
 * @internal
 * @param format vertex format
 * @returns byte size
 */
export function vertexByteSize(format: VertexFormat): Int {
  return VERTEX_TYPE_SIZE_MAP[format & BYTE_MASK] * vertexSize(format);
}

/**
 * Returns the number of components of a vertex format.
 * @internal
 * @param format vertex format
 * @returns number of components
 */
export function vertexSize(format: VertexFormat): Int {
  return (format >> 8) & BYTE_MASK;
}

/**
 * Returns the data type of a vertex format.
 * @internal
 * @param format vertex format
 * @returns GL data type
 */
export function vertexType(format: VertexFormat): Int {
  return VERTEX_TYPE_MAP[format & BYTE_MASK];
}

/**
 * Returns if a vertex format is normalized.
 * @internal
 * @param format vertex format
 * @returns number of components
 */
export function vertexNormalized(format: VertexFormat): boolean {
  return !!(format >> 16);
}

/**
 * Returns the byte size of a index format.
 * @internal
 * @param format index format
 * @returns byte size of the format
 */
export function indexSize(format: IndexFormat): Int {
  return (format - GLenum.UNSIGNED_SHORT) + 2;
}

/**
 * Convert PixelFormat to GL texture internal format.
 * @internal
 * @param format pixel format
 * @param isRenderbuffer if this is a renderbuffer
 * @param isWebGL2 if WebGL2 is used
 * @returns GL texture internal format
 */
export function glTexInternalFormat(format: PixelFormat, isWebGL2: boolean = false): Int {
  return (isWebGL2 || isDepthStencil(format)) ? TEX_INTERNAL_FORMAT_MAP[format >> 16] : glTexFormat(format);
}

/**
 * Convert PixelFormat to GL texture image format.
 * @internal
 * @param format pixel format
 * @returns GL texture image format
 */
export function glTexFormat(format: PixelFormat): Int {
  return TEX_FORMAT_MAP[(format >> 8) & BYTE_MASK];
}

/**
 * Convert PixelFormat to GL texture size type.
 * @internal
 * @param format pixel format
 * @param isWebGL2 if WebGL2 is used
 * @returns GL texture size type
 */
export function glTexType(format: PixelFormat, isWebGL2: boolean = false): Int {
  const type = TEX_TYPE_MAP[format & BYTE_MASK];
  if (isWebGL2 && type === GLenum.HALF_FLOAT_OES) {
    return GLenum.HALF_FLOAT; // WebGL2 uses a different enum value for half float
  }
  return type;
}
