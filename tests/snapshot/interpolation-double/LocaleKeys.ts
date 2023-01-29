/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      greeting: (data: Record<'name', unknown>) => t('common.greeting', data), /* Hello, {{name}}! */
      invitation: (data: Record<'first' | 'second', unknown>) => t('common.invitation', data), /* {{first}}, invited {{second}} to be friends. */
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
