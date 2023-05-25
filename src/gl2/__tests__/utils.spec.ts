import { TextureFormat, UInt } from '../../gpu';
import * as GLenum from '../../gpu/gl-const';
import { glClearType, glTexelFormat, glTexelSize, glTexelType } from '../utils';

class TextureFormatSpec {
  id: TextureFormat = TextureFormat.RGBA8;
  format: UInt = 0;
  bytes: UInt = 0;
  type: UInt = 0;
  clear: UInt = 0;
  depth: boolean = false;
  stencil: boolean = false;
}

const TEXTURE_FORMAT_SPECS: TextureFormatSpec[] = [
  // 8-bit formats
  { id: TextureFormat.R8, format: GLenum.RED, bytes: 1, type: GLenum.UNSIGNED_BYTE, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.R8SNORM, format: GLenum.RED, bytes: 1, type: GLenum.BYTE, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.R8UI, format: GLenum.RED_INTEGER, bytes: 1, type: GLenum.UNSIGNED_BYTE, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.R8I, format: GLenum.RED_INTEGER, bytes: 1, type: GLenum.BYTE, clear: GLenum.INT, depth: false, stencil: false },

  // 16-bit formats
  { id: TextureFormat.R16UI, format: GLenum.RED_INTEGER, bytes: 2, type: GLenum.UNSIGNED_SHORT, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.R16I, format: GLenum.RED_INTEGER, bytes: 2, type: GLenum.SHORT, clear: GLenum.INT, depth: false, stencil: false },
  { id: TextureFormat.RG8, format: GLenum.RG, bytes: 2, type: GLenum.UNSIGNED_BYTE, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RG8SNORM, format: GLenum.RG, bytes: 2, type: GLenum.BYTE, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RG8UI, format: GLenum.RG_INTEGER, bytes: 2, type: GLenum.UNSIGNED_BYTE, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.RG8I, format: GLenum.RG_INTEGER, bytes: 2, type: GLenum.BYTE, clear: GLenum.INT, depth: false, stencil: false },

  // 32-bit formats
  { id: TextureFormat.R32UI, format: GLenum.RED_INTEGER, bytes: 4, type: GLenum.UNSIGNED_INT, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.R32I, format: GLenum.RED_INTEGER, bytes: 4, type: GLenum.INT, clear: GLenum.INT, depth: false, stencil: false },
  { id: TextureFormat.RG16UI, format: GLenum.RG_INTEGER, bytes: 4, type: GLenum.UNSIGNED_SHORT, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.RG16I, format: GLenum.RG_INTEGER, bytes: 4, type: GLenum.SHORT, clear: GLenum.INT, depth: false, stencil: false },
  { id: TextureFormat.RGBA8, format: GLenum.RGBA, bytes: 4, type: GLenum.UNSIGNED_BYTE, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.SRGBA8, format: GLenum.RGBA, bytes: 4, type: GLenum.UNSIGNED_BYTE, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RGBA8SNORM, format: GLenum.RGBA, bytes: 4, type: GLenum.BYTE, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RGBA8UI, format: GLenum.RGBA_INTEGER, bytes: 4, type: GLenum.UNSIGNED_BYTE, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.RGBA8I, format: GLenum.RGBA_INTEGER, bytes: 4, type: GLenum.BYTE, clear: GLenum.INT, depth: false, stencil: false },
  { id: TextureFormat.RGB10A2, format: GLenum.RGBA, bytes: 4, type: GLenum.UNSIGNED_INT_2_10_10_10_REV, clear: GLenum.FLOAT, depth: false, stencil: false },

  // 64-bit formats
  { id: TextureFormat.RG32UI, format: GLenum.RG_INTEGER, bytes: 8, type: GLenum.UNSIGNED_INT, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.RG32I, format: GLenum.RG_INTEGER, bytes: 8, type: GLenum.INT, clear: GLenum.INT, depth: false, stencil: false },
  { id: TextureFormat.RGBA16UI, format: GLenum.RGBA_INTEGER, bytes: 8, type: GLenum.UNSIGNED_SHORT, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.RGBA16I, format: GLenum.RGBA_INTEGER, bytes: 8, type: GLenum.SHORT, clear: GLenum.INT, depth: false, stencil: false },
 
  // 128-bit formats
  { id: TextureFormat.RGBA32UI, format: GLenum.RGBA_INTEGER, bytes: 16, type: GLenum.UNSIGNED_INT, clear: GLenum.UNSIGNED_INT, depth: false, stencil: false },
  { id: TextureFormat.RGBA32I, format: GLenum.RGBA_INTEGER, bytes: 16, type: GLenum.INT, clear: GLenum.INT, depth: false, stencil: false },

  // Float formats
  { id: TextureFormat.R16F, format: GLenum.RED, bytes: 2, type: GLenum.HALF_FLOAT, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RG16F, format: GLenum.RG, bytes: 4, type: GLenum.HALF_FLOAT, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RG11B10F, format: GLenum.RGB, bytes: 4, type: GLenum.UNSIGNED_INT_10F_11F_11F_REV, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RGBA16F, format: GLenum.RGBA, bytes: 8, type: GLenum.HALF_FLOAT, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.R32F, format: GLenum.RED, bytes: 4, type: GLenum.FLOAT, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RG32F, format: GLenum.RG, bytes: 8, type: GLenum.FLOAT, clear: GLenum.FLOAT, depth: false, stencil: false },
  { id: TextureFormat.RGBA32F, format: GLenum.RGBA, bytes: 16, type: GLenum.FLOAT, clear: GLenum.FLOAT, depth: false, stencil: false },

  // Depth/stencil formats
  { id: TextureFormat.Depth16, format: GLenum.DEPTH_COMPONENT, bytes: 2, type: GLenum.UNSIGNED_SHORT, clear: GLenum.FLOAT, depth: true, stencil: false },
  { id: TextureFormat.Depth24, format: GLenum.DEPTH_COMPONENT, bytes: 4, type: GLenum.UNSIGNED_INT, clear: GLenum.FLOAT, depth: true, stencil: false },
  { id: TextureFormat.Depth24Stencil8, format: GLenum.DEPTH_STENCIL, bytes: 4, type: GLenum.UNSIGNED_INT_24_8_WEBGL, clear: GLenum.FLOAT, depth: true, stencil: true },
  { id: TextureFormat.Depth32F, format: GLenum.DEPTH_COMPONENT, bytes: 4, type: GLenum.FLOAT, clear: GLenum.FLOAT, depth: true, stencil: false },
  { id: TextureFormat.Depth32FStencil8, format: GLenum.DEPTH_STENCIL, bytes: 8, type: GLenum.FLOAT_32_UNSIGNED_INT_24_8_REV, clear: GLenum.FLOAT, depth: true, stencil: true },
];

