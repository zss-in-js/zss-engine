import { transpileAtomic } from '../src';

describe('transpileAtomic', () => {
  test('transpiles simple property with string value', () => {
    const result = transpileAtomic('color', 'red', 'abc123');

    expect(result).toBe('.abc123 { color: red; }');
  });

  test('transpiles simple property with number value', () => {
    const result = transpileAtomic('fontSize', 16, 'def456');

    expect(result).toBe('.def456:not(#\\#) { font-size: 16px; }');
  });

  test('transpiles property with camelCase conversion', () => {
    const result = transpileAtomic('backgroundColor', 'blue', 'ghi789');

    expect(result).toBe('.ghi789:not(#\\#) { background-color: blue; }');
  });

  test('transpiles @media query', () => {
    const result = transpileAtomic('@media (min-width: 768px)', 'block', 'jkl012');

    expect(result).toBe('@media (min-width: 768px) { .jkl012 { @media (min-width: 768px): block; } }');
  });

  test('transpiles @container query', () => {
    const result = transpileAtomic('@container (min-width: 400px)', 'flex', 'mno345');

    expect(result).toBe('@container (min-width: 400px) { .mno345 { @container (min-width: 400px): flex; } }');
  });

  test('returns empty string for non-string and non-number values', () => {
    const result = transpileAtomic('color', {} as any, 'pqr678');

    expect(result).toBe('');
  });

  test('handles zero value', () => {
    const result = transpileAtomic('margin', 0, 'stu901');

    expect(result).toBe('.stu901 { margin: 0px; }');
  });

  test('handles opacity with decimal value', () => {
    const result = transpileAtomic('opacity', 0.5, 'vwx234');

    expect(result).toBe('.vwx234 { opacity: 0.5; }');
  });
});
