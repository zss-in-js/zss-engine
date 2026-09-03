import { camelToKebabCase, applyCssValue, isAtRule } from './helper.js';
import type { Property } from '../types/css-property.js';
import type { CSSProperties } from '../types/css-properties.js';

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

export function transpile(
  object: Record<string, CSSProperties>,
  base36Hash?: string,
  core?: string,
) {
  let styleSheet = '';
  const mediaQueries: { media: string; css: string }[] = [];

  const classNameApply = (property: string) => {
    return core === '--global' ? property : `.${base36Hash}`;
  };

  const rules = (indent: string, rulesValue: unknown, property: string) => {
    const value = (rulesValue as Record<string, unknown>)[property];
    const cssProp = camelToKebabCase(property);
    return `${indent}${cssProp}: ${value};\n`;
  };

  const atRuleConverter = (
    className: string,
    properties: Property,
    indent: string,
  ): string => {
    let nestedRules = '';
    let regularRules = '';
    let innerAtRules = '';

    for (const property in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, property)) {
        const value = properties[property];

        if (isAtRule(property)) {
          const innerBody = atRuleConverter(
            className,
            value as Property,
            indent + '  ',
          );
          innerAtRules += `${indent}${property} {\n${innerBody}${indent}}\n`;
          continue;
        }

        const isColon = property.startsWith(':');
        const isArray = property.startsWith('[');
        if (isColon || isArray) {
          const kebabProperty = camelToKebabCase(property);
          const increaseKebabProperty = ':not(#\\#)' + kebabProperty;
          let pseudoClassRule = '';

          if (typeof value === 'object' && value !== null) {
            for (const pseudoProp in value) {
              if (Object.prototype.hasOwnProperty.call(value, pseudoProp)) {
                const CSSProp = camelToKebabCase(pseudoProp);
                const applyValue = applyCssValue(
                  value[pseudoProp] as string | number,
                  CSSProp,
                );
                pseudoClassRule += rules(
                  indent + '  ',
                  { [pseudoProp]: applyValue },
                  pseudoProp,
                );
              }
            }
          }
          nestedRules += `${indent}${className}${increaseKebabProperty} {\n${pseudoClassRule}${indent}}\n`;
        } else {
          const CSSProp = camelToKebabCase(property);
          const applyValue = applyCssValue(value as string | number, CSSProp);
          regularRules += rules(
            indent + '  ',
            { [property]: applyValue },
            property,
          );
        }
      }
    }

    const baseRule = regularRules
      ? `${indent}${className} {\n${regularRules}${indent}}\n`
      : '';
    return baseRule + nestedRules + innerAtRules;
  };

  const stringConverter = (
    className: string,
    properties: Property,
    indentLevel: number,
  ): Property => {
    const classSelector: Property = {};
    const innerIndent = ' '.repeat(indentLevel + 1);
    let cssRule = '';

    for (const property in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, property)) {
        const value = properties[property];

        if (typeof value === 'string' || typeof value === 'number') {
          let CSSProp = camelToKebabCase(property);
          const applyValue = applyCssValue(value, CSSProp);
          cssRule += `  ${CSSProp}: ${applyValue};\n`;
        } else if (!property.startsWith('@')) {
          const kebabPseudoSelector = camelToKebabCase(property);
          const isPseudo = property.startsWith(':') || property.startsWith('[');
          const selector = isPseudo
            ? className + ':not(#\\#)' + kebabPseudoSelector
            : className + kebabPseudoSelector;
          const styles = stringConverter(selector, value, indentLevel);
          Object.assign(classSelector, styles);
        } else if (isAtRule(property)) {
          const body = atRuleConverter(className, value, innerIndent);
          mediaQueries.push({
            media: property,
            css: `${property} {\n${body}}\n`,
          });
        }
      }
    }

    classSelector[className] = cssRule;
    return classSelector;
  };

  for (const property in object) {
    if (property.startsWith('@keyframes')) {
      const keyframesContent = object[property];
      styleSheet += createKeyframes(property, keyframesContent);
    }
    const classSelectors = stringConverter(
      classNameApply(property),
      object[property],
      1,
    );
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
