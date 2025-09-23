type CSSVariableKey = `--${string}`;
export type CSSVariableValue = `var(${CSSVariableKey})`;
export type CSSVariableProperty = { [key: CSSVariableKey]: string | number };

export type CreateValues = Record<string, string | number>;
export type CreateTokens = Record<string, Record<string, string | number>>;
export type ReturnVariableType<T> = { [K in keyof T]: CSSVariableValue };

export type RxVariableSet = { [key: CSSVariableKey]: string };
export type ReturnRx = {
  className: string;
  style: {
    [k: string]: string;
  };
};
