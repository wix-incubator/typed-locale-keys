/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      people: {
        message: (data: Record<'numPersons', unknown>) => t('common.people.message', data), /* Hey, {numPersons, plural, =0 {no one} =1 {one person} other {# persons}} */
        messageNestedParams: (data: Record<'name' | 'numPersons', unknown>) => t('common.people.messageNestedParams', data), /* Hey, {numPersons, plural, =0 {No one here.} one {{name}. You are the only person here.} other {{name} and # other persons are here.}} */
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
