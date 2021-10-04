/* eslint-disable @typescript-eslint/no-unused-vars */
import { TFunction } from 'i18next';

import {
  CustomFnName,
  customFnName
} from './__generated__/pregenerated/fn-name-dynamic/customFnName';
import {
  ILocaleKeys,
  LocaleKeys
} from './__generated__/pregenerated/general/LocaleKeys';
import { LocaleKeys as LocaleKeysNoFn } from './__generated__/pregenerated/no-fn/LocaleKeys';
import {
  ILocaleKeys as ILocaleKeysTypedFn,
  LocaleKeys as LocaleKeysTypedFn
} from './__generated__/pregenerated/type-fn/LocaleKeys';

const str: string = LocaleKeys((() => '') as TFunction).common.loggedIn.message(
  {
    username: 'John'
  }
);

const otherStr: string = LocaleKeysTypedFn(() => '').readingWarning({
  reader: 'Alice',
  writer: 'Bob'
});

const someVal: ReturnType<ILocaleKeys['common']['loggedIn']['message']> =
  'someval';

const someOtherVal: ReturnType<ILocaleKeysTypedFn['readingWarning']> =
  'someval';

const noFn: string = LocaleKeysNoFn().common.loggedIn.message;

const keys: CustomFnName = {
  common: {
    loggedIn: {
      message: 'foo'
    }
  },
  readingWarning: 'buz'
};
