const isWindowDefined = typeof window !== 'undefined';
const isDocumentDefined = typeof document !== 'undefined';
export const isServer = !isWindowDefined || !isDocumentDefined;
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isDevAndTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

const exception = ['line-height', 'font-weight', 'opacity', 'scale', 'z-index', 'column-count', 'order', 'orphans', 'widows'];

export const applyCssValue = (value: string | number, cssProp: string): string => {
  if (typeof value === 'number') {
    return exception.includes(cssProp) ? value.toString() : value + 'px';
  }
  return value;
};

export const camelToKebabCase = (property: string) =>
  property
    // Add a hyphen between uppercase letters and numbers (except for cases like HTML2)
    .replace(/([A-Z]+)([0-9]+)/g, '$1$2') // 例: HTML2 → html2
    // Add a hyphen between lowercase letters, numbers and uppercase letters
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Properly handle consecutive uppercase letters (e.g. APIResponse → api-response)
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
