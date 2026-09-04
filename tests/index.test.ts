import * as index from '../src/index';

describe('index exports', () => {
  test('exports utility functions', () => {
    expect(index.genBase36Hash).toBeDefined();
    expect(index.transpile).toBeDefined();
    expect(index.transpileAtomic).toBeDefined();
    expect(index.splitAtomicAndNested).toBeDefined();
    expect(index.processAtomicProps).toBeDefined();
    expect(index.camelToKebabCase).toBeDefined();
    expect(index.kebabToCamelCase).toBeDefined();
    expect(index.applyCssValue).toBeDefined();
    expect(index.isAtRule).toBeDefined();
    expect(index.exceptionCamelCase).toBeDefined();
    expect(index.DIRECT_LONGHANDS).toBeDefined();
    expect(index.impliesCondition).toBeDefined();
    expect(index.getSpecificity).toBeDefined();
    expect(index.getPseudoElement).toBeDefined();
    expect(index.canonicalProperty).toBeDefined();
    expect(index.counterpartOf).toBeDefined();
    expect(index.spellingOf).toBeDefined();
  });

  test('exported functions are callable', () => {
    expect(typeof index.genBase36Hash).toBe('function');
    expect(typeof index.transpile).toBe('function');
    expect(typeof index.transpileAtomic).toBe('function');
    expect(typeof index.splitAtomicAndNested).toBe('function');
    expect(typeof index.processAtomicProps).toBe('function');
    expect(typeof index.camelToKebabCase).toBe('function');
    expect(typeof index.kebabToCamelCase).toBe('function');
    expect(typeof index.applyCssValue).toBe('function');
    expect(typeof index.isAtRule).toBe('function');
    expect(Array.isArray(index.exceptionCamelCase)).toBe(true);
    expect(typeof index.DIRECT_LONGHANDS).toBe('object');
    expect(typeof index.impliesCondition).toBe('function');
    expect(typeof index.getSpecificity).toBe('function');
    expect(typeof index.getPseudoElement).toBe('function');
    expect(typeof index.canonicalProperty).toBe('function');
    expect(typeof index.counterpartOf).toBe('function');
    expect(typeof index.spellingOf).toBe('function');
  });
});
