import { Driver } from './driver';
import * as InterpolationComplexLocaleKeys from './snapshot/interpolation-complex/LocaleKeys';
import * as ICULocaleKeys from './snapshot/icu/LocaleKeys';
import * as CustomFnNameLocaleKeys from './snapshot/fn-name/customFnName';
import * as ExoticKeysLocaleKeys from './snapshot/exotic-keys/LocaleKeys';
import * as FlatLocaleKeys from './snapshot/flat/LocaleKeys';
import * as FlattenLocaleKeys from './snapshot/flatten/LocaleKeys';
import * as RootKeyLocaleKeys from './snapshot/root-key/LocaleKeys';
import * as InterpolationDoubleLocaleKeys from './snapshot/interpolation-double/LocaleKeys';
import * as InterpolationSingleLocaleKeys from './snapshot/interpolation-single/LocaleKeys';
import * as NestedLocaleKeys from './snapshot/nested/LocaleKeys';
import * as NoTranslFnLocaleKeys from './snapshot/no-transl-fn/LocaleKeys';

let driver: Driver;

beforeEach(() => {
  driver = new Driver();
});

test('nested data', async () => {
  driver.given.namespace('nested');

  await driver.when.runsCodegenCommand();

  const [{ LocaleKeys }, generatedResultsAsStr, generatedSnapShotAsStr] =
    await Promise.all([
      driver.get.generatedResults<typeof NestedLocaleKeys>(),
      driver.get.generatedResultsAsStr(),
      driver.get.generatedSnapShotAsStr(),
    ]);
  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(generatedResultsAsStr).toBe(generatedSnapShotAsStr);
  expect(result.common.create()).toBe(
    driver.get.expectedTranslationOf('common.create')
  );
  expect(result.model.user.id()).toBe(
    driver.get.expectedTranslationOf('model.user.id')
  );
});

test('flat data', async () => {
  driver.given.namespace('flat');

  await driver.when.runsCodegenCommand();

  const [{ LocaleKeys }, generatedResultsAsStr, generatedSnapShotAsStr] =
    await Promise.all([
      driver.get.generatedResults<typeof FlatLocaleKeys>(),
      driver.get.generatedResultsAsStr(),
      driver.get.generatedSnapShotAsStr(),
    ]);

  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(generatedResultsAsStr).toBe(generatedSnapShotAsStr);
  expect(result.common.cancel()).toBe(
    driver.get.expectedTranslationOf('common.cancel')
  );
  expect(result.model.player.name()).toBe(
    driver.get.expectedTranslationOf('model.player.name')
  );
});

test('exotic keys', async () => {
  driver.given.namespace('exotic-keys');

  await driver.when.runsCodegenCommand();

  const { LocaleKeys } = await driver.get.generatedResults<
    typeof ExoticKeysLocaleKeys
  >();

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
  driver.given.namespace('root-key');

  await driver.when.runsCodegenCommand();

  const { LocaleKeys } = await driver.get.generatedResults<
    typeof RootKeyLocaleKeys
  >();

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
  driver.given.namespace('interpolation-double');
  await driver.when.runsCodegenCommand();

  const { LocaleKeys } = await driver.get.generatedResults<
    typeof InterpolationDoubleLocaleKeys
  >();

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
  driver.given.namespace('interpolation-single');

  await driver.when.runsCodegenCommand({
    singleCurlyBraces: true,
  });
  const [{ LocaleKeys }, generatedResultsAsStr, generatedSnapShotAsStr] =
    await Promise.all([
      driver.get.generatedResults<typeof InterpolationSingleLocaleKeys>(),
      driver.get.generatedResultsAsStr(),
      driver.get.generatedSnapShotAsStr(),
    ]);

  const result = LocaleKeys(driver.get.defaultTranslationFn());

  expect(generatedResultsAsStr).toBe(generatedSnapShotAsStr);
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
  let LocaleKeys: typeof InterpolationComplexLocaleKeys.LocaleKeys;
  let generatedResultsAsStr: string, generatedSnapShotAsStr: string;

  beforeEach(async () => {
    driver.given.namespace('interpolation-complex');

    await driver.when.runsCodegenCommand();

    [{ LocaleKeys }, generatedResultsAsStr, generatedSnapShotAsStr] =
      await Promise.all([
        driver.get.generatedResults<typeof InterpolationComplexLocaleKeys>(),
        driver.get.generatedResultsAsStr(),
        driver.get.generatedSnapShotAsStr(),
      ]);
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

    expect(generatedResultsAsStr).toBe(generatedSnapShotAsStr);
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
  driver.given.namespace('fn-name');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    functionName: 'customFnName',
    reactHook: true,
  });

  const { customFnName, useCustomFnName } = await driver.get.generatedResults<
    typeof CustomFnNameLocaleKeys
  >();

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
  driver.given.namespace('no-transl-fn');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    translate: false,
  });

  const { LocaleKeys } = await driver.get.generatedResults<
    typeof NoTranslFnLocaleKeys
  >();

  const localeKeys = LocaleKeys();

  expect(localeKeys.common.loggedIn.message).toEqual('common.loggedIn.message');
  expect(localeKeys.readingWarning).toEqual('readingWarning');
});

test('flatten result', async () => {
  driver.given.namespace('flatten');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
    nested: false,
  });

  const { LocaleKeys } = await driver.get.generatedResults<
    typeof FlattenLocaleKeys
  >();

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
  driver.given.namespace('lint-disable');

  await driver.when.runsCodegenCommand({
    source: 'tests/sources/default.json',
  });

  const resultStr = await driver.get.generatedResultsAsStr();

  const [firstLine, secondLine] = resultStr.split('\n');

  expect(firstLine).toBe('/* eslint-disable */');
  expect(secondLine).toBe('/* tslint:disable */');
});

test('data interpolation icu', async () => {
  driver.given.namespace('icu');
  await driver.when.runsCodegenCommand({
    singleCurlyBraces: true,
  });

  const [{ LocaleKeys }, generatedResultsAsStr, generatedSnapShotAsStr] =
    await Promise.all([
      driver.get.generatedResults<typeof ICULocaleKeys>(),
      driver.get.generatedResultsAsStr(),
      driver.get.generatedSnapShotAsStr(),
    ]);

  const result = LocaleKeys(driver.get.defaultTranslationFn());
  expect(result.common.people.message({ numPersons: 0 })).toBe(
    driver.get.expectedTranslationOf('common.people.message', { numPersons: 0 })
  );
  expect(generatedResultsAsStr).toBe(generatedSnapShotAsStr);
});
