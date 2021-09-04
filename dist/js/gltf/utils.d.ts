/**
 * Decodes a buffer into string.
 * This uses TextDecoder, which can be polyfilled as per:
 * https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#polyfill
 */
export declare function decodeText(data: BufferSource): string;
/**
 * Check if URI is a data or blob URI.
 */
export declare function isDataUri(uri: string): boolean;
/**
 * Extract the base part of a URL.
 */
export declare function getBaseUrl(url: string): string;
/**
 * Resolve relative URIs into absolute path.
 */
export declare function resolveRelativeUri(uri: string, baseUri: string): string;
//# sourceMappingURL=utils.d.ts.map