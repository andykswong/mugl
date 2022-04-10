import { create as id, generationOf, indexOf, MAX_SAFE_GENERATION } from "./id";

/** Allocator of generational index IDs. */
export class IdAllocator {
  private generations: number[] = [];
  private freeList: number[] = [];

  public get size(): number {
    return this.generations.length - this.freeList.length;
  }

  public clear(): void {
    this.generations.length = 0;
    this.freeList.length = 0;
  }

  public create(): number {
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

  public delete(id: number): boolean {
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

  public forEach<C>(callbackFn: (id: number, index: number, self: IdAllocator) => void, thisArg?: C): void {
    let index = 0;
    for (const id of this.values()) {
      callbackFn.call(thisArg, id, index, this);
      index += 1;
    }
  }

  public has(id: number): boolean {
    return (indexOf(id) < this.generations.length
      && generationOf(id) === this.generations[indexOf(id)]);
  }

  public * values(): Iterable<number> {
    for (let i = 0; i < this.generations.length; ++i) {
      const generation = this.generations[i];
      if (this.generations[i] >= 0) {
        yield id(i, generation);
      }
    }
  }

  public [Symbol.iterator](): Iterable<number> {
    return this.values();
  }
}
