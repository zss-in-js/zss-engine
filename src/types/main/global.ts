import type { CSSProperties, MediaQuery } from '../common/css-properties';

type JSXType = keyof HTMLElementTagNameMap | '*' | ':root';
type HTMLType = {
  [K in JSXType]: CSSProperties;
};

type ClassName = `.${string}`;
type ClassNameType = {
  [K in ClassName]: CSSProperties;
};

type Attribute = `${string}[${string}]${string}`;
type AttributeType = {
  [K in Attribute]: CSSProperties;
};

type Consecutive = `${JSXType} ${string}`;
type ConsecutiveType = {
  [K in Consecutive]: CSSProperties;
};

type PseudoClass = `${JSXType}:${string}`;
type PseudoClassType = {
  [K in PseudoClass]: CSSProperties;
};

type PseudoElement = `::${string}`;
type PseudoElementType = {
  [K in PseudoElement]: CSSProperties;
};

type KeyframeSelector = 'from' | 'to' | `${number}%`;

export type CreateKeyframes = {
  [K in KeyframeSelector]?: CSSProperties;
};

type KeyframesType = {
  [K in `@keyframes ${string}`]: CreateKeyframes;
};

type MediaQueryHTMLType = {
  [K in MediaQuery]: CSSHTML;
};

export type CSSHTML = HTMLType | ClassNameType | AttributeType | ConsecutiveType | PseudoClassType | PseudoElementType | KeyframesType | MediaQueryHTMLType;
