import * as GLenum from '../gpu/gl-const';
import { TextureFormat, UInt } from '../gpu';

/**
 * Gets the GL texel format from a texture format.
 * @internal
 * @param format texture format
 * @returns GL texel format
 */
 export function glTexelFormat(format: TextureFormat): UInt {
  switch (format) {
    case GLenum.R8:
    case GLenum.R8_SNORM:
    case GLenum.R16F:
    case GLenum.R32F:
      return GLenum.RED;
    case GLenum.R8UI:
    case GLenum.R8I:
    case GLenum.R16UI:
    case GLenum.R16I:
    case GLenum.R32UI:
    case GLenum.R32I:
      return GLenum.RED_INTEGER;
    case GLenum.RG8:
    case GLenum.RG8_SNORM:
    case GLenum.RG16F:
    case GLenum.RG32F:
      return GLenum.RG;
    case GLenum.RG8UI:
    case GLenum.RG8I:
    case GLenum.RG16UI:
    case GLenum.RG16I:
    case GLenum.RG32UI:
    case GLenum.RG32I:
      return GLenum.RG_INTEGER;

    case GLenum.RGBA8:
    case GLenum.SRGB8_ALPHA8:
    case GLenum.RGBA8_SNORM:
    case GLenum.RGB10_A2:
    case GLenum.RGBA16F:
    case GLenum.RGBA32F:
      return GLenum.RGBA;
    case GLenum.RGBA8UI:
    case GLenum.RGBA8I:
    case GLenum.RGBA16UI:
    case GLenum.RGBA32UI:
    case GLenum.RGBA16I:
    case GLenum.RGBA32I:
      return GLenum.RGBA_INTEGER;

    case GLenum.R11F_G11F_B10F:
      return GLenum.RGB;

    // Depth/stencil formats
    case GLenum.DEPTH_COMPONENT16:
    case GLenum.DEPTH_COMPONENT24:
    case GLenum.DEPTH_COMPONENT32F:
      return GLenum.DEPTH_COMPONENT;

    case GLenum.DEPTH24_STENCIL8:
    case GLenum.DEPTH32F_STENCIL8:
      return GLenum.DEPTH_STENCIL;
  }

  return GLenum.NONE;
}

/**
 * Gets the GL texel byte size from a texture format.
 * @internal
 * @param format texture format
 * @returns GL texel byte size
 */
export function glTexelSize(format: TextureFormat): UInt {
  switch (format) {
    case GLenum.R8:
    case GLenum.R8UI:
    case GLenum.R8_SNORM:
    case GLenum.R8I:
      return 1;

    case GLenum.R16UI:
    case GLenum.R16I:
    case GLenum.RG8:
    case GLenum.RG8UI:
    case GLenum.RG8_SNORM:
    case GLenum.RG8I:
    case GLenum.R16F:
      return 2;

    case GLenum.R32UI:
    case GLenum.R32I:
    case GLenum.R32F:
    case GLenum.RG16UI:
    case GLenum.RG16I:
    case GLenum.RG16F:
    case GLenum.RGBA8:
    case GLenum.SRGB8_ALPHA8:
    case GLenum.RGBA8UI:
    case GLenum.RGBA8_SNORM:
    case GLenum.RGBA8I:
    case GLenum.RGB10_A2:
    case GLenum.R11F_G11F_B10F:
      return 4;

    case GLenum.RG32UI:
    case GLenum.RG32I:
    case GLenum.RG32F:
    case GLenum.RGBA16UI:
    case GLenum.RGBA16I:
    case GLenum.RGBA16F:
      return 8;

    case GLenum.RGBA32UI:
    case GLenum.RGBA32I:
    case GLenum.RGBA32F:
      return 16;

    case GLenum.DEPTH_COMPONENT16:
      return 2;
    case GLenum.DEPTH_COMPONENT24:
    case GLenum.DEPTH24_STENCIL8:
    case GLenum.DEPTH_COMPONENT32F:
      return 4;
    case GLenum.DEPTH32F_STENCIL8:
      return 8;
  }
  return 0;
}

