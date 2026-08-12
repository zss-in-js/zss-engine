import { DIRECT_LONGHANDS } from './shorthand-graph.js';

const DIRECT_SHORTHANDS: Record<string, string[]> = {};
for (const [shorthand, longhands] of Object.entries(DIRECT_LONGHANDS)) {
  for (const longhand of longhands) {
    if (!DIRECT_SHORTHANDS[longhand]) DIRECT_SHORTHANDS[longhand] = [];
    DIRECT_SHORTHANDS[longhand].push(shorthand);
  }
}

const depthCache = new Map<string, number>();

export const getPropertyDepth = (property: string): number => {
  const cached = depthCache.get(property);
  if (cached !== undefined) return cached;
  depthCache.set(property, 0);

  let depth = 0;
  for (const shorthand of DIRECT_SHORTHANDS[property] || []) {
    depth = Math.max(depth, getPropertyDepth(shorthand) + 1);
  }

  depthCache.set(property, depth);
  return depth;
};
