import { getPseudoElement, getSpecificity } from '../src/utils/specificity';

describe('getSpecificity', () => {
  describe('simple selectors', () => {
    it.each([
      ['', [0, 0, 0]],
      ['*', [0, 0, 0]],
      ['button', [0, 0, 1]],
      ['svg|a', [0, 0, 2]],
      ['#app', [1, 0, 0]],
      ['.button', [0, 1, 0]],
      [':hover', [0, 1, 0]],
      [':focus-visible', [0, 1, 0]],
      ['[disabled]', [0, 1, 0]],
      ['[data-open="true"]', [0, 1, 0]],
      ['::before', [0, 0, 1]],
      [':before', [0, 0, 1]],
      [':after', [0, 0, 1]],
      [':first-line', [0, 0, 1]],
      [':first-letter', [0, 0, 1]],
    ] as const)('calculates %s as %j', (selector, expected) => {
      expect(getSpecificity(selector)).toEqual(expected);
    });
  });

  describe('compound and complex selectors', () => {
    it.each([
      ['button#save.primary:hover::before', [1, 2, 2]],
      ['main > article.card + article[data-pinned] ~ footer', [0, 2, 4]],
      ['html body #app .page .item:hover', [1, 3, 2]],
      ['* > * + *', [0, 0, 0]],
      ['.foo\\:bar#one\\#two', [1, 1, 0]],
    ] as const)('adds every component in %s', (selector, expected) => {
      expect(getSpecificity(selector)).toEqual(expected);
    });

    it('counts an attribute as one selector and ignores its contents', () => {
      expect(
        getSpecificity(
          'a[href="#id"][data-value=".class):not(#fake)"][title=\'x]y\']',
        ),
      ).toEqual([0, 3, 1]);
    });

    it('handles escapes in names and attribute values', () => {
      expect(getSpecificity('.a\\.b[data-x=foo\\]bar]')).toEqual([0, 2, 0]);
      expect(getSpecificity('a[title="say \\\"hello\\\""]')).toEqual([0, 1, 1]);
    });

    it('tolerates an unclosed attribute selector', () => {
      expect(getSpecificity('div[data-value="unterminated')).toEqual([0, 1, 1]);
    });
  });

  describe('selector-list pseudo-classes', () => {
    it.each([
      [':not(.plain)', [0, 1, 0]],
      [':is(.a, #b, span)', [1, 0, 0]],
      [':has(> .badge)', [0, 1, 0]],
      ['article:has(> img.hero, #fallback)', [1, 0, 1]],
      [':where(#ignored, .also-ignored, article)', [0, 0, 0]],
      ['.card:is(:hover, :focus-visible)', [0, 2, 0]],
      [':not(:is(.a, #b), :where(#ignored))', [1, 0, 0]],
      [':is(.a, .b.c, div)', [0, 2, 0]],
      [':is()', [0, 0, 0]],
    ] as const)(
      'uses the appropriate argument weight for %s',
      (selector, expected) => {
        expect(getSpecificity(selector)).toEqual(expected);
      },
    );

    it('splits only top-level commas', () => {
      expect(
        getSpecificity(':is([data-list="a,b"], :not(.a, #b), div)'),
      ).toEqual([1, 0, 0]);
    });

    it('does not treat escaped commas as selector-list separators', () => {
      expect(getSpecificity(':is(.a\\,b.c, article)')).toEqual([0, 2, 0]);
    });

    it('does not close a function at parentheses in strings', () => {
      expect(getSpecificity(':is([data-value=")"], #fallback)')).toEqual([
        1, 0, 0,
      ]);
      expect(getSpecificity(":is([data-value='('], .fallback)")).toEqual([
        0, 1, 0,
      ]);
    });

    it('handles escaped parentheses while locating the function end', () => {
      expect(getSpecificity(':is(.foo\\)bar, #fallback)')).toEqual([1, 0, 0]);
    });

    it('tolerates an unclosed functional pseudo-class', () => {
      expect(getSpecificity(':is(.item, #fallback')).toEqual([1, 0, 0]);
    });
  });

  describe('structural and shadow-DOM pseudo selectors', () => {
    it.each([
      [':nth-child(odd)', [0, 1, 0]],
      [':nth-child(2 of .item)', [0, 2, 0]],
      [':nth-last-child(-n + 3 of li.important, #featured)', [1, 1, 0]],
      [':nth-of-type(2 of #ignored)', [0, 1, 0]],
      [':host', [0, 1, 0]],
      [':host(.active)', [0, 2, 0]],
      [':host-context(main#app)', [1, 1, 1]],
      ['::slotted(.item)', [0, 1, 1]],
      ['::slotted(#hero, .item.active)', [1, 0, 1]],
      ['::cue(.loud)', [0, 1, 1]],
      ['::cue-region(#captions)', [1, 0, 1]],
      ['::part(label)', [0, 0, 1]],
      ['::highlight(search)', [0, 0, 1]],
      [':hover::before', [0, 1, 1]],
    ] as const)('calculates %s as %j', (selector, expected) => {
      expect(getSpecificity(selector)).toEqual(expected);
    });
  });

  it('normalizes pseudo names case-insensitively for their specificity rules', () => {
    expect(getSpecificity(':IS(.item, #hero):BEFORE')).toEqual([1, 0, 1]);
  });
});

describe('getPseudoElement', () => {
  it.each([
    ['', ''],
    ['button.primary:hover', ''],
    ['::before', '::before'],
    [':before', '::before'],
    [':after', '::after'],
    [':first-line', '::first-line'],
    [':first-letter', '::first-letter'],
    [':hover::after', '::after'],
    [':focus::part(label)', '::part(label)'],
    [':hover::highlight(search)', '::highlight(search)'],
    ['::slotted(.item)', '::slotted(.item)'],
    ['::cue([voice="A)"])', '::cue([voice="A)"])'],
    ['::BEFORE', '::before'],
  ] as const)('finds the pseudo-element of %s', (selector, expected) => {
    expect(getPseudoElement(selector)).toBe(expected);
  });

  it.each([
    [':not(::before)'],
    [':is(.item, ::after)'],
    ['[data-selector="::before"]'],
    ['[data-selector=foo\\]bar] .item'],
  ] as const)('ignores a pseudo-element nested inside %s', (selector) => {
    expect(getPseudoElement(selector)).toBe('');
  });

  it('returns the first pseudo-element when given an invalid trailing sequence', () => {
    expect(getPseudoElement('a::before::after')).toBe('::before');
  });

  it('preserves a functional pseudo-element argument verbatim', () => {
    expect(getPseudoElement('x::part(foo\\)bar)')).toBe('::part(foo\\)bar)');
  });

  it('tolerates unclosed brackets and functions', () => {
    expect(getPseudoElement('[data-selector="::before"')).toBe('');
    expect(getPseudoElement('::part(label')).toBe('::part(label');
  });
});
