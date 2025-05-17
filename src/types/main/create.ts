import type { CSSProperties } from '../common/css-properties';

export type CreateStyleType<T> = {
  readonly [K in keyof T]: T[K] extends CSSProperties ? CSSProperties : T[K];
};

export type CreateStyle = {
  [key: string]: CSSProperties;
};

export type ReturnType<T> = { [key in keyof T]: string };
