import { Generator } from '../src/Generator';

void (async () => {
  const generator = new Generator({
    srcFile: `tests/testData/typeTests.json`,
    outDir: `tests/__generated__/typeTests/`
  });

  const generatorTypeFn = new Generator({
    srcFile: `tests/testData/typeTests.json`,
    outDir: `tests/__generated__/typeTestsTypeFn/`,
    translationFunctionTypeImport: 'i18next#TFunction'
  });

  await Promise.all([generator.generate(), generatorTypeFn.generate()]);
})();
