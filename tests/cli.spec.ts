import { importResults, runCodegenCommand } from './helpers';

test('should generate from entries in package.json', async () => {
  await runCodegenCommand({
    source: 'tests/sources/nested.json',
    reactHook: false
  });

  const { localeKeys } = await importResults<{ localeKeys: unknown }>(
    'tests/__generated__/cli/primary/localeKeys'
  );

  expect(localeKeys).not.toBeUndefined();
});
