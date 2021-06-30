import { Accessor, Buffer, BufferView, Extras, GlTF, Image } from './spec/glTF2';

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

  /**
   * Loads a file as string.
   * @param uri URI to load. This can be a relative, absolute, data or blob URI
   * @returns a promise containing the file content as string
   */
  (uri: string, type: 'str'): Promise<string>;
}

/**
 * A GlTF accessor object with buffer data resolved and stored in extra.buffer.
 */
 export type ResolvedAccessor = Accessor & {
  extras: Extras & {
    /** The byte offset into the resolved buffer. This is for alignment with buffer stride size for buffer sharing. */
    byteOffset: number;

    /**
     * The resolved buffer data, which can be a view of underlying buffer, or a new buffer for sparse data.
     */
    buffer: Uint8Array;
  };
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
 * A GlTF bufferView object with the buffer data resolved and stored in extra.buffer.
 */
 export type ResolvedBufferView = BufferView & {
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
   * An array of accessors
   */
  accessors: [ResolvedAccessor, ...ResolvedAccessor[]];

  /**
   * An array of buffers.
   */
  buffers?: [ResolvedBuffer, ...ResolvedBuffer[]];

  /**
   * An array of bufferViews.
   */
  bufferViews?: [ResolvedBufferView, ...ResolvedBufferView[]];
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
