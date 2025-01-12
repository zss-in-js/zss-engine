export type VarsDefinition = Record<string, string | Record<string, string>>;

type CSSVariableKey = `--${string}`;
export type CSSVariableValue = `var(${CSSVariableKey})`;

type CSSVariableProperties = { [key: CSSVariableKey]: string | number };
export type VarsTransformed = { [key: string]: CSSVariableProperties };
