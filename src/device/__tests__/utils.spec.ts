import { IndexFormat, PixelFormat, TexType, VertexFormat } from '../enums';
import { GL_BYTE, GL_DEPTH_COMPONENT, GL_DEPTH_COMPONENT16, GL_DEPTH_STENCIL, GL_FLOAT, GL_HALF_FLOAT, GL_HALF_FLOAT_OES, GL_R16F, GL_R32F, GL_RED, GL_RG, GL_RG16F, GL_RG32F, GL_RGBA, GL_RGBA16F, GL_RGBA32F, GL_RGBA8, GL_SHORT, GL_UNSIGNED_BYTE, GL_UNSIGNED_INT, GL_UNSIGNED_INT_24_8_WEBGL, GL_UNSIGNED_SHORT } from '../glenums';
import { glTexFormat, glTexInternalFormat, glTexType, hasStencil, indexSize, is3DTexture, isDepthStencil, vertexByteSize, vertexNormalized, vertexSize, vertexType } from '../utils';

describe('utils', () => {
  const TEX_TYPES_3D: TexType[] = [TexType.Array, TexType.Tex3D];

  test('is3DTexture should only return true for 3D and 2D array types', () => {
    for (const type of Object.values(TexType)) {
      expect(is3DTexture(type)).toBe(TEX_TYPES_3D.includes(type));
    }
  });

  test('indexSize should return the byte size for each format', () => {
    expect(indexSize(IndexFormat.UInt16)).toBe(2);
    expect(indexSize(IndexFormat.UInt32)).toBe(4);
  });

  describe('vertex format', () => {
    const VERTEX_FORMAT_INFO: Readonly<Record<VertexFormat, { bytes: number, size: number, type: GLenum, norm: boolean }>> = {
      [VertexFormat.Float]: { bytes: 4, size: 1, type: GL_FLOAT, norm: false },
      [VertexFormat.Float2]: { bytes: 8, size: 2, type: GL_FLOAT, norm: false },
      [VertexFormat.Float3]: { bytes: 12, size: 3, type: GL_FLOAT, norm: false },
      [VertexFormat.Float4]: { bytes: 16, size: 4, type: GL_FLOAT, norm: false },
      [VertexFormat.Char4]: { bytes: 4, size: 4, type: GL_BYTE, norm: false },
      [VertexFormat.Char4N]: { bytes: 4, size: 4, type: GL_BYTE, norm: true },
      [VertexFormat.UChar4]: { bytes: 4, size: 4, type: GL_UNSIGNED_BYTE, norm: false },
      [VertexFormat.UChar4N]: { bytes: 4, size: 4, type: GL_UNSIGNED_BYTE, norm: true },
      [VertexFormat.Short2]: { bytes: 4, size: 2, type: GL_SHORT, norm: false },
      [VertexFormat.Short2N]: { bytes: 4, size: 2, type: GL_SHORT, norm: true },
      [VertexFormat.Short4]: { bytes: 8, size: 4, type: GL_SHORT, norm: false },
      [VertexFormat.Short4N]: { bytes: 8, size: 4, type: GL_SHORT, norm: true },
      [VertexFormat.UShort2]: { bytes: 4, size: 2, type: GL_UNSIGNED_SHORT, norm: false },
      [VertexFormat.UShort2N]: { bytes: 4, size: 2, type: GL_UNSIGNED_SHORT, norm: true },
      [VertexFormat.UShort4]: { bytes: 8, size: 4, type: GL_UNSIGNED_SHORT, norm: false },
      [VertexFormat.UShort4N]: { bytes: 8, size: 4, type: GL_UNSIGNED_SHORT, norm: true },
    };

    test('vertexByteSize should return the byte size for each format', () => {
      for (const type of Object.values(VertexFormat)) {
        expect(vertexByteSize(type)).toBe(VERTEX_FORMAT_INFO[type].bytes);
      }
    });

    test('vertexSize should return the component size for each format', () => {
      for (const type of Object.values(VertexFormat)) {
        expect(vertexSize(type)).toBe(VERTEX_FORMAT_INFO[type].size);
      }
    });

    test('vertexType should return the GL data type for each format', () => {
      for (const type of Object.values(VertexFormat)) {
        expect(vertexType(type)).toBe(VERTEX_FORMAT_INFO[type].type);
      }
    });

    test('vertexNormalized should return true only for normalized formats', () => {
      for (const type of Object.values(VertexFormat)) {
        expect(vertexNormalized(type)).toBe(VERTEX_FORMAT_INFO[type].norm);
      }
    });
  });

  describe('pixel format', () => {
    const DEPTH_FORMATS: PixelFormat[] = [PixelFormat.Depth, PixelFormat.DepthStencil];
    const STENCIL_FORMATS: PixelFormat[] = [PixelFormat.Stencil, PixelFormat.DepthStencil];
    const PIXEL_FORMAT_INFO: Readonly<Record<PixelFormat, { format: GLenum, internal: GLenum, type: GLenum }>> = {
      [PixelFormat.Depth]: { format: GL_DEPTH_COMPONENT, internal: GL_DEPTH_COMPONENT16, type: GL_UNSIGNED_INT },
      [PixelFormat.Stencil]: { format: GL_DEPTH_STENCIL, internal: GL_DEPTH_STENCIL, type: GL_UNSIGNED_INT_24_8_WEBGL },
      [PixelFormat.DepthStencil]: { format: GL_DEPTH_STENCIL, internal: GL_DEPTH_STENCIL, type: GL_UNSIGNED_INT_24_8_WEBGL },
      [PixelFormat.RGBA8]: { format: GL_RGBA, internal: GL_RGBA8, type: GL_UNSIGNED_BYTE },
      [PixelFormat.RGBA32F]: { format: GL_RGBA, internal: GL_RGBA32F, type: GL_FLOAT },
      [PixelFormat.RGBA16F]: { format: GL_RGBA, internal: GL_RGBA16F, type: GL_HALF_FLOAT_OES },
      [PixelFormat.R32F]: { format: GL_RED, internal: GL_R32F, type: GL_FLOAT },
      [PixelFormat.R16F]: { format: GL_RED, internal: GL_R16F, type: GL_HALF_FLOAT_OES },
      [PixelFormat.RG32F]: { format: GL_RG, internal: GL_RG32F, type: GL_FLOAT },
      [PixelFormat.RG16F]: { format: GL_RG, internal: GL_RG16F, type: GL_HALF_FLOAT_OES },
    };

    test('isDepthStencil should only return true for depth and/or stencil formats', () => {
      for (const type of Object.values(PixelFormat)) {
        expect(isDepthStencil(type)).toBe(DEPTH_FORMATS.includes(type) || STENCIL_FORMATS.includes(type));
      }
    });

    test('hasStencil should only return true for stencil formats', () => {
      for (const type of Object.values(PixelFormat)) {
        expect(hasStencil(type)).toBe(STENCIL_FORMATS.includes(type));
      }
    });

    test('glTexInternalFormat should return the GL internal format for WebGL1 for each depth/stencil format', () => {
      for (const type of Object.values(PixelFormat)) {
        if (DEPTH_FORMATS.includes(type) || STENCIL_FORMATS.includes(type)) {
          const expectedFormat = PIXEL_FORMAT_INFO[type].internal;
          expect(glTexInternalFormat(type)).toBe(expectedFormat);
          expect(glTexInternalFormat(type, false)).toBe(expectedFormat);
        }
      }
    });

    test('glTexInternalFormat should return the GL texture format for WebGL1 for each color format', () => {
      for (const type of Object.values(PixelFormat)) {
        if (!DEPTH_FORMATS.includes(type) && !STENCIL_FORMATS.includes(type)) {
          const expectedFormat = PIXEL_FORMAT_INFO[type].format;
          expect(glTexInternalFormat(type)).toBe(expectedFormat);
          expect(glTexInternalFormat(type, false)).toBe(expectedFormat);
        }
      }
    });

    test('glTexInternalFormat should return the GL internal format for WebGL2 for each format', () => {
      for (const type of Object.values(PixelFormat)) {
        expect(glTexInternalFormat(type, true)).toBe(PIXEL_FORMAT_INFO[type].internal);
      }
    });

    test('glTexFormat should return the GL texture format for each format', () => {
      for (const type of Object.values(PixelFormat)) {
        expect(glTexFormat(type)).toBe(PIXEL_FORMAT_INFO[type].format);
      }
    });

    test('glTexType should return the WebGL1 data type for each format', () => {
      for (const type of Object.values(PixelFormat)) {
        const expectedType = PIXEL_FORMAT_INFO[type].type;
        expect(glTexType(type)).toBe(expectedType);
        expect(glTexType(type, false)).toBe(expectedType);
      }
    });

    test('glTexType should return the WebGL2 data type for each format', () => {
      for (const type of Object.values(PixelFormat)) {
        let expectedType = PIXEL_FORMAT_INFO[type].type;
        if (expectedType === GL_HALF_FLOAT_OES) {
          expectedType = GL_HALF_FLOAT; // WebGL2 uses a different value for half float
        }
        expect(glTexType(type, true)).toBe(expectedType);
      }
    });
  });
});
