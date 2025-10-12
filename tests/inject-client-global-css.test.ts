import { injectClientGlobalCSS } from '../src';

describe('injectClientGlobalCSS on client', () => {
  beforeEach(() => {
    // 各テストの前にheadをクリア
    document.head.innerHTML = '';
    jest.resetModules(); // モジュールのキャッシュをリセット
  });

  test('creates new style element on first call', () => {
    const css = '.test { color: red; }';

    injectClientGlobalCSS(css);

    const styleElement = document.querySelector('[data-scope="global"]');
    expect(styleElement).toBeInstanceOf(HTMLStyleElement);
    expect(styleElement?.textContent).toBe(css);
    expect(styleElement?.getAttribute('type')).toBe('text/css');
  });

  test('appends to existing style element on second call', () => {
    const css1 = '.test1 { color: red; }';
    const css2 = '.test2 { color: blue; }';

    injectClientGlobalCSS(css1);
    injectClientGlobalCSS(css2);

    const styleElements = document.querySelectorAll('[data-scope="global"]');
    expect(styleElements.length).toBe(1);

    const styleElement = styleElements[0] as HTMLStyleElement;
    expect(styleElement.textContent).toBe(css1 + css2);
  });
});

describe('injectClientGlobalCSS on server', () => {
  beforeAll(() => {
    jest.mock('../src/utils/helper.ts', () => ({
      ...jest.requireActual('../src/utils/helper.ts'),
      isServer: true, // isServerをtrueに上書き
    }));
  });

  afterAll(() => {
    jest.unmock('../src/utils/helper.ts'); // モックを解除
  });

  test('should not inject style on server', () => {
    // モックを有効にするために動的にインポート
    const { injectClientGlobalCSS: injectClientGlobalCSSOnServer } = require('../src');
    document.head.innerHTML = '';
    const css = '.test { color: red; }';
    injectClientGlobalCSSOnServer(css);
    const styleElement = document.querySelector('[data-scope="global"]');
    expect(styleElement).toBeNull();
  });
});
