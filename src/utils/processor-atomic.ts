import type { CSSProperties, CreateStyle } from '../index.js';
import { camelToKebabCase, genBase36Hash, applyCssValue, transpileAtomic } from '../index.js';
import { SHORTHAND_PROPERTIES } from './shorthand.js';

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

function processAtomicProps(flatProps: CSSProperties, atomicHashes: Set<string>, allStyleSheets: Set<string>, parentAtRule?: string) {
  const resultQueue: Array<[string, string | number]> = [];
  for (const [property, value] of Object.entries(flatProps)) {
    if (property.startsWith('@media') || property.startsWith('@container')) {
      processAtomicProps(value as CreateStyle, atomicHashes, allStyleSheets, property);
      continue;
    }

    resultQueue.push([property, value as string | number]);
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
