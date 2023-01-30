import fs from 'fs';

import { render } from '@testing-library/react';
import React from 'react';

import {
  LocaleKeys,
  LocaleKeysProvider,
  useLocaleKeys,
} from './__generated__/pregenerated/react/LocaleKeys';
import { Driver } from './driver';

const namespace = 'react';
let driver: Driver;

beforeAll(async () => {
  driver = new Driver();
  driver.given.namespace('react');

  await driver.when.runsCodegenCommand({
    reactHook: true,
  });

  await driver.get.generatedResults();
});

const testId = 'some-translated-text';

const SomeText = () => {
  const localeKeys = useLocaleKeys();

  return (
    <div data-testid={testId}>
      {localeKeys.common.loggedIn.message({ username: 'Bruce' })}
    </div>
  );
};

test('ts file is not generated', () => {
  expect(fs.existsSync(`tests/__generated__/${namespace}/localeKeys.ts`)).toBe(
    false
  );
});

test('react file (snapshot)', async () => {
  const [generatedResultsAsStr, generatedSnapShotAsStr] = await Promise.all([
    driver.get.generatedResultsAsStr(),
    driver.get.generatedSnapShotAsStr(),
  ]);
  expect(generatedResultsAsStr).toBe(generatedSnapShotAsStr);
});

test('provider and hook should call translation function and return its result', () => {
  const renderResult = render(
    <LocaleKeysProvider translateFn={driver.get.defaultTranslationFn()}>
      <SomeText />
    </LocaleKeysProvider>
  );

  expect(renderResult.getByTestId(testId).innerHTML).toContain(
    driver.get.expectedTranslationOf('common.loggedIn.message', {
      username: 'Bruce',
    })
  );
});

test('provider and hook should call translation function and return its result when localeKeys passed as prop', () => {
  const renderResult = render(
    <LocaleKeysProvider
      localeKeys={LocaleKeys(driver.get.defaultTranslationFn())}
    >
      <SomeText />
    </LocaleKeysProvider>
  );

  expect(renderResult.getByTestId(testId).innerHTML).toContain(
    driver.get.expectedTranslationOf('common.loggedIn.message', {
      username: 'Bruce',
    })
  );
});
