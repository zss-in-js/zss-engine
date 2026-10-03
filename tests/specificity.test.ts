import {
  findInvalidNesting,
  findSameNameNesting,
  getPseudoElement,
  MAX_SELECTOR_NESTING,
  getSpecificity,
  stripSelectorComments,
} from '../src/utils/specificity';

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

    it.each([
      ['.\\31 item', [0, 1, 0]],
      ['.\\A item', [0, 1, 0]],
      ['.\\b item', [0, 1, 0]],
      ['.\\31\titem', [0, 1, 0]],
      ['.\\31\nitem', [0, 1, 0]],
      ['.\\31\fitem', [0, 1, 0]],
      ['.\\31\ritem', [0, 1, 0]],
      ['.\\31', [0, 1, 0]],
      ['.\\31g', [0, 1, 0]],
      ['.\\g', [0, 1, 0]],
      ['.\\', [0, 1, 0]],
    ] as const)('handles the CSS escape in %s', (selector, expected) => {
      expect(getSpecificity(selector)).toEqual(expected);
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
      [':nth-child(2 OF .item)', [0, 2, 0]],
      [':nth-last-child(odd Of #a, .b)', [1, 1, 0]],
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

describe('findSameNameNesting', () => {
  it.each([
    [':is(:where(:not(:has(.a))))', null],
    [':is(.a):is(.b)', null],
    ['[data-x=":is(:is(a))"]', null],
    [':nth-child(2 of :is(.a)):is(.b)', null],
    [':where(:where(.a), .b)', ':where'],
    [':is(:where(:is(.a)))', ':is'],
    [':not(.x, :not(.a))', null],
    [':not(:not(:is(:is(.a))))', ':is'],
    ['::slotted(::slotted(span))', '::slotted'],
  ])('%s -> %s', (selector, expected) => {
    expect(findSameNameNesting(selector)).toBe(expected);
  });

  it.each([
    ['\\:is(:is(.a))', null],
    ['":is(:is(.a))"', null],
    ["':is(:is(.a))'", null],
    ['(:is(.a))', null],
    [':is((.a))', null],
    [':hover', null],
    [':', null],
    [')', null],
  ])('tolerates non-functional syntax in %s', (selector, expected) => {
    expect(findSameNameNesting(selector)).toBe(expected);
  });
});

describe('findInvalidNesting', () => {
  const nest = (open: string, levels: number) =>
    open.repeat(levels) + '.a' + ')'.repeat(levels);

  it.each([
    [nest(':not(', MAX_SELECTOR_NESTING)],
    [nest('(', MAX_SELECTOR_NESTING)],
    [':is(' + nest(':not(', MAX_SELECTOR_NESTING - 1) + ')'],
    ['[data-x="' + '('.repeat(MAX_SELECTOR_NESTING + 1) + '"]'],
  ])('accepts %s', (selector) => {
    expect(findInvalidNesting(selector)).toBeNull();
  });

  it.each([
    [nest(':not(', MAX_SELECTOR_NESTING + 1)],
    [nest('(', MAX_SELECTOR_NESTING + 1)],
    [
      Array.from(
        { length: MAX_SELECTOR_NESTING + 1 },
        (_, i) => `:x${i}(`,
      ).join('') + '.a',
    ],
  ])('rejects nesting deeper than the limit in %s', (selector) => {
    expect(findInvalidNesting(selector)).toEqual({ kind: 'too-deep' });
  });

  it('reports same-name nesting', () => {
    expect(findInvalidNesting(':where(:where(.a))')).toEqual({
      kind: 'same-name',
      name: ':where',
    });
  });
});

describe('stripSelectorComments', () => {
  it.each([
    [':hover', ':hover'],
    [':is(.a/* #b */, .c)', ':is(.a/**/, .c)'],
    ['.a/**/.b', '.a/**/.b'],
    ['[data-x="/* kept */"]/* gone */', '[data-x="/* kept */"]/**/'],
    ["[data-x='/*']:hover", "[data-x='/*']:hover"],
    ['.a\\/* not a comment', '.a\\/* not a comment'],
    [':hover/* unterminated', ':hover/**/'],
  ])('%s -> %s', (selector, expected) => {
    expect(stripSelectorComments(selector)).toBe(expected);
  });

  it('removes parentheses inside comments before nesting is counted', () => {
    const hidden =
      ':not(/*)*/'.repeat(MAX_SELECTOR_NESTING + 1) +
      '.a' +
      ')'.repeat(MAX_SELECTOR_NESTING + 1);
    const inert = ':not(/*' + '('.repeat(MAX_SELECTOR_NESTING + 1) + '*/.a)';
    expect(findInvalidNesting(stripSelectorComments(hidden))).toEqual({
      kind: 'too-deep',
    });
    expect(findInvalidNesting(stripSelectorComments(inert))).toBeNull();
  });

  it('removes selectors inside comments before specificity is counted', () => {
    expect(getSpecificity(stripSelectorComments(':hover/* #a .b */'))).toEqual([
      0, 1, 0,
    ]);
    expect(getPseudoElement(stripSelectorComments('.a/*::before*/'))).toBe('');
  });
});

describe('comments preserve selector token boundaries', () => {
  it.each(['[data-x=foo/**/i]', ':nth-child(2n/**/of .a)', '.a/**/.b'])(
    'preserves %s',
    (selector) => {
      expect(stripSelectorComments(selector)).toBe(selector);
    },
  );
  it('ignores comments in every selector reader', () => {
    expect(getSpecificity(':hover/* #a .b */')).toEqual([0, 1, 0]);
    expect(getSpecificity(':nth-child(2n/**/of .a)')).toEqual([0, 2, 0]);
    expect(getSpecificity(':nth-child(2n of/**/.a)')).toEqual([0, 2, 0]);
    expect(getSpecificity(':is([x/* ] */], #a)')).toEqual([1, 0, 0]);
    expect(getPseudoElement(':is(.a/* ) */)::before')).toBe('::before');
    expect(getPseudoElement('.a/*::before*/')).toBe('');
    expect(findInvalidNesting(':is(/* :is( */.a)')).toBeNull();
    expect(
      findInvalidNesting(':not(/*)*/'.repeat(65) + '.a' + ')'.repeat(65)),
    ).toEqual({ kind: 'too-deep' });
  });
});
