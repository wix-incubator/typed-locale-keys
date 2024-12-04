import fs from 'fs';
import path from 'path';
import util from 'util';
import { spawn } from 'child-process-promise';
import jsonStringify from 'fast-json-stable-stringify';
import { Generator } from '../src/Generator';
import { CliParams } from '../src/bin';
import { DEFAULT_FN_NAME, DEFAULT_OUTPUT } from '../src/constants';
import { getFileExtension } from '../src/utils';

const readFile = util.promisify(fs.readFile);

export class Driver {
  private cwd: string = process.cwd();
  private cliParams: Partial<CliParams> = {
    functionName: DEFAULT_FN_NAME,
  };
  private namespace: string | undefined;
  private functionName: string | undefined;
  private isReactFile: boolean | undefined;

  private defaultTranslateFn = (key: string, options?: unknown) =>
    options ? `KEY: ${key}; OPTIONS: ${jsonStringify(options)}` : `KEY: ${key}`;

  private tFnSpy = jest.fn().mockImplementation(this.defaultTranslateFn);

  private importResults<T>(modulePath: string) {
    const moduleIdentifier = path.resolve(this.cwd, modulePath);

    // eslint-disable-next-line import/extensions,@typescript-eslint/no-unsafe-return,@typescript-eslint/ban-ts-comment
    return import(moduleIdentifier) as Promise<T>;
  }

  private get namespacedSource() {
    return this.namespace ? `tests/sources/${this.namespace}.json` : undefined;
  }

  private get namespacedOutput() {
    return this.namespace
      ? `tests/__generated__/runtime-generation/${this.namespace}/`
      : undefined;
  }

  public given = {
    cwd: (cwd: string): void => {
      this.cwd = path.resolve(process.cwd(), cwd);
    },
    namespace: (namespace: string): void => {
      this.namespace = namespace;
    },
    cliParams: (values: Partial<CliParams>) => {
      Object.assign(this.cliParams, values);
    },
  };

  public when = {
    runsCodegenCommand: async (): Promise<void> => {
      const {
        source = this.namespacedSource,
        output = this.namespacedOutput,
        functionName = DEFAULT_FN_NAME,
        reactHook,
        ...rest
      } = this.cliParams;

      this.functionName = functionName;
      this.isReactFile = reactHook;

      await spawn(
        'ts-node',
        [
          path.resolve(process.cwd(), 'src/bin.ts'),
          'codegen',
          source ?? '',
          ...Object.entries({
            output,
            functionName,
            reactHook,
            ...rest,
          }).flatMap(([key, value]) =>
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
      } = params;

      await new Generator({
        srcFile,
        outDir,
        reactBindings,
        interpolationPrefix: singleCurlyBraces ? '{' : '{{',
        interpolationSuffix: singleCurlyBraces ? '}' : '}}',
        showTranslations,
        functionName,
        translationFn,
        flatten: !nested,
      }).generate();
    },
  };

  public get = {
    defaultTranslationFn: (): jest.Mock => this.tFnSpy,
    generatedResults: <T>(modulePath?: string): Promise<T> => {
      return this.importResults<T>(
        modulePath ??
          `tests/__generated__/runtime-generation/${this.namespace!}/${this
            .functionName!}`
      );
    },
    expectedTranslationOf: (
      key: string,
      options?: Record<string, unknown>
    ): string => this.defaultTranslateFn(key, options),
    generatedResultsAsStr: (modulePath?: string): Promise<string> =>
      readFile(
        modulePath
          ? `${path.join(this.cwd, modulePath)}`
          : `tests/__generated__/runtime-generation/${this
              .namespace!}/LocaleKeys.${getFileExtension(this.isReactFile)}`,
        'utf8'
      ),
  };
}
