import { isServer } from '..';

export function injectClientGlobalCSS(sheet: string, scoped: string) {
  if (isServer) return;

  const existingStyleElement = document.querySelector(`[data-scope="${scoped}"]`);
  if (existingStyleElement instanceof HTMLStyleElement) {
    existingStyleElement.textContent += sheet;
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-scope', scoped);
  styleElement.setAttribute('type', 'text/css');
  styleElement.textContent = sheet;
  document.head.appendChild(styleElement);
}
