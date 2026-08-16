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
const OF_KEYWORD = /\s+of\s+/;

const isNameChar = (char: string): boolean => /[\w-]/.test(char);

const skipName = (selector: string, from: number): number => {
  let index = from;
  while (index < selector.length) {
    if (selector[index] === '\\') {
      index += 2;
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

const findClose = (selector: string, open: number): number => {
  let depth = 0;
  for (let index = open; index < selector.length; index++) {
    const char = selector[index];
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

const splitTopLevel = (list: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < list.length; index++) {
    const char = list[index];
    if (char === '\\') {
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      index = skipString(list, char, index + 1) - 1;
      continue;
    }
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    else if (char === ',' && depth === 0) {
      parts.push(list.slice(start, index));
      start = index + 1;
    }
  }

  parts.push(list.slice(start));
  return parts;
};

const compare = (a: Specificity, b: Specificity): number =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

const highest = (list: string): Specificity =>
  splitTopLevel(list).reduce<Specificity>(
    (best, part) => {
      const current = getSpecificity(part);
      return compare(current, best) > 0 ? current : best;
    },
    [0, 0, 0],
  );

export function getSpecificity(selector: string): Specificity {
  const total: Specificity = [0, 0, 0];
  let index = 0;

  const add = (specificity: Specificity) => {
    total[0] += specificity[0];
    total[1] += specificity[1];
    total[2] += specificity[2];
  };

  while (index < selector.length) {
    const char = selector[index];

    if (char === '#') {
      index = skipName(selector, index + 1);
      total[0] += 1;
      continue;
    }
    if (char === '.') {
      index = skipName(selector, index + 1);
      total[1] += 1;
      continue;
    }
    if (char === '[') {
      index = skipBracket(selector, index);
      total[1] += 1;
      continue;
    }

    if (char === ':') {
      const doubleColon = selector[index + 1] === ':';
      const nameStart = index + (doubleColon ? 2 : 1);
      const nameEnd = skipName(selector, nameStart);
      const name = selector.slice(nameStart, nameEnd).toLowerCase();
      index = nameEnd;

      let inner = '';
      if (selector[index] === '(') {
        const close = findClose(selector, index);
        inner = selector.slice(index + 1, close);
        index = close + 1;
      }

      if (doubleColon || LEGACY_PSEUDO_ELEMENTS.has(name)) {
        total[2] += 1;
        if (ARGUMENT_ADDS_TO_ELEMENT.has(name)) add(highest(inner));
        continue;
      }
      if (name === 'where') continue;
      if (MAX_OF_ARGUMENTS.has(name)) {
        add(highest(inner));
        continue;
      }

      total[1] += 1;
      if (ARGUMENT_ADDS_TO_HOST.has(name)) {
        add(highest(inner));
        continue;
      }
      if (NTH_WITH_OF.has(name)) {
        const of = OF_KEYWORD.exec(inner);
        if (of) add(highest(inner.slice(of.index + of[0].length)));
      }
      continue;
    }

    if (isNameChar(char) || char === '\\') {
      index = skipName(selector, index);
      total[2] += 1;
      continue;
    }

    index += 1;
  }

  return total;
}

export function getPseudoElement(selector: string): string {
  let index = 0;

  while (index < selector.length) {
    const char = selector[index];
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
