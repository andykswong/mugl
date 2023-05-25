import { GenerationalId } from '../index';

describe('GenerationalId', () => {
  it('should create correct id from index and generation values', () => {
    expect(GenerationalId.create(0, 0)).toBe(0);
    expect(GenerationalId.create(7, 3)).toBe(12884901895);
  });

  it('should get the correct index from valid generational id', () => {
    expect(GenerationalId.indexOf(12884901899)).toBe(11);
  });

  it('should get the correct generation from valid generational id', () => {
    expect(GenerationalId.generationOf(21474836493)).toBe(5);
  });
});
