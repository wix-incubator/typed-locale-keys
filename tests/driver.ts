import path from 'path';

import { spawn } from 'child-process-promise';

import { Generator, Options } from '../src/Generator';
import { CliParams } from '../src/bin';

export class Driver {
  private cwd: string = process.cwd();

  given = {
    cwd: (cwd: string): void => {
      this.cwd = cwd;
    }
  };

  when = {
    runsCodegenCommand: async (
      { source, ...params } = {} as Partial<CliParams>
    ): Promise<void> => {
      await spawn(
        `ts-node`,
        [
          path.resolve(process.cwd(), 'src/bin.ts'),
          'codegen',
          source as string,
          ...Object.entries(params).flatMap(([key, value]) => [
            `--${key}`,
            (value as string).toString()
          ])
        ],
        {
          cwd: this.cwd
        }
      );
    },
    generatesResult: async <L>(
      namespace: string,
      params: Partial<Options> = {}
    ): Promise<{
      localeKeys: (fn: CallableFunction) => L;
    }> => {
      const generator = new Generator({
        srcFile: `tests/sources/${namespace}.json`,
        outDir: `tests/__generated__/runtime-generation/${namespace}/`,
        ...params
      });

      await generator.generate();

      return this.get.importedGeneratedResults(
        `tests/__generated__/runtime-generation/${namespace}/localeKeys`
      );
    }
  };

  get = {
    importedGeneratedResults: async <R>(
      modulePath: string
    ): Promise<R & { useLocaleKeys: unknown }> => {
      // eslint-disable-next-line import/extensions,@typescript-eslint/no-unsafe-return,@typescript-eslint/ban-ts-comment
      return import(path.resolve(this.cwd, modulePath));
    }
  };
}
