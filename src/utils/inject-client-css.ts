import { isServer } from '../index.js';

const styleCache: Record<string, string> = {};

let clientStyleElement: HTMLElement | null = null;
let queryStyleElement: HTMLElement | null = null;

function createClientStyleElement() {
  if (!clientStyleElement) {
    clientStyleElement = document.querySelector('style[data-scope="client"]');
    if (!clientStyleElement) {
      clientStyleElement = document.createElement('style');
      clientStyleElement.setAttribute('data-scope', 'client');
      clientStyleElement.setAttribute('type', 'text/css');
      document.head.prepend(clientStyleElement);
    }
  }
  return clientStyleElement;
}

function createQueryStyleElement() {
  if (!queryStyleElement) {
    queryStyleElement = document.querySelector('style[data-scope="query"]');
    if (!queryStyleElement) {
      queryStyleElement = document.createElement('style');
      queryStyleElement.setAttribute('data-scope', 'query');
      queryStyleElement.setAttribute('type', 'text/css');
      document.head.appendChild(queryStyleElement);
    }
  }
  return queryStyleElement;
}

export function injectClientCSS(hash: string, sheet: string) {
  if (isServer) return;
  if (styleCache[hash]) return;
  styleCache[hash] = sheet;
  const clientElement = createClientStyleElement();
  // Stacking up for atomic classes
  clientElement.textContent = sheet + (clientElement.textContent || '');
}

export function injectClientQuery(hash: string, sheet: string) {
  if (isServer) return;
  if (styleCache[hash]) return;
  styleCache[hash] = sheet;

  /* istanbul ignore next */
  if (sheet.includes('@media') || sheet.includes('@container')) {
    const queryElement = createQueryStyleElement();
    // Stacking down for media and container queries
    queryElement.textContent = (queryElement.textContent || '') + sheet;
  }
}
