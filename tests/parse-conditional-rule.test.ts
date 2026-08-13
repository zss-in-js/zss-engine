import { impliesCondition } from '../src/utils/parse-conditional-rule';

describe('impliesCondition', () => {
  describe('when the first rule is strictly narrower', () => {
    it.each([
      ['@media (min-width: 900px)', '@media (min-width: 600px)'],
      ['@media (max-width: 600px)', '@media (max-width: 900px)'],
      ['@media (min-height: 40em)', '@media (min-height: 20em)'],
      ['@media (width >= 900px)', '@media (width >= 600px)'],
      ['@media (width <= 600px)', '@media (width <= 900px)'],
      ['@media (600px <= width <= 900px)', '@media (min-width: 600px)'],
      ['@media (700px < width < 900px)', '@media (600px <= width <= 1000px)'],
      [
        '@media (min-width: 600px) and (max-width: 900px)',
        '@media (min-width: 600px)',
      ],
      [
        '@media (min-width: 700px) and (max-width: 900px)',
        '@media (min-width: 600px) and (max-width: 1000px)',
      ],
      [
        '@media (min-width: 600px) and (min-height: 400px)',
        '@media (min-width: 600px)',
      ],
      ['  @MEDIA (WIDTH >= 900PX)  ', '@media (min-width:600px)'],
      [
        '@container card (min-width: 800px)',
        '@container card (min-width: 400px)',
      ],
      ['@container (min-width: 800cqw)', '@container (min-width: 400cqw)'],
      [
        '@container (min-inline-size: 800px)',
        '@container (min-inline-size: 400px)',
      ],
      [
        '@container (min-block-size: 800px)',
        '@container (min-block-size: 400px)',
      ],
      [
        '@media screen and (min-width: 900px)',
        '@media screen and (min-width: 600px)',
      ],
      ['@media (min-width: +900.5px)', '@media (min-width: 600px)'],
      ['@media (max-width: -1px)', '@media (max-width: 0px)'],
      ['@media (min-width: 2)', '@media (min-width: 1)'],
    ])('%s implies %s, but not vice versa', (narrow, broad) => {
      expect(impliesCondition(narrow, broad)).toBe(true);
      expect(impliesCondition(broad, narrow)).toBe(false);
    });
  });

  describe('when rules are equal or incomparable', () => {
    it.each([
      ['@media (min-width: 600px)', '@media (max-width: 900px)'],
      ['@media (min-width: 600px)', '@media (min-height: 600px)'],
      ['@media (min-width: 40em)', '@media (min-width: 600px)'],
      ['@media (min-width: 600px)', '@media (min-width: 600px)'],
      ['@media (width > 600px)', '@media (width >= 600px)'],
      [
        '@media (min-width: 600px) and (max-width: 900px)',
        '@media (min-width: 700px) and (max-width: 1000px)',
      ],
      [
        '@media (min-width: 600px) and (hover: hover)',
        '@media (min-width: 600px)',
      ],
      [
        '@media print and (min-width: 900px)',
        '@media screen and (min-width: 600px)',
      ],
      [
        '@container card (min-width: 800px)',
        '@container sidebar (min-width: 400px)',
      ],
      ['@container card (min-width: 800px)', '@container (min-width: 400px)'],
      ['@media (min-width: 900px)', '@container (min-width: 600px)'],
    ])('does not rank %s against %s in either direction', (a, b) => {
      expect(impliesCondition(a, b)).toBe(false);
      expect(impliesCondition(b, a)).toBe(false);
    });
  });

  describe('when either rule uses unsupported syntax', () => {
    const valid = '@media (min-width: 600px)';

    it.each([
      '',
      '(min-width: 900px)',
      '@supports (display: grid)',
      '@media',
      '@media ',
      '@media screen',
      '@media screen (min-width: 900px)',
      '@media screen and color',
      '@media only screen and (min-width: 900px)',
      '@media not screen and (min-width: 900px)',
      '@media (min-width: 900px), (max-width: 100px)',
      '@media (min-width: calc(600px + 1px))',
      '@media (min-width: 900foo)',
      '@media (min-width: 900%)',
      '@media (color)',
      '@media (min-color: 8)',
      '@media (minimum-width: 900px)',
      '@media (min-width 900px)',
      '@media (min-width: px)',
      '@media (min-width: .px)',
      '@media (min-width: 900px',
      '@media min-width: 900px)',
      '@media ()',
      '@media (900px width)',
      '@media (900px = width)',
      '@media (900px > width > 600px)',
      '@media (900px < width > 600px)',
      '@media (600px < color < 900px)',
      '@media (600px < width < 900em)',
      '@media (width = 900px)',
      '@media (width >= px)',
      '@media (width >= 900px extra)',
      '@media (min-width: 900px) or (max-width: 1000px)',
      '@media (min-width: 900px) and',
      '@media (min-width: 900px) and (max-width: 1000em)',
      '@media (min-width: 900px)and (max-width: 1000px)',
      '@container only (min-width: 900px)',
      '@container not (min-width: 900px)',
      '@container card(min-width: 900px)',
      '@container style(--card: 1)',
    ])('rejects %s conservatively', (unsupported) => {
      expect(impliesCondition(unsupported, valid)).toBe(false);
      expect(impliesCondition(valid, unsupported)).toBe(false);
    });
  });
});
