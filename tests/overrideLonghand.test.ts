import { overrideLonghand } from '../src/utils/override-longhand';
import { CreateStyle } from '../src/types/main/create';

describe('overrideLonghand', () => {
  test('should remove longhand properties overridden by shorthand properties', () => {
    const style = {
      marginTop: '10px',
      margin: '20px',
    } as CreateStyle;
    const expected = {
      margin: '20px',
    };
    expect(overrideLonghand(style)).toEqual(expected);
  });

  test('should not remove longhand if shorthand comes before it', () => {
    const style = {
      margin: '20px',
      marginTop: '10px',
    } as CreateStyle;
    const expected = {
      margin: '20px',
      marginTop: '10px',
    };
    expect(overrideLonghand(style)).toEqual(expected);
  });

  test('should remove multiple longhands overridden by a single shorthand', () => {
    const style = {
      marginTop: '10px',
      marginLeft: '5px',
      marginBottom: '15px',
      marginRight: '5px',
      margin: '20px',
    } as CreateStyle;
    const expected = {
      margin: '20px',
    };
    expect(overrideLonghand(style)).toEqual(expected);
  });

  test('should handle nested styles (e.g., @media queries)', () => {
    const style = {
      color: 'red',
      '@media (min-width: 768px)': {
        paddingTop: '10px',
        padding: '20px',
        margin: '5px',
      },
      paddingLeft: '5px',
    } as CreateStyle;
    const expected = {
      color: 'red',
      '@media (min-width: 768px)': {
        padding: '20px',
        margin: '5px',
      },
      paddingLeft: '5px',
    };
    expect(overrideLonghand(style)).toEqual(expected);
  });
  test('should handle nested and flat styles overridden by shorthand properties', () => {
    const style = {
      paddingTop: '20px',
      padding: '30px',
      '@media (min-width: 768px)': {
        paddingTop: '10px',
        padding: '20px',
      },
      paddingLeft: '5px',
    } as CreateStyle;
    const expected = {
      padding: '30px',
      '@media (min-width: 768px)': {
        padding: '20px',
      },
      paddingLeft: '5px',
    };
    expect(overrideLonghand(style)).toEqual(expected);
  });
});
