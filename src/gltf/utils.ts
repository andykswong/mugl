/**
 * Decodes a buffer into string.
 * This uses TextDecoder, which can be polyfilled as per:
 * https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#polyfill
 */
export function decodeText(data: BufferSource): string {
  return new TextDecoder().decode(data);
}

/**
 * Check if URI is a data or blob URI.
 */
export function isDataUri(uri: string): boolean {
  return /^data:.*,.*$/i.test(uri) /* Data URI */ ||
    /^blob:.*$/i.test(uri) /* Blob URI */;
}

/**
 * Extract the base part of a URL.
 */
export function getBaseUrl(url: string): string {
  if (isDataUri(url)) {
    return '';
  }

  const parts = url.split('/');
  parts.pop();
  return parts.length ? parts.join('/') + '/' : '';
}

/**
 * Resolve relative URIs into absolute path.
 */
export function resolveRelativeUri(uri: string, baseUri: string): string {
  if (uri === '') {
    return '';
  }

  if (
    /^(https?:)?\/\//i.test(uri) /* Absolute HTTP URL */ ||
    isDataUri(uri) /* Data URI */
  ) {
    return uri;
  }

  // Relative path
  return baseUri + uri;
}
