/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    'common.loggedIn.message': (data: Record<'username', unknown>) => t('common.loggedIn.message', data), /* Hey, {{username}}, you have successfully logged in! */
    readingWarning: (data: Record<'reader' | 'writer', unknown>) => t('readingWarning', data), /* {{reader}} reads message from {{writer}} */
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
