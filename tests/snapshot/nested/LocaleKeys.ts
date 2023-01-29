/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      create: () => t('common.create'), /* Create */
    },
    model: {
      user: {
        id: () => t('model.user.id'), /* ID */
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
