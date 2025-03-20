export type VarsDefinition = Record<string, string | number | Record<string, string | number>>;

type CSSVariableKey = `--${string}`;
export type CSSVariableValue = `var(${CSSVariableKey})`;

export type CSSVariableProperty = { [key: CSSVariableKey]: string | number };
export type VarsTransformed = { [key: string]: CSSVariableProperty };
