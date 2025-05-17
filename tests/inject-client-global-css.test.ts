import { injectClientGlobalCSS } from '../src';

test('injectClientGlobalCSS correctly appends global style element with expected content', () => {
  const sheet = '.global-class { color: blue; }';

  injectClientGlobalCSS(sheet);

  const styleElement = document.querySelector(`[data-scope="global"]`);
  expect(styleElement).not.toBeNull();
  expect(styleElement?.textContent).toContain('.global-class { color: blue; }');
});
