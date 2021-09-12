/* eslint-disable @typescript-eslint/no-unused-vars */
import { TFunction } from 'i18next';

import { LocaleKeys, localeKeys } from './__generated__/typeTests/localeKeys';
import {
  LocaleKeys as LocaleKeysTypedFn,
  localeKeys as localeKeysTypedFn
} from './__generated__/typeTestsTypeFn/localeKeys';

const str: string = localeKeys((() => '') as TFunction).common.greeting({
  name: 'John'
});

const otherStr: string = localeKeysTypedFn(() => '').common.invitation({
  first: 'Alice',
  second: 'Bob'
});

const someVal: string = 'someval' as ReturnType<
  LocaleKeys['common']['greeting']
>;

const someOtherVal: string = 'someval' as ReturnType<
  LocaleKeysTypedFn['common']['greeting']
>;
