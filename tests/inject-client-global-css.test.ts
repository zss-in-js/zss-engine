import { injectClientGlobalCSS } from '../src';

test('injectClientGlobalCSS correctly appends global style element with expected content', () => {
  const scoped = 'global-scope';
  const sheet = '.global-class { color: blue; }';

  injectClientGlobalCSS(sheet, scoped);

  const styleElement = document.querySelector(`[data-scope="${scoped}"]`);
  expect(styleElement).not.toBeNull();
  expect(styleElement?.textContent).toContain('.global-class { color: blue; }');
});
