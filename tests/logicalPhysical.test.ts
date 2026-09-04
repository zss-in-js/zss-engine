import {
  canonicalProperty,
  counterpartOf,
  spellingOf,
} from '../src/utils/logicalPhysical';

const edgePairs = [
  ['margin-block-start', 'margin-top'],
  ['margin-block-end', 'margin-bottom'],
  ['margin-inline-start', 'margin-left'],
  ['margin-inline-end', 'margin-right'],
  ['padding-block-start', 'padding-top'],
  ['padding-block-end', 'padding-bottom'],
  ['padding-inline-start', 'padding-left'],
  ['padding-inline-end', 'padding-right'],
  ['scroll-margin-block-start', 'scroll-margin-top'],
  ['scroll-margin-block-end', 'scroll-margin-bottom'],
  ['scroll-margin-inline-start', 'scroll-margin-left'],
  ['scroll-margin-inline-end', 'scroll-margin-right'],
  ['scroll-padding-block-start', 'scroll-padding-top'],
  ['scroll-padding-block-end', 'scroll-padding-bottom'],
  ['scroll-padding-inline-start', 'scroll-padding-left'],
  ['scroll-padding-inline-end', 'scroll-padding-right'],
  ['inset-block-start', 'top'],
  ['inset-block-end', 'bottom'],
  ['inset-inline-start', 'left'],
  ['inset-inline-end', 'right'],
  ['border-block-start', 'border-top'],
  ['border-block-end', 'border-bottom'],
  ['border-inline-start', 'border-left'],
  ['border-inline-end', 'border-right'],
  ['border-block-start-width', 'border-top-width'],
  ['border-block-start-style', 'border-top-style'],
  ['border-block-start-color', 'border-top-color'],
  ['border-block-end-width', 'border-bottom-width'],
  ['border-block-end-style', 'border-bottom-style'],
  ['border-block-end-color', 'border-bottom-color'],
  ['border-inline-start-width', 'border-left-width'],
  ['border-inline-start-style', 'border-left-style'],
  ['border-inline-start-color', 'border-left-color'],
  ['border-inline-end-width', 'border-right-width'],
  ['border-inline-end-style', 'border-right-style'],
  ['border-inline-end-color', 'border-right-color'],
  ['border-start-start-radius', 'border-top-left-radius'],
  ['border-start-end-radius', 'border-top-right-radius'],
  ['border-end-start-radius', 'border-bottom-left-radius'],
  ['border-end-end-radius', 'border-bottom-right-radius'],
  ['corner-start-start-shape', 'corner-top-left-shape'],
  ['corner-start-end-shape', 'corner-top-right-shape'],
  ['corner-end-start-shape', 'corner-bottom-left-shape'],
  ['corner-end-end-shape', 'corner-bottom-right-shape'],
] as const;

const axisPairs = [
  ['block-size', 'height'],
  ['inline-size', 'width'],
  ['min-block-size', 'min-height'],
  ['min-inline-size', 'min-width'],
  ['max-block-size', 'max-height'],
  ['max-inline-size', 'max-width'],
  ['overflow-block', 'overflow-y'],
  ['overflow-inline', 'overflow-x'],
  ['overscroll-behavior-block', 'overscroll-behavior-y'],
  ['overscroll-behavior-inline', 'overscroll-behavior-x'],
  ['contain-intrinsic-block-size', 'contain-intrinsic-height'],
  ['contain-intrinsic-inline-size', 'contain-intrinsic-width'],
] as const;

const allPairs = [...edgePairs, ...axisPairs];

describe('canonicalProperty', () => {
  test.each(allPairs)('canonicalizes %s to %s', (logical, physical) => {
    expect(canonicalProperty(logical)).toBe(physical);
    expect(canonicalProperty(physical)).toBe(physical);
  });

  test('leaves unrelated properties unchanged', () => {
    expect(canonicalProperty('color')).toBe('color');
  });
});

describe('counterpartOf', () => {
  test.each(allPairs)(
    'maps %s and %s in both directions',
    (logical, physical) => {
      expect(counterpartOf(logical)).toBe(physical);
      expect(counterpartOf(physical)).toBe(logical);
    },
  );

  test('returns undefined for an unrelated property', () => {
    expect(counterpartOf('color')).toBeUndefined();
  });
});

describe('spellingOf', () => {
  test.each(edgePairs)(
    'classifies edge pair %s and %s',
    (logical, physical) => {
      expect(spellingOf(logical, false)).toBe('logical');
      expect(spellingOf(physical, false)).toBe('physical');
    },
  );

  test.each(axisPairs)(
    'includes axis pair %s and %s when requested',
    (logical, physical) => {
      expect(spellingOf(logical, true)).toBe('logical');
      expect(spellingOf(physical, true)).toBe('physical');
    },
  );

  test('excludes axis properties by default', () => {
    expect(spellingOf('block-size', false)).toBeUndefined();
    expect(spellingOf('height', false)).toBeUndefined();
  });

  test('returns undefined for an unrelated property', () => {
    expect(spellingOf('color', true)).toBeUndefined();
  });
});
