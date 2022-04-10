import { indexOf } from "./id";
import { IdAllocator } from "./allocator";

/** Value Arena that uses generational index as key. */
export class Arena<V> {
    private allocator: IdAllocator = new IdAllocator();
    private data: V[] = [];

    public add(value: V): number {
        const id = this.allocator.create();
        this.data[indexOf(id)] = value;
        return id;
    }

    public clear(): void {
        this.allocator.clear();
        this.data.length = 0;
    }

    public delete(id: number): boolean {
        if (this.allocator.delete(id)) {
            delete this.data[indexOf(id)];
            return true;
        }
        return false;
    }

    public * entries(): Iterable<[number, V]> {
        for (const id of this.allocator.values()) {
            yield [id, this.data[indexOf(id)]];
        }
    }

    public forEach<C>(callbackFn: (value: V, id: number, self: Arena<V>) => void, thisArg?: C): void {
        this.allocator.forEach((id) => {
            callbackFn.call(thisArg, this.data[indexOf(id)], id, this);
        }, thisArg);
    }

    public get(id: number): V | undefined {
        return this.has(id) ? this.data[indexOf(id)] : undefined;
    }

    public has(id: number): boolean {
        return this.allocator.has(id);
    }

    public keys(): Iterable<number> {
        return this.allocator.values();
    }

    public * values(): Iterable<V> {
        for (const id of this.allocator.values()) {
            yield this.data[indexOf(id)];
        }
    }

    public [Symbol.iterator](): Iterable<[number, V]> {
        return this.entries();
    }
}
