import { genBase36Hash, transpile } from '../src';

test('object to sheet transpiler produces expected output', async () => {
  const object = {
    e2e: {
      color: 'aqua',
    },
  };

  const base62Hash = genBase36Hash(object, 1, 6);
  const { styleSheet } = transpile(object, base62Hash);

  expect(styleSheet).toContain('color: aqua;');
});
