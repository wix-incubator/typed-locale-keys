import fs from 'fs';

import { render } from '@testing-library/react';
import React from 'react';

import {
  LocaleKeysProvider,
  useLocaleKeys
} from './__generated__/pregenerated/react/localeKeys';
import { generateResult } from './helpers';

const namespace = 'react';
let importResult: Record<string, unknown>;

beforeAll(async () => {
  importResult = await generateResult<{
    common: {
      create(): string;
    };
    model: { user: { id(): string } };
  }>(namespace, {
    reactBindings: true
  });
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
  const tFn = jest
    .fn()
    .mockImplementation(
      (key, options) => `KEY: "${key}"; OPTIONS: "${JSON.stringify(options)}"`
    );

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
    <LocaleKeysProvider tFn={tFn}>
      <SomeText />
    </LocaleKeysProvider>
  );

  expect(renderResult.getByTestId(testId).innerHTML).toContain(
    'KEY: "common.loggedIn.message"; OPTIONS: "{"username":"Bruce"}"'
  );
});
