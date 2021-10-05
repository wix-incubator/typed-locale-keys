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

test('root key', async () => {
  const driver = new Driver();

  driver.given.namespace('root-key');

  await driver.when.runsCodegenCommand();

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
    driver.get.expectedTranslationOf('home.nested')
  );
  expect(result.home.nested.deep()).toBe(
    driver.get.expectedTranslationOf('home.nested.deep')
  );
  expect(result.common.nested.$value()).toBe(
    driver.get.expectedTranslationOf('common.nested')
  );
  expect(result.common.nested.deep()).toBe(
    driver.get.expectedTranslationOf('common.nested.deep')
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
      second: 'Two',
    })
  );
});

test('data interpolation single quote', async () => {
  const driver = new Driver();
  driver.given.namespace('interpolation-single');

  await driver.when.runsCodegenCommand({
    singleCurlyBraces: true,
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
      username: 'Boss',
    })
  );

  expect(result.readingWarning({ reader: 'Alice', writer: 'Bob' })).toBe(
    driver.get.expectedTranslationOf('readingWarning', {
      reader: 'Alice',
      writer: 'Bob',
    })
  );
});

test('complex interpolation case', async () => {
  const driver = new Driver();
  driver.given.namespace('interpolation-complex');

  await driver.when.runsGenerator();

  const { LocaleKeys } = await driver.get.generatedResults<{
    order: {
      shippingLabel: {
        customerDetailsCard: {
          address(
            params: Record<
              | 'firstName'
              | 'lastName'
              | 'addressLine1'
              | 'addressLine2'
              | 'city'
              | 'state'
              | 'zipCode'
              | 'country',
              unknown
            >
          ): string;
        };
      };
    };
  }>();

  expect(
    LocaleKeys(
      driver.get.defaultTranslationFn()
    ).order.shippingLabel.customerDetailsCard.address({
      firstName: 'Eddard',
      lastName: 'Stark',
      city: 'Winterfell',
      addressLine1: 'Main caslte',
      addressLine2: 'Big Hall',
      state: 'North',
      zipCode: '123',
      country: 'Seven Kingdoms',
    })
  ).toBe(
    driver.get.expectedTranslationOf(
      'order.shippingLabel.customerDetailsCard.address',
      {
        firstName: 'Eddard',
        lastName: 'Stark',
        city: 'Winterfell',
        addressLine1: 'Main caslte',
        addressLine2: 'Big Hall',
        state: 'North',
        zipCode: '123',
        country: 'Seven Kingdoms',
      }
    )
  );
});

test('custom function name', async () => {
  const driver = new Driver();
  driver.given.namespace('fn-name');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    functionName: 'customFnName',
    reactHook: true,
  });

  const { customFnName, useCustomFnName } = await driver.get.generatedResults<
    {
      common: {
        loggedIn: {
          message(data: { username: unknown }): string;
        };
      };
      readingWarning(data: { reader: unknown; writer: string }): string;
    },
    'customFnName',
    'useCustomFnName'
  >('tests/__generated__/runtime-generation/fn-name/customFnName');

  expect(customFnName).not.toBeUndefined();
  expect(useCustomFnName).not.toBeUndefined();

  expect(
    customFnName(driver.get.defaultTranslationFn()).common.loggedIn.message({
      username: 'Alice',
    })
  ).toBe(
    driver.get.expectedTranslationOf('common.loggedIn.message', {
      username: 'Alice',
    })
  );
});

test('add translated value as a comment', async () => {
  const driver = new Driver();
  driver.given.namespace('comments');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
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
    showTranslations: false,
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
    translate: false,
  });

  const { LocaleKeys } = (await driver.get.generatedResults()) as unknown as {
    LocaleKeys: () => {
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
    nested: false,
  });

  const { LocaleKeys } = await driver.get.generatedResults<{
    'common.loggedIn.message': (data: { username: string }) => string;
    readingWarning: (data: { reader: string; writer: string }) => string;
  }>();

  const localeKeys = LocaleKeys(driver.get.defaultTranslationFn());

  expect(localeKeys['common.loggedIn.message']({ username: 'Boss' })).toBe(
    driver.get.expectedTranslationOf('common.loggedIn.message', {
      username: 'Boss',
    })
  );

  expect(localeKeys.readingWarning({ reader: 'Alice', writer: 'Bob' })).toBe(
    driver.get.expectedTranslationOf('readingWarning', {
      reader: 'Alice',
      writer: 'Bob',
    })
  );
});
