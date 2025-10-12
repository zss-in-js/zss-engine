import { genBase36Hash } from '../src';

describe('genBase36Hash - edge cases', () => {
  test('handles objects with array values', () => {
    const obj = { colors: ['red', 'blue', 'green'] };
    const hash = genBase36Hash(obj, 1, 8);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(8);
  });

  test('handles null values', () => {
    const obj = { value: null };
    const hash = genBase36Hash(obj, 1, 8);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(8);
  });

  test('handles undefined values', () => {
    const obj = { value: undefined };
    const hash = genBase36Hash(obj, 1, 8);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(8);
  });
});
