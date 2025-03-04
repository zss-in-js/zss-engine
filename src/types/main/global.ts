import type { CustomProperties, MediaQuery } from '../common/css-properties';

type JSXType = keyof HTMLElementTagNameMap | '*' | ':root';
type HTMLType = {
  [K in JSXType]: CustomProperties;
};

type ClassName = `.${string}`;
type ClassNameType = {
  [K in ClassName]: CustomProperties;
};

type Attribute = `${string}[${string}]${string}`;
type AttributeType = {
  [K in Attribute]: CustomProperties;
};

type Consecutive = `${JSXType} ${string}`;
type ConsecutiveType = {
  [K in Consecutive]: CustomProperties;
};

type PseudoClass = `${JSXType}:${string}`;
type PseudoClassType = {
  [K in PseudoClass]: CustomProperties;
};

type PseudoElement = `::${string}`;
type PseudoElementType = {
  [K in PseudoElement]: CustomProperties;
};

type KeyframeSelector = 'from' | 'to' | `${number}%`;

export type KeyframesDefinition = {
  [K in KeyframeSelector]?: CustomProperties;
};

type KeyframesType = {
  [K in `@keyframes ${string}`]: KeyframesDefinition;
};

type MediaQueryHTMLType = {
  [K in MediaQuery]: CustomHTMLType;
};

export type CustomHTMLType =
  | HTMLType
  | ClassNameType
  | AttributeType
  | ConsecutiveType
  | PseudoClassType
  | PseudoElementType
  | KeyframesType
  | MediaQueryHTMLType;
