import { getPropertyDepth } from '../src/utils/shorthand';
import { DIRECT_LONGHANDS } from '../src/utils/shorthand-graph';
describe('shorthand graph invariants', () => {
  const entries = Object.entries(DIRECT_LONGHANDS);
  const nodes = new Set(
    entries.flatMap(([parent, children]) => [parent, ...children]),
  );

  it('contains no empty names, self edges, or duplicate edges', () => {
    for (const [shorthand, longhands] of entries) {
      expect(shorthand).not.toBe('');
      expect(new Set(longhands).size).toBe(longhands.length);

      for (const longhand of longhands) {
        expect(longhand).not.toBe('');
        expect(longhand).not.toBe(shorthand);
      }
    }
  });

  /**
   * Depth is defined as the longest path into a node, so it rises across every
   * edge for free — as long as there is no cycle to make the recursion bottom
   * out at zero. This is the test that keeps that assumption true; ranking a
   * pair that shares no edge belongs to the depth suite.
   */
  it('is acyclic', () => {
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (node: string, path: string[]): void => {
      if (visiting.has(node)) {
        throw new Error(`shorthand cycle: ${[...path, node].join(' -> ')}`);
      }
      if (visited.has(node)) return;

      visiting.add(node);
      for (const child of DIRECT_LONGHANDS[node] || []) {
        visit(child, [...path, node]);
      }
      visiting.delete(node);
      visited.add(node);
    };

    for (const node of nodes) visit(node, []);
    expect(visited).toEqual(nodes);
  });

  it('returns the independently calculated longest-path depth for every node', () => {
    const parents = new Map<string, string[]>();
    for (const [parent, children] of entries) {
      for (const child of children) {
        parents.set(child, [...(parents.get(child) || []), parent]);
      }
    }

    const expectedDepth = (node: string, path = new Set<string>()): number => {
      if (path.has(node)) throw new Error(`cycle while calculating ${node}`);
      const nextPath = new Set(path).add(node);
      return Math.max(
        0,
        ...(parents.get(node) || []).map(
          (parent) => expectedDepth(parent, nextPath) + 1,
        ),
      );
    };

    for (const node of nodes) {
      expect(getPropertyDepth(node)).toBe(expectedDepth(node));
    }
  });
});
