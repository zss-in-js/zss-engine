import { genBase36Hash, transpiler } from '../src';

test('object to sheet transpiler produces expected output', async () => {
  const object = {
    e2e: {
      color: 'aqua',
    },
  };

  const base62Hash = genBase36Hash(object, 6);
  const { styleSheet } = transpiler(object, base62Hash);

  expect(styleSheet).toContain('.e2e_');
  expect(styleSheet).toContain('color: aqua;');
});
