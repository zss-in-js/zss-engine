import { processAtomicProps, splitAtomicAndNested } from '../src/utils/processor-atomic';

describe('splitAtomicAndNested', () => {
  test('splits atomic and nested properties correctly', () => {
    const obj = {
      color: 'red',
      fontSize: '16px',
      ':hover': {
        color: 'blue',
      },
      '@media (min-width: 768px)': {
        display: 'flex',
        justifyContent: 'center',
        ':active': {
          backgroundColor: 'yellow',
        },
      },
      margin: '10px',
    };

    const flat: any = {};
    const nonFlat: any = {};
    splitAtomicAndNested(obj, flat, nonFlat);

    expect(flat).toEqual({
      color: 'red',
      fontSize: '16px',
      margin: '10px',
      '@media (min-width: 768px)': {
        display: 'flex',
        justifyContent: 'center',
      },
    });

    expect(nonFlat).toEqual({
      ':hover': {
        color: 'blue',
      },
      '@media (min-width: 768px)': {
        ':active': {
          backgroundColor: 'yellow',
        },
      },
    });
  });

  test('handles @media with only nested properties', () => {
    const obj = {
      '@media (min-width: 768px)': {
        ':hover': {
          color: 'red',
        },
      },
    };
    const flat: any = {};
    const nonFlat: any = {};
    splitAtomicAndNested(obj, flat, nonFlat);

    expect(flat).toEqual({});
    expect(nonFlat).toEqual({
      '@media (min-width: 768px)': {
        ':hover': {
          color: 'red',
        },
      },
    });
  });

  test('handles empty object', () => {
    const obj = {};
    const flat: any = {};
    const nonFlat: any = {};
    splitAtomicAndNested(obj, flat, nonFlat);
    expect(flat).toEqual({});
    expect(nonFlat).toEqual({});
  });

  test('handles only atomic properties', () => {
    const obj = {
      color: 'red',
      margin: '10px',
    };
    const flat: any = {};
    const nonFlat: any = {};
    splitAtomicAndNested(obj, flat, nonFlat);
    expect(flat).toEqual({
      color: 'red',
      margin: '10px',
    });
    expect(nonFlat).toEqual({});
  });

  test('handles only nested properties', () => {
    const obj = {
      ':hover': {
        color: 'blue',
      },
      '@media (min-width: 768px)': {
        display: 'flex',
      },
    };
    const flat: any = {};
    const nonFlat: any = {};
    splitAtomicAndNested(obj, flat, nonFlat);
    expect(flat).toEqual({
      '@media (min-width: 768px)': {
        display: 'flex',
      },
    });
    expect(nonFlat).toEqual({
      ':hover': {
        color: 'blue',
      },
    });
  });
});

describe('processAtomicProps', () => {
  let atomicMap: Map<string, string>;

  beforeEach(() => {
    atomicMap = new Map();
  });

  test('processes basic atomic properties', () => {
    const flatProps = {
      color: 'red',
    };
    processAtomicProps(flatProps, atomicMap);

    expect(atomicMap.size).toBe(1);
  });

  test('processes @media queries', () => {
    const flatProps = {
      '@media (min-width: 600px)': {
        color: 'blue',
      },
    };
    processAtomicProps(flatProps, atomicMap);

    expect(atomicMap.size).toBe(1);
  });

  test('handles shorthand properties', () => {
    processAtomicProps(
      {
        margin: '10px',
        marginTop: '20px',
      },
      atomicMap
    );
    expect(atomicMap.size).toBe(2);

    const sheets = Array.from(atomicMap.values()).join('');
    expect(sheets).not.toContain('margin-top:20px');
  });

  test('ignores longhand when shorthand is present', () => {
    processAtomicProps({ margin: '10px' }, atomicMap);
    processAtomicProps({ marginTop: '5px' }, atomicMap);

    expect(atomicMap.size).toBe(2);
  });

  test('processes multiple atomic properties', () => {
    processAtomicProps(
      {
        color: 'green',
      },
      atomicMap
    );

    expect(atomicMap.size).toBe(1);
  });

  test('skips duplicate atomic hashes', () => {
    const flat = {
      color: 'red',
    };

    processAtomicProps(flat, atomicMap);
    const firstSize = atomicMap.size;

    processAtomicProps(flat, atomicMap);
    const secondSize = atomicMap.size;

    expect(firstSize).toBe(secondSize);
    expect(firstSize).toBe(1);
  });
});
