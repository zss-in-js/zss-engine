import type { CSSProperties } from '../index.js';
import { camelToKebabCase, applyCssValue, isAtRule } from './helper.js';
import { transpileAtomic } from './transpile-atomic.js';
import { genBase36Hash } from './hash.js';

function splitAtomicAndNested(obj: CSSProperties, flat: CSSProperties, nonFlat: CSSProperties) {
  const queryFlat = flat as Record<string, unknown>;
  const queryNonFlat = nonFlat as Record<string, unknown>;
  Object.entries(obj).forEach(([property, value]) => {
    if (property.startsWith(':') || property.startsWith('[')) {
      queryNonFlat[property] = value;
    } else if (isAtRule(property)) {
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

function processAtomicProps(flatProps: CSSProperties, atomicMap: Map<string, string>, parentAtRule?: string) {
  const resultQueue: Array<[string, string | number]> = [];
  for (const [key, style] of Object.entries(flatProps)) {
    if (isAtRule(key)) {
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
