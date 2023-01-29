/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    home: {
      $value: () => t('home'), /* Home key */
      nested: {
        $value: () => t('home.nested'), /* Level 1 nested */
        deep: () => t('home.nested.deep'), /* Level 2 nested */
      },
      vague: {
        short: () => t('home.vague.short'), /* Short */
        shortAndLong: () => t('home.vague.shortAndLong'), /* Longer */
        shortNested: {
          inner: () => t('home.vague.shortNested.inner'), /* Short inner */
        },
        shortNestedAndLong: {
          inner: () => t('home.vague.shortNestedAndLong.inner'), /* Longer inner */
          $value: () => t('home.vague.shortNestedAndLong'), /* Longer root */
        },
      },
    },
    common: {
      nested: {
        $value: () => t('common.nested'), /* Mixed nesting root */
        deep: () => t('common.nested.deep'), /* Mixed nesting */
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
