import { genBase36Hash, transpile } from '../src/index';

test('transpile handles edge cases in media queries', () => {
  const object = {
    component: {
      display: 'flex',
      '@media (min-width: 1024px)': {
        flexDirection: 'row',
        gap: '20px',
        [':first-child']: {
          marginLeft: 0,
        },
        ':last-child': {
          marginRight: 0,
        },
      },
    },
  };

  const base36Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base36Hash);

  expect(styleSheet).toContain('@media (min-width: 1024px)');
  expect(styleSheet).toContain('flex-direction: row;');
  expect(styleSheet).toContain('gap: 20px;');
  expect(styleSheet).toContain(':first-child');
  expect(styleSheet).toContain(':last-child');
});

test('transpile handles container queries with nested selectors', () => {
  const object = {
    wrapper: {
      containerType: 'inline-size',
      '@container (min-width: 500px)': {
        padding: '30px',
        ':empty': {
          display: 'none',
        },
      },
    },
  };

  const base36Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base36Hash);

  expect(styleSheet).toContain('@container (min-width: 500px)');
  expect(styleSheet).toContain('padding: 30px;');
  expect(styleSheet).toContain(':empty');
});

test('transpile handles @keyframes', () => {
  const object = {
    '@keyframes fadeIn': {
      '0%': {
        opacity: 0,
        transform: 'translateY(10px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
  };

  const { styleSheet } = transpile(object, 'test');

  expect(styleSheet).toContain('@keyframes fadeIn');
  expect(styleSheet).toContain('0%');
  expect(styleSheet).toContain('opacity: 0;');
  expect(styleSheet).toContain('transform: translateY(10px);');
  expect(styleSheet).toContain('100%');
  expect(styleSheet).toContain('opacity: 1;');
});

test('transpile handles pseudo-selectors', () => {
  const object = {
    button: {
      color: 'blue',
      ':hover': {
        color: 'red',
      },
      '::before': {
        content: '""',
      },
    },
  };

  const base36Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base36Hash);

  expect(styleSheet).toContain('color: blue;');
  expect(styleSheet).toContain(':hover');
  expect(styleSheet).toContain('color: red;');
  expect(styleSheet).toContain('::before');
});

test('transpile handles @media queries', () => {
  const object = {
    container: {
      width: '100%',
      '@media (min-width: 768px)': {
        width: '50%',
        padding: '20px',
      },
    },
  };

  const base36Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base36Hash);

  expect(styleSheet).toContain('width: 100%;');
  expect(styleSheet).toContain('@media (min-width: 768px)');
  expect(styleSheet).toContain('width: 50%;');
  expect(styleSheet).toContain('padding: 20px;');
});

test('transpile handles @media with pseudo-selectors', () => {
  const object = {
    link: {
      color: 'blue',
      '@media (min-width: 768px)': {
        fontSize: '16px',
        ':hover': {
          color: 'red',
          textDecoration: 'underline',
        },
        ':focus': {
          outline: '2px solid blue',
        },
      },
    },
  };

  const base36Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base36Hash);

  expect(styleSheet).toContain('@media (min-width: 768px)');
  expect(styleSheet).toContain('font-size: 16px;');
  expect(styleSheet).toContain(':hover');
  expect(styleSheet).toContain('color: red;');
  expect(styleSheet).toContain(':focus');
});

test('transpile handles @container queries', () => {
  const object = {
    card: {
      padding: '10px',
      '@container (min-width: 400px)': {
        padding: '20px',
        fontSize: '18px',
      },
    },
  };

  const base36Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base36Hash);

  expect(styleSheet).toContain('@container (min-width: 400px)');
  expect(styleSheet).toContain('padding: 20px;');
  expect(styleSheet).toContain('font-size: 18px;');
});

test('transpile handles global styles with --global core', () => {
  const object = {
    body: {
      margin: 0,
      padding: 0,
    },
  };

  const { styleSheet } = transpile(object, undefined, '--global');

  expect(styleSheet).toContain('body {');
  expect(styleSheet).toContain('margin: 0px;');
  expect(styleSheet).not.toContain('.');
});

test('transpile handles number values', () => {
  const object = {
    box: {
      opacity: 0.5,
      zIndex: 100,
      flexGrow: 1,
    },
  };

  const base36Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base36Hash);

  expect(styleSheet).toContain('opacity: 0.5;');
  expect(styleSheet).toContain('z-index: 100;');
  expect(styleSheet).toContain('flex-grow: 1;');
});

test('transpile handles @media with only nested rules', () => {
  const object = {
    nav: {
      display: 'block',
      '@media (max-width: 600px)': {
        ':hover': {
          backgroundColor: 'gray',
        },
      },
    },
  };

  const base36Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base36Hash);

  expect(styleSheet).toContain('@media (max-width: 600px)');
  expect(styleSheet).toContain(':hover');
  expect(styleSheet).toContain('background-color: gray;');
});

test('transpile ignores inherited and unsupported keyframe properties', () => {
  const inheritedFrame = { color: 'red' };
  const frame = Object.assign(Object.create(inheritedFrame), {
    opacity: 0,
    metadata: { name: 'start' },
  });
  const inheritedKeyframes = { '50%': { opacity: 0.5 } };
  const keyframes = Object.assign(Object.create(inheritedKeyframes), {
    '0%': frame,
  });

  const { styleSheet } = transpile({ '@keyframes guarded': keyframes } as unknown as Parameters<typeof transpile>[0], 'test');

  expect(styleSheet).toContain('opacity: 0;');
  expect(styleSheet).not.toContain('50%');
  expect(styleSheet).not.toContain('color: red;');
  expect(styleSheet).toContain('@keyframes guarded {\n  0% {\n    opacity: 0;\n  }\n}');
});

test('transpile ignores inherited properties, unknown at-rules, and invalid query selectors', () => {
  const query = Object.assign(Object.create({ inheritedColor: 'red' }), {
    ':hover': 'invalid',
    ':focus': null,
    ':active': Object.assign(Object.create({ inheritedOpacity: 0 }), { color: 'green' }),
  });
  const styles = Object.assign(Object.create({ inheritedDisplay: 'block' }), {
    color: 'blue',
    '@unknown rule': { color: 'red' },
    '@media (min-width: 1px)': query,
  });

  const { styleSheet } = transpile({ component: styles } as unknown as Parameters<typeof transpile>[0], 'guarded');

  expect(styleSheet).toContain('color: blue;');
  expect(styleSheet).toContain('@media (min-width: 1px)');
  expect(styleSheet).not.toContain('inherited');
  expect(styleSheet).not.toContain('@unknown');
  expect(styleSheet).not.toContain('invalid');
  expect(styleSheet).not.toContain('inherited-opacity');
});
