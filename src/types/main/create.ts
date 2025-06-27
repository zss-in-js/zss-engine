import type { CSSProperties } from '../common/css-properties';

export type CreateStyleType<T> = {
  readonly [K in keyof T]: T[K] extends CSSProperties ? CSSProperties : T[K];
};

export type CreateStyle = {
  [key: string]: CSSProperties;
};

type Selector<Properties> = {
  readonly properties: Properties;
};

export type ReturnType<T> = {
  [K in keyof T]: Readonly<{
    [P in keyof T[K]]: P extends `@media ${string}` | `@container ${string}` | `:${string}` | `&${string}` ? Selector<keyof T[K][P]> : Readonly<T[K][P]>;
  }>;
};
