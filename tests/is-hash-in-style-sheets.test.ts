import { isHashInStyleSheets } from '../src/utils/is-hash-in-style-sheets';

// Helper to add style sheets to the document
function addStyle(css: string) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Manually add the sheet to document.styleSheets for JSDOM, as it doesn't update automatically
  const sheet = style.sheet as CSSStyleSheet;
  if (sheet) {
    (document.styleSheets as any).push(sheet);
  }
}

describe('isHashInStyleSheets', () => {
  beforeEach(() => {
    // Clear all style elements and reset the styleSheets array before each test
    document.head.innerHTML = '';
    Object.defineProperty(document, 'styleSheets', {
      value: [],
      writable: true,
      configurable: true, // Allow re-definition for subsequent tests
    });
  });

  test('should return false when there are no style sheets', () => {
    expect(isHashInStyleSheets('any-hash')).toBe(false);
  });

  test('should find a hash in a simple style rule', () => {
    addStyle('.hash123 { color: red; }');
    expect(isHashInStyleSheets('hash123')).toBe(true);
  });

  test('should return false if the hash is not found', () => {
    addStyle('.other-class { color: blue; }');
    expect(isHashInStyleSheets('hash123')).toBe(false);
  });

  test('should find a hash within a @media rule', () => {
    addStyle('@media (min-width: 600px) { .hash-in-media { color: green; } }');
    expect(isHashInStyleSheets('hash-in-media')).toBe(true);
  });

  test('should find a hash when it is one of multiple selectors', () => {
    addStyle('.foo, .multi-hash, .bar { color: purple; }');
    expect(isHashInStyleSheets('multi-hash')).toBe(true);
  });

  test('should not match a hash that is a substring of another class name', () => {
    addStyle('.prefix-hash123-suffix { color: orange; }');
    expect(isHashInStyleSheets('hash123')).toBe(false);
  });

  test('should handle hashes with special regex characters', () => {
    // CSS selectors can't contain most special characters unescaped, but we escape them for the regex test.
    // Let's assume a valid CSS class is created, e.g., by escaping in another function.
    const validCssClass = 'h$sh.[]()_valid';
    addStyle(`.${validCssClass} { color: pink; }`);
    expect(isHashInStyleSheets(validCssClass)).toBe(true);
  });

  test('should return false for an empty hash string', () => {
    addStyle('.a { color: red; }');
    expect(isHashInStyleSheets('')).toBe(false);
  });
});
