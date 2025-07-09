import type { CSSProperties, CreateStyle } from '../index.js';
import { camelToKebabCase, genBase36Hash, applyCssValue, transpileAtomic } from '../index.js';

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

function processAtomicProps(flatProps: CreateStyle, atomicHashes: Set<string>, allStyleSheets: Set<string>, parentAtRule?: string) {
  Object.entries(flatProps).forEach(([property, value]) => {
    if (property.startsWith('@media') || property.startsWith('@container')) {
      processAtomicProps(value as CreateStyle, atomicHashes, allStyleSheets, property);
    } else {
      const CSSProp = camelToKebabCase(property);
      const normalizedValue = applyCssValue(value as string | number, CSSProp);
      const singlePropObj = { [property]: normalizedValue };
      const hashInput = parentAtRule ? { [parentAtRule]: singlePropObj } : singlePropObj;
      const atomicHash = genBase36Hash(hashInput, 1, 8);

      if (atomicHashes.has(atomicHash)) return;
      atomicHashes.add(atomicHash);

      let styleSheet = transpileAtomic(property, value as string | number, atomicHash);
      if (parentAtRule) {
        styleSheet = `${parentAtRule} { ${styleSheet} }`;
      }
      allStyleSheets.add(styleSheet + '\n');
    }
  });
}

export { splitAtomicAndNested, processAtomicProps };
