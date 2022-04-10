/** Allocator of generational index IDs. */
export declare class IdAllocator {
    private generations;
    private freeList;
    get size(): number;
    clear(): void;
    create(): number;
    delete(id: number): boolean;
    forEach<C>(callbackFn: (id: number, index: number, self: IdAllocator) => void, thisArg?: C): void;
    has(id: number): boolean;
    values(): Iterable<number>;
    [Symbol.iterator](): Iterable<number>;
}
//# sourceMappingURL=allocator.d.ts.map