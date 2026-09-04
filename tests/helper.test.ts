import {
  applyCssValue,
  camelToKebabCase,
  isAtRule,
  kebabToCamelCase,
} from '../src/utils/helper';

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

  test('lowercases trailing digits without inserting a hyphen', () => {
    expect(camelToKebabCase('HTML2')).toBe('html2');
    expect(camelToKebabCase('APIResponse')).toBe('api-response');
  });

  test('preserves the case of custom properties', () => {
    expect(camelToKebabCase('--fooBar')).toBe('--fooBar');
    expect(camelToKebabCase('--MyColor')).toBe('--MyColor');
    expect(camelToKebabCase('--foo-bar')).toBe('--foo-bar');
  });
});

describe('kebabToCamelCase', () => {
  test('converts kebab-case to camelCase', () => {
    expect(kebabToCamelCase('font-size')).toBe('fontSize');
    expect(kebabToCamelCase('background-color')).toBe('backgroundColor');
    expect(kebabToCamelCase('color')).toBe('color');
  });

  test('handles vendor prefixes correctly', () => {
    expect(kebabToCamelCase('-ms-transform')).toBe('msTransform');
    expect(kebabToCamelCase('-moz-appearance')).toBe('MozAppearance');
    expect(kebabToCamelCase('-webkit-transform')).toBe('WebkitTransform');
  });

  test('preserves the case of custom properties', () => {
    expect(kebabToCamelCase('--foo-bar')).toBe('--foo-bar');
    expect(kebabToCamelCase('--MyColor')).toBe('--MyColor');
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

  test('does not append "px" to numeric custom property values', () => {
    expect(applyCssValue(10, '--spacing')).toBe('10');
  });

  test('converts hex codes to color names in string values', () => {
    expect(applyCssValue('#f00', 'color')).toBe('red');
    expect(applyCssValue('#0000ff', 'backgroundColor')).toBe('blue');
    expect(
      applyCssValue('linear-gradient(#fff, #000)', 'backgroundImage'),
    ).toBe('linear-gradient(white, black)');
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

  test('skips values holding a url() or a quoted string', () => {
    expect(applyCssValue('url(#fff)', 'clip-path')).toBe('url(#fff)');
    expect(applyCssValue('URL(#fff)', 'clip-path')).toBe('URL(#fff)');
    expect(applyCssValue("'#fff'", 'content')).toBe("'#fff'");
    expect(applyCssValue('"#fff"', 'content')).toBe('"#fff"');
    expect(applyCssValue('url(bg.png) #fff', 'background')).toBe(
      'url(bg.png) #fff',
    );
  });
});

describe('isAtRule', () => {
  test('returns true for query-like at-rules', () => {
    expect(isAtRule('@media (min-width: 768px)')).toBe(true);
    expect(isAtRule('@container (min-width: 300px)')).toBe(true);
    expect(isAtRule('@supports (display: grid)')).toBe(true);
    expect(isAtRule('@layer utilities')).toBe(true);
    expect(isAtRule('@scope (.card)')).toBe(true);
  });

  test('returns false for other properties or at-rules', () => {
    expect(isAtRule('color')).toBe(false);
    expect(isAtRule('fontSize')).toBe(false);
    expect(isAtRule('@font-face')).toBe(false);
    expect(isAtRule('@keyframes slide-in')).toBe(false);
    expect(isAtRule('@property --foo')).toBe(false);
  });
});
