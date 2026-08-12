import { getPropertyDepth } from '../src/utils/shorthand';
import { DIRECT_LONGHANDS } from '../src/utils/shorthand-graph';

const BOX_FAMILIES = ['margin', 'padding', 'scroll-margin', 'scroll-padding'];
const LOGICAL_PHYSICAL_EDGES: [string, string][] = [
  ['block-start', 'top'],
  ['block-end', 'bottom'],
  ['inline-start', 'left'],
  ['inline-end', 'right'],
];
const BORDER_VALUES = ['width', 'style', 'color'];
const EDGES = [
  ...LOGICAL_PHYSICAL_EDGES.map(([, physical]) => physical),
  ...LOGICAL_PHYSICAL_EDGES.map(([logical]) => logical),
];

/**
 * Same computed property under its logical and its physical name. The pair has
 * to land on the same depth, otherwise one spelling silently outranks the other.
 * The list is also what folds the two spellings together when the coverage of a
 * property is compared with another's, so a missing entry costs detection there
 * as well.
 */
const LOGICAL_PHYSICAL_PAIRS: [string, string][] = [
  ...BOX_FAMILIES.flatMap((family): [string, string][] =>
    LOGICAL_PHYSICAL_EDGES.map(([logical, physical]) => [
      `${family}-${logical}`,
      `${family}-${physical}`,
    ]),
  ),
  ...LOGICAL_PHYSICAL_EDGES.map(([logical, physical]): [string, string] => [
    `inset-${logical}`,
    physical,
  ]),
  ...LOGICAL_PHYSICAL_EDGES.flatMap(
    ([logical, physical]): [string, string][] => [
      [`border-${logical}`, `border-${physical}`],
      ...BORDER_VALUES.map((value): [string, string] => [
        `border-${logical}-${value}`,
        `border-${physical}-${value}`,
      ]),
    ],
  ),
  ['border-start-start-radius', 'border-top-left-radius'],
  ['border-start-end-radius', 'border-top-right-radius'],
  ['border-end-start-radius', 'border-bottom-left-radius'],
  ['border-end-end-radius', 'border-bottom-right-radius'],
  ['corner-start-start-shape', 'corner-top-left-shape'],
  ['corner-start-end-shape', 'corner-top-right-shape'],
  ['corner-end-start-shape', 'corner-bottom-left-shape'],
  ['corner-end-end-shape', 'corner-bottom-right-shape'],
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

  /**
   * Two properties with no edge between them can still contain one another, and
   * that is where a missing edge hides. Until `padding-block` listed the physical
   * edges it sets, it covered `padding-top` while sharing its depth. Fold the two
   * spellings of one computed property together, then every property that covers
   * strictly more than another has to rank above it.
   */
  it('ranks a property above everything it covers, edge or not', () => {
    const alias = new Map(LOGICAL_PHYSICAL_PAIRS);
    const nodes = new Set(
      Object.entries(DIRECT_LONGHANDS).flatMap(([shorthand, longhands]) => [
        shorthand,
        ...longhands,
      ]),
    );

    const covered = new Map<string, Set<string>>();
    const coverageOf = (property: string): Set<string> => {
      const cached = covered.get(property);
      if (cached) return cached;

      const longhands = DIRECT_LONGHANDS[property];
      const coverage = longhands
        ? new Set(longhands.flatMap((longhand) => [...coverageOf(longhand)]))
        : new Set([alias.get(property) ?? property]);

      covered.set(property, coverage);
      return coverage;
    };

    const unranked: string[] = [];

    for (const property of nodes) {
      const coverage = coverageOf(property);

      for (const other of nodes) {
        if (other === property) continue;

        const otherCoverage = coverageOf(other);
        const covers =
          coverage.size > otherCoverage.size &&
          [...otherCoverage].every((leaf) => coverage.has(leaf));

        if (covers && getPropertyDepth(property) >= getPropertyDepth(other)) {
          unranked.push(
            `${property} covers ${other} but does not rank above it`,
          );
        }
      }
    }

    expect(unranked).toEqual([]);
  });

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
