import { camelToKebabCase, applyCssValue } from './helper.js';
import type { Property } from '../types/common/css-property.js';
import type { CSSProperties, CSSHTML } from '../index.js';

const createKeyframes = (property: string, content: Property) => {
  let keyframesRules = `${property} {\n`;
  for (const key in content) {
    if (Object.prototype.hasOwnProperty.call(content, key)) {
      const keyframeValue = content[key];
      keyframesRules += `  ${key} {\n`;
      for (const prop in keyframeValue as Property) {
        if (Object.prototype.hasOwnProperty.call(keyframeValue, prop)) {
          const CSSProp = camelToKebabCase(prop);
          const value = (keyframeValue as Property)[prop];
          if (typeof value === 'string' || typeof value === 'number') {
            const applyValue = applyCssValue(value, CSSProp);
            keyframesRules += `    ${CSSProp}: ${applyValue};\n`;
          }
        }
      }
      keyframesRules += `  }\n`;
    }
  }
  keyframesRules += `}\n`;
  return keyframesRules;
};

export function transpile(object: CSSHTML, base36Hash?: string, core?: string) {
  let styleSheet = '';
  const mediaQueries: { media: string; css: string }[] = [];

  const classNameApply = (property: string) => {
    return core === '--global' ? property : `.${base36Hash}`;
  };

  const rules = (indent: string, rulesValue: unknown, property: unknown) => {
    if (typeof property !== 'string') return '';
    const value = (rulesValue as Record<string, unknown>)[property];
    const cssProp = camelToKebabCase(property);
    return `${indent}${cssProp}: ${value};\n`;
  };

  const stringConverter = (className: string, properties: Property | CSSProperties, indentLevel = 0): Property => {
    const classSelector: Property = {};
    const indent = ''.repeat(indentLevel);
    const innerIndent = ' '.repeat(indentLevel + 1);
    let cssRule = '';

    for (const property in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, property)) {
        const value = (properties as Property)[property];

        if (typeof value === 'string' || typeof value === 'number') {
          let CSSProp = camelToKebabCase(property);
          const applyValue = applyCssValue(value, CSSProp);
          cssRule += `  ${CSSProp}: ${applyValue};\n`;
        } else if (!property.startsWith('@')) {
          const kebabPseudoSelector = camelToKebabCase(property.replace('&', ''));
          const styles = stringConverter(className + kebabPseudoSelector, value, indentLevel);
          Object.assign(classSelector, styles);
        } else if (property.startsWith('@media') || property.startsWith('@container')) {
          const mediaRule = property;
          let nestedRules = '';
          let regularRules = '';
          for (const mediaProp in value as Property) {
            if (Object.prototype.hasOwnProperty.call(value, mediaProp)) {
              const mediaValue = value[mediaProp];
              const isColon = mediaProp.startsWith(':');
              const isAnd = mediaProp.startsWith('&');
              if (isColon || isAnd) {
                const kebabMediaProp = camelToKebabCase(mediaProp.replace('&', ''));
                let pseudoClassRule = '';

                if (typeof mediaValue === 'object' && mediaValue !== null) {
                  for (const pseudoProp in mediaValue) {
                    if (Object.prototype.hasOwnProperty.call(mediaValue, pseudoProp)) {
                      const CSSProp = camelToKebabCase(pseudoProp);
                      const applyValue = applyCssValue(mediaValue[pseudoProp] as string | number, CSSProp);
                      pseudoClassRule += rules(innerIndent + '  ', { [pseudoProp]: applyValue }, pseudoProp);
                    }
                  }
                }
                nestedRules += `${innerIndent}${className}${kebabMediaProp} {\n${pseudoClassRule}${innerIndent}}\n`;
              } else {
                const CSSProp = camelToKebabCase(mediaProp);
                const applyValue = applyCssValue(mediaValue as string | number, CSSProp);
                regularRules += rules(innerIndent + '  ', { [mediaProp]: applyValue }, mediaProp);
              }
            }
          }
          if (regularRules) {
            mediaQueries.push({
              media: mediaRule,
              css: `${mediaRule} {\n${innerIndent}${className} {\n${regularRules}  }\n${nestedRules}${indent}}${indent}\n`,
            });
          } else {
            mediaQueries.push({
              media: mediaRule,
              css: `${mediaRule} {\n${nestedRules}${indent}}\n`,
            });
          }
        }
      }
    }

    classSelector[className] = cssRule;
    return classSelector;
  };

  for (const property in object) {
    if (property.startsWith('@keyframes')) {
      const keyframesContent = (object as Property)[property];
      styleSheet += createKeyframes(property, keyframesContent as Property);
    }
    const classSelectors = stringConverter(classNameApply(property), (object as Property)[property] as unknown as CSSProperties, 1);
    for (const selector in classSelectors) {
      if (!selector.startsWith('@keyframes') && classSelectors[selector]) {
        styleSheet += selector + ' {\n' + classSelectors[selector] + '}\n';
      }
    }
  }

  mediaQueries.forEach(({ css }) => {
    styleSheet += css;
  });

  return { styleSheet };
}
