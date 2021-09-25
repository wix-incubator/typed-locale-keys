import fs from 'fs';

import { render } from '@testing-library/react';
import React from 'react';

import {
  LocaleKeysProvider,
  useLocaleKeys
} from './__generated__/pregenerated/react/localeKeys';
import { Driver } from './driver';

const namespace = 'react';
let importResult: Record<string, unknown>;

let driver: Driver;

beforeAll(async () => {
  driver = new Driver();
  driver.given.namespace('react');

  await driver.when.runsCodegenCommand({
    reactHook: true
  });

  importResult = await driver.get.generatedResults<{
    common: {
      create(): string;
    };
    model: { user: { id(): string } };
  }>();
});

test('ts file is not generated', () => {
  expect(fs.existsSync(`tests/__generated__/${namespace}/localeKeys.ts`)).toBe(
    false
  );
});

test('hook and provider should be defined in file', () => {
  expect(importResult.useLocaleKeys).not.toBeUndefined();
  expect(importResult.LocaleKeysProvider).not.toBeUndefined();
});

test('provider and hook should call translation function and return its result', () => {
  const testId = 'some-translated-text';

  const SomeText = () => {
    const localeKeys = useLocaleKeys();

    return (
      <div data-testid={testId}>
        {localeKeys.common.loggedIn.message({ username: 'Bruce' })}
      </div>
    );
  };

  const renderResult = render(
    <LocaleKeysProvider tFn={driver.get.defaultTranslationFn()}>
      <SomeText />
    </LocaleKeysProvider>
  );

  expect(renderResult.getByTestId(testId).innerHTML).toContain(
    driver.get.expectedTranslationOf('common.loggedIn.message', {
      username: 'Bruce'
    })
  );
});
