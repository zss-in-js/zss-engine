import * as index from '../src/index';

describe('index exports', () => {
  test('exports utility functions', () => {
    expect(index.isServer).toBeDefined();
    expect(index.isDevelopment).toBeDefined();
    expect(index.isTestingDevelopment).toBeDefined();
    expect(index.genBase36Hash).toBeDefined();
    expect(index.transpile).toBeDefined();
    expect(index.transpileAtomic).toBeDefined();
    expect(index.splitAtomicAndNested).toBeDefined();
    expect(index.processAtomicProps).toBeDefined();
    expect(index.SHORTHAND_PROPERTIES).toBeDefined();
    expect(index.LONG_TO_SHORT).toBeDefined();
    expect(index.build).toBeDefined();
    expect(index.camelToKebabCase).toBeDefined();
    expect(index.applyCssValue).toBeDefined();
    expect(index.injectClientCSS).toBeDefined();
    expect(index.injectClientQuery).toBeDefined();
    expect(index.injectClientGlobalCSS).toBeDefined();
    expect(index.isHashInStyleSheets).toBeDefined();
  });

  test('exported functions are callable', () => {
    expect(typeof index.genBase36Hash).toBe('function');
    expect(typeof index.transpile).toBe('function');
    expect(typeof index.transpileAtomic).toBe('function');
    expect(typeof index.splitAtomicAndNested).toBe('function');
    expect(typeof index.processAtomicProps).toBe('function');
    expect(typeof index.build).toBe('function');
    expect(typeof index.camelToKebabCase).toBe('function');
    expect(typeof index.applyCssValue).toBe('function');
    expect(typeof index.injectClientCSS).toBe('function');
    expect(typeof index.injectClientQuery).toBe('function');
    expect(typeof index.injectClientGlobalCSS).toBe('function');
    expect(typeof index.isHashInStyleSheets).toBe('function');
  });

  test('exported constants have correct types', () => {
    expect(typeof index.isServer).toBe('boolean');
    expect(typeof index.isDevelopment).toBe('boolean');
    expect(typeof index.isTestingDevelopment).toBe('boolean');
  });
});
