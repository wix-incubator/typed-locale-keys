/* eslint-disable @typescript-eslint/no-unused-vars */
import { TFunction } from 'i18next';

import {
  LocaleKeys,
  localeKeys
} from './__generated__/pregenerated/general/localeKeys';
import {
  LocaleKeys as LocaleKeysTypedFn,
  localeKeys as localeKeysTypedFn
} from './__generated__/pregenerated/type-fn/localeKeys';

const str: string = localeKeys((() => '') as TFunction).common.loggedIn.message(
  {
    username: 'John'
  }
);

const otherStr: string = localeKeysTypedFn(() => '').readingWarning({
  reader: 'Alice',
  writer: 'Bob'
});

const someVal: string = 'someval' as ReturnType<
  LocaleKeys['common']['loggedIn']['message']
>;

const someOtherVal: string = 'someval' as ReturnType<
  LocaleKeysTypedFn['readingWarning']
>;
