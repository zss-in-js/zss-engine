export type Specificity = [number, number, number];

const LEGACY_PSEUDO_ELEMENTS = new Set([
  'before',
  'after',
  'first-line',
  'first-letter',
]);

const MAX_OF_ARGUMENTS = new Set(['is', 'not', 'has']);
const NTH_WITH_OF = new Set(['nth-child', 'nth-last-child']);
const ARGUMENT_ADDS_TO_HOST = new Set(['host', 'host-context']);
const ARGUMENT_ADDS_TO_ELEMENT = new Set(['slotted', 'cue', 'cue-region']);

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

const isSpace = (char: string | undefined): boolean =>
  char !== undefined && /\s/.test(char);

const ofAt = (selector: string, index: number): boolean =>
  (isSpace(selector[index - 1]) || selector.slice(index - 2, index) === '*/') &&
  (selector[index + 1] === 'f' || selector[index + 1] === 'F') &&
  (isSpace(selector[index + 2]) || selector.startsWith('/*', index + 2));

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

const pseudo = (name: string, doubleColon: boolean): [Specificity, Kind] => {
  if (doubleColon || LEGACY_PSEUDO_ELEMENTS.has(name)) {
    return [[0, 0, 1], ARGUMENT_ADDS_TO_ELEMENT.has(name) ? HIGHEST : IGNORED];
  }
  if (name === 'where') return [[0, 0, 0], IGNORED];
  if (MAX_OF_ARGUMENTS.has(name)) return [[0, 0, 0], HIGHEST];
  if (ARGUMENT_ADDS_TO_HOST.has(name)) return [[0, 1, 0], HIGHEST];
  if (NTH_WITH_OF.has(name)) return [[0, 1, 0], BEFORE_OF];
  return [[0, 1, 0], IGNORED];
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
    if (char === '/' && selector[index + 1] === '*') {
      index = skipComment(selector, index);
      continue;
    }
    const top = stack[stack.length - 1];
    const counting = top.kind === SUM || top.kind === HIGHEST;

    if (char === '"' || char === "'") {
      index = skipString(selector, char, index + 1);
      continue;
    }
    if (char === '\\' && !counting) {
      index += 2;
      continue;
    }
    if (char === ')') {
      if (stack.length > 1) close(stack);
      index += 1;
      continue;
    }
    if (char === '(') {
      stack.push(frame(counting ? SUM : IGNORED));
      index += 1;
      continue;
    }
    if (
      (char === 'o' || char === 'O') &&
      top.kind === BEFORE_OF &&
      ofAt(selector, index)
    ) {
      top.kind = HIGHEST;
      index += 2;
      continue;
    }
    if (!counting) {
      index += 1;
      continue;
    }
    if (char === ',' && top.kind === HIGHEST) {
      top.best = higher(top.best, top.sum);
      top.sum = [0, 0, 0];
      index += 1;
      continue;
    }
    if (char === '#' || char === '.') {
      top.sum[char === '#' ? 0 : 1] += 1;
      index = skipName(selector, index + 1);
      continue;
    }
    if (char === '[') {
      top.sum[1] += 1;
      index = skipBracket(selector, index);
      continue;
    }
    if (char === ':') {
      const doubleColon = selector[index + 1] === ':';
      const nameStart = index + (doubleColon ? 2 : 1);
      const nameEnd = skipName(selector, nameStart);
      const [own, argument] = pseudo(
        selector.slice(nameStart, nameEnd).toLowerCase(),
        doubleColon,
      );
      add(top.sum, own);
      if (selector[nameEnd] === '(') {
        stack.push(frame(argument));
        index = nameEnd + 1;
      } else {
        index = nameEnd;
      }
      continue;
    }
    if (isNameChar(char) || char === '\\') {
      top.sum[2] += 1;
      index = skipName(selector, index);
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

export const MAX_SELECTOR_NESTING = 64;

export type InvalidNesting =
  { kind: 'same-name'; name: string } | { kind: 'too-deep' };

const TOO_DEEP: InvalidNesting = { kind: 'too-deep' };

export function findSameNameNesting(selector: string): string | null {
  const nesting = findInvalidNesting(selector);
  return nesting?.kind === 'same-name' ? nesting.name : null;
}

export function findInvalidNesting(selector: string): InvalidNesting | null {
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
      index = skipString(selector, char, index + 1);
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
