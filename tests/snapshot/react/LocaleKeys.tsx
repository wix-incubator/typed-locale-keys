/* eslint-disable */
/* tslint:disable */
import React from 'react';

export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      loggedIn: {
        message: (data: Record<'username', unknown>) => t('common.loggedIn.message', data), /* Hey, {{username}}, you have successfully logged in! */
      },
    },
    readingWarning: (data: Record<'reader' | 'writer', unknown>) => t('readingWarning', data), /* {{reader}} reads message from {{writer}} */
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;

const LocaleKeysContext = React.createContext({} as ILocaleKeys);
export const LocaleKeysProvider: React.FC<{ translateFn?: (...args: unknown[]) => string; localeKeys?: ILocaleKeys; children?: React.ReactNode }> = ({ translateFn, localeKeys, children }) => {
    if (!translateFn && !localeKeys) { throw new Error('Either translateFn or localeKeys must be provided') }
    const value = (typeof translateFn === 'function' ? LocaleKeys(translateFn) : localeKeys) as ILocaleKeys
    return <LocaleKeysContext.Provider value={value}>{children}</LocaleKeysContext.Provider>;
  };
export const useLocaleKeys = () => React.useContext(LocaleKeysContext);
