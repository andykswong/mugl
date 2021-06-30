import { GlTF } from './spec/glTF2';
import { parseGLB } from './glb';
import { GlTFFile, ResolvedBuffers, ResolvedGlTF, ResolvedImages, GlTFResourceLoader } from './types';
import { getBaseUrl, resolveRelativeUri } from './utils';
import { getAccessorElementSize, getExtras } from './gltf-utils';
import { GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT } from '../device';

/**
 * Fetch a GlTF model and resolve its external resources (binary buffers and images).
 */
export async function resolveGlTF(
  file: GlTFFile,
  loader: GlTFResourceLoader = glTFResourceFetch
): Promise<ResolvedGlTF> {
  const baseUrl = file.uri ? getBaseUrl(file.uri) : '';
  let glTF: GlTF | undefined = file.glTF;
  let binaryChunk: Uint8Array | undefined = file.binaryChunk;

  if (!glTF && file.uri) {
    const isGLB = file.uri.match(/\.glb$/);
    if (isGLB) {
      const glTFContent = parseGLB(await loader(file.uri, 'bin'));
      glTF = glTFContent.glTF;
      binaryChunk = glTFContent.binaryChunk;
    } else {
      glTF = JSON.parse(await loader(file.uri, 'str'));
    }
  }

  if (!glTF) {
    throw new Error('Failed to load glTF JSON');
  }

  const resolvedGlTF = await resolveBuffers(glTF, binaryChunk, loader, baseUrl);
  return await resolveImages(resolvedGlTF, loader, baseUrl);
}

export function glTFResourceFetch(uri: string, type: 'bin'): Promise<Uint8Array>;
export function glTFResourceFetch(uri: string, type: 'img'): Promise<TexImageSource>;
export function glTFResourceFetch(uri: string, type: 'str'): Promise<string>;
export function glTFResourceFetch(uri: string, type: 'bin' | 'img' | 'str'): Promise<Uint8Array | TexImageSource | string> {
  if (type === 'bin') {
    return fetch(uri)
      .then(data => data.arrayBuffer())
      .then(buffer => new Uint8Array(buffer));
  }
  if (type === 'img') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => reject(new Error('Failed to load: ' + uri));
      img.onload = () => resolve(img);
      img.src = uri;
    });
  }

  // return string by default
  return fetch(uri).then(data => data.text());
}

async function resolveBuffers<T extends GlTF>(
  glTF: T, binaryChunk: Uint8Array | undefined, loader: GlTFResourceLoader, baseUrl: string
): Promise<T & ResolvedBuffers> {
  if (glTF.buffers) {
    for (let i = 0; i < glTF.buffers.length; ++i) {
      const buffer = glTF.buffers[i];
      if (getExtras(buffer).buffer) {
        continue;
      }

      let bufferData: Uint8Array;
      const uri = buffer.uri;
      if (!uri) {
        if (i !== 0 || !binaryChunk) {
          throw new Error('Invalid glTF: missing uri for buffer ' + i);
        }
        bufferData = binaryChunk;
      } else {
        bufferData = await loader(resolveRelativeUri(uri, baseUrl), 'bin');
      }

      getExtras(buffer).buffer = bufferData;
    }
  }

  if (glTF.bufferViews) {
    for (let i = 0; i < glTF.bufferViews.length; ++i) {
      const bufferView = glTF.bufferViews[i];
      if (getExtras(bufferView).buffer) {
        continue;
      }

      const buffer = glTF.buffers?.[bufferView.buffer];
      if (!buffer) {
        throw new Error('Invalid glTF: invalid buffer for bufferView ' + i);
      }
      const bufferData = <Uint8Array>getExtras(buffer).buffer;
      const bufferViewData = new Uint8Array(
        bufferData.buffer, (bufferData.byteOffset || 0) + (bufferView.byteOffset || 0), bufferView.byteLength);

      getExtras(bufferView).buffer = bufferViewData;
    }
  }

  resolveAccessors(glTF);

  return <T & ResolvedBuffers>glTF;
}

