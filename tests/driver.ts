import path from 'path';

import { spawn } from 'child-process-promise';
import jsonStringify from 'fast-json-stable-stringify';

import { CliParams } from '../src/bin';

type GeneratedModule<R, N extends string = 'localeKeys'> = {
  [key in N]: (fn: CallableFunction) => R;
} & {
  useLocaleKeys: () => R;
};

export class Driver {
  private cwd: string = process.cwd();

  private namespace: string | undefined;

  private defaultTranslateFn = (key: string, options?: unknown) =>
    options ? `KEY: ${key}; OPTIONS: ${jsonStringify(options)}` : `KEY: ${key}`;

  private tFnSpy = jest.fn().mockImplementation(this.defaultTranslateFn);

  private importResults<R, N extends string>(modulePath: string) {
    const moduleIdentifier = path.resolve(this.cwd, modulePath);

    // eslint-disable-next-line import/extensions,@typescript-eslint/no-unsafe-return,@typescript-eslint/ban-ts-comment
    return import(moduleIdentifier) as Promise<GeneratedModule<R, N>>;
  }

  given = {
    cwd: (cwd: string): void => {
      this.cwd = cwd;
    },
    namespace: (namespace: string): void => {
      this.namespace = namespace;
    }
  };

  when = {
    runsCodegenCommand: async (
      params: Partial<CliParams> = {}
    ): Promise<void> => {
      const {
        source = `tests/sources/${this.namespace}.json`,
        output = `tests/__generated__/runtime-generation/${this.namespace}/`,
        ...rest
      } = params;

      await spawn(
        `ts-node`,
        [
          path.resolve(process.cwd(), 'src/bin.ts'),
          'codegen',
          source as string,
          ...Object.entries({ output, ...rest }).flatMap(([key, value]) => [
            `--${key}`,
            (value as string).toString()
          ])
        ],
        {
          cwd: this.cwd
        }
      );
    }
  };

  get = {
    defaultTranslationFn: (): jest.Mock => this.tFnSpy,
    generatedResults: <R, N extends string = 'localeKeys'>(
      modulePath?: string
    ): Promise<GeneratedModule<R, N>> => {
      if (this.namespace) {
        return this.importResults<R, N>(
          `tests/__generated__/runtime-generation/${this.namespace}/localeKeys`
        );
      }

      if (!modulePath) {
        throw Error('namespace must be given or modulePath provided');
      }

      return this.importResults<R, N>(modulePath);
    },
    expectedTranslationOf: (key: string, options?: Record<string, unknown>) =>
      this.defaultTranslateFn(key, options)
  };
}
