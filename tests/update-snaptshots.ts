import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DEFAULT_FN_NAME } from '../src/constants';
import { Generator } from '../src/Generator';
import { getInterpolationPrefix, getInterpolationSuffix } from '../src/utils';

interface Config {
  sourceFileName: string;

  reactHook?: boolean;
  singleCurlyBraces?: boolean;
  functionName?: string;
  showTranslations?: boolean;
  translate?: boolean;
  nested?: boolean;
}

const SOURCE_DIRECTORY = 'tests/sources';
const EXPORT_DIRECTORY = 'tests/snapshot';
const getSourceFile = (fileName: string) =>
  `${SOURCE_DIRECTORY}/${fileName}.json`;
const getOutputFile = (dirName: string) => `${EXPORT_DIRECTORY}/${dirName}`;

const cliDefinition = yargs(hideBin(process.argv)).command(
  'generate [fileName]',
  'Generates snapshots for tests',
  (y) =>
    y
      .positional('fileName', {
        type: 'string',
        describe: 'Locale JSON file name',
      })
      .option('all', {
        type: 'boolean',
        alias: 'a',
        describe: 'Generate all files in source',
      })
);

void (async () => {
  const {
    argv: { fileName, all },
  } = cliDefinition;
  const entries: Record<string, Partial<Config>> = {
    icu: {
      singleCurlyBraces: true,
    },
    nested: {},
    flat: {},
    'exotic-keys': {},
    'root-key': {},
    'interpolation-double': {},
    'interpolation-complex': {},
    'interpolation-single': { singleCurlyBraces: true },
    'fn-name': {
      sourceFileName: 'default',
      functionName: 'customFnName',
      reactHook: true,
    },
    'no-transl-fn': {
      sourceFileName: 'default',
      translate: false,
    },
    flatten: {
      sourceFileName: 'default',
      nested: false,
    },
  };
  let snapshots: [string, Partial<Config>][] = [];

  if (all) {
    snapshots = Object.entries(entries);
  } else if (fileName) {
    if (!Object.keys(entries).includes(fileName)) {
      throw new Error(
        `File "${fileName}" has no snapshot generation implementation`
      );
    }
    snapshots = [[fileName, entries[fileName]]];
  } else {
    throw new Error(
      `Must enter at least a single source file name from the entry list: ${Object.keys(
        entries
      )
        .map((entry) => `"${entry}"`)
        .join(', ')}`
    );
  }

  fs.readdir(SOURCE_DIRECTORY, (err, files) => {
    const errors: string[] = [];

    snapshots.forEach(([key, { sourceFileName }]) => {
      if (
        !files.some(
          (file) =>
            file.includes(key) ||
            (sourceFileName && file.includes(sourceFileName))
        )
      ) {
        errors.push(
          `File "${key}" doesn't exist in source directory (${SOURCE_DIRECTORY})`
        );
      }
    });

    if (errors.length) {
      throw new Error(errors.join('\n'));
    }
  });

  const promises = snapshots.map(
    ([
      key,
      {
        sourceFileName,
        translate = true,
        reactHook,
        singleCurlyBraces,
        nested = true,
        showTranslations = true,
        functionName = DEFAULT_FN_NAME,
      },
    ]) =>
      new Generator({
        srcFile: getSourceFile(sourceFileName ?? key),
        outDir: getOutputFile(key),
        reactBindings: reactHook,
        interpolationPrefix: getInterpolationPrefix(singleCurlyBraces),
        interpolationSuffix: getInterpolationSuffix(singleCurlyBraces),
        showTranslations,
        functionName,
        translationFn: translate,
        flatten: !nested,
      }).generate()
  );

  await Promise.all(promises);
  // eslint-disable-next-line no-console
  console.log('✨  Done generating snapshots');
})();
