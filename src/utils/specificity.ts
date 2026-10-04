export type Specificity = [number, number, number];

const LEGACY_PSEUDO_ELEMENTS = new Set([
  'before',
  'after',
  'first-line',
  'first-letter',
]);

const SUM = 0;
const HIGHEST = 1;
const BEFORE_OF = 2;
const IGNORED = 3;

type Kind = typeof SUM | typeof HIGHEST | typeof BEFORE_OF | typeof IGNORED;

type Frame = { kind: Kind; sum: Specificity; best: Specificity };

const isNameChar = (char: string): boolean => /[\w-]/.test(char);

const escapeEnd = (selector: string, start: number): number => {
  let end = start + 1;

  while (end < selector.length && end - start <= 6) {
    const code = selector.charCodeAt(end);
    if (!(
      (code >= 0x30 && code <= 0x39) ||
      (code >= 0x41 && code <= 0x46) ||
      (code >= 0x61 && code <= 0x66)
    )) {
      break;
    }
    end += 1;
  }

  if (end === start + 1) {
    return Math.min(start + 2, selector.length);
  }

  if (end < selector.length) {
    const code = selector.charCodeAt(end);
    if (
      code === 0x09 ||
      code === 0x0a ||
      code === 0x0c ||
      code === 0x0d ||
      code === 0x20
    ) {
      end += 1;
    }
  }

  return end;
};

const skipName = (selector: string, from: number): number => {
  let index = from;
  while (index < selector.length) {
    if (selector[index] === '\\') {
      index = escapeEnd(selector, index);
      continue;
    }
    if (!isNameChar(selector[index])) break;
    index += 1;
  }
  return index;
};

const skipString = (source: string, quote: string, from: number): number => {
  let index = from;
  while (index < source.length && source[index] !== quote) {
    if (source[index] === '\\') index += 1;
    index += 1;
  }
  return Math.min(index + 1, source.length);
};

const skipComment = (selector: string, from: number): number => {
  const end = selector.indexOf('*/', from + 2);
  return end < 0 ? selector.length : end + 2;
};

const findClose = (selector: string, open: number): number => {
  let depth = 0;
  for (let index = open; index < selector.length; index++) {
    const char = selector[index];
    if (char === '/' && selector[index + 1] === '*') {
      index = skipComment(selector, index) - 1;
      continue;
    }
    if (char === '\\') {
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      index = skipString(selector, char, index + 1) - 1;
      continue;
    }
    if (char === '(') depth += 1;
    else if (char === ')') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return selector.length;
};

const skipBracket = (selector: string, open: number): number => {
  for (let index = open + 1; index < selector.length; index++) {
    const char = selector[index];
    if (char === '/' && selector[index + 1] === '*') {
      index = skipComment(selector, index) - 1;
      continue;
    }
    if (char === '\\') {
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      index = skipString(selector, char, index + 1) - 1;
      continue;
    }
    if (char === ']') return index + 1;
  }
  return selector.length;
};

const IDENT_BYTE = 1;
const IDENT_START = 2;
const IDENT_CLASS = new Uint8Array(128);
for (let code = 0; code < 128; code++) {
  const char = String.fromCharCode(code);
  if (/[A-Za-z_]/.test(char)) IDENT_CLASS[code] = IDENT_BYTE | IDENT_START;
  else if (/[0-9-]/.test(char)) IDENT_CLASS[code] = IDENT_BYTE;
}

const identClass = (selector: string, index: number): number => {
  if (index >= selector.length) return 0;
  const code = selector.charCodeAt(index);
  return code >= 0x80 ? IDENT_BYTE | IDENT_START : IDENT_CLASS[code];
};

const validEscape = (selector: string, index: number): boolean =>
  selector[index] === '\\' &&
  (index + 1 >= selector.length || !'\n\r\f'.includes(selector[index + 1]));

const startsIdent = (selector: string, index: number): boolean => {
  const char = selector[index];
  if (char === '-')
    return (
      (identClass(selector, index + 1) & IDENT_START) !== 0 ||
      selector[index + 1] === '-' ||
      validEscape(selector, index + 1)
    );
  if (char === '\\') return validEscape(selector, index);
  return (identClass(selector, index) & IDENT_START) !== 0;
};

let identEscaped = false;
const skipIdent = (selector: string, from: number): number => {
  let index = from;
  identEscaped = false;
  for (;;) {
    while (identClass(selector, index) & IDENT_BYTE) index += 1;
    if (!validEscape(selector, index)) return index;
    index = escapeEnd(selector, index);
    identEscaped = true;
  }
};
const hexValue = (code: number): number => {
  if (code >= 0x30 && code <= 0x39) return code - 0x30;
  const lower = code | 0x20;
  return lower >= 0x61 && lower <= 0x66 ? lower - 0x57 : -1;
};

const escapeValue = (selector: string, start: number, end: number): number => {
  let value = 0;
  let index = start + 1;
  let digit: number;
  while (index < end && (digit = hexValue(selector.charCodeAt(index))) >= 0) {
    value = value * 16 + digit;
    index += 1;
  }
  if (index === start + 1) return selector.codePointAt(start + 1) ?? 0xfffd;
  return value === 0 || value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)
    ? 0xfffd
    : value;
};
// An escaped identifier decoded and lowercased; empty when it cannot be a keyword.
const decodeKeyword = (
  selector: string,
  start: number,
  end: number,
): string => {
  let result = '';
  let index = start;
  while (index < end) {
    let code: number;
    if (selector[index] === '\\') {
      const next = escapeEnd(selector, index);
      code = escapeValue(selector, index, next);
      index = next;
    } else {
      code = selector.charCodeAt(index);
      index += 1;
    }
    if (code >= 0x80) return '';
    result += String.fromCharCode(
      code >= 0x41 && code <= 0x5a ? code + 0x20 : code,
    );
  }
  return result;
};

