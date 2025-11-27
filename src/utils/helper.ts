import { hexToColorName } from './hex-to-color-name.js';

const isWindowDefined = typeof window !== 'undefined';
const isDocumentDefined = typeof document !== 'undefined';
export const isServer = !isWindowDefined || !isDocumentDefined;
export const isDevelopment = process.env.NODE_ENV === 'development';
/* istanbul ignore next */
export const isTestingDevelopment = process.env.NODE_ENV === 'test' || isDevelopment;

const exception = [
  'animation-iteration-count',
  'aspect-ratio',
  'column-count',
  'columns',
  'fill-opacity',
  'flex',
  'flex-grow',
  'flex-shrink',
  'flood-opacity',
  'font-size-adjust',
  'font-weight',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'hyphenate-limit-chars',
  'initial-letter',
  'line-height',
  'math-depth',
  'opacity',
  'order',
  'orphans',
  'scale',
  'shape-image-threshold',
  'stop-opacity',
  'stroke-miterlimit',
  'stroke-opacity',
  'tab-size',
  'widows',
  'z-index',
  'zoom',
];

const convertHexToColorName = (value: string): string => {
  return value.replace(/#[0-9a-fA-F]{3,6}\b/g, match => {
    return hexToColorName[match.toLowerCase()] || match;
  });
};

export const applyCssValue = (value: string | number, cssProp: string): string => {
  if (typeof value === 'number') {
    return exception.includes(cssProp) ? value.toString() : value + 'px';
  }
  return convertHexToColorName(value);
};

export const camelToKebabCase = (property: string) => {
  // Vendor Start Prefix -ms -moz -webkit
  if (/^(ms|Moz|Webkit)/.test(property)) {
    property = '-' + property;
  }
  return (
    property
      // Add a hyphen between uppercase letters and numbers (except for cases like HTML2)
      .replace(/([A-Z]+)([0-9]+)/g, '$1$2') // eg: HTML2 → html2
      // Add a hyphen between lowercase letters, numbers and uppercase letters
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Properly handle consecutive uppercase letters (e.g. APIResponse → api-response)
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .toLowerCase()
  );
};
