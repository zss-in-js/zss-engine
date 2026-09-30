export type { CSSProperties } from './types/css-properties.js';
export { genBase36Hash } from './utils/hash.js';
export { transpile } from './utils/transpile.js';
export { transpileAtomic } from './utils/transpile-atomic.js';
export {
  splitAtomicAndNested,
  processAtomicProps,
} from './utils/processor-atomic.js';
export {
  camelToKebabCase,
  kebabToCamelCase,
  applyCssValue,
  isAtRule,
  exceptionCamelCase,
} from './utils/helper.js';
export { DIRECT_LONGHANDS } from './utils/shorthand-graph.js';
export { impliesCondition } from './utils/parse-conditional-rule.js';
export type { Specificity } from './utils/specificity.js';
export {
  getSpecificity,
  getPseudoElement,
  findSameNameNesting,
} from './utils/specificity.js';
export type { PropertySpelling } from './utils/logicalPhysical.js';
export {
  canonicalProperty,
  counterpartOf,
  spellingOf,
} from './utils/logicalPhysical.js';