function resolveAccessors<T extends GlTF>(glTF: T): void {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */ 
  if (glTF.accessors) {
    for (let i = 0; i < glTF.accessors.length; ++i) {
      const accessor = glTF.accessors[i];
      if (getExtras(accessor).buffer) {
        continue;
      }

      let buffer: Uint8Array | null = null;
      let byteOffset = 0;
      const elementSize = getAccessorElementSize(accessor);
      let bufferLength = accessor.count * elementSize;

      // Resolve buffer from bufferView
      const bufferView = glTF.bufferViews?.[accessor.bufferView!];
      if (bufferView) {
        const bufferViewData = <Uint8Array>getExtras(bufferView).buffer;
        const alignment = bufferView.byteStride || 1;

        byteOffset = (accessor.byteOffset || 0) % alignment;
        bufferLength = accessor.count * (bufferView.byteStride || elementSize);

        const bufferOffset = (accessor.byteOffset || 0) - byteOffset;

        buffer = new Uint8Array(bufferViewData.buffer, bufferViewData.byteOffset + bufferOffset, bufferLength);
      }

      // Resolve sparse accessor
      if (accessor.sparse) {
        const {
          count,
          indices: { bufferView: indexViewId, byteOffset: indexViewOffset = 0, componentType },
          values: { bufferView: valueViewId, byteOffset: valueViewOffset = 0 }
        } = accessor.sparse;
        const indexView = glTF.bufferViews?.[indexViewId!];
        const valueView = glTF.bufferViews?.[valueViewId!];

        if (indexView && valueView) {
          const sparseBuffer = new Uint8Array(bufferLength);
          if (buffer) {
            sparseBuffer.set(buffer, byteOffset);
          }

          const indexBuffer = <Uint8Array>getExtras(indexView).buffer;
          const valueBuffer = <Uint8Array>getExtras(valueView).buffer;
          const IndexBufferType = componentType === GL_UNSIGNED_BYTE ? Uint8Array : componentType === GL_UNSIGNED_SHORT ? Uint16Array : Uint32Array;
          const indices = new IndexBufferType(indexBuffer.buffer, indexBuffer.byteOffset + indexViewOffset, count);
          const values = new Uint8Array(valueBuffer.buffer, valueBuffer.byteOffset + valueViewOffset, count);
          for (let j = 0; j < count; ++j) {
            const index = indices[j] * elementSize;
            for (let k = 0; k < elementSize; ++k) {
              sparseBuffer[index + k] = values[j * elementSize + k];
            }
          }

          // Use the sparse buffer instead of underlying buffer view
          byteOffset = 0;
          buffer = sparseBuffer;
        }
      }

      if (!buffer) {
        throw new Error('Invalid glTF: invalid accessor ' + i);
      }

      getExtras(accessor).buffer = buffer;
      getExtras(accessor).byteOffset = byteOffset;
    }
  }
  /* eslint-enable */
}

async function resolveImages<T extends GlTF & ResolvedBuffers>(
  glTF: T, loader: GlTFResourceLoader, baseUrl: string
): Promise<T & ResolvedImages> {
  if (glTF.images) {
    for (let i = 0; i < glTF.images.length; ++i) {
      const image = glTF.images[i];
      if (getExtras(image).image) {
        continue;
      }

      const bufferView = image.bufferView;
      let isObjectURL = false;
      let uri = image.uri;
      let imageData: TexImageSource;

      if (bufferView) {
        const bufferViewObj = glTF.bufferViews?.[bufferView];
        if (!bufferViewObj) {
          throw new Error('Invalid glTF: invalid bufferView for image ' + i);
        }

        const blob = new Blob([ <Uint8Array>getExtras(bufferViewObj).buffer ], { type: image.mimeType });
        uri = URL.createObjectURL(blob);
        isObjectURL = true;
      }

      if (uri) {
        try {
          imageData = await loader(resolveRelativeUri(uri, baseUrl), 'img');
        } finally {
          if (isObjectURL) {
            URL.revokeObjectURL(uri);
          }
        }
      } else {
        throw new Error('Invalid glTF: missing uri or bufferView for image ' + i);
      }

      getExtras(image).image = imageData;
    }
  }

  return <T & ResolvedImages>glTF;
}
