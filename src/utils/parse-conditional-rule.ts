type RuleKind = 'media' | 'container';
type Axis = 'width' | 'height' | 'inline-size' | 'block-size';

type Bounds = {
  lower: number;
  upper: number;
  unit: string;
};

type ConditionalRange = {
  kind: RuleKind;
  name: string | null;
  axes: Map<Axis, Bounds>;
};

const SUPPORTED_UNITS = new Set([
  '',
  'px',
  'cm',
  'mm',
  'in',
  'pt',
  'pc',
  'q',
  'em',
  'rem',
  'ex',
  'ch',
  'cap',
  'ic',
  'lh',
  'rlh',
  'vw',
  'vh',
  'vi',
  'vb',
  'vmin',
  'vmax',
  'svw',
  'svh',
  'lvw',
  'lvh',
  'dvw',
  'dvh',
  'cqw',
  'cqh',
  'cqi',
  'cqb',
  'cqmin',
  'cqmax',
]);

class Reader {
  position = 0;
  readonly input: string;

  constructor(input: string) {
    this.input = input;
  }

  get done(): boolean {
    return this.position === this.input.length;
  }

  peek(): string {
    return this.input[this.position] ?? '';
  }

  take(text: string): boolean {
    if (
      this.input
        .slice(this.position, this.position + text.length)
        .toLowerCase() !== text.toLowerCase()
    ) {
      return false;
    }
    this.position += text.length;
    return true;
  }

  skipWhitespace(): boolean {
    const start = this.position;
    while (this.peek() && this.peek().trim() === '') this.position++;
    return this.position > start;
  }

  takeIdentifier(): string | null {
    const start = this.position;
    const first = this.peek();
    if (!isIdentifierStart(first)) return null;
    this.position++;
    while (isIdentifierCharacter(this.peek())) this.position++;
    return this.input.slice(start, this.position).toLowerCase();
  }

  takeNumber(): number | null {
    const start = this.position;
    if (this.peek() === '+' || this.peek() === '-') this.position++;

    let digits = 0;
    while (isDigit(this.peek())) {
      this.position++;
      digits++;
    }
    if (this.peek() === '.') {
      this.position++;
      while (isDigit(this.peek())) {
        this.position++;
        digits++;
      }
    }
    if (digits === 0) {
      this.position = start;
      return null;
    }
    return Number(this.input.slice(start, this.position));
  }
}

const isDigit = (character: string): boolean =>
  character >= '0' && character <= '9';

const isAsciiLetter = (character: string): boolean => {
  const lower = character.toLowerCase();
  return lower >= 'a' && lower <= 'z';
};

const isIdentifierStart = (character: string): boolean =>
  isAsciiLetter(character) || character === '_';

const isIdentifierCharacter = (character: string): boolean =>
  isIdentifierStart(character) || isDigit(character) || character === '-';

const axisOf = (value: string | null): Axis | null => {
  switch (value) {
    case 'width':
    case 'height':
    case 'inline-size':
    case 'block-size':
      return value;
    default:
      return null;
  }
};

const takeValue = (reader: Reader): { value: number; unit: string } | null => {
  const value = reader.takeNumber();
  if (value === null) return null;

  const unit = reader.takeIdentifier() ?? '';
  if (!SUPPORTED_UNITS.has(unit)) return null;
  return { value, unit };
};

const bounds = (lower: number, upper: number, unit: string): Bounds => ({
  lower,
  upper,
  unit,
});

const parseColonRange = (reader: Reader): [Axis, Bounds] | null => {
  const start = reader.position;
  let bound: 'min' | 'max';
  if (reader.take('min')) bound = 'min';
  else if (reader.take('max')) bound = 'max';
  else {
    reader.position = start;
    return null;
  }
  if (!reader.take('-')) return null;

  const axis = axisOf(reader.takeIdentifier());
  if (!axis) return null;
  reader.skipWhitespace();
  if (!reader.take(':')) return null;
  reader.skipWhitespace();

  const value = takeValue(reader);
  if (!value) return null;
  return [
    axis,
    bound === 'min'
      ? bounds(value.value, Infinity, value.unit)
      : bounds(-Infinity, value.value, value.unit),
  ];
};

const takeOperator = (reader: Reader): '<' | '<=' | '>' | '>=' | null => {
  const first = reader.peek();
  if (first !== '<' && first !== '>') return null;
  reader.position++;
  if (reader.peek() === '=') {
    reader.position++;
    return `${first}=`;
  }
  return first;
};

