import path from 'path';

import { spawn } from 'child-process-promise';

import { Generator, Options } from '../src/Generator';
import { CliParams } from '../src/bin';

export function importResults<R>(modulePath: string): Promise<R> {
  // eslint-disable-next-line import/extensions,@typescript-eslint/no-unsafe-return,@typescript-eslint/ban-ts-comment
  return import(path.resolve(process.cwd(), modulePath));
}

export function defaultSpy(): jest.Mock {
  return jest.fn().mockImplementation((arg) => `transformed -> ${arg}`);
}

export async function generateResult<L>(
  namespace: string,
  params: Partial<Options> = {}
): Promise<{
  localeKeys: (fn: CallableFunction) => L;
}> {
  const generator = new Generator({
    srcFile: `tests/sources/${namespace}.json`,
    outDir: `tests/__generated__/runtime-generation/${namespace}/`,
    ...params
  });

  await generator.generate();

  return importResults(
    `tests/__generated__/runtime-generation/${namespace}/localeKeys`
  );
}

export async function runCodegenCommand(
  { source, ...params } = {} as Partial<CliParams>
): Promise<void> {
  await spawn(`ts-node`, [
    path.resolve(process.cwd(), 'src/bin.ts'),
    'codegen',
    source as string,
    ...Object.entries(params).flatMap(([key, value]) => [
      `--${key}`,
      (value as string).toString()
    ])
  ]);
}
