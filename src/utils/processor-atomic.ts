import type { CSSProperties } from '../index.js';
import { camelToKebabCase, genBase36Hash, applyCssValue, transpileAtomic } from '../index.js';
import { SHORTHAND_PROPERTIES } from './shorthand.js';

function splitAtomicAndNested(obj: CSSProperties, flat: CSSProperties, nonFlat: CSSProperties) {
  const queryFlat = flat as Record<string, unknown>;
  const queryNonFlat = nonFlat as Record<string, unknown>;
  Object.entries(obj).forEach(([property, value]) => {
    if (property.startsWith(':') || property.startsWith('[')) {
      queryNonFlat[property] = value;
    } else if (property.startsWith('@media') || property.startsWith('@container')) {
      const innerFlat: CSSProperties = {};
      const innerNonFlat: CSSProperties = {};
      splitAtomicAndNested(value as CSSProperties, innerFlat, innerNonFlat);
      if (Object.keys(innerFlat).length) queryFlat[property] = innerFlat;
      if (Object.keys(innerNonFlat).length) queryNonFlat[property] = innerNonFlat;
    } else {
      queryFlat[property] = value;
    }
  });
}

const LONG_TO_SHORT: Record<string, string> = {};
Object.entries(SHORTHAND_PROPERTIES).forEach(([shorthand, longhands]) => {
  longhands.forEach(long => {
    LONG_TO_SHORT[long] = shorthand;
  });
});

function processAtomicProps(flatProps: CSSProperties, atomicMap: Map<string, string>, parentAtRule?: string) {
  const resultQueue: Array<[string, string | number]> = [];
  for (const [key, style] of Object.entries(flatProps)) {
    if (key.startsWith('@media') || key.startsWith('@container')) {
      processAtomicProps(style as CSSProperties, atomicMap, key);
      continue;
    }

    resultQueue.push([key, style as string | number]);
  }

  for (const [property, value] of resultQueue) {
    const CSSProp = camelToKebabCase(property);
    const normalizedValue = applyCssValue(value, CSSProp);
    const singlePropObj = { [property]: normalizedValue };
    const styleObj = parentAtRule ? { [parentAtRule]: singlePropObj } : singlePropObj;
    const atomicHash = genBase36Hash(styleObj, 1, 8);

    if (atomicMap.has(atomicHash)) continue;

    let styleSheet = transpileAtomic(property, value, atomicHash);
    if (parentAtRule) {
      styleSheet = `${parentAtRule} { ${styleSheet} }`;
    }
    atomicMap.set(atomicHash, styleSheet + '\n');
  }
}

export { splitAtomicAndNested, processAtomicProps };
