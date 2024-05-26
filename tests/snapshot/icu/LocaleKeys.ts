/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      people: {
        message: (data: { numPersons?: number }) => t('common.people.message', data), /* Hey, {numPersons, plural, =0 {no one} =1 {one person} other {# persons}} */
        messageComplex: (data: { name?: string; numPersons?: number; productsAmount?: number }) => t('common.people.messageComplex', data), /* Hey {name}, There are {numPersons, plural, =0 {no one} =1 {one person} other {# persons}} that want to change the {productsAmount, plural, =1 {price of 1 product} other {prices of # products}} */
        messageNestingParams: (data: { name?: string; numPersons?: number }) => t('common.people.messageNestingParams', data), /* Hey, {numPersons, plural, =0 {No one here.} one {{name}. You are the only person here.} other {{name} and # other persons are here.}} */
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
