import type { CSSProperties } from '../common/css-properties';

export type CreateStyleType<T> = {
  readonly [K in keyof T]: T[K] extends CSSProperties ? CSSProperties : T[K];
};

export type CreateStyle = {
  [key: string]: CSSProperties;
};

type SelectorProperties<Properties> = {
  readonly properties: Properties;
};

type StyleAtomClassFor<P extends string, V> = {
  readonly property: `${P}: ${V & (string | number)}`;
};

export type ReturnType<T> = {
  [K in keyof T]: Readonly<{
    [P in keyof T[K]]: P extends `@media ${string}` | `@container ${string}` | `:${string}` | `&${string}`
      ? SelectorProperties<keyof T[K][P]>
      : StyleAtomClassFor<P & string, T[K][P]>;
  }>;
};
