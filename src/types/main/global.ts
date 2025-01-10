import { JSX } from 'react';
import type { CustomProperties, MediaQuery } from '../common/css-properties';

type JSXType = keyof JSX.IntrinsicElements | '*' | ':root';
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

type Pseudo = `${JSXType}:${string}`;
type PseudoType = {
  [K in Pseudo]: CustomProperties;
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

export type CustomHTMLType = HTMLType | ClassNameType | AttributeType | ConsecutiveType | PseudoType | KeyframesType | MediaQueryHTMLType;
