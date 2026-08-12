import { transpileAtomic } from '../src/index';
import { getPropertyDepth, MAX_PROPERTY_DEPTH, SHORTHAND_PROPERTIES } from '../src/utils/shorthand';
import { overrideLonghand } from '../src/utils/override-longhand';

const not = ':not(#\\#)';

describe('shorthand cascade depth', () => {
  test('depth grows with each shorthand level', () => {
    expect(getPropertyDepth('color')).toBe(0);
    expect(getPropertyDepth('border')).toBe(0);
    expect(getPropertyDepth('border-top')).toBe(1);
    expect(getPropertyDepth('border-width')).toBe(1);
    expect(getPropertyDepth('border-top-width')).toBe(2);
  });

  test('logical border properties nest under border', () => {
    expect(getPropertyDepth('border')).toBe(0);
    expect(getPropertyDepth('border-block')).toBe(1);
    expect(getPropertyDepth('border-block-start')).toBe(2);
    expect(getPropertyDepth('border-block-start-width')).toBe(3);

    expect(getPropertyDepth('border-inline')).toBe(1);
    expect(getPropertyDepth('border-inline-start')).toBe(2);
    expect(getPropertyDepth('border-inline-start-width')).toBe(3);
  });

  test('depth follows the graph, not the hyphen count', () => {
    // flex-flow and flex-direction both have one hyphen
    expect(getPropertyDepth('flex-flow')).toBe(0);
    expect(getPropertyDepth('flex-direction')).toBe(1);
    // columns -> column-width has no shared prefix
    expect(getPropertyDepth('columns')).toBe(0);
    expect(getPropertyDepth('column-width')).toBe(1);
  });

  test('MAX_PROPERTY_DEPTH covers the deepest chain', () => {
    expect(MAX_PROPERTY_DEPTH).toBe(3);
  });
});

describe('transpileAtomic specificity', () => {
  test('each level adds one :not(#\\#)', () => {
    expect(transpileAtomic('border', '1px solid red', 'h')).toBe('.h { border: 1px solid red; }');
    expect(transpileAtomic('borderTop', '1px solid red', 'h')).toBe(`.h${not} { border-top: 1px solid red; }`);
    expect(transpileAtomic('borderTopWidth', 2, 'h')).toBe(`.h${not}${not} { border-top-width: 2px; }`);
  });

  test('longhand keeps winning over its shorthand regardless of insertion order', () => {
    const shorthand = transpileAtomic('border', '1px solid red', 'a');
    const middle = transpileAtomic('borderTop', '2px solid blue', 'b');
    const longhand = transpileAtomic('borderTopWidth', 3, 'c');

    const count = (rule: string) => rule.split(not).length - 1;
    expect(count(shorthand)).toBeLessThan(count(middle));
    expect(count(middle)).toBeLessThan(count(longhand));
  });

  test('pseudo suffix comes after the specificity bump', () => {
    expect(transpileAtomic('borderTopWidth', 2, 'h', ':hover')).toBe(`.h${not}${not}:hover { border-top-width: 2px; }`);
  });
});

describe('shorthand expansion', () => {
  test('border transitively covers intermediate and leaf longhands', () => {
    expect(SHORTHAND_PROPERTIES['border']).toEqual(expect.arrayContaining(['border-top', 'border-width', 'border-top-width']));
  });

  test('overrideLonghand removes an intermediate shorthand shadowed by a later one', () => {
    expect(overrideLonghand({ borderTopWidth: '3px', borderTop: '2px solid blue', border: '1px solid red' })).toEqual({
      border: '1px solid red',
    });
    expect(overrideLonghand({ border: '1px solid red', borderTop: '2px solid blue' })).toEqual({
      border: '1px solid red',
      borderTop: '2px solid blue',
    });
  });
});
