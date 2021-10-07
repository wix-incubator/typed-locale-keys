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
      vague: {
        short(): string;
        shortAndLong(): string;
        shortNested: {
          inner(): string;
        };
        shortNestedAndLong: {
          $value(): string;
          inner(): string;
        };
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
  expect(result.home.vague.short()).toBe(
    driver.get.expectedTranslationOf('home.vague.short')
  );
  expect(result.home.vague.shortAndLong()).toBe(
    driver.get.expectedTranslationOf('home.vague.shortAndLong')
  );
  expect(result.home.vague.shortNested.inner()).toBe(
    driver.get.expectedTranslationOf('home.vague.shortNested.inner')
  );
  expect(result.home.vague.shortNestedAndLong.$value()).toBe(
    driver.get.expectedTranslationOf('home.vague.shortNestedAndLong')
  );
  expect(result.home.vague.shortNestedAndLong.inner()).toBe(
    driver.get.expectedTranslationOf('home.vague.shortNestedAndLong.inner')
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

describe('complex interpolation case', () => {
  let driver: Driver;

  let LocaleKeys: (t: (...params: unknown[]) => string) => {
    order: {
      shippingLabel: {
        labelDetailsCard: {
          shipFrom: {
            addressFormat(
              data: Record<
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

        customerDetailsCard: {
          address(
            data: Record<
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
  };

  beforeEach(async () => {
    driver = new Driver();
    driver.given.namespace('interpolation-complex');

    await driver.when.runsCodegenCommand();

    LocaleKeys = (await driver.get.generatedResults())
      .LocaleKeys as unknown as typeof LocaleKeys;
  });

  test('general case', () => {
    const data = {
      firstName: 'Eddard',
      lastName: 'Stark',
      city: 'Winterfell',
      addressLine1: 'Main caslte',
      addressLine2: 'Big Hall',
      state: 'North',
      zipCode: '123',
      country: 'Seven Kingdoms',
    };

    expect(
      LocaleKeys(
        driver.get.defaultTranslationFn()
      ).order.shippingLabel.customerDetailsCard.address(data)
    ).toBe(
      driver.get.expectedTranslationOf(
        'order.shippingLabel.customerDetailsCard.address',
        data
      )
    );
  });

  test('case when the complex interpolation comes first', async () => {
    const data = {
      city: 'Winterfell',
      addressLine1: 'Main caslte',
      addressLine2: 'Big Hall',
      state: 'North',
      zipCode: '123',
      country: 'Seven Kingdoms',
    };

    expect(
      LocaleKeys(
        driver.get.defaultTranslationFn()
      ).order.shippingLabel.labelDetailsCard.shipFrom.addressFormat(data)
    ).toBe(
      driver.get.expectedTranslationOf(
        'order.shippingLabel.labelDetailsCard.shipFrom.addressFormat',
        data
      )
    );
  });
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

test('should contain linter disable comments on first lines', async () => {
  const driver = new Driver();
  driver.given.namespace('lint-disable');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
  });

  const resultStr = await driver.get.generatedResultsAsStr();

  const [firstLine, secondLine] = resultStr.split('\n');

  expect(firstLine).toBe('/* eslint-disable */');
  expect(secondLine).toBe('/* tslint:disable */');
});