// Whether the identifier at start..end is word (lowercase ASCII), without slicing it.
const identIs = (
  selector: string,
  start: number,
  end: number,
  decoded: string | null,
  word: string,
): boolean => {
  if (decoded !== null) return decoded === word;
  if (end - start !== word.length) return false;
  for (let k = 0; k < word.length; k++) {
    const code = selector.charCodeAt(start + k);
    if (
      (code >= 0x41 && code <= 0x5a ? code + 0x20 : code) !== word.charCodeAt(k)
    )
      return false;
  }
  return true;
};
const frame = (kind: Kind): Frame => ({
  kind,
  sum: [0, 0, 0],
  best: [0, 0, 0],
});

const add = (total: Specificity, value: Specificity) => {
  total[0] += value[0];
  total[1] += value[1];
  total[2] += value[2];
};

const higher = (a: Specificity, b: Specificity): Specificity =>
  (b[0] - a[0] || b[1] - a[1] || b[2] - a[2]) > 0 ? b : a;

const ELEMENT: [Specificity, Kind] = [[0, 0, 1], IGNORED];
const ELEMENT_WITH_ARGUMENT: [Specificity, Kind] = [[0, 0, 1], HIGHEST];
const WHERE: [Specificity, Kind] = [[0, 0, 0], IGNORED];
const HIGHEST_ARGUMENT: [Specificity, Kind] = [[0, 0, 0], HIGHEST];
const HOST: [Specificity, Kind] = [[0, 1, 0], HIGHEST];
const NTH: [Specificity, Kind] = [[0, 1, 0], BEFORE_OF];
const CLASS: [Specificity, Kind] = [[0, 1, 0], IGNORED];

