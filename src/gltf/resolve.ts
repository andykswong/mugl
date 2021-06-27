import { GlTF } from './spec/glTF2';
import { parseGLB } from './glb';
import { GlTFFile, ResolvedBuffers, ResolvedGlTF, ResolvedImages, GlTFResourceLoader } from './types';
import { getBaseUrl, getExtras, resolveRelativeUri } from './utils';

/**
 * Fetch and resolve external resources of a GlTF model.
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
    for (let i = 0; i < glTF.buffers?.length || 0; ++i) {
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
    for (let i = 0; i < glTF.bufferViews?.length || 0; ++i) {
      const bufferView = glTF.bufferViews[i];
      if (getExtras(bufferView).bufferView) {
        continue;
      }

      const buffer = glTF.buffers?.[bufferView.buffer];
      if (!buffer) {
        throw new Error('Invalid glTF: invalid buffer for bufferView ' + i);
      }
      const bufferData = <Uint8Array>getExtras(buffer).buffer;
      const bufferViewData = new Uint8Array(
        bufferData.buffer, (bufferData.byteOffset || 0) + (bufferView.byteOffset || 0), bufferView.byteLength);

      getExtras(bufferView).bufferView = bufferViewData;
    }
  }

  return <T & ResolvedBuffers>glTF;
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

        const blob = new Blob([ <Uint8Array>getExtras(bufferViewObj).bufferView ], { type: image.mimeType });
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
