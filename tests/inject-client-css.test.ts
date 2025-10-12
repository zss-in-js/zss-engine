describe('injectClientCSS and injectClientQuery', () => {
  // Helper to dynamically import the module with potential mocks
  const getModule = async () => require('../src/utils/inject-client-css');

  beforeEach(() => {
    document.head.innerHTML = '';
    jest.resetModules(); // Resets module cache, including styleCache and element references
  });

  describe('on client', () => {
    describe('injectClientCSS', () => {
      test('creates and prepends a new style element if it does not exist', async () => {
        const { injectClientCSS } = await getModule();
        injectClientCSS('hash1', '.a {}');
        const styleElement = document.querySelector('style[data-scope="client"]');
        expect(styleElement).not.toBeNull();
        expect(styleElement?.textContent).toBe('.a {}');
        expect(document.head.firstChild).toBe(styleElement);
      });

      test('uses existing style element if found', async () => {
        const { injectClientCSS } = await getModule();
        // Pre-add a style element
        const existingStyle = document.createElement('style');
        existingStyle.setAttribute('data-scope', 'client');
        document.head.appendChild(existingStyle);

        injectClientCSS('hash1', '.a {}');

        const styleElements = document.querySelectorAll('style[data-scope="client"]');
        expect(styleElements.length).toBe(1);
        expect(styleElements[0].textContent).toBe('.a {}');
      });

      test('does not inject the same style twice', async () => {
        const { injectClientCSS } = await getModule();
        injectClientCSS('hash1', '.a {}');
        injectClientCSS('hash1', '.a {}');
        const styleElement = document.querySelector('style[data-scope="client"]');
        expect(styleElement?.textContent).toBe('.a {}');
      });

      test('prepends new styles to existing ones', async () => {
        const { injectClientCSS } = await getModule();
        injectClientCSS('hash1', '.a {}');
        injectClientCSS('hash2', '.b {}');
        const styleElement = document.querySelector('style[data-scope="client"]');
        expect(styleElement?.textContent).toBe('.b {}.a {}');
      });
    });

    describe('injectClientQuery', () => {
      test('creates and appends a new query style element for @media', async () => {
        const { injectClientQuery } = await getModule();
        injectClientQuery('hash1', '@media (min-width: 600px) { .a { font-size: 14px } }');
        const styleElement = document.querySelector('style[data-scope="query"]');
        expect(styleElement).not.toBeNull();
        expect(styleElement?.textContent).toBe('@media (min-width: 600px) { .a { font-size: 14px } }');
        expect(document.head.lastChild).toBe(styleElement);
      });

      test('appends new @media queries to existing element', async () => {
        const { injectClientQuery } = await getModule();
        injectClientQuery('hash1', '@media (min-width: 600px) { .a { font-size: 14px } }');
        const styleElement = document.querySelector('style[data-scope="query"]');
        expect(styleElement?.textContent).toBe('@media (min-width: 600px) { .a { font-size: 14px } }');
      });

      test('does not inject the same query style twice', async () => {
        const { injectClientQuery } = await getModule();
        const query = '@media (min-width: 600px) { .a {} }';
        injectClientQuery('hash1', query);
        injectClientQuery('hash1', query); // Call twice
        const styleElement = document.querySelector('style[data-scope="query"]');
        expect(styleElement?.textContent).toBe(query);
      });
    });
  });

  describe('on server', () => {
    beforeEach(() => {
      jest.mock('../src/utils/helper.ts', () => ({
        ...jest.requireActual('../src/utils/helper.ts'),
        isServer: true,
      }));
    });

    afterEach(() => {
      jest.unmock('../src/utils/helper.ts');
    });

    test('injectClientCSS does nothing', async () => {
      const { injectClientCSS } = await getModule();
      injectClientCSS('hash1', '.a {}');
      const styleElement = document.querySelector('style[data-scope="client"]');
      expect(styleElement).toBeNull();
    });

    test('injectClientQuery does nothing', async () => {
      const { injectClientQuery } = await getModule();
      injectClientQuery('hash1', '@media (min-width: 600px) { .a {} }');
      const styleElement = document.querySelector('style[data-scope="query"]');
      expect(styleElement).toBeNull();
    });
  });
});
