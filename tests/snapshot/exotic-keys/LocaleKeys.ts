/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    home: {
      key: {
        'with-dash': () => t('home.key.with-dash'), /* I am with dash */
        $dollar: () => t('home.key.$dollar'), /* I am started with dollar sign */
        '#hashed': () => t('home.key.#hashed'), /* I am started with hashbang */
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
