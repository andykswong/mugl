import { indexOf } from "./id";

/** Generational index map backend by a Map. */
export class GenIdMap<V> {
  private map: Map<number, [number, V]> = new Map();

  public get size(): number {
    return this.map.size;
  }

  public clear(): void {
    this.map.clear();
  }

  public delete(id: number): boolean {
    const entry = this.map.get(indexOf(id));
    if (entry && entry[0] === id) {
      this.map.delete(indexOf(id));
      return true;
    }
    return false;
  }

  public entries(): Iterable<[number, V]> {
    return this.map.values();
  }

  public forEach<C>(callbackFn: (value: V, id: number, self: GenIdMap<V>) => void, thisArg?: C): void {
    this.map.forEach((entry) => {
      callbackFn.call(thisArg, entry[1], entry[0], this);
    });
  }

  public get(id: number): V | undefined {
    const entry = this.map.get(indexOf(id));
    if (entry && entry[0] === id) {
      return entry[1];
    }
    return undefined;
  }

  public has(id: number): boolean {
    const entry = this.map.get(indexOf(id));
    return !!entry && entry[0] === id;
  }

  public * keys(): Iterable<number> {
    for (const entry of this.map.values()) {
      yield entry[0];
    }
  }

  public set(id: number, value: V): GenIdMap<V> {
    this.map.set(indexOf(id), [id, value]);
    return this;
  }

  public * values(): Iterable<V> {
    for (const entry of this.map.values()) {
      yield entry[1];
    }
  }

  public [Symbol.iterator](): Iterable<[number, V]> {
      return this.entries();
  }
}

/** Sparse set based map with generational index as key. */
export class SparseSetMap<V> {
  private sparse: number[] = [];
  private ids: number[] = [];
  private dense: V[] = [];

  public get size(): number {
    return this.dense.length;
  }

  public clear(): void {
    this.sparse.length = 0;
    this.ids.length = 0;
    this.dense.length = 0;
  }

  public delete(id: number): boolean {
    if (this.has(id)) {
      const index = indexOf(id);
      const denseIndex = this.sparse[index];

      this.sparse[indexOf(this.ids[this.size - 1])] = denseIndex;
      this.ids[denseIndex] = this.ids[this.size - 1];
      this.dense[denseIndex] = this.dense[this.size - 1];

      this.sparse[index] = -1;
      this.ids.pop();
      this.dense.pop();

      return true;
    }

    return false;
  }

  public * entries(): Iterable<[number, V]> {
    for (let i = 0; i < this.ids.length; ++i) {
      yield [this.ids[i], this.dense[i]];
    }
  }

  public forEach<C>(callbackFn: (value: V, id: number, self: SparseSetMap<V>) => void, thisArg?: C): void {
    this.ids.forEach((id, i) => {
      callbackFn.call(thisArg, this.dense[i], id, this);
    });
  }

  public get(id: number): V | undefined {
    return this.has(id) ? this.dense[this.sparse[indexOf(id)]] : undefined;
  }

  public has(id: number): boolean {
    return (this.ids[this.sparse[indexOf(id)]] === id);
  }

  public * keys(): Iterable<number> {
    for (let i = 0; i < this.ids.length; ++i) {
      yield this.ids[i];
    }
  }

  public set(id: number, value: V): SparseSetMap<V> {
    const denseIndex = this.sparse[indexOf(id)];
    if (!isNaN(denseIndex) && denseIndex >= 0) {
      this.ids[denseIndex] = id;
      this.dense[denseIndex] = value;
    } else {
      this.sparse[indexOf(id)] = this.ids.length;
      this.ids.push(id);
      this.dense.push(value);
    }
    return this;
  }

  public * values(): Iterable<V> {
    for (let i = 0; i < this.ids.length; ++i) {
      yield this.dense[i];
    }
  }

  public [Symbol.iterator](): Iterable<[number, V]> {
      return this.entries();
  }
}
