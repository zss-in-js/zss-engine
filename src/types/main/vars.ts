type CSSVariableKey = `--${string}`;
export type CSSVariableValue = `var(${CSSVariableKey})`;
export type CSSVariableProperty = { [key: CSSVariableKey]: string | number };

export type CreateValues = Record<string, string | number>;
export type CreateTheme = Record<string, Record<string, string | number>>;
