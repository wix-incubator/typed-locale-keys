import { Generator } from '../src/Generator';
import { DEFAULT_FN_NAME } from '../src/constants';

void (async () => {
  const functionName = DEFAULT_FN_NAME;

  await Promise.all([
    new Generator({
      srcFile: `tests/sources/typeTests.json`,
      outDir: `tests/__generated__/pregenerated/general/`,
      functionName
    }).generate(),
    new Generator({
      srcFile: `tests/sources/typeTests.json`,
      outDir: `tests/__generated__/pregenerated/type-fn/`,
      translationFunctionTypeImport: 'i18next#TFunction',
      functionName
    }).generate(),
    new Generator({
      srcFile: `tests/sources/typeTests.json`,
      outDir: `tests/__generated__/pregenerated/react/`,
      reactBindings: true,
      translationFunctionTypeImport: 'i18next#TFunction',
      functionName
    }).generate(),
    new Generator({
      srcFile: `tests/sources/typeTests.json`,
      outDir: `tests/__generated__/pregenerated/no-fn/`,
      translationFn: false,
      functionName
    }).generate()
  ]);
})();
