import path from 'path';

import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';

import { Generator } from './Generator';

interface PackageJsonConfig {
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

void (async () => {
  const {
    argv: { source, output, reactHook, showTranslations, singleCurlyBraces }
  } = yargs(hideBin(process.argv)).command(
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
            'Read interpolation arguments using single curly instead of double',
          default: false
        })
        .option('reactHook', {
          type: 'boolean',
          describe: 'Generate React bindings (Provider and hook)',
          default: false
        })
  );

  const packageJson = (await import(
    path.resolve(process.cwd(), 'package.json')
  )) as { typedLocaleKeys?: PackageJsonConfig };

  const primaryOutput =
    output ?? packageJson.typedLocaleKeys?.primaryOutput ?? './dist';

  const entries = Object.values(packageJson.typedLocaleKeys?.entries ?? {});

  if (source) {
    entries.push({ source, output: primaryOutput });
  }

  const promises = entries.map((entry) =>
    new Generator({
      srcFile: typeof entry === 'string' ? entry : entry.source,
      outDir:
        typeof entry !== 'string' && entry.output
          ? entry.output
          : primaryOutput,
      reactBindings: reactHook,
      showTranslations,
      interpolationPrefix: singleCurlyBraces ? '{' : '{{',
      interpolationSuffix: singleCurlyBraces ? '}' : '}}'
    }).generate()
  );

  await Promise.all(promises);
})();
