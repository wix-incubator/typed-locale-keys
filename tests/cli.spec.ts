import { Driver } from './driver';

interface ResultOne {
  localeKeys: (fn: () => string) => {
    common: { hello: () => string; myName: (data: { name: string }) => string };
  };
}

interface ResultTwo {
  localeKeys: (fn: () => string) => {
    model: { user: { id: () => string } };
  };
}

test('should generate from entries in package.json', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli/entries');

  await driver.when.runsCodegenCommand();

  const { localeKeys: objCase } =
    await driver.get.importedGeneratedResults<ResultOne>(
      '__generated__/localeKeys'
    );

  const { localeKeys: strCase } =
    await driver.get.importedGeneratedResults<ResultTwo>('dist/localeKeys');

  expect(typeof objCase(() => '').common.hello).toBe('function');
  expect(typeof strCase(() => '').model.user.id).toBe('function');
});

test('should generate in location of primaryOutput', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli/primaryOutput');

  await driver.when.runsCodegenCommand();

  const { localeKeys } = await driver.get.importedGeneratedResults<ResultOne>(
    'dist/__generated__/localeKeys'
  );

  expect(typeof localeKeys(() => '').common.hello).toBe('function');
});

test('should apply params from package json', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli/packageJsonBooleans');

  await driver.when.runsCodegenCommand({
    source: 'source.json'
  });

  const { useLocaleKeys, localeKeys } =
    await driver.get.importedGeneratedResults<ResultOne>(
      '__generated__/localeKeys'
    );

  expect(typeof useLocaleKeys).toBe('function');

  const tFnMock = jest.fn();
  const name = 'John';

  localeKeys(tFnMock).common.myName({ name });

  expect(tFnMock).toHaveBeenCalledWith('common.myName', { name });
  expect(tFnMock).toHaveBeenCalledTimes(1);
});

test('should override params in package json with cli args', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli/overridePackageJson');

  await driver.when.runsCodegenCommand({
    source: 'source.json',
    output: 'dist',
    reactHook: false,
    showTranslations: false
  });

  const { useLocaleKeys, localeKeys } =
    await driver.get.importedGeneratedResults<ResultOne>('dist/localeKeys');

  expect(useLocaleKeys).toBeUndefined();

  const tFnMock = jest.fn();
  const name = 'John';

  localeKeys(tFnMock).common.myName({ name });

  expect(tFnMock).toHaveBeenCalledWith('common.myName', { name });
  expect(tFnMock).toHaveBeenCalledTimes(1);
});
