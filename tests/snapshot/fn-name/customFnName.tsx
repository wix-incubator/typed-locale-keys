/* eslint-disable */
/* tslint:disable */
import React from 'react';

export function customFnName<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      loggedIn: {
        message: (data: Record<'username', unknown>) => t('common.loggedIn.message', data), /* Hey, {{username}}, you have successfully logged in! */
      },
    },
    readingWarning: (data: Record<'reader' | 'writer', unknown>) => t('readingWarning', data), /* {{reader}} reads message from {{writer}} */
  };
}

export type ICustomFnName = ReturnType<typeof customFnName>;

const LocaleKeysContext = React.createContext({} as ICustomFnName);
export const CustomFnNameProvider: React.FC<{ translateFn?: (...args: unknown[]) => string; localeKeys?: ICustomFnName }> = ({ translateFn, localeKeys, children }) => {
    if (!translateFn && !localeKeys) { throw new Error('Either translateFn or localeKeys must be provided') }
    const value = (typeof translateFn === 'function' ? customFnName(translateFn) : localeKeys) as ICustomFnName
    return <LocaleKeysContext.Provider value={value}>{children}</LocaleKeysContext.Provider>;
  };
export const useCustomFnName = () => React.useContext(LocaleKeysContext);
