import { Int } from 'munum';
import { IndexFormat, PixelFormat, TexType, VertexFormat } from '../enums';
import { GL_BYTE, GL_DEPTH_COMPONENT, GL_DEPTH_COMPONENT16, GL_DEPTH_STENCIL, GL_FLOAT, GL_HALF_FLOAT, GL_HALF_FLOAT_OES, GL_R16F, GL_R32F, GL_RED, GL_RG, GL_RG16F, GL_RG32F, GL_RGBA, GL_RGBA16F, GL_RGBA32F, GL_RGBA8, GL_SHORT, GL_UNSIGNED_BYTE, GL_UNSIGNED_INT, GL_UNSIGNED_INT_24_8_WEBGL, GL_UNSIGNED_SHORT } from '../glenums';
import { glTexFormat, glTexInternalFormat, glTexType, hasStencil, indexSize, is3DTexture, isDepthStencil, vertexByteSize, vertexNormalized, vertexSize, vertexType } from '../utils';

class VertexFormatSpec {
  id: VertexFormat = VertexFormat.Float;
  bytes: Int = 0;
  size: Int = 0;
  type: Int = 0;
  norm: boolean = false;
}

const VERTEX_FORMAT_SPECS: VertexFormatSpec[] = [
  { id: VertexFormat.Float, bytes: 4, size: 1, type: GL_FLOAT, norm: false },
  { id: VertexFormat.Float2, bytes: 8, size: 2, type: GL_FLOAT, norm: false },
  { id: VertexFormat.Float3, bytes: 12, size: 3, type: GL_FLOAT, norm: false },
  { id: VertexFormat.Float4, bytes: 16, size: 4, type: GL_FLOAT, norm: false },

  { id: VertexFormat.Char2, bytes: 2, size: 2, type: GL_BYTE, norm: false },
  { id: VertexFormat.Char2N, bytes: 2, size: 2, type: GL_BYTE, norm: true },
  { id: VertexFormat.Char4, bytes: 4, size: 4, type: GL_BYTE, norm: false },
  { id: VertexFormat.Char4N, bytes: 4, size: 4, type: GL_BYTE, norm: true },

  { id: VertexFormat.UChar2, bytes: 2, size: 2, type: GL_UNSIGNED_BYTE, norm: false },
  { id: VertexFormat.UChar2N, bytes: 2, size: 2, type: GL_UNSIGNED_BYTE, norm: true },
  { id: VertexFormat.UChar4, bytes: 4, size: 4, type: GL_UNSIGNED_BYTE, norm: false },
  { id: VertexFormat.UChar4N, bytes: 4, size: 4, type: GL_UNSIGNED_BYTE, norm: true },

  { id: VertexFormat.Short2, bytes: 4, size: 2, type: GL_SHORT, norm: false },
  { id: VertexFormat.Short2N, bytes: 4, size: 2, type: GL_SHORT, norm: true },
  { id: VertexFormat.Short4, bytes: 8, size: 4, type: GL_SHORT, norm: false },
  { id: VertexFormat.Short4N, bytes: 8, size: 4, type: GL_SHORT, norm: true },

  { id: VertexFormat.UShort2, bytes: 4, size: 2, type: GL_UNSIGNED_SHORT, norm: false },
  { id: VertexFormat.UShort2N, bytes: 4, size: 2, type: GL_UNSIGNED_SHORT, norm: true },
  { id: VertexFormat.UShort4, bytes: 8, size: 4, type: GL_UNSIGNED_SHORT, norm: false },
  { id: VertexFormat.UShort4N, bytes: 8, size: 4, type: GL_UNSIGNED_SHORT, norm: true },
];

class PixelFormatSpec {
  id: PixelFormat = PixelFormat.RGBA8;
  format: Int = 0;
  internal: Int = 0;
  type: Int = 0;
  depth: boolean = false;
  stencil: boolean = false;
}

const PIXEL_FORMAT_SPECS: PixelFormatSpec[] = [
  { id: PixelFormat.Depth, format: GL_DEPTH_COMPONENT, internal: GL_DEPTH_COMPONENT16, type: GL_UNSIGNED_INT, depth: true, stencil: false },
  { id: PixelFormat.Stencil, format: GL_DEPTH_STENCIL, internal: GL_DEPTH_STENCIL, type: GL_UNSIGNED_INT_24_8_WEBGL, depth: false, stencil: true },
  { id: PixelFormat.DepthStencil, format: GL_DEPTH_STENCIL, internal: GL_DEPTH_STENCIL, type: GL_UNSIGNED_INT_24_8_WEBGL, depth: true, stencil: true },
  { id: PixelFormat.RGBA8, format: GL_RGBA, internal: GL_RGBA8, type: GL_UNSIGNED_BYTE, depth: false, stencil: false },
  { id: PixelFormat.RGBA32F, format: GL_RGBA, internal: GL_RGBA32F, type: GL_FLOAT, depth: false, stencil: false },
  { id: PixelFormat.RGBA16F, format: GL_RGBA, internal: GL_RGBA16F, type: GL_HALF_FLOAT_OES, depth: false, stencil: false },
  { id: PixelFormat.R32F, format: GL_RED, internal: GL_R32F, type: GL_FLOAT, depth: false, stencil: false },
  { id: PixelFormat.R16F, format: GL_RED, internal: GL_R16F, type: GL_HALF_FLOAT_OES, depth: false, stencil: false },
  { id: PixelFormat.RG32F, format: GL_RG, internal: GL_RG32F, type: GL_FLOAT, depth: false, stencil: false },
  { id: PixelFormat.RG16F, format: GL_RG, internal: GL_RG16F, type: GL_HALF_FLOAT_OES, depth: false, stencil: false },
];

