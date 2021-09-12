import { Generator, Options } from '../src/Generator';

export function importResults<R>(path: string): R {
  // eslint-disable-next-line import/extensions,@typescript-eslint/no-unsafe-return,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  return import(path);
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
    srcFile: `tests/testData/${namespace}.json`,
    outDir: `tests/__generated__/${namespace}/`,
    ...params
  });

  await generator.generate();

  return importResults(`./__generated__/${namespace}/localeKeys`);
}
