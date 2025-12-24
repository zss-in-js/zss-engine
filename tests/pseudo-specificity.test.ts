import { genBase36Hash, transpile } from '../src';

describe('transpile specificity enhancement', () => {
  it('should add :not(##) to pseudo-elements for increased specificity', () => {
    const object = {
      button: {
        color: 'blue',
        ':hover': {
          color: 'red',
        },
        '&::before': {
          content: '""',
          display: 'block',
        },
        '@media (min-width: 768px)': {
          ':focus': {
            outline: '2px solid blue',
          },
          color: 'white',
        },
      },
    };

    const base36Hash = genBase36Hash(object, 1, 6);
    const { styleSheet } = transpile(object, base36Hash);

    // Check for base class
    expect(styleSheet).toContain(`.${base36Hash}`);

    // Check for pseudo-elements with specificity enhancement
    expect(styleSheet).toContain(`.${base36Hash}:not(#\\#):hover`);
    expect(styleSheet).toContain(`.${base36Hash}:not(#\\#)::before`);

    // Check for pseudo-elements within media queries
    expect(styleSheet).toContain('@media (min-width: 768px)');
    expect(styleSheet).toContain(`.${base36Hash}:not(#\\#):focus`);
    expect(styleSheet).toContain(`color: white`);
  });
});
