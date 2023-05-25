import * as GenId from '../id';
import { IdGenerator } from '../generator';

describe(IdGenerator.name, () => {
  it('has the correct string tag', () => {
    expect(`${new IdGenerator()}`).toBe(`[object ${IdGenerator.name}]`);
  });

  test('clear() should empty the container', () => {
    const generator = new IdGenerator();
    generator.create();
    generator.create();

    expect(generator.size).toBe(2);

    generator.clear();
    expect(generator.size).toBe(0);
  });

  describe('create', () => {
    it('should create new ID', () => {
      const generator = new IdGenerator();
      expect(generator.size).toBe(0);

      const id = generator.create();
      expect(id).toBeTruthy();
      expect(generator.size).toBe(1);
      expect(generator.has(id)).toBeTruthy();
    });

    it('should not result in duplicate id when create after delete', () => {
      const generator = new IdGenerator();
      const id = generator.create();
      generator.delete(id);
      const id2 = generator.create();

      expect(id).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id2).not.toBe(id);
    });

    it('should never return 0 id', () => {
      const generator = new IdGenerator();
      generator['generations'].push(GenId.MAX_SAFE_GENERATION);

      expect(generator.delete(GenId.create(0, GenId.MAX_SAFE_GENERATION))).toBeTruthy();
      expect(generator.create()).toBe(GenId.create(0, 1));
    });
  });

  describe('delete', () => {
    it('should remove id and return true', () => {
      const generator = new IdGenerator();
      const id = generator.create();

      expect(generator.delete(id)).toBeTruthy();
      expect(generator.size).toBe(0);
    });

    it('should do nothing and return false for non-existent id', () => {
      const generator = new IdGenerator();
      generator.create();

      expect(generator.delete(999)).toBeFalsy();
      expect(generator.size).toBe(1);
    });
  });

  describe('iterators', () => {
    test('foreach() should loop through all ids', () => {
      const generator = new IdGenerator();
      const id1 = generator.create();
      const id2 = generator.create();

      const results: [number, number][] = [];
      generator.forEach((id, id2) => results.push([id, id2]));

      expect(results).toEqual([[id1, id1], [id2, id2]]);
    });

    test('entries() should iterate through all ids', () => {
      const generator = new IdGenerator();
      const id1 = generator.create();
      const id2 = generator.create();

      const results: [number, number][] = [];
      for (const entry of generator.entries()) {
        results.push(entry);
      }

      expect(results).toEqual([[id1, id1], [id2, id2]]);
    });

    test('[Symbol.iterator]() should iterate through all ids', () => {
      const generator = new IdGenerator();
      const id1 = generator.create();
      const id2 = generator.create();

      const results: number[] = [];
      for (const id of generator) {
        results.push(id);
      }

      expect(results).toEqual([id1, id2]);
    });

    test('keys() should iterate through all ids', () => {
      const generator = new IdGenerator();
      const id1 = generator.create();
      const id2 = generator.create();

      const results: number[] = [];
      for (const id of generator.keys()) {
        results.push(id);
      }

      expect(results).toEqual([id1, id2]);
    });

    test('values() should iterate through all ids', () => {
      const generator = new IdGenerator();
      const id1 = generator.create();
      const id2 = generator.create();

      const results: number[] = [];
      for (const id of generator.values()) {
        results.push(id);
      }

      expect(results).toEqual([id1, id2]);
    });
  });
});
