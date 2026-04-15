import * as index from '../src/index';

describe('index exports', () => {
  test('exports utility functions', () => {
    expect(index.genBase36Hash).toBeDefined();
    expect(index.transpile).toBeDefined();
    expect(index.transpileAtomic).toBeDefined();
    expect(index.splitAtomicAndNested).toBeDefined();
    expect(index.processAtomicProps).toBeDefined();
    expect(index.overrideLonghand).toBeDefined();
    expect(index.camelToKebabCase).toBeDefined();
    expect(index.applyCssValue).toBeDefined();
  });

  test('exported functions are callable', () => {
    expect(typeof index.genBase36Hash).toBe('function');
    expect(typeof index.transpile).toBe('function');
    expect(typeof index.transpileAtomic).toBe('function');
    expect(typeof index.splitAtomicAndNested).toBe('function');
    expect(typeof index.processAtomicProps).toBe('function');
    expect(typeof index.overrideLonghand).toBe('function');
    expect(typeof index.camelToKebabCase).toBe('function');
    expect(typeof index.applyCssValue).toBe('function');
  });
});