// Pseudo rules looked up by length and first letter, so a name is compared once.
const pseudoAt = (
  selector: string,
  start: number,
  end: number,
  escaped: boolean,
  doubleColon: boolean,
): [Specificity, Kind] => {
  const decoded = escaped ? decodeKeyword(selector, start, end) : null;
  const is = (word: string) => identIs(selector, start, end, decoded, word);
  const length = decoded === null ? end - start : decoded.length;
  const first =
    (decoded === null ? selector.charCodeAt(start) : decoded.charCodeAt(0)) |
    0x20;
  if (doubleColon) {
    return (first === 0x73 && is('slotted')) ||
      (first === 0x63 && (is('cue') || is('cue-region')))
      ? ELEMENT_WITH_ARGUMENT
      : ELEMENT;
  }
  switch (length) {
    case 2:
      return first === 0x69 && is('is') ? HIGHEST_ARGUMENT : CLASS;
    case 3:
      return (first === 0x6e && is('not')) || (first === 0x68 && is('has'))
        ? HIGHEST_ARGUMENT
        : CLASS;
    case 4:
      return first === 0x68 && is('host') ? HOST : CLASS;
    case 5:
      if (first === 0x77 && is('where')) return WHERE;
      return first === 0x61 && is('after') ? ELEMENT : CLASS;
    case 6:
      return first === 0x62 && is('before') ? ELEMENT : CLASS;
    case 9:
      return first === 0x6e && is('nth-child') ? NTH : CLASS;
    case 10:
      return first === 0x66 && is('first-line') ? ELEMENT : CLASS;
    case 12:
      if (first === 0x68 && is('host-context')) return HOST;
      return first === 0x66 && is('first-letter') ? ELEMENT : CLASS;
    case 14:
      return first === 0x6e && is('nth-last-child') ? NTH : CLASS;
    default:
      return CLASS;
  }
};
const close = (stack: Frame[]) => {
  const top = stack.pop() as Frame;
  if (top.kind === SUM) add(stack[stack.length - 1].sum, top.sum);
  else if (top.kind === HIGHEST)
    add(stack[stack.length - 1].sum, higher(top.best, top.sum));
};

export function getSpecificity(selector: string): Specificity {
  const stack: Frame[] = [frame(SUM)];
  let index = 0;

  while (index < selector.length) {
    const char = selector[index];
    const top = stack[stack.length - 1];
    const counting = top.kind === SUM || top.kind === HIGHEST;

    // Inside `:nth-child(` a word may start with a digit, so `1of` stays one word.
    const ident =
      char === '\\' || char === '-'
        ? startsIdent(selector, index)
        : (identClass(selector, index) &
            (top.kind === BEFORE_OF ? IDENT_BYTE : IDENT_START)) !==
          0;
    if (ident) {
      const end = skipIdent(selector, index);
      if (selector[end] === '(') {
        stack.push(frame(counting ? SUM : IGNORED));
        index = end + 1;
        continue;
      }
      if (top.kind === BEFORE_OF) {
        const decoded = identEscaped
          ? decodeKeyword(selector, index, end)
          : null;
        if (identIs(selector, index, end, decoded, 'of')) top.kind = HIGHEST;
      } else if (counting) {
        top.sum[2] += 1;
      }
      index = end;
      continue;
    }
    if (char === '/' && selector[index + 1] === '*') {
      index = skipComment(selector, index);
      continue;
    }
    if (char === '"' || char === "'") {
      index = skipString(selector, char, index + 1);
      continue;
    }
    if (char === '(') {
      stack.push(frame(counting ? SUM : IGNORED));
      index += 1;
      continue;
    }
    if (char === ')') {
      if (stack.length > 1) close(stack);
      index += 1;
      continue;
    }
    if (char === '[') {
      if (counting) top.sum[1] += 1;
      index = skipBracket(selector, index);
      continue;
    }
    if (
      (char === '#' || char === '.') &&
      (startsIdent(selector, index + 1) ||
        (char === '#' &&
          ((identClass(selector, index + 1) & IDENT_BYTE) !== 0 ||
            validEscape(selector, index + 1))))
    ) {
      if (counting) top.sum[char === '#' ? 0 : 1] += 1;
      index = skipIdent(selector, index + 1);
      continue;
    }
    if (char === ',') {
      if (top.kind === HIGHEST) {
        top.best = higher(top.best, top.sum);
        top.sum = [0, 0, 0];
      }
      index += 1;
      continue;
    }
    if (char === ':') {
      const doubleColon = selector[index + 1] === ':';
      const nameStart = index + (doubleColon ? 2 : 1);
      if (!startsIdent(selector, nameStart)) {
        index = nameStart;
        continue;
      }
      const nameEnd = skipIdent(selector, nameStart);
      const escaped = identEscaped;
      const isFunction = selector[nameEnd] === '(';
      if (counting) {
        const [own, argument] = pseudoAt(
          selector,
          nameStart,
          nameEnd,
          escaped,
          doubleColon,
        );
        add(top.sum, own);
        if (isFunction) stack.push(frame(argument));
      } else if (isFunction) {
        stack.push(frame(IGNORED));
      }
      index = nameEnd + (isFunction ? 1 : 0);
      continue;
    }
    index += 1;
  }

  while (stack.length > 1) close(stack);
  return stack[0].sum;
}

