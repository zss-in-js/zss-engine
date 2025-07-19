import type { CSSProperties, CreateStyle } from '../index.js';
import { camelToKebabCase, genBase36Hash, applyCssValue, transpileAtomic } from '../index.js';
import { SHORTHAND_PROPERTIES } from './shorthand';

function splitAtomicAndNested(obj: CSSProperties, flat: CreateStyle, nonFlat: CreateStyle) {
  Object.entries(obj).forEach(([property, value]) => {
    if (property.startsWith(':') || property.startsWith('&')) {
      nonFlat[property] = value;
    } else if (property.startsWith('@media') || property.startsWith('@container')) {
      const innerFlat: CreateStyle = {};
      const innerNonFlat: CreateStyle = {};
      splitAtomicAndNested(value as Record<string, unknown>, innerFlat, innerNonFlat);
      if (Object.keys(innerFlat).length) flat[property] = innerFlat;
      if (Object.keys(innerNonFlat).length) nonFlat[property] = innerNonFlat;
    } else if (typeof value === 'object' && value !== null) {
      flat[property] = value;
    } else {
      flat[property] = value;
    }
  });
}

const LONG_TO_SHORT: Record<string, string> = {};
Object.entries(SHORTHAND_PROPERTIES).forEach(([shorthand, longhands]) => {
  longhands.forEach(long => {
    LONG_TO_SHORT[long] = shorthand;
  });
});

function processAtomicProps(flatProps: CreateStyle, atomicHashes: Set<string>, allStyleSheets: Set<string>, parentAtRule?: string) {
  const seen = new Set<string>();
  const resultQueue: Array<[string, string | number]> = [];

  for (const [property, value] of Object.entries(flatProps)) {
    if (property.startsWith('@media') || property.startsWith('@container')) {
      processAtomicProps(value as CreateStyle, atomicHashes, allStyleSheets, property);
      continue;
    }

    const kebab = camelToKebabCase(property);

    if (SHORTHAND_PROPERTIES[kebab]) {
      const longhands = SHORTHAND_PROPERTIES[kebab];
      longhands.forEach(l => seen.delete(l));
      seen.add(kebab);
      resultQueue.push([property, value as string | number]);
    } else if (kebab in LONG_TO_SHORT) {
      const shorthand = LONG_TO_SHORT[kebab];
      if (seen.has(shorthand)) {
        continue;
      }
      seen.add(kebab);
      resultQueue.push([property, value as string | number]);
    } else {
      seen.add(kebab);
      resultQueue.push([property, value as string | number]);
    }
  }

  for (const [property, value] of resultQueue) {
    const CSSProp = camelToKebabCase(property);
    const normalizedValue = applyCssValue(value, CSSProp);
    const singlePropObj = { [property]: normalizedValue };
    const styleObj = parentAtRule ? { [parentAtRule]: singlePropObj } : singlePropObj;
    const atomicHash = genBase36Hash(styleObj, 1, 8);

    if (atomicHashes.has(atomicHash)) continue;
    atomicHashes.add(atomicHash);

    let styleSheet = transpileAtomic(property, value, atomicHash);
    if (parentAtRule) {
      styleSheet = `${parentAtRule} { ${styleSheet} }`;
    }
    allStyleSheets.add(styleSheet + '\n');
  }
}

export { splitAtomicAndNested, processAtomicProps };
