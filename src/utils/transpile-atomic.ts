import { applyCssValue, camelToKebabCase } from './helper';

function transpileAtomic(property: string, value: string | number, hash: string): string {
  if (typeof value === 'string' || typeof value === 'number') {
    const CSSProp = camelToKebabCase(property);
    const applyValue = applyCssValue(value, CSSProp);
    const atomicRule = `.${hash} { ${CSSProp}: ${applyValue}; }`;

    if (property.startsWith('@media') || property.startsWith('@container')) {
      return `${property} {\n  ${atomicRule}\n}\n`;
    }

    return `${atomicRule}\n`;
  }
  return '';
}

export { transpileAtomic };
