export function isHashInStyleSheets(hash: string): boolean {
  const sheets = Array.from(document.styleSheets) as CSSStyleSheet[];

  return sheets.some(sheet => {
    try {
      return Array.from(sheet.cssRules).some(rule => (rule as CSSStyleRule).selectorText === `.${hash}`);
    } catch (_err) {
      return false;
    }
  });
}
