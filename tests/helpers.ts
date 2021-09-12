import { Generator, Options } from '../src/Generator';

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

  // eslint-disable-next-line import/extensions,@typescript-eslint/no-unsafe-return
  return import(`./__generated__/${namespace}/localeKeys`);
}
