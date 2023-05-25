/**
 * Generational index ID, which consists of an index and a generation values combined as a single number.
 * @packageDocumentation
 */

export const MAX_SAFE_GENERATION = (1 << 21) - 1;
export const UNIT_GENERATION = 2 ** 32;

/** Creates a generational index ID from index and generation parts. */
export function create<T extends number = number>(index: number, generation: number): T {
  return ((generation & MAX_SAFE_GENERATION) * UNIT_GENERATION + (index >>> 0)) as T;
}

/** Returns the index part (lower 32bit) of a generational index ID. */
export function indexOf<T extends number = number>(id: T): number {
  return id >>> 0;
}

/** Returns the generation part (upper 21bit) of a generational index ID. */
export function generationOf<T extends number = number>(id: T): number {
  return (id / UNIT_GENERATION) & MAX_SAFE_GENERATION;
}