const parseComparisonRange = (reader: Reader): [Axis, Bounds] | null => {
  const axis = axisOf(reader.takeIdentifier());
  if (!axis) return null;
  reader.skipWhitespace();

  const operator = takeOperator(reader);
  if (!operator) return null;
  reader.skipWhitespace();

  const value = takeValue(reader);
  if (!value) return null;
  return [
    axis,
    operator.startsWith('>')
      ? bounds(value.value, Infinity, value.unit)
      : bounds(-Infinity, value.value, value.unit),
  ];
};

const parseBetweenRange = (reader: Reader): [Axis, Bounds] | null => {
  const low = takeValue(reader);
  if (!low) return null;
  reader.skipWhitespace();

  const lowerOperator = takeOperator(reader);
  if (!lowerOperator?.startsWith('<')) return null;
  reader.skipWhitespace();

  const axis = axisOf(reader.takeIdentifier());
  if (!axis) return null;
  reader.skipWhitespace();

  const upperOperator = takeOperator(reader);
  if (!upperOperator?.startsWith('<')) return null;
  reader.skipWhitespace();

  const high = takeValue(reader);
  if (!high || low.unit !== high.unit) return null;
  return [axis, bounds(low.value, high.value, low.unit)];
};

const parseTerm = (reader: Reader): [Axis, Bounds] | null => {
  if (!reader.take('(')) return null;
  reader.skipWhitespace();

  const contentStart = reader.position;
  let parsed = parseColonRange(reader);
  if (!parsed) {
    reader.position = contentStart;
    parsed = parseComparisonRange(reader);
  }
  if (!parsed) {
    reader.position = contentStart;
    parsed = parseBetweenRange(reader);
  }
  if (!parsed) return null;

  reader.skipWhitespace();
  return reader.take(')') ? parsed : null;
};

const mergeBounds = (
  axes: Map<Axis, Bounds>,
  axis: Axis,
  next: Bounds,
): boolean => {
  const previous = axes.get(axis);
  if (!previous) {
    axes.set(axis, next);
    return true;
  }
  if (previous.unit !== next.unit) return false;
  axes.set(
    axis,
    bounds(
      Math.max(previous.lower, next.lower),
      Math.min(previous.upper, next.upper),
      next.unit,
    ),
  );
  return true;
};

const parseConditionalRange = (condition: string): ConditionalRange | null => {
  const reader = new Reader(condition.trim());

  let kind: RuleKind;
  if (reader.take('@media')) kind = 'media';
  else if (reader.take('@container')) kind = 'container';
  else return null;

  if (!reader.skipWhitespace()) return null;

  let name: string | null = null;
  if (reader.peek() !== '(') {
    name = reader.takeIdentifier();
    if (!name || name === 'not' || name === 'only') return null;
    if (!reader.skipWhitespace()) return null;
    if (kind === 'media') {
      if (!reader.take('and') || !reader.skipWhitespace()) return null;
    }
  }

  const axes = new Map<Axis, Bounds>();
  while (true) {
    const term = parseTerm(reader);
    if (!term || !mergeBounds(axes, term[0], term[1])) return null;

    const hasSeparator = reader.skipWhitespace();
    if (reader.done) break;
    if (!hasSeparator || !reader.take('and') || !reader.skipWhitespace()) {
      return null;
    }
  }

  return { kind, name, axes };
};

/**
 * Returns true only when every environment matching `narrow` also matches
 * `broad`, and the former is strictly narrower. Unsupported or incomparable
 * conditions deliberately return false.
 */
export const impliesCondition = (narrow: string, broad: string): boolean => {
  const tight = parseConditionalRange(narrow);
  const wide = parseConditionalRange(broad);
  if (!tight || !wide || tight.kind !== wide.kind || tight.name !== wide.name) {
    return false;
  }

  let strict = tight.axes.size > wide.axes.size;
  for (const [axis, wideBounds] of wide.axes) {
    const tightBounds = tight.axes.get(axis);
    if (!tightBounds || tightBounds.unit !== wideBounds.unit) return false;
    if (
      tightBounds.lower < wideBounds.lower ||
      tightBounds.upper > wideBounds.upper
    ) {
      return false;
    }
    if (
      tightBounds.lower > wideBounds.lower ||
      tightBounds.upper < wideBounds.upper
    ) {
      strict = true;
    }
  }
  return strict;
};
