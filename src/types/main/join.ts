export type Join<T extends readonly string[]> = T extends [infer F extends string, ...infer R extends string[]] ? `${F}${Join<R>}` : '';
