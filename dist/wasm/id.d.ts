/** Newtype that represents an ID. Wraps a number. */
export declare type Id<T> = number & {
    readonly __type: T;
};
/** Creates a generational index ID from index and generation parts. */
export declare function id<T>(index: number, generation: number): Id<T>;
/** Returns the index part (lower 32bit) of a generational index ID. */
export declare function indexOf<T>(id: Id<T>): number;
/** Returns the generation part (upper 21bit) of a generational index ID. */
export declare function generationOf<T>(id: Id<T>): number;
/** Allocator of generational index IDs. */
export declare class IdAllocator<T> {
    private generations;
    private freeList;
    [Symbol.iterator](): Iterable<Id<T>>;
    get size(): number;
    clear(): void;
    create(): Id<T>;
    delete(id: Id<T>): boolean;
    forEach<C>(callbackFn: (id: Id<T>, index: number, self: IdAllocator<T>) => void, thisArg?: C): void;
    has(id: Id<T>): boolean;
    values(): Iterable<Id<T>>;
}
/** Value Arena that uses generational index as key. */
export declare class IdArena<K, V> {
    private allocator;
    private data;
    [Symbol.iterator](): Iterable<[Id<K>, V]>;
    add(value: V): Id<K>;
    clear(): void;
    delete(id: Id<K>): boolean;
    entries(): Iterable<[Id<K>, V]>;
    forEach<C>(callbackFn: (value: V, id: Id<K>, self: IdArena<K, V>) => void, thisArg?: C): void;
    get(id: Id<K>): V | undefined;
    has(id: Id<K>): boolean;
    keys(): Iterable<Id<K>>;
    values(): Iterable<V>;
}
//# sourceMappingURL=id.d.ts.map