export function isHashInStyleSheets(hash: string): boolean {
  const sheets = Array.from(document.styleSheets) as CSSStyleSheet[];

  function checkRule(rule: CSSRule): boolean {
    // For CSSStyleRule
    if (rule instanceof CSSStyleRule && rule.selectorText) {
      return hasHashInSelector(rule.selectorText, hash);
    }

    // For CSSMediaRule (@media query)
    if (rule instanceof CSSMediaRule) {
      return Array.from(rule.cssRules).some(checkRule);
    }

    // For CSSContainerRule (@container query)
    if (rule instanceof CSSContainerRule) {
      return Array.from(rule.cssRules).some(checkRule);
    }

    // For CSSSupportsRule (@supports query)
    if (rule instanceof CSSSupportsRule) {
      return Array.from(rule.cssRules).some(checkRule);
    }

    // Other group rules (@keyframes, etc.)
    if ('cssRules' in rule && rule.cssRules) {
      return Array.from(rule.cssRules as CSSRuleList).some(checkRule);
    }

    return false;
  }

  function hasHashInSelector(selectorText: string, hash: string): boolean {
    // Split the selector and check each part
    const selectors = selectorText.split(',').map(s => s.trim());

    return selectors.some(selector => {
      // Checks for an exact match of .hash (respecting word boundaries)
      const classPattern = new RegExp(`\\.${escapeRegExp(hash)}(?![\\w-])`);
      return classPattern.test(selector);
    });
  }

  function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return sheets.some(sheet => {
    try {
      return Array.from(sheet.cssRules).some(checkRule);
    } catch (_err) {
      // If access is not possible due to CORS restrictions, etc.
      return false;
    }
  });
}
