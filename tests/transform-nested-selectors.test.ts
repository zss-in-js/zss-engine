import { transformNestedSelectors } from '../src/utils/transform-nested-selectors';

describe('transformNestedSelectors', () => {
  it('should add :not(##) to selectors starting with : or &', () => {
    const input = {
      ':hover': { color: 'red' },
      '&:hover': { color: 'blue' },
    };
    // "&" is removed by the transpile function
    const expected = {
      ':not(#\\#):hover': { color: 'red' },
      ':not(#\\#)&:hover': { color: 'blue' },
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
