/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      people: {
        message: (data: Record<'numPersons', unknown>) => t('common.people.message', data), /* Hey, {numPersons, plural, =0 {no one} =1 {one person} other {# persons}} */
        messageComplex: (data: Record<'name' | 'numPersons' | 'productsAmount', unknown>) => t('common.people.messageComplex', data), /* Hey {name}, There are {numPersons, plural, =0 {no one} =1 {one person} other {# persons}} that want to change the {productsAmount, plural, =1 {price of 1 product} other {prices of # products}} */
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
