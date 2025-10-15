import { applyCssValue, camelToKebabCase } from './helper.js';
import { SHORTHAND_PROPERTIES } from './shorthand.js';

const ALL_LONGHANDS = new Set(Object.values(SHORTHAND_PROPERTIES).flat());

function transpileAtomic(property: string, value: string | number, hash: string): string {
  if (typeof value === 'string' || typeof value === 'number') {
    const CSSProp = camelToKebabCase(property);
    const applyValue = applyCssValue(value, CSSProp);

    let selector = `.${hash}`;
    if (ALL_LONGHANDS.has(CSSProp)) {
      selector += ':not(#\\#)';
    }

    const atomicRule = `${selector} { ${CSSProp}: ${applyValue}; }`;

    if (property.startsWith('@media') || property.startsWith('@container')) {
      return `${property} { ${atomicRule} }`;
    }

    return atomicRule;
  }
  return '';
}

export { transpileAtomic };