describe('utils', () => {
  describe('texture format', () => {
    test('glTexelFormat should return the GL texture format for each format', () => {
      for (let i = 0; i < TEXTURE_FORMAT_SPECS.length; ++i) {
        expect(glTexelFormat(TEXTURE_FORMAT_SPECS[i].id)).toBe(TEXTURE_FORMAT_SPECS[i].format);
      }
    });

    test('glTexelSize should return the GL texel byte size for each format', () => {
      for (let i = 0; i < TEXTURE_FORMAT_SPECS.length; ++i) {
        const expectedSize = TEXTURE_FORMAT_SPECS[i].bytes;
        expect(glTexelSize(TEXTURE_FORMAT_SPECS[i].id)).toBe(expectedSize);
      }
    });

    test('glTexelType should return the GL data type for each format', () => {
      for (let i = 0; i < TEXTURE_FORMAT_SPECS.length; ++i) {
        const expectedType = TEXTURE_FORMAT_SPECS[i].type;
        expect(glTexelType(TEXTURE_FORMAT_SPECS[i].id)).toBe(expectedType);
      }
    });

    test('glClearType should return the GL clear data type for each format', () => {
      for (let i = 0; i < TEXTURE_FORMAT_SPECS.length; ++i) {
        const expectedType = TEXTURE_FORMAT_SPECS[i].clear;
        expect(glClearType(TEXTURE_FORMAT_SPECS[i].id)).toBe(expectedType);
      }
    });
  });
});
