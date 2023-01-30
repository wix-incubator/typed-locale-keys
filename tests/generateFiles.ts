import fs from 'fs';
import { DEFAULT_FN_NAME } from '../src/constants';
import { Generator } from '../src/Generator';
import { getInterpolationPrefix, getInterpolationSuffix } from '../src/utils';

const SOURCE_DIRECTORY = 'tests/sources';
const getSourceFile = (fileName: string) =>
  `${SOURCE_DIRECTORY}/${fileName}.json`;
const getOutputFile = (dirName: string) =>
  `tests/__generated__/pregenerated/${dirName}`;

interface Config {
  sourceFileName: string;

  reactHook?: boolean;
  singleCurlyBraces?: boolean;
  functionName?: string;
  showTranslations?: boolean;
  translate?: boolean;
  nested?: boolean;
}

export const Entries: Record<string, Partial<Config>> = {
  icu: {
    singleCurlyBraces: true,
  },
  'icu-double': {},
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
  react: {
    sourceFileName: 'typeTests',
    reactHook: true,
  },
};

export const generateFiles = async () => {
  let entries: [string, Partial<Config>][] = [];
  entries = Object.entries(Entries);

  fs.readdir(SOURCE_DIRECTORY, (err, files) => {
    const errors: string[] = [];

    entries.forEach(([key, { sourceFileName }]) => {
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

  const promises = entries.map(
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
  console.log('✨  Done generating pretest files');
};
