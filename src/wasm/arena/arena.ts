import { indexOf } from './id';
import { IdGenerator } from './generator';

/** An arena that uses generational index as key. */
export class GenerationalArena<T, I extends number = number> implements Map<I, T>, Iterable<[I, T]> {
  private ids: IdGenerator<I> = new IdGenerator();
  private readonly data: T[] = [];

  public get size(): number {
    return this.ids.size;
  }

  public add(value: T): I {
    const id = this.ids.create();
    this.data[indexOf(id)] = value;
    return id;
  }

  public clear(): void {
    this.ids.clear();
    this.data.length = 0;
  }

  public delete(id: I): boolean {
    if (this.ids.delete(id)) {
      delete this.data[indexOf(id)];
      return true;
    }
    return false;
  }

  public get(id: I): T | undefined {
    return this.ids.has(id) ? this.data[indexOf(id)] : undefined;
  }

  public has(id: I): boolean {
    return this.ids.has(id);
  }

  public set(id: I, value: T): this {
    if (this.ids.has(id)) {
      this.data[indexOf(id)] = value;
    }
    return this;
  }

  public forEach(callback: (value: T, key: I, self: GenerationalArena<T, I>) => void, thisArg?: unknown): void {
    this.ids.forEach((id) => {
      callback.call(thisArg, this.data[indexOf(id)], id, this);
    });
  }

  public * entries(): IterableIterator<[I, T]> {
    for (const id of this.ids.values()) {
      yield [id, this.data[indexOf(id)]];
    }
  }

  public keys(): IterableIterator<I> {
    return this.ids.values();
  }

  public * values(): IterableIterator<T> {
    for (const id of this.ids.values()) {
      yield this.data[indexOf(id)];
    }
  }

  public [Symbol.iterator](): IterableIterator<[I, T]> {
    return this.entries();
  }

  public get [Symbol.toStringTag](): string {
    return GenerationalArena.name;
  }
}
