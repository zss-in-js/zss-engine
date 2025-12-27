type CSSVariableKey = `--${string}`;
export type CSSVariableValue = `var(${CSSVariableKey})`;
export type CSSVariableProperty = { [key: CSSVariableKey]: string | number };

export type CreateStatic = Record<string, string | number>;

export type CreateTheme = Record<string, Record<string, string | number>>;
export type ReturnVariableType<T> = { [K in keyof T]: CSSVariableValue };

export type Styles = { [key: CSSVariableKey]: string };
