import { Buffer, Extras, GlTF, Image } from '../gltf-spec/glTF2';
export { GlTF } from '../gltf-spec/glTF2';

/**
 * Specifies a GlTF file, either by URI, or the GlTF JSON content (and optionally binary chunk for GLB).
 */
export type GlTFFile = {
  glTF?: GlTF;
  binaryChunk?: Uint8Array;
  uri?: string;
};

/**
 * A GlTF resource loader function.
 */
export interface GlTFResourceLoader {
  /**
   * Loads a file as binary buffer.
   * @param uri URI to load. This can be a relative, absolute, data or blob URI
   * @returns a promise containing a Uint8Array of the file content
   */
  (uri: string, type: 'bin'): Promise<Uint8Array>;

  /**
   * Loads a file as TexImageSource.
   * @param uri URI to load. This can be a relative, absolute, data or blob URI
   * @returns a promise containing the image data
   */
  (uri: string, type: 'img'): Promise<TexImageSource>;
}

/**
 * A GlTF buffer object with the buffer data resolved and stored in extra.buffer.
 */
export type ResolvedBuffer = Buffer & {
  extras: Extras & {
    /** The resolved buffer data */
    buffer: Uint8Array;
  };
}

/**
 * Resolved GlTF buffers.
 */
export interface ResolvedBuffers {
  /**
   * An array of buffers.
   */
  buffers?: [ResolvedBuffer, ...ResolvedBuffer[]];
}

/**
 * A GlTF image object with the image resolved and stored in extra.image.
 */
export type ResolvedImage = Image & {
  extras: Extras & {
    /** The resolved image */
    image: HTMLImageElement;
  };
}

/**
 * Resolved GlTF images.
 */
export interface ResolvedImages {
  /**
   * An array of images.
   */
  images?: [ResolvedImage, ...ResolvedImage[]];
}

/**
 * A GlTF model with external resources resolved.
 */
export type ResolvedGlTF = GlTF & ResolvedBuffers & ResolvedImages;
