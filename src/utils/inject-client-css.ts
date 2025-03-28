import { isServer } from '../index.js';

const styleSheets: Record<string, HTMLStyleElement> = {};
const hashCache: Record<string, string> = {};

export function createStyleElement(hash: string): HTMLStyleElement | null {
  if (document.getElementById(hash)) return null;

  const styleElement = document.createElement('style');
  styleElement.setAttribute('id', hash);
  styleElement.setAttribute('type', 'text/css');
  styleSheets[hash] = styleElement;
  document.head.appendChild(styleElement);

  return styleSheets[hash];
}

export function injectClientCSS(hash: string, sheet: string) {
  if (isServer) return;
  requestAnimationFrame(() => {
    styleCleanUp();
  });
  hashCache[hash] = hash;

  const styleElement = createStyleElement(hash);
  if (styleElement == null) return;

  styleElement.textContent = sheet;
}

function styleCleanUp() {
  requestAnimationFrame(() => {
    for (const hash in hashCache) {
      const classElements = document.querySelectorAll(`[class*="${hash}"]`);
      if (classElements.length === 0) {
        removeStyleElement(hashCache[hash]);
      }
    }
  });
}

function removeStyleElement(hash: string) {
  if (styleSheets[hash]) {
    delete styleSheets[hash];

    if (hashCache.hasOwnProperty.call(hashCache, hash)) {
      delete hashCache[hash];
    }

    const styleElement = document.getElementById(hash);
    if (styleElement) {
      document.head.removeChild(styleElement);
    }
  }
}
