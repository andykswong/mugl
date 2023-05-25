import * as GLenum from './gl-const';
import { VertexAttribute, VertexBufferFormats, VertexBufferLayout } from './descriptor';
import { UInt } from './primitive';
import { IndexFormat, TextureDimension, TextureFormat, VertexFormat, VertexStepMode } from './type';

/**
 * Checks if given texture type is a 3D or 2D array texture.
 * @internal
 * @param dimension texture dimension
 * @return whether the texture type is 3D
 */
export function is3DTexture(dimension: TextureDimension): boolean {
  return dimension === GLenum.TEXTURE_3D || dimension === GLenum.TEXTURE_2D_ARRAY;
}

/**
 * Returns the byte size of a index format.
 * @internal
 * @param format index format
 * @returns byte size of the format
 */
export function indexByteSize(format: IndexFormat): UInt {
  return format === GLenum.UNSIGNED_SHORT ? 2 : 4;
}

/**
 * Returns the byte size of a vertex format.
 * @internal
 * @param format vertex format
 * @returns byte size
 */
export function vertexByteSize(format: VertexFormat): UInt {
  return ((format >> 4) & 0xF) * vertexSize(format);
}

/**
 * Returns the number of components of a vertex format.
 * @internal
 * @param format vertex format
 * @returns number of components
 */
 export function vertexSize(format: VertexFormat): UInt {
  return format & 0xF;
}

/**
 * Returns the data type of a vertex format.
 * @internal
 * @param format vertex format
 * @returns GL data type
 */
export function vertexType(format: VertexFormat): UInt {
  switch ((format >> 4) & 0x1FF) {
    case 0x024:
      return GLenum.FLOAT;
    case 0x022:
      return GLenum.HALF_FLOAT;
    case 0x112:
      return GLenum.SHORT;
    case 0x111:
      return GLenum.BYTE;
    case 0x012:
      return GLenum.UNSIGNED_SHORT;
    case 0x011:
      return GLenum.UNSIGNED_BYTE;
  }

  return GLenum.NONE;
}

/**
 * Returns if a vertex format is normalized.
 * @internal
 * @param format vertex format
 * @returns number of components
 */
export function vertexNormalized(format: VertexFormat): boolean {
  return !!(format >> 13);
}

/**
 * Auto-calculates the offsets, strides, shaderLocation for given attribute formats.
 * @param buffers the buffer layouts
 * @return the calculated vertex buffer layout 
 */
export function vertexBufferLayouts(buffers: VertexBufferFormats[]): VertexBufferLayout[] {
  let shaderLocation = 0;
  const result: VertexBufferLayout[] = [];
  for (let i = 0; i < buffers.length; ++i) {
    const attributes: VertexAttribute[] = [];
    let stride = 0;
    for (let j = 0; j < buffers[i].attributes.length; ++j) {
      const format = buffers[i].attributes[j];
      attributes.push({
        format,
        offset: stride,
        shaderLocation,
      });
      stride += vertexByteSize(format);
      ++shaderLocation;
    }
    result.push({
      attributes,
      stride,
      stepMode: buffers[i].instanced ? VertexStepMode.Instance : VertexStepMode.Vertex,
    });
  }

  return result;
}

/**
 * Checks if given texture format is a depth/stencil format.
 * @internal
 * @param format texture format
 * @returns whether the texture format is a depth/stencil format
 */
 export function isDepthStencil(format: TextureFormat): boolean {
  switch (format) {
    case GLenum.DEPTH_COMPONENT16:
    case GLenum.DEPTH_COMPONENT24:
    case GLenum.DEPTH24_STENCIL8:
    case GLenum.DEPTH_COMPONENT32F:
    case GLenum.DEPTH32F_STENCIL8:
      return true;
  }
  return false;
}

/**
 * Checks if given texture format has stencil component.
 * @internal
 * @param format texture format
 * @returns whether the texture format has stencil component
 */
export function hasStencil(format: TextureFormat): boolean {
  switch (format) {
    case GLenum.DEPTH24_STENCIL8:
    case GLenum.DEPTH32F_STENCIL8:
      return true;
  }
  return false;
}
