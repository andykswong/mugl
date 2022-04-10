/** Value Arena that uses generational index as key. */
export declare class Arena<V> {
    private allocator;
    private data;
    add(value: V): number;
    clear(): void;
    delete(id: number): boolean;
    entries(): Iterable<[number, V]>;
    forEach<C>(callbackFn: (value: V, id: number, self: Arena<V>) => void, thisArg?: C): void;
    get(id: number): V | undefined;
    has(id: number): boolean;
    keys(): Iterable<number>;
    values(): Iterable<V>;
    [Symbol.iterator](): Iterable<[number, V]>;
}
//# sourceMappingURL=arena.d.ts.map