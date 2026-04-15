import { CSSProperties } from '../types/css-properties.js';
import { camelToKebabCase } from './helper.js';
import { LONG_TO_SHORT, SHORTHAND_PROPERTIES } from './shorthand.js';

export const overrideLonghand = (style: CSSProperties) => {
  const props = Object.keys(style);
  const propsToRemove = new Set<string>();

  // Find plain props and their indices
  const plainProps: { key: string; index: number }[] = [];
  for (let i = 0; i < props.length; i++) {
    if (!props[i].startsWith('@')) {
      plainProps.push({ key: props[i], index: i });
    }
  }

  // Find shorthands among plain props
  const shorthandsInStyle: { [key: string]: number } = {};
  for (const { key, index } of plainProps) {
    const kebab = camelToKebabCase(key);
    if (SHORTHAND_PROPERTIES[kebab]) {
      shorthandsInStyle[kebab] = index;
    }
  }

  // Determine which longhands to remove
  for (const { key, index } of plainProps) {
    const kebab = camelToKebabCase(key);
    if (!SHORTHAND_PROPERTIES[kebab]) {
      // is longhand
      const longhands = LONG_TO_SHORT[kebab] || [];
      for (const shorthand of longhands) {
        if (shorthandsInStyle[shorthand] > index) {
          propsToRemove.add(key);
          break;
        }
      }
    }
  }

  const finalStyle: Record<string, unknown> = {};
  const queryStyle = style as Record<string, unknown>;
  for (const prop of props) {
    if (propsToRemove.has(prop)) {
      continue;
    }
    if (prop.startsWith('@')) {
      finalStyle[prop] = overrideLonghand(queryStyle[prop] as CSSProperties);
    } else {
      finalStyle[prop] = queryStyle[prop];
    }
  }

  return finalStyle as CSSProperties;
};
