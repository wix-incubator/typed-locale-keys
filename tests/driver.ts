import fs from 'fs';
import path from 'path';

import util from 'util';

import { spawn } from 'child-process-promise';
import jsonStringify from 'fast-json-stable-stringify';

import { Generator } from '../src/Generator';
import { CliParams } from '../src/bin';
import { DEFAULT_FN_NAME, DEFAULT_OUTPUT } from '../src/constants';

type GeneratedModule<
  R,
  N extends string = 'localeKeys',
  H extends string = 'useLocaleKeys'
> = {
  [key in N]: (fn: CallableFunction) => R;
} & {
  [key in H]: () => R;
};

const readFile = util.promisify(fs.readFile);

export class Driver {
  private cwd: string = process.cwd();

  private namespace: string | undefined;

  private defaultTranslateFn = (key: string, options?: unknown) =>
    options ? `KEY: ${key}; OPTIONS: ${jsonStringify(options)}` : `KEY: ${key}`;

  private tFnSpy = jest.fn().mockImplementation(this.defaultTranslateFn);

  private importResults<R, N extends string, H extends string>(
    modulePath: string
  ) {
    const moduleIdentifier = path.resolve(this.cwd, modulePath);

    // eslint-disable-next-line import/extensions,@typescript-eslint/no-unsafe-return,@typescript-eslint/ban-ts-comment
    return import(moduleIdentifier) as Promise<GeneratedModule<R, N, H>>;
  }

  private get namespacedSource() {
    return this.namespace ? `tests/sources/${this.namespace}.json` : undefined;
  }

  private get namespacedOutput() {
    return this.namespace
      ? `tests/__generated__/runtime-generation/${this.namespace}/`
      : undefined;
  }

  given = {
    cwd: (cwd: string): void => {
      this.cwd = cwd;
    },
    namespace: (namespace: string): void => {
      this.namespace = namespace;
    },
  };

  when = {
    runsCodegenCommand: async (
      params: Partial<CliParams> = {}
    ): Promise<void> => {
      const {
        source = this.namespacedSource,
        output = this.namespacedOutput,
        ...rest
      } = params;

      await spawn(
        'ts-node',
        [
          path.resolve(process.cwd(), 'src/bin.ts'),
          'codegen',
          source ?? '',
          ...Object.entries({ output, ...rest }).flatMap(([key, value]) =>
            value != null ? [`--${key}`, value.toString()] : []
          ),
        ],
        {
          cwd: this.cwd,
        }
      );
    },
    runsGenerator: async (params: Partial<CliParams> = {}): Promise<void> => {
      const {
        source: srcFile = this.namespacedSource ?? 'tests/sources/default.json',
        output: outDir = this.namespacedOutput ?? DEFAULT_OUTPUT,
        translate: translationFn = true,
        functionName = DEFAULT_FN_NAME,
        nested = true,
        showTranslations = true,
        reactHook: reactBindings,
        singleCurlyBraces,
        dynamicNaming,
      } = params;

      await new Generator({
        srcFile,
        outDir,
        reactBindings,
        interpolationPrefix: singleCurlyBraces ? '{' : '{{',
        interpolationSuffix: singleCurlyBraces ? '}' : '}}',
        showTranslations,
        dynamicNaming,
        functionName,
        translationFn,
        flatten: !nested,
      }).generate();
    },
  };

  get = {
    defaultTranslationFn: (): jest.Mock => this.tFnSpy,
    generatedResults: <
      R,
      N extends string = 'LocaleKeys',
      H extends string = 'useLocaleKeys'
    >(
      modulePath?: string
    ): Promise<GeneratedModule<R, N, H>> => {
      if (!this.namespace && !modulePath) {
        throw Error('namespace must be given or modulePath provided');
      }

      return this.importResults<R, N, H>(
        modulePath ??
          `tests/__generated__/runtime-generation/${
            this.namespace as string
          }/LocaleKeys`
      );
    },
    expectedTranslationOf: (
      key: string,
      options?: Record<string, unknown>
    ): string => this.defaultTranslateFn(key, options),
    generatedResultsAsStr: async (filePath?: string): Promise<string> => {
      if (!this.namespace && !filePath) {
        throw Error('namespace must be given or filePath provided');
      }

      return readFile(
        filePath ??
          `tests/__generated__/runtime-generation/${
            this.namespace as string
          }/LocaleKeys.ts`,
        'utf8'
      );
    },
  };
}
