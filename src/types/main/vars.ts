type CSSVariableKey = `--${string}`;
export type CSSVariableValue = `var(${CSSVariableKey})`;
export type CSSVariableProperty = { [key: CSSVariableKey]: string | number };
export type CreateVars = Record<string, string | number>;
export type CreateTheme = Record<string, Record<string, string | number>>;

type IsUppercase<S extends string> = S extends Uppercase<S> ? (S extends Lowercase<S> ? false : true) : false;
type IsDigit<S extends string> = S extends `${number}` ? true : false;

type CamelToKebab<S extends string, PrevType = 'start'> = S extends `${infer First}${infer Rest}`
  ? IsUppercase<First> extends true
    ? PrevType extends 'upper' | 'start'
      ? `${Lowercase<First>}${CamelToKebab<Rest, 'upper'>}`
      : `-${Lowercase<First>}${CamelToKebab<Rest, 'upper'>}`
    : IsDigit<First> extends true
    ? PrevType extends 'digit' | 'lower'
      ? `${First}${CamelToKebab<Rest, 'digit'>}`
      : `-${First}${CamelToKebab<Rest, 'digit'>}`
    : `${First}${CamelToKebab<Rest, 'lower'>}`
  : S;

type RemoveLeadingHyphen<S extends string> = S extends `-${infer Rest}` ? Rest : S;

export type CamelToKebabCase<S extends string> = RemoveLeadingHyphen<CamelToKebab<S>>;
