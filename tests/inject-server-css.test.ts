import { getServerCSS, injectServerCSS } from '../src';

test('should inject and get server CSS correctly', () => {
  const hash1 = 'abcd1';
  const hash2 = 'abcd2';
  const sheet1 = 'body { color: red; }';
  const sheet2 = 'h1 { font-size: 20px; }';

  injectServerCSS(hash1, sheet1);
  injectServerCSS(hash2, sheet2);

  const serverCSS = getServerCSS();
  expect(serverCSS).toContain(sheet1);
  expect(serverCSS).toContain(sheet2);
});
