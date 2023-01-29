/* eslint-disable */
/* tslint:disable */
export function LocaleKeys() {
  return {
    common: {
      loggedIn: {
        message: 'common.loggedIn.message', /* Hey, {{username}}, you have successfully logged in! */
      },
    },
    readingWarning: 'readingWarning', /* {{reader}} reads message from {{writer}} */
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
