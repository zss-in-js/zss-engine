import { CreateStyle } from '../types/main/create.js';

export function transformNestedSelectors(nonFlat: CreateStyle): CreateStyle {
  const modNonFlat: CreateStyle = {};
  Object.entries(nonFlat).forEach(([atRule, nestedObj]) => {
    if (atRule.startsWith(':') || atRule.startsWith('&')) {
      modNonFlat[`:not(#\\#)${atRule}`] = nestedObj;
    } else {
      modNonFlat[atRule] = nestedObj;
    }
  });
  return modNonFlat;
}
