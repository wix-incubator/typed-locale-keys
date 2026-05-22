#!/usr/bin/env node

import { cosmiconfig } from 'cosmiconfig';
import yargs, { Argv } from 'yargs';

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
export type CliParams = Awaited<ReturnType<typeof codegenBuilder>['argv']>;

const codegenBuilder = (y: Argv) =>
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
    });

const runCodegen = async (argv: CliParams): Promise<void> => {
  const config = (
    await cosmiconfig('typedlocalekeys', {
      packageProp: 'typedLocaleKeys',
    }).search()
  )?.config as Config | undefined;

  const {
    output = config?.primaryOutput ?? DEFAULT_OUTPUT,
    reactHook = config?.reactHook,
    singleCurlyBraces = config?.singleCurlyBraces,
    functionName,
    source,
    showTranslations,
    translate,
    nested,
  } = argv;

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
    }).generate()
  );

  await Promise.all(promises);
};

void yargs(hideBin(process.argv))
  .command(
    'codegen [source]',
    'Generates a factory from the keys of a locale.json file',
    codegenBuilder,
    runCodegen
  )
  .demandCommand(1)
  .parseAsync();
