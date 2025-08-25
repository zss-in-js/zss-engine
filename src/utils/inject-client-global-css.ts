/*
  Atomics with client injection have limitations and require a dedicated plugin implementation.
  This injection works easily for non-atomic class-based scoping.
*/

import { isServer } from '../index.js';

export function injectClientGlobalCSS(sheet: string) {
  if (isServer) return;

  const existingStyleElement = document.querySelector(`[data-scope="global"]`);
  if (existingStyleElement instanceof HTMLStyleElement) {
    existingStyleElement.textContent += sheet;
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-scope', 'global');
  styleElement.setAttribute('type', 'text/css');
  styleElement.textContent = sheet;
  document.head.appendChild(styleElement);
}
