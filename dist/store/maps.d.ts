/** Generational index map backend by a Map. */
export declare class GenIdMap<V> {
    private map;
    get size(): number;
    clear(): void;
    delete(id: number): boolean;
    entries(): Iterable<[number, V]>;
    forEach<C>(callbackFn: (value: V, id: number, self: GenIdMap<V>) => void, thisArg?: C): void;
    get(id: number): V | undefined;
    has(id: number): boolean;
    keys(): Iterable<number>;
    set(id: number, value: V): GenIdMap<V>;
    values(): Iterable<V>;
    [Symbol.iterator](): Iterable<[number, V]>;
}
/** Sparse set based map with generational index as key. */
export declare class SparseSetMap<V> {
    private sparse;
    private ids;
    private dense;
    get size(): number;
    clear(): void;
    delete(id: number): boolean;
    entries(): Iterable<[number, V]>;
    forEach<C>(callbackFn: (value: V, id: number, self: SparseSetMap<V>) => void, thisArg?: C): void;
    get(id: number): V | undefined;
    has(id: number): boolean;
    keys(): Iterable<number>;
    set(id: number, value: V): SparseSetMap<V>;
    values(): Iterable<V>;
    [Symbol.iterator](): Iterable<[number, V]>;
}
//# sourceMappingURL=maps.d.ts.map