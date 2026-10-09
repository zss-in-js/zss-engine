import { hexToColorName } from './hex-to-color-name.js';

// For <time> -related types, a time unit is mandatory; appending px is not used
const exception = [
  '-webkit-animation-delay',
  '-webkit-animation-duration',
  '-webkit-animation-iteration-count',
  '-webkit-box-flex',
  '-webkit-box-flex-group',
  '-webkit-box-ordinal-group',
  '-webkit-column-count',
  '-webkit-columns',
  '-webkit-flex',
  '-webkit-flex-grow',
  '-webkit-flex-shrink',
  '-webkit-initial-letter',
  '-webkit-line-clamp',
  '-webkit-mask-box-image-slice',
  '-webkit-order',
  '-webkit-transition-delay',
  '-webkit-transition-duration',
  'animation-delay',
  'animation-duration',
  'animation-iteration-count',
  'aspect-ratio',
  'border-image-slice',
  'box-flex',
  'box-flex-group',
  'box-ordinal-group',
  'column-count',
  'columns',
  'fill-opacity',
  'flex',
  'flex-grow',
  'flex-line-count',
  'flex-shrink',
  'flood-opacity',
  'font-size-adjust',
  'font-weight',
  'grid-area',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'hyphenate-limit-chars',
  'initial-letter',
  'line-clamp',
  'line-height',
  'mask-border-slice',
  'math-depth',
  'max-lines',
  'opacity',
  'order',
  'orphans',
  'reading-order',
  'scale',
  'shape-image-threshold',
  'stop-opacity',
  'stroke-miterlimit',
  'stroke-opacity',
  'tab-size',
  'transition-delay',
  'transition-duration',
  'widows',
  'z-index',
  'zoom',
];

export const exceptionCamelCase = exception.map((prop) =>
  prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase()),
);

const convertHexToColorName = (value: string): string => {
  if (/url\(|["']/i.test(value)) return value;

  return value.replace(/#[0-9a-fA-F]{3,6}\b/g, (match) => {
    return hexToColorName[match.toLowerCase()] || match;
  });
};

export const applyCssValue = (
  value: string | number,
  cssProp: string,
): string => {
  if (typeof value === 'number') {
    return exception.includes(cssProp) || cssProp.startsWith('--')
      ? value.toString()
      : value + 'px';
  }

  return convertHexToColorName(value);
};

export const camelToKebabCase = (property: string) => {
  if (property.startsWith('--')) return property;

  // Vendor Start Prefix -ms -moz -webkit
  if (/^(ms|Moz|Webkit)/.test(property)) {
    property = '-' + property;
  }
  return (
    property
      // Add a hyphen between lowercase letters, numbers and uppercase letters
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Properly handle consecutive uppercase letters (e.g. APIResponse → api-response)
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .toLowerCase()
  );
};

export const kebabToCamelCase = (property: string) => {
  if (property.startsWith('--')) return property;

  const camel = property.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
  return /^Ms[A-Z]/.test(camel) ? 'ms' + camel.slice(2) : camel;
};

export const isAtRule = (prop: string) => {
  return (
    prop.startsWith('@media') ||
    prop.startsWith('@container') ||
    prop.startsWith('@supports') ||
    prop.startsWith('@layer') ||
    prop.startsWith('@scope')
  );
};
