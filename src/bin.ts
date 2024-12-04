#!/usr/bin/env node

import { cosmiconfig } from 'cosmiconfig';
import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';

import { Generator } from './Generator';
import { DEFAULT_FN_NAME, DEFAULT_OUTPUT } from './constants';
import { getInterpolationPrefix, getInterpolationSuffix } from './utils';

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
  'Generates a factory from the keys of a locale.json file',
  (y) =>
    y
      .positional('source', {
        type: 'string',
        describe: 'Locale JSON file path',
      })
      .option('output', {
        type: 'string',
        alias: 'o',
        describe: 'Distribution directory for generated factory',
      })
      .option('nested', {
        type: 'boolean',
        describe: 'Should create nested object',
        alias: 'n',
        default: true,
      })
      .option('translate', {
        type: 'boolean',
        alias: 't',
        default: true,
        describe:
          'Should add translate function. NOTE: will wrap value with function',
      })
      .option('showTranslations', {
        type: 'boolean',
        describe: "Add translations as function's comment",
        default: true,
      })
      .option('functionName', {
        type: 'string',
        alias: 'f',
        describe: 'Generated function name',
        default: DEFAULT_FN_NAME,
      })
      .option('singleCurlyBraces', {
        type: 'boolean',
        describe:
          'Read interpolation arguments using single curly instead of double',
      })
      .option('reactHook', {
        type: 'boolean',
        describe: 'Generate React bindings (Provider and hook)',
      })
      .option('experimental_proxyImpl', {
        type: 'boolean',
        default: false,
        describe:
          'Use new experimental proxy implementation which puts the most aggressively growing part of the file into type so it will not be bundled',
      })
);

void (async () => {
  const config = (
    await cosmiconfig('typedlocalekeys', {
      packageProp: 'typedLocaleKeys',
    }).search()
  )?.config as Config | undefined;

  const {
    argv: {
      output = config?.primaryOutput ?? DEFAULT_OUTPUT,
      reactHook = config?.reactHook,
      singleCurlyBraces = config?.singleCurlyBraces,
      functionName,
      source,
      showTranslations,
      translate,
      nested,
      experimental_proxyImpl, // eslint-disable-line @typescript-eslint/naming-convention
    },
  } = cliDefinition;

  const entries = Object.entries(config?.entries ?? {});

  if (source) {
    entries.push([functionName, { source, output }]);
  }

  const promises = entries.map(([key, value]) =>
    new Generator({
      srcFile: typeof value === 'string' ? value : value.source,
      outDir: typeof value !== 'string' && value.output ? value.output : output,
      reactBindings: reactHook,
      interpolationPrefix: getInterpolationPrefix(singleCurlyBraces),
      interpolationSuffix: getInterpolationSuffix(singleCurlyBraces),
      showTranslations,
      functionName: key,
      translationFn: translate,
      flatten: !nested,
      experimental_proxyImplementation: experimental_proxyImpl,
    }).generate()
  );

  await Promise.all(promises);
})();
