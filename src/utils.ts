/**
 * An array-like object of number.
 */
export interface NumberArray {
  [index: number]: number;
  readonly length: number;
}

/**
 * Shallow-copy elements from one array to another, and returns the destination array.
 */
export function arrayCopy<T extends NumberArray>(
  out: T, src: Readonly<NumberArray>, outOffset = 0, srcOffset = 0, count = Math.min(src.length - srcOffset, out.length - outOffset)
): T {
  for (let i = 0; i < count; ++i) {
    out[outOffset + i] = src[srcOffset + i];
  }
  return out;
}