describe('utils', () => {
  test('is3DTexture should only return true for 3D and 2D array types', () => {
    expect(is3DTexture(TexType.Tex2D)).toBe(false);
    expect(is3DTexture(TexType.Cube)).toBe(false);
    expect(is3DTexture(TexType.Array)).toBe(true);
    expect(is3DTexture(TexType.Tex3D)).toBe(true);
  });

  test('indexSize should return the byte size for each format', () => {
    expect(indexSize(IndexFormat.UInt16)).toBe(2);
    expect(indexSize(IndexFormat.UInt32)).toBe(4);
  });

  describe('vertex format', () => {

    test('vertexByteSize should return the byte size for each format', () => {
      for (let i = 0; i < VERTEX_FORMAT_SPECS.length; ++i) {
        expect(vertexByteSize(VERTEX_FORMAT_SPECS[i].id)).toBe(VERTEX_FORMAT_SPECS[i].bytes);
      }
    });

    test('vertexSize should return the component size for each format', () => {
      for (let i = 0; i < VERTEX_FORMAT_SPECS.length; ++i) {
        expect(vertexSize(VERTEX_FORMAT_SPECS[i].id)).toBe(VERTEX_FORMAT_SPECS[i].size);
      }
    });

    test('vertexType should return the GL data type for each format', () => {
      for (let i = 0; i < VERTEX_FORMAT_SPECS.length; ++i) {
        expect(vertexType(VERTEX_FORMAT_SPECS[i].id)).toBe(VERTEX_FORMAT_SPECS[i].type);
      }
    });

    test('vertexNormalized should return true only for normalized formats', () => {
      for (let i = 0; i < VERTEX_FORMAT_SPECS.length; ++i) {
        expect(vertexNormalized(VERTEX_FORMAT_SPECS[i].id)).toBe(VERTEX_FORMAT_SPECS[i].norm);
      }
    });
  });

  describe('pixel format', () => {
    test('isDepthStencil should only return true for depth and/or stencil formats', () => {
      for (let i = 0; i < PIXEL_FORMAT_SPECS.length; ++i) {
        expect(isDepthStencil(PIXEL_FORMAT_SPECS[i].id)).toBe(PIXEL_FORMAT_SPECS[i].depth || PIXEL_FORMAT_SPECS[i].stencil);
      }
    });

    test('hasStencil should only return true for stencil formats', () => {
      for (let i = 0; i < PIXEL_FORMAT_SPECS.length; ++i) {
        expect(hasStencil(PIXEL_FORMAT_SPECS[i].id)).toBe(PIXEL_FORMAT_SPECS[i].stencil);
      }
    });

    test('glTexInternalFormat should return the GL internal format for WebGL1 for each depth/stencil format', () => {
      for (let i = 0; i < PIXEL_FORMAT_SPECS.length; ++i) {
        if (PIXEL_FORMAT_SPECS[i].depth || PIXEL_FORMAT_SPECS[i].stencil) {
          const expectedFormat = PIXEL_FORMAT_SPECS[i].internal;
          expect(glTexInternalFormat(PIXEL_FORMAT_SPECS[i].id)).toBe(expectedFormat);
          expect(glTexInternalFormat(PIXEL_FORMAT_SPECS[i].id, false)).toBe(expectedFormat);
        }
      }
    });

    test('glTexInternalFormat should return the GL texture format for WebGL1 for each color format', () => {
      for (let i = 0; i < PIXEL_FORMAT_SPECS.length; ++i) {
        if (!PIXEL_FORMAT_SPECS[i].depth && !PIXEL_FORMAT_SPECS[i].stencil) {
          const expectedFormat = PIXEL_FORMAT_SPECS[i].format;
          expect(glTexInternalFormat(PIXEL_FORMAT_SPECS[i].id)).toBe(expectedFormat);
          expect(glTexInternalFormat(PIXEL_FORMAT_SPECS[i].id, false)).toBe(expectedFormat);
        }
      }
    });

    test('glTexInternalFormat should return the GL internal format for WebGL2 for each format', () => {
      for (let i = 0; i < PIXEL_FORMAT_SPECS.length; ++i) {
        expect(glTexInternalFormat(PIXEL_FORMAT_SPECS[i].id, true)).toBe(PIXEL_FORMAT_SPECS[i].internal);
      }
    });

    test('glTexFormat should return the GL texture format for each format', () => {
      for (let i = 0; i < PIXEL_FORMAT_SPECS.length; ++i) {
        expect(glTexFormat(PIXEL_FORMAT_SPECS[i].id)).toBe(PIXEL_FORMAT_SPECS[i].format);
      }
    });

    test('glTexType should return the WebGL1 data type for each format', () => {
      for (let i = 0; i < PIXEL_FORMAT_SPECS.length; ++i) {
        const expectedType = PIXEL_FORMAT_SPECS[i].type;
        expect(glTexType(PIXEL_FORMAT_SPECS[i].id)).toBe(expectedType);
        expect(glTexType(PIXEL_FORMAT_SPECS[i].id, false)).toBe(expectedType);
      }
    });

    test('glTexType should return the WebGL2 data type for each format', () => {
      for (let i = 0; i < PIXEL_FORMAT_SPECS.length; ++i) {
        let expectedType = PIXEL_FORMAT_SPECS[i].type;
        if (expectedType === GL_HALF_FLOAT_OES) {
          expectedType = GL_HALF_FLOAT; // WebGL2 uses a different value for half float
        }
        expect(glTexType(PIXEL_FORMAT_SPECS[i].id, true)).toBe(expectedType);
      }
    });
  });
});
