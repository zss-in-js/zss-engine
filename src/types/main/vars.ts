export type VarsDefinition = Record<string, string | number | Record<string, string | number>>;

type CSSVariableKey = `--${string}`;
export type CSSVariableValue = `var(${CSSVariableKey})`;

type CSSVariableProperties = { [key: CSSVariableKey]: string | number };
export type VarsTransformed = { [key: string]: CSSVariableProperties };
