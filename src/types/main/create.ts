import type { CustomProperties } from '../common/css-properties';

export type CreateStyle<T> = {
  readonly [K in keyof T]: T[K] extends CustomProperties ? CustomProperties : T[K];
};

export type ClassesStyle = {
  [key: string]: CustomProperties;
};

export type ReturnType<T> = { [key in keyof T]: string };
