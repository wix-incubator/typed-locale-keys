import { Driver } from './driver';

test('nested data', async () => {
  const driver = new Driver();

  driver.given.namespace('nested');

  await driver.when.runsCodegenCommand();

  const { LocaleKeys } = await driver.get.generatedResults<{
    common: {
      create(): string;
    };
    model: { user: { id(): string } };
  }>();

  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(result.common.create()).toBe(
    driver.get.expectedTranslationOf('common.create')
  );
  expect(result.model.user.id()).toBe(
    driver.get.expectedTranslationOf('model.user.id')
  );
});

test('flat data', async () => {
  const driver = new Driver();

  driver.given.namespace('flat');

  await driver.when.runsCodegenCommand();

  const { LocaleKeys } = await driver.get.generatedResults<{
    common: {
      cancel(): string;
    };
    model: {
      player: {
        name(): string;
      };
    };
  }>();

  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(result.common.cancel()).toBe(
    driver.get.expectedTranslationOf('common.cancel')
  );
  expect(result.model.player.name()).toBe(
    driver.get.expectedTranslationOf('model.player.name')
  );
});

test('data interpolation double quote', async () => {
  const driver = new Driver();
  driver.given.namespace('interpolation-double');
  await driver.when.runsCodegenCommand();

  const { LocaleKeys } = await driver.get.generatedResults<{
    common: {
      greeting(params: { name: unknown }): string;
      invitation(params: { first: unknown; second: unknown }): string;
    };
  }>();

  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(result.common.greeting({ name: 'John' })).toBe(
    driver.get.expectedTranslationOf('common.greeting', { name: 'John' })
  );

  expect(result.common.invitation({ first: 'One', second: 'Two' })).toBe(
    driver.get.expectedTranslationOf('common.invitation', {
      first: 'One',
      second: 'Two'
    })
  );
});

test('data interpolation single quote', async () => {
  const driver = new Driver();
  driver.given.namespace('interpolation-single');

  await driver.when.runsCodegenCommand({
    singleCurlyBraces: true
  });

  const { LocaleKeys } = await driver.get.generatedResults<{
    common: {
      loggedIn: {
        message(data: { username: unknown }): string;
      };
    };
    readingWarning(data: { reader: unknown; writer: string }): string;
  }>();

  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(result.common.loggedIn.message({ username: 'Boss' })).toBe(
    driver.get.expectedTranslationOf('common.loggedIn.message', {
      username: 'Boss'
    })
  );

  expect(result.readingWarning({ reader: 'Alice', writer: 'Bob' })).toBe(
    driver.get.expectedTranslationOf('readingWarning', {
      reader: 'Alice',
      writer: 'Bob'
    })
  );
});

test('custom function name', async () => {
  const driver = new Driver();

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    output: 'tests/__generated__/fn-name/',
    functionName: 'customFnName'
  });

  const { customFnName } = await driver.get.generatedResults<
    {
      common: {
        loggedIn: {
          message(data: { username: unknown }): string;
        };
      };
      readingWarning(data: { reader: unknown; writer: string }): string;
    },
    'customFnName'
  >('tests/__generated__/fn-name/customFnName');

  expect(customFnName).not.toBeUndefined();

  expect(
    customFnName(driver.get.defaultTranslationFn()).common.loggedIn.message({
      username: 'Alice'
    })
  ).toBe(
    driver.get.expectedTranslationOf('common.loggedIn.message', {
      username: 'Alice'
    })
  );
});

test.todo('add translated value as a comment');

test.todo('values as translation keys without translation function');
