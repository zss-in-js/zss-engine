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

  test('box model shorthands cover their physical and logical longhands', () => {
    for (const box of ['margin', 'padding', 'scroll-margin', 'scroll-padding']) {
      expect(getPropertyDepth(box)).toBe(0);
      expect(getPropertyDepth(`${box}-top`)).toBe(1);
      expect(getPropertyDepth(`${box}-block`)).toBe(1);
      expect(getPropertyDepth(`${box}-inline`)).toBe(1);
      expect(getPropertyDepth(`${box}-block-start`)).toBe(2);
      expect(getPropertyDepth(`${box}-inline-end`)).toBe(2);
    }
  });

  test('inset covers physical and logical offsets', () => {
    expect(getPropertyDepth('inset')).toBe(0);
    expect(getPropertyDepth('top')).toBe(1);
    expect(getPropertyDepth('inset-block')).toBe(1);
    expect(getPropertyDepth('inset-block-start')).toBe(2);
  });

  test('gap, overflow, place-* and overscroll-behavior are ranked', () => {
    expect(getPropertyDepth('gap')).toBe(1); // reset by the `grid` shorthand
    expect(getPropertyDepth('row-gap')).toBe(2);
    expect(getPropertyDepth('overflow')).toBe(0);
    expect(getPropertyDepth('overflow-x')).toBe(1);
    expect(getPropertyDepth('overscroll-behavior')).toBe(0);
    expect(getPropertyDepth('overscroll-behavior-y')).toBe(1);
    expect(getPropertyDepth('place-items')).toBe(0);
    expect(getPropertyDepth('align-items')).toBe(1);
    expect(getPropertyDepth('place-content')).toBe(0);
    expect(getPropertyDepth('justify-content')).toBe(1);
    expect(getPropertyDepth('place-self')).toBe(0);
    expect(getPropertyDepth('align-self')).toBe(1);
  });

  test('nested longhands of background, font, transition and animation', () => {
    expect(getPropertyDepth('background-position')).toBe(1);
    expect(getPropertyDepth('background-position-x')).toBe(2);
    expect(getPropertyDepth('font-variant')).toBe(1);
    expect(getPropertyDepth('font-variant-caps')).toBe(2);
    expect(getPropertyDepth('transition-behavior')).toBe(1);
    expect(getPropertyDepth('animation-range')).toBe(1);
    expect(getPropertyDepth('animation-range-start')).toBe(2);
  });

  test('logical border radii sit under border-radius', () => {
    expect(getPropertyDepth('border-radius')).toBe(0);
    expect(getPropertyDepth('border-top-left-radius')).toBe(1);
    expect(getPropertyDepth('border-start-start-radius')).toBe(1);
  });

  test('white-space and text-wrap are siblings sharing text-wrap-mode', () => {
    expect(getPropertyDepth('white-space')).toBe(0);
    expect(getPropertyDepth('text-wrap')).toBe(0);
    expect(getPropertyDepth('text-wrap-mode')).toBe(1);
    expect(getPropertyDepth('text-wrap-style')).toBe(1);
    expect(getPropertyDepth('white-space-collapse')).toBe(1);
  });

  test('container, offset, caret, mask-border and timelines are ranked', () => {
    expect(getPropertyDepth('container')).toBe(0);
    expect(getPropertyDepth('container-type')).toBe(1);
    expect(getPropertyDepth('offset-path')).toBe(1);
    expect(getPropertyDepth('caret-color')).toBe(1);
    expect(getPropertyDepth('mask-border')).toBe(0);
    expect(getPropertyDepth('mask-border-slice')).toBe(1);
    expect(getPropertyDepth('scroll-timeline-axis')).toBe(1);
    expect(getPropertyDepth('view-timeline-inset')).toBe(1);
    expect(getPropertyDepth('font-synthesis-weight')).toBe(1);
  });

  test('`all` is never registered, it would rank every other property below it', () => {
    expect(SHORTHAND_PROPERTIES['all']).toBeUndefined();
    expect(getPropertyDepth('all')).toBe(0);
    expect(getPropertyDepth('color')).toBe(0);
    expect(getPropertyDepth('display')).toBe(0);
  });

  test('MAX_PROPERTY_DEPTH covers the deepest chain', () => {
    // border -> border-block -> border-block-start -> border-block-start-width
    expect(MAX_PROPERTY_DEPTH).toBe(3);
  });

  test('every registered longhand is deeper than all of its shorthands', () => {
    for (const [shorthand, longhands] of Object.entries(SHORTHAND_PROPERTIES)) {
      for (const longhand of longhands) {
        expect(getPropertyDepth(longhand)).toBeGreaterThan(getPropertyDepth(shorthand));
      }
    }
  });

  test('no registered property exceeds MAX_PROPERTY_DEPTH', () => {
    const all = new Set([...Object.keys(SHORTHAND_PROPERTIES), ...Object.values(SHORTHAND_PROPERTIES).flat()]);
    for (const property of all) {
      expect(getPropertyDepth(property)).toBeLessThanOrEqual(MAX_PROPERTY_DEPTH);
    }
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
