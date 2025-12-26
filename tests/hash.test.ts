import { genBase36Hash } from '../src';

describe('genBase36Hash', () => {
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

  test('generates a hash of the specified length (longer than default)', () => {
    const obj = { a: 1, b: 2 };
    const hash = genBase36Hash(obj, 1, 12);
    expect(hash.length).toBe(12);
  });

  test('generates a hash of the specified length (shorter than default)', () => {
    const obj = { a: 1, b: 2 };
    const hash = genBase36Hash(obj, 1, 5);
    expect(hash.length).toBe(5);
  });

  test('generates different hashes for different objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    const hash1 = genBase36Hash(obj1, 1, 10);
    const hash2 = genBase36Hash(obj2, 1, 10);
    expect(hash1).not.toBe(hash2);
  });

  test('generates different hashes for the same object with different seeds', () => {
    const obj = { a: 1 };
    const hash1 = genBase36Hash(obj, 1, 10);
    const hash2 = genBase36Hash(obj, 2, 10);
    expect(hash1).not.toBe(hash2);
  });

  test('handles short input object and generates longer hash', () => {
    const obj = { width: 120 };
    const hash = genBase36Hash(obj, 1, 10);
    expect(hash.length).toBe(10);
    expect(hash.startsWith('x')).toBe(true);
  });

  test('generates consistent hash for the same object and seed', () => {
    const obj = { complex: { nested: [1, "test", { flag: true }] } };
    const hash1 = genBase36Hash(obj, 42, 14);
    const hash2 = genBase36Hash(obj, 42, 14);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(14);
  });
});
