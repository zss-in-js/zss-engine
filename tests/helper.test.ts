import { applyCssValue, camelToKebabCase } from '../src/utils/helper';

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

describe('applyCssValue', () => {
  test('appends "px" to number values for non-exception properties', () => {
    expect(applyCssValue(10, 'width')).toBe('10px');
    expect(applyCssValue(25, 'height')).toBe('25px');
  });

  test('converts number values to string for exception properties', () => {
    expect(applyCssValue(0.5, 'opacity')).toBe('0.5');
    expect(applyCssValue(700, 'font-weight')).toBe('700');
  });

  test('converts hex codes to color names in string values', () => {
    expect(applyCssValue('#f00', 'color')).toBe('red');
    expect(applyCssValue('#0000ff', 'backgroundColor')).toBe('blue');
    expect(applyCssValue('linear-gradient(#fff, #000)', 'backgroundImage')).toBe('linear-gradient(white, black)');
  });

  test('leaves string values without hex codes unchanged', () => {
    expect(applyCssValue('auto', 'width')).toBe('auto');
    expect(applyCssValue('red', 'color')).toBe('red');
  });

  test('handles mixed content with hex codes', () => {
    expect(applyCssValue('1px solid #ccc', 'border')).toBe('1px solid #ccc');
  });

  test('handles undefined color names for hex codes', () => {
    expect(applyCssValue('#123456', 'color')).toBe('#123456');
  });
});
