import { GenerationalArena } from '../arena';

describe('GenerationalArena', () => {
  it('has the correct string tag', () => {
    expect(`${new GenerationalArena()}`).toBe(`[object ${GenerationalArena.name}]`);
  });

  test('add value to arena', () => {
    const arena = new GenerationalArena<string>();
    expect(arena.size).toBe(0);

    const value = 'hello';
    const id = arena.add(value);
    expect(id).toBeTruthy();
    expect(arena.size).toBe(1);
    expect(arena.get(id)).toBe(value);
    expect(arena.has(id)).toBeTruthy();
  });

  test('clear() should empty the container', () => {
    const arena = new GenerationalArena<string>();
    arena.add('1');
    arena.add('2');

    expect(arena.size).toBe(2);

    arena.clear();
    expect(arena.size).toBe(0);
  });

  test('delete() should remove value and return true', () => {
    const arena = new GenerationalArena<string>();
    const id = arena.add('hello');

    expect(arena.delete(id)).toBeTruthy();
    expect(arena.size).toBe(0);
  });

  test('delete() should do nothing and return false for non-existent id', () => {
    const arena = new GenerationalArena<string>();
    arena.add('hello');

    expect(arena.delete(999)).toBeFalsy();
    expect(arena.size).toBe(1);
  });

  test('set() should update value', () => {
    const arena = new GenerationalArena<string>();
    const id = arena.add('hello');
    const newValue = 'new';

    arena.set(id, newValue);

    expect(arena.get(id)).toBe(newValue);
  });

  test('set() should do nothing for non-existent id', () => {
    const arena = new GenerationalArena<string>();
    const value = 'hello';
    const id = arena.add(value);

    arena.set(999, 'unreachable');

    expect(arena.get(id)).toBe(value);
  });

  test('foreach() should loop through all id-values', () => {
    const arena = new GenerationalArena<string>();
    const value1 = 'hello', value2 = 'world';
    const id1 = arena.add(value1);
    const id2 = arena.add(value2);

    const results: [number, string][] = [];
    arena.forEach((value, id) => results.push([id, value]));

    expect(results).toEqual([[id1, value1], [id2, value2]]);
  });

  test('entries() should iterate through all id-values', () => {
    const arena = new GenerationalArena<string>();
    const value1 = 'hello', value2 = 'world';
    const id1 = arena.add(value1);
    const id2 = arena.add(value2);

    const results: [number, string][] = [];
    for (const entry of arena.entries()) {
      results.push(entry);
    }

    expect(results).toEqual([[id1, value1], [id2, value2]]);
  });

  test('[Symbol.iterator]() should iterate through all id-values', () => {
    const arena = new GenerationalArena<string>();
    const value1 = 'hello', value2 = 'world';
    const id1 = arena.add(value1);
    const id2 = arena.add(value2);

    const results: [number, string][] = [];
    for (const entry of arena) {
      results.push(entry);
    }

    expect(results).toEqual([[id1, value1], [id2, value2]]);
  });

  test('keys() should iterate through all ids', () => {
    const arena = new GenerationalArena<string>();
    const value1 = 'hello', value2 = 'world';
    const id1 = arena.add(value1);
    const id2 = arena.add(value2);

    const results: number[] = [];
    for (const key of arena.keys()) {
      results.push(key);
    }

    expect(results).toEqual([id1, id2]);
  });

  test('values() should iterate through all values', () => {
    const arena = new GenerationalArena<string>();
    const value1 = 'hello', value2 = 'world';
    arena.add(value1);
    arena.add(value2);

    const results: string[] = [];
    for (const value of arena.values()) {
      results.push(value);
    }

    expect(results).toEqual([value1, value2]);
  });
});
