import { applyCssValue, camelToKebabCase, isAtRule } from './helper.js';
import { getPropertyDepth } from './shorthand.js';

function transpileAtomic(property: string, value: string | number, hash: string, pseudo?: string): string {
  if (typeof value === 'string' || typeof value === 'number') {
    const CSSProp = camelToKebabCase(property);
    const applyValue = applyCssValue(value, CSSProp);
    let selector = `.${hash}` + ':not(#\\#)'.repeat(getPropertyDepth(CSSProp));

    if (pseudo) {
      selector += pseudo;
    }

    const atomicRule = `${selector} { ${CSSProp}: ${applyValue}; }`;

    if (isAtRule(property)) {
      return `${property} { ${atomicRule} }`;
    }

    return atomicRule;
  }
  return '';
}

export { transpileAtomic };
