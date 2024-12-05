import { Driver } from './driver';
import * as InterpolationComplexLocaleKeys from './__generated__/pregenerated/interpolation-complex/LocaleKeys';
import * as ICULocaleKeys from './__generated__/pregenerated/icu/LocaleKeys';
import * as ICUNestedLocaleKeys from './__generated__/pregenerated/icu-nested/LocaleKeys';
import * as CustomFnNameLocaleKeys from './__generated__/pregenerated/fn-name/customFnName';
import * as ExoticKeysLocaleKeys from './__generated__/pregenerated/exotic-keys/LocaleKeys';
import * as FlatLocaleKeys from './__generated__/pregenerated/flat/LocaleKeys';
import * as FlattenLocaleKeys from './__generated__/pregenerated/flatten/LocaleKeys';
import * as RootKeyLocaleKeys from './__generated__/pregenerated/root-key/LocaleKeys';
import * as InterpolationDoubleLocaleKeys from './__generated__/pregenerated/interpolation-double/LocaleKeys';
import * as InterpolationSingleLocaleKeys from './__generated__/pregenerated/interpolation-single/LocaleKeys';
import * as NestedLocaleKeys from './__generated__/pregenerated/nested/LocaleKeys';
import * as NoTranslFnLocaleKeys from './__generated__/pregenerated/no-transl-fn/LocaleKeys';

let driver: Driver;

beforeEach(() => {
  driver = new Driver();
});

