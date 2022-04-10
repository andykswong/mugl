export declare const MAX_SAFE_GENERATION: number;
export declare const UNIT_GENERATION: number;
/** Creates a generational index ID from index and generation parts. */
export declare function create(index: number, generation: number): number;
/** Returns the index part (lower 32bit) of a generational index ID. */
export declare function indexOf(id: number): number;
/** Returns the generation part (upper 21bit) of a generational index ID. */
export declare function generationOf(id: number): number;
//# sourceMappingURL=id.d.ts.map