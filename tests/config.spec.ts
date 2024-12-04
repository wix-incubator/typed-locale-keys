import { Driver } from './driver';

interface ResultOne {
  common: { hello: () => string; myName: (data: { name: string }) => string };
}

interface ResultTwo {
  model: { user: { id: () => string } };
}
type GeneratedModule<
  R,
  N extends string = 'LocaleKeys',
  H extends string = 'useLocaleKeys'
> = {
  [key in N]: (fn: CallableFunction) => R;
} & {
  [key in H]: () => R;
};

test('should generate from entries in .typedlocalekeysrc.json', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli-configs-sandbox/entries');

  await driver.when.runsCodegenCommand();

  const { messages: objCase } = await driver.get.generatedResults<
    GeneratedModule<ResultOne, 'messages'>
  >('__generated__/messages');

  const { commonKeys: strCase } = await driver.get.generatedResults<
    GeneratedModule<ResultTwo, 'commonKeys'>
  >('dist/commonKeys');

  expect(typeof objCase(() => '').common.hello).toBe('function');
  expect(typeof strCase(() => '').model.user.id).toBe('function');
});

test('should generate in location of primaryOutput from package.json', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli-configs-sandbox/primaryOutput');

  await driver.when.runsCodegenCommand();

  const { LocaleKeys } = await driver.get.generatedResults<
    GeneratedModule<ResultOne>
  >('dist/__generated__/LocaleKeys');

  expect(typeof LocaleKeys(() => '').common.hello).toBe('function');
});

test('should apply params from package.json', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli-configs-sandbox/packageJsonBooleans');
  driver.given.cliParams({
    source: 'source.json',
  });
  await driver.when.runsCodegenCommand();

  const { useLocaleKeys, LocaleKeys } = await driver.get.generatedResults<
    GeneratedModule<ResultOne>
  >('__generated__/LocaleKeys');

  expect(typeof useLocaleKeys).toBe('function');

  const tFnMock = jest.fn();
  const name = 'John';

  LocaleKeys(tFnMock).common.myName({ name });

  expect(tFnMock).toHaveBeenCalledWith('common.myName', { name });
  expect(tFnMock).toHaveBeenCalledTimes(1);
});

test('should override params in package.json with cli args', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli-configs-sandbox/overridePackageJson');

  driver.given.cliParams({
    source: 'source.json',
    output: 'dist',
    reactHook: false,
    showTranslations: false,
    singleCurlyBraces: false,
  });
  await driver.when.runsCodegenCommand();

  const { useLocaleKeys, LocaleKeys } = await driver.get.generatedResults<
    GeneratedModule<ResultOne>
  >('dist/LocaleKeys');

  expect(useLocaleKeys).toBeUndefined();

  const tFnMock = jest.fn();
  const name = 'John';

  LocaleKeys(tFnMock).common.myName({ name });

  expect(tFnMock).toHaveBeenCalledWith('common.myName', { name });
  expect(tFnMock).toHaveBeenCalledTimes(1);
});

test('should generate file with Proxy implementation if the flag is passed', async () => {
  const driver = new Driver();

  driver.given.cwd('tests/cli-configs-sandbox/proxyImpl');
  driver.given.cliParams({
    experimental_proxyImpl: true,
  });
  await driver.when.runsCodegenCommand();

  expect(
    await driver.get.generatedResultsAsStr('./dist/__generated__/LocaleKeys.ts')
  ).toContain('new Proxy(');
});
