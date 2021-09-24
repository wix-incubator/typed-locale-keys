#!/usr/bin/env node

import { cosmiconfig } from 'cosmiconfig';
import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';

import { Generator } from './Generator';

export interface Config {
  entries: {
    [key: string]:
      | string
      | {
          source: string;
          output?: string;
        };
  };
  primaryOutput?: string;
  singleCurlyBraces?: boolean;
  reactHook?: boolean;
}

export type CliParams = typeof cliDefinition['argv'];

const cliDefinition = yargs(hideBin(process.argv)).command(
  'codegen [source]',
  'Generates a class from the keys of a locale.json file',
  (y) =>
    y
      .positional('source', {
        type: 'string',
        describe: 'Locale JSON file path'
      })
      .option('output', {
        type: 'string',
        alias: 'o',
        describe: 'Distribution directory for generated class'
      })
      .option('nested', {
        type: 'boolean',
        describe: 'Should create nested object',
        alias: 'n',
        default: true
      })
      .option('translate', {
        type: 'boolean',
        alias: 't',
        default: true,
        describe:
          'Should add translate function. NOTE: will wrap value with function'
      })
      .option('showTranslations', {
        type: 'boolean',
        describe: `Add translations as function's comment`,
        default: true
      })
      .option('functionName', {
        type: 'string',
        describe: 'Generated function name',
        default: 'LocaleKeys'
      })
      .option('singleCurlyBraces', {
        type: 'boolean',
        describe:
          'Read interpolation arguments using single curly instead of double'
      })
      .option('reactHook', {
        type: 'boolean',
        describe: 'Generate React bindings (Provider and hook)'
      })
);

void (async () => {
  const config = (await cosmiconfig('typedLocaleKeys').search())?.config as
    | Config
    | undefined;

  const {
    argv: {
      output = config?.primaryOutput ?? './dist',
      reactHook = config?.reactHook,
      singleCurlyBraces = config?.singleCurlyBraces,
      source,
      showTranslations
    }
  } = cliDefinition;

  const entries = Object.values(config?.entries ?? {});

  if (source) {
    entries.push({ source, output });
  }

  const promises = entries.map((entry) =>
    new Generator({
      srcFile: typeof entry === 'string' ? entry : entry.source,
      outDir: typeof entry !== 'string' && entry.output ? entry.output : output,
      reactBindings: reactHook,
      showTranslations,
      interpolationPrefix: singleCurlyBraces ? '{' : '{{',
      interpolationSuffix: singleCurlyBraces ? '}' : '}}'
    }).generate()
  );

  await Promise.all(promises);
})();
