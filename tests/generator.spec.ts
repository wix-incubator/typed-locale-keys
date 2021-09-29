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

test('exotic keys', async () => {
  const driver = new Driver();

  driver.given.namespace('exotic-keys');

  await driver.when.runsCodegenCommand();

  const { LocaleKeys } = await driver.get.generatedResults<{
    home: {
      key: {
        'with-dash'(): string;
        '$dollar'(): string;
        '#hashed'(): string;
      };
    };
  }>();

  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(result.home.key['with-dash']()).toBe(
    driver.get.expectedTranslationOf('home.key.with-dash')
  );
  expect(result.home.key.$dollar()).toBe(
    driver.get.expectedTranslationOf('home.key.$dollar')
  );
  expect(result.home.key['#hashed']()).toBe(
    driver.get.expectedTranslationOf('home.key.#hashed')
  );
});

test.skip('root key', async () => {
  const driver = new Driver();

  driver.given.namespace('root-key');

  await driver.when.runsGenerator();

  const { LocaleKeys } = await driver.get.generatedResults<{
    home: {
      $value(): string;
      nested: {
        $value(): string;
        deep(): string;
      };
    };
    common: {
      nested: {
        $value(): string;
        deep(): string;
      };
    };
  }>();

  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(result.home.$value()).toBe(driver.get.expectedTranslationOf('home'));
  expect(result.home.nested.$value()).toBe(
    driver.get.expectedTranslationOf('home.key')
  );
  expect(result.home.nested.deep()).toBe(
    driver.get.expectedTranslationOf('home.key.deep')
  );
  expect(result.common.nested.$value()).toBe('common.nested');
  expect(result.common.nested.deep()).toBe('common.nested.deep');
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
  driver.given.namespace('fn-name');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
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
  >('tests/__generated__/runtime-generation/fn-name/customFnName');

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

test('custom function name and dynamic naming', async () => {
  const driver = new Driver();
  driver.given.namespace('fn-name-dynamic');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    functionName: 'customDynamicFnName',
    dynamicNaming: true,
    reactHook: true
  });

  const { customDynamicFnName, useCustomDynamicFnName } =
    await driver.get.generatedResults<
      {
        common: {
          loggedIn: {
            message(data: { username: unknown }): string;
          };
        };
        readingWarning(data: { reader: unknown; writer: string }): string;
      },
      'customDynamicFnName',
      'useCustomDynamicFnName'
    >(
      'tests/__generated__/runtime-generation/fn-name-dynamic/customDynamicFnName'
    );

  expect(customDynamicFnName).not.toBeUndefined();
  expect(useCustomDynamicFnName).not.toBeUndefined();
});

test('add translated value as a comment', async () => {
  const driver = new Driver();
  driver.given.namespace('comments');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json'
  });

  const resultStr = await driver.get.generatedResultsAsStr();

  expect(resultStr).toContain(
    '/* Hey, {{username}}, you have successfully logged in! */'
  );
  expect(resultStr).toContain('/* {{reader}} reads message from {{writer}} */');
});

test('not add translated value as a comment', async () => {
  const driver = new Driver();

  driver.given.namespace('no-comments');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    showTranslations: false
  });

  const resultStr = await driver.get.generatedResultsAsStr();

  expect(resultStr).not.toContain(
    '/* Hey, {{username}}, you have successfully logged in! */'
  );
  expect(resultStr).not.toContain(
    '/* {{reader}} reads message from {{writer}} */'
  );
});

test('values as translation keys without translation function', async () => {
  const driver = new Driver();
  driver.given.namespace('no-transl-fn');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    translate: false
  });

  const { LocaleKeys } = (await driver.get.generatedResults()) as unknown as {
    LocaleKeys(): {
      common: {
        loggedIn: {
          message: string;
        };
      };
      readingWarning: string;
    };
  };

  const localeKeys = LocaleKeys();

  expect(localeKeys.common.loggedIn.message).toEqual('common.loggedIn.message');
  expect(localeKeys.readingWarning).toEqual('readingWarning');
});

test('flatten result', async () => {
  const driver = new Driver();
  driver.given.namespace('flatten');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    nested: false
  });

  const { LocaleKeys } = await driver.get.generatedResults<{
    'common.loggedIn.message': (data: { username: string }) => string;
    readingWarning: (data: { reader: string; writer: string }) => string;
  }>();

  const localeKeys = LocaleKeys(driver.get.defaultTranslationFn());

  expect(localeKeys['common.loggedIn.message']({ username: 'Boss' })).toBe(
    driver.get.expectedTranslationOf('common.loggedIn.message', {
      username: 'Boss'
    })
  );

  expect(localeKeys.readingWarning({ reader: 'Alice', writer: 'Bob' })).toBe(
    driver.get.expectedTranslationOf('readingWarning', {
      reader: 'Alice',
      writer: 'Bob'
    })
  );
});
