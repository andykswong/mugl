export const MAX_SAFE_GENERATION = (1 << 21) - 1;
export const UNIT_GENERATION = 2 ** 32;

/** Creates a generational index ID from index and generation parts. */
export function create(index: number, generation: number): number {
  return ((generation & MAX_SAFE_GENERATION) * UNIT_GENERATION + (index >>> 0));
}

/** Returns the index part (lower 32bit) of a generational index ID. */
export function indexOf(id: number): number {
  return id >>> 0;
}

/** Returns the generation part (upper 21bit) of a generational index ID. */
export function generationOf(id: number): number {
  return (id / UNIT_GENERATION) & MAX_SAFE_GENERATION;
}
