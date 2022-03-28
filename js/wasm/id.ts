const MAX_SAFE_GENERATION = (1 << 21) - 1;
const UNIT_GENERATION = 2 ** 32;

/** Newtype that represents an ID. Wraps a number. */
export type Id<T> = number & { readonly __type: T };

/** Creates a generational index ID from index and generation parts. */
export function id<T>(index: number, generation: number): Id<T> {
  return ((generation & MAX_SAFE_GENERATION) * UNIT_GENERATION + (index >>> 0)) as Id<T>;
}

/** Returns the index part (lower 32bit) of a generational index ID. */
export function indexOf<T>(id: Id<T>): number {
  return id >>> 0;
}

/** Returns the generation part (upper 21bit) of a generational index ID. */
export function generationOf<T>(id: Id<T>): number {
  return (id / UNIT_GENERATION) & MAX_SAFE_GENERATION;
}

/** Allocator of generational index IDs. */
export class IdAllocator<T> {
  private generations: number[] = [];
  private freeList: number[] = [];

  public [Symbol.iterator](): Iterable<Id<T>> {
    return this.values();
  }

  public get size(): number {
    return this.generations.length - this.freeList.length;
  }

  public clear(): void {
    this.generations.length = 0;
    this.freeList.length = 0;
  }

  public create(): Id<T> {
    let index: number;
    let generation: number;

    if (this.freeList.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      index = this.freeList.pop()!;
      generation = Math.abs(this.generations[index]);
      this.generations[index] = generation;
    } else {
      index = this.generations.length;
      generation = index ? 0 : 1; // avoids 0 Id as it is usually reserved for null.
      this.generations.push(generation);
    }

    return id(index, generation);
  }

  public delete(id: Id<T>): boolean {
    if (!this.has(id)) {
      return false;
    }

    const index = indexOf(id);
    // Use negative sign to indicate free space
    let generation = -((this.generations[index] + 1) & MAX_SAFE_GENERATION);
    if (!index && !generation) {
      ++generation; // avoids 0 Id as it is usually reserved for null.
    }

    this.generations[index] = generation;
    this.freeList.push(index);

    return true;
  }

  public forEach<C>(callbackFn: (id: Id<T>, index: number, self: IdAllocator<T>) => void, thisArg?: C): void {
    let index = 0;
    for (const id of this.values()) {
      callbackFn.call(thisArg, id, index, this);
      index += 1;
    }
  }

  public has(id: Id<T>): boolean {
    return (indexOf(id) < this.generations.length
      && generationOf(id) === this.generations[indexOf(id)]);
  }

  public * values(): Iterable<Id<T>> {
    for (let i = 0; i < this.generations.length; ++i) {
      const generation = this.generations[i];
      if (this.generations[i] >= 0) {
        yield id(i, generation);
      }
    }
  }
}

/** Value Arena that uses generational index as key. */
export class IdArena<K, V> {
  private allocator: IdAllocator<K> = new IdAllocator<K>();
  private data: V[] = [];

  public [Symbol.iterator](): Iterable<[Id<K>, V]> {
    return this.entries();
  }

  public add(value: V): Id<K> {
    const id = this.allocator.create();
    this.data[indexOf(id)] = value;
    return id;
  }

  public clear(): void {
    this.allocator.clear();
    this.data.length = 0;
  }

  public delete(id: Id<K>): boolean {
    if (this.allocator.delete(id)) {
      delete this.data[indexOf(id)];
      return true;
    }
    return false;
  }

  public * entries(): Iterable<[Id<K>, V]> {
    for (const id of this.allocator.values()) {
      yield [id, this.data[indexOf(id)]];
    }
  }

  public forEach<C>(callbackFn: (value: V, id: Id<K>, self: IdArena<K, V>) => void, thisArg?: C): void {
    this.allocator.forEach((id) => {
      callbackFn.call(thisArg, this.data[indexOf(id)], id, this);
    }, thisArg);
  }

  public get(id: Id<K>): V | undefined {
    return this.has(id) ? this.data[indexOf(id)] : undefined;
  }

  public has(id: Id<K>): boolean {
    return this.allocator.has(id);
  }

  public keys(): Iterable<Id<K>> {
    return this.allocator.values();
  }

  public * values(): Iterable<V> {
    for (const id of this.allocator.values()) {
      yield this.data[indexOf(id)];
    }
  }
}