export function stripSelectorComments(selector: string): string {
  if (!selector.includes('/*')) return selector;
  let result = '';
  let start = 0;
  let index = 0;

  while (index < selector.length) {
    const char = selector[index];

    if (char === '\\') {
      index += 2;
      continue;
    }
    if (char === '"' || char === "'") {
      index = skipString(selector, char, index + 1);
      continue;
    }
    if (char === '/' && selector[index + 1] === '*') {
      result += selector.slice(start, index) + '/**/';
      index = skipComment(selector, index);
      start = index;
      continue;
    }
    index += 1;
  }

  return result + selector.slice(start);
}

export const MAX_SELECTOR_NESTING = 16;

export type InvalidSelector =
  | { kind: 'same-name'; name: string }
  | { kind: 'too-deep' }
  | { kind: 'stray-quote' };

const TOO_DEEP: InvalidSelector = { kind: 'too-deep' };
const STRAY_QUOTE: InvalidSelector = { kind: 'stray-quote' };

export function findSameNameNesting(selector: string): string | null {
  const nesting = findInvalidSelector(selector);
  return nesting?.kind === 'same-name' ? nesting.name : null;
}

export function findInvalidSelector(selector: string): InvalidSelector | null {
  const open: [string, number][] = [];
  let depth = 0;
  let index = 0;

  while (index < selector.length) {
    const char = selector[index];
    if (char === '/' && selector[index + 1] === '*') {
      index = skipComment(selector, index);
      continue;
    }

    if (char === '\\') {
      index = escapeEnd(selector, index);
      continue;
    }
    if (char === '"' || char === "'") {
      let end = index + 1;
      while (end < selector.length && selector[end] !== char) {
        end += selector[end] === '\\' ? 2 : 1;
      }
      if (depth === 0 || end >= selector.length) return STRAY_QUOTE;
      index = end + 1;
      continue;
    }
    if (char === '[') {
      index = skipBracket(selector, index);
      continue;
    }

    if (char === '(') {
      depth += 1;
      if (depth > MAX_SELECTOR_NESTING) return TOO_DEEP;
    } else if (char === ')') {
      if (open.length > 0 && open[open.length - 1][1] === depth) open.pop();
      depth = Math.max(depth - 1, 0);
    } else if (char === ':') {
      const doubleColon = selector[index + 1] === ':';
      const nameStart = index + (doubleColon ? 2 : 1);
      const nameEnd = skipName(selector, nameStart);
      if (nameEnd > nameStart && selector[nameEnd] === '(') {
        const name =
          (doubleColon ? '::' : ':') +
          selector.slice(nameStart, nameEnd).toLowerCase();
        if (name !== ':not' && open.some(([ancestor]) => ancestor === name))
          return { kind: 'same-name', name };
        depth += 1;
        if (depth > MAX_SELECTOR_NESTING) return TOO_DEEP;
        open.push([name, depth]);
        index = nameEnd + 1;
        continue;
      }
      index = nameEnd;
      continue;
    }

    index += 1;
  }

  return null;
}

export function getPseudoElement(selector: string): string {
  let index = 0;

  while (index < selector.length) {
    const char = selector[index];
    if (char === '/' && selector[index + 1] === '*') {
      index = skipComment(selector, index);
      continue;
    }
    if (char === '[') {
      index = skipBracket(selector, index);
      continue;
    }
    if (char !== ':') {
      index += 1;
      continue;
    }

    const doubleColon = selector[index + 1] === ':';
    const nameStart = index + (doubleColon ? 2 : 1);
    const nameEnd = skipName(selector, nameStart);
    const name = selector.slice(nameStart, nameEnd).toLowerCase();
    index = nameEnd;

    let argument = '';
    if (selector[index] === '(') {
      const close = findClose(selector, index);
      argument = selector.slice(index, close + 1);
      index = close + 1;
    }

    if (doubleColon || LEGACY_PSEUDO_ELEMENTS.has(name)) {
      return `::${name}${argument}`;
    }
  }

  return '';
}
