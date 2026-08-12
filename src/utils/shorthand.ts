// reference [https://github.com/ota-meshi/eslint-plugin-css/blob/main/lib/utils/resource/index.ts]

const DIRECT_LONGHANDS: Record<string, string[]> = {
  margin: ['margin-top', 'margin-bottom', 'margin-left', 'margin-right'],
  padding: ['padding-top', 'padding-bottom', 'padding-left', 'padding-right'],
  background: [
    'background-image',
    'background-size',
    'background-position',
    'background-repeat',
    'background-origin',
    'background-clip',
    'background-attachment',
    'background-color',
  ],
  font: ['font-style', 'font-variant', 'font-weight', 'font-stretch', 'font-size', 'font-family', 'line-height'],
  border: ['border-width', 'border-style', 'border-color', 'border-top', 'border-bottom', 'border-left', 'border-right', 'border-block', 'border-inline'],
  'border-top': ['border-top-width', 'border-top-style', 'border-top-color'],
  'border-bottom': ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
  'border-left': ['border-left-width', 'border-left-style', 'border-left-color'],
  'border-right': ['border-right-width', 'border-right-style', 'border-right-color'],
  'border-width': ['border-top-width', 'border-bottom-width', 'border-left-width', 'border-right-width'],
  'border-style': ['border-top-style', 'border-bottom-style', 'border-left-style', 'border-right-style'],
  'border-color': ['border-top-color', 'border-bottom-color', 'border-left-color', 'border-right-color'],
  'list-style': ['list-style-type', 'list-style-position', 'list-style-image'],
  'border-radius': ['border-top-right-radius', 'border-top-left-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
  transition: ['transition-delay', 'transition-duration', 'transition-property', 'transition-timing-function'],
  animation: [
    'animation-name',
    'animation-duration',
    'animation-timing-function',
    'animation-delay',
    'animation-iteration-count',
    'animation-direction',
    'animation-fill-mode',
    'animation-play-state',
  ],
  'border-block': ['border-block-start', 'border-block-end', 'border-block-width', 'border-block-style', 'border-block-color'],
  'border-block-end': ['border-block-end-width', 'border-block-end-style', 'border-block-end-color'],
  'border-block-start': ['border-block-start-width', 'border-block-start-style', 'border-block-start-color'],
  'border-block-width': ['border-block-start-width', 'border-block-end-width'],
  'border-block-style': ['border-block-start-style', 'border-block-end-style'],
  'border-block-color': ['border-block-start-color', 'border-block-end-color'],
  'border-image': ['border-image-source', 'border-image-slice', 'border-image-width', 'border-image-outset', 'border-image-repeat'],
  'border-inline': ['border-inline-start', 'border-inline-end', 'border-inline-width', 'border-inline-style', 'border-inline-color'],
  'border-inline-end': ['border-inline-end-width', 'border-inline-end-style', 'border-inline-end-color'],
  'border-inline-start': ['border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color'],
  'border-inline-width': ['border-inline-start-width', 'border-inline-end-width'],
  'border-inline-style': ['border-inline-start-style', 'border-inline-end-style'],
  'border-inline-color': ['border-inline-start-color', 'border-inline-end-color'],
  'column-rule': ['column-rule-width', 'column-rule-style', 'column-rule-color'],
  columns: ['column-width', 'column-count'],
  flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
  'flex-flow': ['flex-direction', 'flex-wrap'],
  grid: ['grid-template', 'grid-auto-rows', 'grid-auto-columns', 'grid-auto-flow', 'grid-gap'],
  'grid-template': ['grid-template-columns', 'grid-template-rows', 'grid-template-areas'],
  'grid-area': ['grid-row', 'grid-column'],
  'grid-column': ['grid-column-start', 'grid-column-end'],
  'grid-gap': ['grid-row-gap', 'grid-column-gap'],
  'grid-row': ['grid-row-start', 'grid-row-end'],
  outline: ['outline-color', 'outline-style', 'outline-width'],
  'text-decoration': ['text-decoration-color', 'text-decoration-style', 'text-decoration-line', 'text-decoration-thickness'],
  'text-emphasis': ['text-emphasis-style', 'text-emphasis-color'],
  mask: ['mask-image', 'mask-mode', 'mask-position', 'mask-size', 'mask-repeat', 'mask-origin', 'mask-clip', 'mask-composite'],
};

// Longhand -> its direct shorthands
const DIRECT_SHORTHANDS: Record<string, string[]> = {};
for (const [shorthand, longhands] of Object.entries(DIRECT_LONGHANDS)) {
  for (const longhand of longhands) {
    if (!DIRECT_SHORTHANDS[longhand]) DIRECT_SHORTHANDS[longhand] = [];
    DIRECT_SHORTHANDS[longhand].push(shorthand);
  }
}

// Transitive expansion: border -> border-top -> border-top-width are all listed under `border`
const expand = (shorthand: string, seen: Set<string>) => {
  for (const longhand of DIRECT_LONGHANDS[shorthand] || []) {
    if (seen.has(longhand)) continue;
    seen.add(longhand);
    expand(longhand, seen);
  }
  return seen;
};

export const SHORTHAND_PROPERTIES: Record<string, string[]> = {};
for (const shorthand of Object.keys(DIRECT_LONGHANDS)) {
  SHORTHAND_PROPERTIES[shorthand] = [...expand(shorthand, new Set<string>())];
}

export const LONG_TO_SHORT: Record<string, string[]> = {};
Object.entries(SHORTHAND_PROPERTIES).forEach(([shorthand, longhands]) => {
  longhands.forEach(longhand => {
    if (!LONG_TO_SHORT[longhand]) {
      LONG_TO_SHORT[longhand] = [];
    }
    LONG_TO_SHORT[longhand].push(shorthand);
  });
});

// Cascade depth: the longest shorthand chain reaching this property.
// border: 0, border-top / border-width: 1, border-top-width: 2
const depthCache = new Map<string, number>();

export const getPropertyDepth = (property: string): number => {
  const cached = depthCache.get(property);
  if (cached !== undefined) return cached;

  // Guard against a cycle in the graph before recursing
  depthCache.set(property, 0);

  let depth = 0;
  for (const shorthand of DIRECT_SHORTHANDS[property] || []) {
    depth = Math.max(depth, getPropertyDepth(shorthand) + 1);
  }

  depthCache.set(property, depth);
  return depth;
};

export const MAX_PROPERTY_DEPTH = Object.keys(DIRECT_SHORTHANDS).reduce((max, property) => Math.max(max, getPropertyDepth(property)), 0);
