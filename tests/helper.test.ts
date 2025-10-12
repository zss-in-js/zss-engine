import { camelToKebabCase } from '../src';

describe('camelToKebabCase', () => {
  test('converts camelCase to kebab-case', () => {
    expect(camelToKebabCase('fontSize')).toBe('font-size');
    expect(camelToKebabCase('backgroundColor')).toBe('background-color');
  });

  test('handles vendor prefixes correctly', () => {
    expect(camelToKebabCase('msTransform')).toBe('-ms-transform');
    expect(camelToKebabCase('MozAppearance')).toBe('-moz-appearance');
    expect(camelToKebabCase('WebkitTransform')).toBe('-webkit-transform');
  });
});
