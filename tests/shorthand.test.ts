import { getPropertyDepth } from '../src/utils/shorthand';

const BOX_FAMILIES = ['margin', 'padding', 'scroll-margin', 'scroll-padding'];
const EDGES = [
  'top',
  'bottom',
  'left',
  'right',
  'block-start',
  'block-end',
  'inline-start',
  'inline-end',
];

/**
 * Same computed property under its logical and its physical name. The pair has
 * to land on the same depth, otherwise one spelling silently outranks the other.
 */
const LOGICAL_PHYSICAL_PAIRS: [string, string][] = [
  ...BOX_FAMILIES.flatMap((family): [string, string][] => [
    [`${family}-block-start`, `${family}-top`],
    [`${family}-block-end`, `${family}-bottom`],
    [`${family}-inline-start`, `${family}-left`],
    [`${family}-inline-end`, `${family}-right`],
  ]),
  ['inset-block-start', 'top'],
  ['inset-block-end', 'bottom'],
  ['inset-inline-start', 'left'],
  ['inset-inline-end', 'right'],
  ['border-block-start-width', 'border-top-width'],
  ['border-block-end-style', 'border-bottom-style'],
  ['border-inline-start-color', 'border-left-color'],
  ['border-inline-end-width', 'border-right-width'],
  ['block-size', 'height'],
  ['inline-size', 'width'],
  ['min-block-size', 'min-height'],
  ['max-inline-size', 'max-width'],
  ['overflow-block', 'overflow-y'],
  ['overflow-inline', 'overflow-x'],
  ['overscroll-behavior-block', 'overscroll-behavior-y'],
  ['overscroll-behavior-inline', 'overscroll-behavior-x'],
  ['contain-intrinsic-block-size', 'contain-intrinsic-height'],
  ['contain-intrinsic-inline-size', 'contain-intrinsic-width'],
  ['border-start-start-radius', 'border-top-left-radius'],
  ['border-end-end-radius', 'border-bottom-right-radius'],
];

describe('getPropertyDepth', () => {
  it.each(BOX_FAMILIES)(
    'ranks the %s family by how many edges it sets',
    (family) => {
      expect(getPropertyDepth(family)).toBe(0);
      expect(getPropertyDepth(`${family}-block`)).toBe(1);
      expect(getPropertyDepth(`${family}-inline`)).toBe(1);

      for (const edge of EDGES) {
        expect(getPropertyDepth(`${family}-${edge}`)).toBe(2);
      }
    },
  );

  it('ranks the inset family, whose physical edges have bare names', () => {
    expect(getPropertyDepth('inset')).toBe(0);
    expect(getPropertyDepth('inset-block')).toBe(1);
    expect(getPropertyDepth('inset-inline')).toBe(1);

    for (const edge of ['top', 'bottom', 'left', 'right']) {
      expect(getPropertyDepth(edge)).toBe(2);
    }
    for (const edge of [
      'block-start',
      'block-end',
      'inline-start',
      'inline-end',
    ]) {
      expect(getPropertyDepth(`inset-${edge}`)).toBe(2);
    }
  });

  it('ranks the border family down to one edge of one value', () => {
    expect(getPropertyDepth('border')).toBe(0);

    for (const mid of ['border-width', 'border-block', 'border-inline']) {
      expect(getPropertyDepth(mid)).toBe(1);
    }
    for (const pair of [
      'border-block-width',
      'border-top',
      'border-block-start',
    ]) {
      expect(getPropertyDepth(pair)).toBe(2);
    }
    for (const leaf of ['border-top-width', 'border-block-start-width']) {
      expect(getPropertyDepth(leaf)).toBe(3);
    }
  });

  /**
   * The physical edges are attached to the axis shorthand they map to under
   * horizontal-tb. A vertical writing mode swaps which axis owns which edge, so
   * the depths may only stay correct as long as both axes and all eight edges
   * sit at one depth each. Once that holds, no reassignment can move a depth.
   */
  it('keeps both axes symmetric so a writing mode cannot change a depth', () => {
    for (const family of [...BOX_FAMILIES, 'inset']) {
      expect(getPropertyDepth(`${family}-block`)).toBe(
        getPropertyDepth(`${family}-inline`),
      );
    }

    const insetEdges = ['top', 'bottom', 'left', 'right'].map(getPropertyDepth);
    expect(new Set(insetEdges).size).toBe(1);

    for (const family of BOX_FAMILIES) {
      const depths = EDGES.map((edge) => getPropertyDepth(`${family}-${edge}`));
      expect(new Set(depths).size).toBe(1);
    }
  });

  it.each(LOGICAL_PHYSICAL_PAIRS)(
    'gives %s the same depth as %s',
    (logical, physical) => {
      expect(getPropertyDepth(logical)).toBe(getPropertyDepth(physical));
    },
  );

  it('ranks a logical axis above the shorthand that resets it', () => {
    expect(getPropertyDepth('overflow')).toBe(0);
    expect(getPropertyDepth('overflow-block')).toBe(1);
    expect(getPropertyDepth('overscroll-behavior')).toBe(0);
    expect(getPropertyDepth('overscroll-behavior-inline')).toBe(1);
  });

  it.each([
    ['contain-intrinsic-size', 'contain-intrinsic-width'],
    ['position-try', 'position-try-fallbacks'],
    ['marker', 'marker-start'],
    ['cue', 'cue-before'],
    ['pause', 'pause-after'],
    ['rest', 'rest-before'],
  ])('ranks %s above %s', (shorthand, longhand) => {
    expect(getPropertyDepth(shorthand)).toBe(0);
    expect(getPropertyDepth(longhand)).toBe(1);
  });

  it('gives a property outside the graph no depth', () => {
    expect(getPropertyDepth('color')).toBe(0);
    expect(getPropertyDepth('marker-offset')).toBe(0);
    expect(getPropertyDepth('not-a-property')).toBe(0);
  });
});