describe('generator', () => {
  describe('nested data', () => {
    beforeEach(async () => {
      driver.given.namespace('nested');
      await driver.when.runsCodegenCommand();
    });

    it('functional', async () => {
      const { LocaleKeys } = await driver.get.generatedResults<
        typeof NestedLocaleKeys
      >();
      const result = LocaleKeys(driver.get.defaultTranslationFn());
      expect(result.common.create()).toBe(
        driver.get.expectedTranslationOf('common.create')
      );
      expect(result.model.user.id()).toBe(
        driver.get.expectedTranslationOf('model.user.id')
      );
    });

    it('snapshot', async () => {
      const generatedResultsAsStr = await driver.get.generatedResultsAsStr();
      expect(generatedResultsAsStr).toMatchSnapshot();
    });
  });

  describe('flat data', () => {
    beforeEach(async () => {
      driver.given.namespace('flat');
      await driver.when.runsCodegenCommand();
    });

    test('functional', async () => {
      const { LocaleKeys } = await driver.get.generatedResults<
        typeof FlatLocaleKeys
      >();

      const result = LocaleKeys(driver.get.defaultTranslationFn());

      expect(result.common.cancel()).toBe(
        driver.get.expectedTranslationOf('common.cancel')
      );
      expect(result.model.player.name()).toBe(
        driver.get.expectedTranslationOf('model.player.name')
      );
    });

    test('snapshot', async () => {
      const generatedResultsAsStr = await driver.get.generatedResultsAsStr();
      expect(generatedResultsAsStr).toMatchSnapshot();
    });
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

  describe('data interpolation single quote', () => {
    beforeEach(async () => {
      driver.given.namespace('interpolation-single');
      driver.given.cliParams({
        singleCurlyBraces: true,
      });
      await driver.when.runsCodegenCommand();
    });

    test('functional', async () => {
      const { LocaleKeys } = await driver.get.generatedResults<
        typeof InterpolationSingleLocaleKeys
      >();

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

    test('snapshot', async () => {
      const generatedResultsAsStr = await driver.get.generatedResultsAsStr();
      expect(generatedResultsAsStr).toMatchSnapshot();
    });
  });

  describe('complex interpolation case', () => {
    beforeEach(async () => {
      driver.given.namespace('interpolation-complex');

      await driver.when.runsCodegenCommand();
    });

    test('general case', async () => {
      const { LocaleKeys } = await driver.get.generatedResults<
        typeof InterpolationComplexLocaleKeys
      >();

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

    test('snapshot', async () => {
      const generatedResultsAsStr = await driver.get.generatedResultsAsStr();
      expect(generatedResultsAsStr).toMatchSnapshot();
    });

    test('case when the complex interpolation comes first', async () => {
      const { LocaleKeys } = await driver.get.generatedResults<
        typeof InterpolationComplexLocaleKeys
      >();

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
    driver.given.cliParams({
      source: 'tests/sources/default.json',
      functionName: 'customFnName',
      reactHook: true,
    });
    await driver.when.runsCodegenCommand();

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
    driver.given.cliParams({
      source: 'tests/sources/default.json',
    });
    await driver.when.runsCodegenCommand();

    const resultStr = await driver.get.generatedResultsAsStr();

    expect(resultStr).toContain(
      '/* Hey, {{username}}, you have successfully logged in! */'
    );
    expect(resultStr).toContain(
      '/* {{reader}} reads message from {{writer}} */'
    );
  });

  test('not add translated value as a comment', async () => {
    driver.given.namespace('no-comments');
    driver.given.cliParams({
      source: 'tests/sources/default.json',
      showTranslations: false,
    });
    await driver.when.runsCodegenCommand();

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
    driver.given.cliParams({
      source: 'tests/sources/default.json',
      translate: false,
    });
    await driver.when.runsCodegenCommand();

    const { LocaleKeys } = await driver.get.generatedResults<
      typeof NoTranslFnLocaleKeys
    >();

    const localeKeys = LocaleKeys();

    expect(localeKeys.common.loggedIn.message).toEqual(
      'common.loggedIn.message'
    );
    expect(localeKeys.readingWarning).toEqual('readingWarning');
  });

  test('flatten result', async () => {
    driver.given.namespace('flatten');
    driver.given.cliParams({
      source: 'tests/sources/default.json',
      nested: false,
    });
    await driver.when.runsCodegenCommand();

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
    driver.given.cliParams({
      source: 'tests/sources/default.json',
    });
    await driver.when.runsCodegenCommand();

    const resultStr = await driver.get.generatedResultsAsStr();

    const [firstLine, secondLine] = resultStr.split('\n');

    expect(firstLine).toBe('/* eslint-disable */');
    expect(secondLine).toBe('/* tslint:disable */');
  });

  test('should have exported function with correct generics and argument types', async () => {
    driver.given.namespace('lint-disable');
    driver.given.cliParams({
      source: 'tests/sources/default.json',
    });
    await driver.when.runsCodegenCommand();

    const generatedResultsAsStr = await driver.get.generatedResultsAsStr();

    expect(generatedResultsAsStr).toContain(
      'export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R)'
    );
  });

  describe('data interpolation icu', () => {
    beforeEach(async () => {
      driver.given.namespace('icu');
      driver.given.cliParams({
        singleCurlyBraces: true,
      });
      await driver.when.runsCodegenCommand();
    });

    test('functional', async () => {
      const { LocaleKeys } = await driver.get.generatedResults<
        typeof ICULocaleKeys
      >();

      const result = LocaleKeys(driver.get.defaultTranslationFn());

      expect(
        result.common.people.messageComplex({
          numPersons: 0,
          name: 'test',
          productsAmount: 0,
        })
      ).toBe(
        driver.get.expectedTranslationOf('common.people.messageComplex', {
          numPersons: 0,
          name: 'test',
          productsAmount: 0,
        })
      );
    });

    test('snapshot', async () => {
      const generatedResultsAsStr = await driver.get.generatedResultsAsStr();
      expect(generatedResultsAsStr).toMatchSnapshot();
    });
  });

  describe('data interpolation icu with nested params', () => {
    beforeEach(async () => {
      driver.given.namespace('icu-nested');
      driver.given.cliParams({
        singleCurlyBraces: true,
      });
      await driver.when.runsCodegenCommand();
    });

    test('functional', async () => {
      const { LocaleKeys } = await driver.get.generatedResults<
        typeof ICUNestedLocaleKeys
      >();

      const result = LocaleKeys(driver.get.defaultTranslationFn());
      expect(
        result.common.people.messageNestedParams({
          numPersons: 2,
          name: 'something',
        })
      ).toBe(
        driver.get.expectedTranslationOf('common.people.messageNestedParams', {
          numPersons: 2,
          name: 'something',
        })
      );
    });

    test('snapshot', async () => {
      const generatedResultsAsStr = await driver.get.generatedResultsAsStr();
      expect(generatedResultsAsStr).toMatchSnapshot();
    });
  });
});
