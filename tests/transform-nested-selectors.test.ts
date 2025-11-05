import { transformNestedSelectors } from '../src/utils/transform-nested-selectors';

describe('transformNestedSelectors', () => {
  it('should add :not(##) to selectors starting with : or &', () => {
    const input = {
      ':hover': { color: 'red' },
      '&.active': { color: 'blue' },
    };
    const expected = {
      ':hover:not(#\\#)': { color: 'red' },
      '&.active:not(#\\#)': { color: 'blue' },
    };
    expect(transformNestedSelectors(input)).toEqual(expected);
  });

  it('should not modify selectors that do not start with : or &', () => {
    const input = {
      div: { color: 'green' },
      span: { color: 'yellow' },
    };
    expect(transformNestedSelectors(input)).toEqual(input);
  });
});
