import { Generator } from '../src/Generator';

void (async () => {
  await Promise.all([
    new Generator({
      srcFile: `tests/testData/typeTests.json`,
      outDir: `tests/__generated__/pregenerated/general/`
    }).generate(),
    new Generator({
      srcFile: `tests/testData/typeTests.json`,
      outDir: `tests/__generated__/pregenerated/type-fn/`,
      translationFunctionTypeImport: 'i18next#TFunction'
    }).generate(),
    new Generator({
      srcFile: `tests/testData/typeTests.json`,
      outDir: `tests/__generated__/pregenerated/react/`,
      reactBindings: true,
      translationFunctionTypeImport: 'i18next#TFunction'
    }).generate()
  ]);
})();
