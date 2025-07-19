import type { CSSProperties, Query } from '../common/css-properties';

type JSXType = keyof HTMLElementTagNameMap | '*' | ':root';
type HTMLSelector = {
  [K in JSXType]: CSSProperties;
};

type Attribute = `${string}[${string}]${string}`;
type AttributeSelector = {
  [K in Attribute]: CSSProperties;
};

type Consecutive = `${JSXType} ${string}`;
type ConsecutiveSelector = {
  [K in Consecutive]: CSSProperties;
};

type PseudoClass = `${JSXType}:${string}`;
type PseudoClassSelector = {
  [K in PseudoClass]: CSSProperties;
};

type PseudoElement = `::${string}`;
type PseudoElementSelector = {
  [K in PseudoElement]: CSSProperties;
};

type KeyframesInSelector = 'from' | 'to' | `${number}%`;

export type CreateKeyframes = {
  [K in KeyframesInSelector]?: CSSProperties;
};

type KeyframesSelector = {
  [K in `@keyframes ${string}`]: CreateKeyframes;
};

type QuerySelectorHTML = {
  [K in Query]: CSSHTML;
};

export type CSSHTML =
  | HTMLSelector
  | AttributeSelector
  | ConsecutiveSelector
  | PseudoClassSelector
  | PseudoElementSelector
  | KeyframesSelector
  | QuerySelectorHTML;