/**
 * Gets the GL texel type from a texture format.
 * @internal
 * @param format texture format
 * @returns GL texel size type
 */
export function glTexelType(format: TextureFormat): UInt {
  switch (format) {
    case GLenum.R8:
    case GLenum.R8UI:
    case GLenum.RG8:
    case GLenum.RG8UI:
    case GLenum.RGBA8:
    case GLenum.SRGB8_ALPHA8:
    case GLenum.RGBA8UI:
      return GLenum.UNSIGNED_BYTE;

    case GLenum.R8_SNORM:
    case GLenum.R8I:
    case GLenum.RG8_SNORM:
    case GLenum.RG8I:
    case GLenum.RGBA8_SNORM:
    case GLenum.RGBA8I:
      return GLenum.BYTE;

    case GLenum.R16UI:
    case GLenum.RG16UI:
    case GLenum.RGBA16UI:
      return GLenum.UNSIGNED_SHORT;

    case GLenum.R16I:
    case GLenum.RG16I:
    case GLenum.RGBA16I:
      return GLenum.SHORT;

    case GLenum.R32UI:
    case GLenum.RG32UI:
    case GLenum.RGBA32UI:
      return GLenum.UNSIGNED_INT;

    case GLenum.R32I:
    case GLenum.RG32I:
    case GLenum.RGBA32I:
      return GLenum.INT;

    case GLenum.RGB10_A2:
      return GLenum.UNSIGNED_INT_2_10_10_10_REV;

    case GLenum.R16F:
    case GLenum.RG16F:
    case GLenum.RGBA16F:
      return GLenum.HALF_FLOAT;

    case GLenum.R32F:
    case GLenum.RG32F:
    case GLenum.RGBA32F:
      return GLenum.FLOAT;

    case GLenum.R11F_G11F_B10F:
      return GLenum.UNSIGNED_INT_10F_11F_11F_REV;

    // Depth/stencil formats
    case GLenum.DEPTH_COMPONENT16:
      return GLenum.UNSIGNED_SHORT;
    case GLenum.DEPTH_COMPONENT24:
      return GLenum.UNSIGNED_INT;
    case GLenum.DEPTH24_STENCIL8:
      return GLenum.UNSIGNED_INT_24_8;
    case GLenum.DEPTH_COMPONENT32F:
      return GLenum.FLOAT;
    case GLenum.DEPTH32F_STENCIL8:
      return GLenum.FLOAT_32_UNSIGNED_INT_24_8_REV;
  }

  return GLenum.NONE;
}

/**
 * Gets the data type required to clear a buffer of given texture format.
 * @internal
 * @param format texture format
 * @returns FLOAT / INT / UNSIGNED_INT
 */
export function glClearType(format: TextureFormat): UInt {
  switch (format) {
    case GLenum.R8I:
    case GLenum.R16I:
    case GLenum.R32I:
    case GLenum.RG8I:
    case GLenum.RG16I:
    case GLenum.RG32I:
    case GLenum.RGBA8I:
    case GLenum.RGBA16I:
    case GLenum.RGBA32I:
      return GLenum.INT;

    case GLenum.R8UI:
    case GLenum.R16UI:
    case GLenum.R32UI:
    case GLenum.RG8UI:
    case GLenum.RG16UI:
    case GLenum.RG32UI:
    case GLenum.RGBA8UI:
    case GLenum.RGBA16UI:
    case GLenum.RGBA32UI:
      return GLenum.UNSIGNED_INT;

    /*
    case GLenum.R8:
    case GLenum.R8_SNORM:
    case GLenum.R16F:
    case GLenum.R32F:
    case GLenum.RG8:
    case GLenum.RG8_SNORM:
    case GLenum.RG16F:
    case GLenum.RG32F:
    case GLenum.RGBA8:
    case GLenum.SRGB8_ALPHA8:
    case GLenum.RGBA8_SNORM:
    case GLenum.RGB10_A2:
    case GLenum.RGBA16F:
    case GLenum.RGBA32F:
    case GLenum.R11F_G11F_B10F:
      return GLenum.FLOAT;
    */
  }

  return GLenum.FLOAT;
}
