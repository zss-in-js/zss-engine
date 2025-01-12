import { injectClientCSS } from '../src';

test('injectClientCSS correctly appends style element with expected content', () => {
  const hash = 'ABC12';
  const sheet = `.test-class_${hash} { color: red; }`;

  injectClientCSS(hash, sheet);

  const styleElement = document.getElementById(hash);
  expect(styleElement).not.toBeNull();
  expect(styleElement?.textContent).toContain(`.test-class_${hash} { color: red; }`);
});
