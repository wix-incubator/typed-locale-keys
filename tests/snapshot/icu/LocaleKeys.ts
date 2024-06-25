/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      people: {
        message: (data: Record<'numPersons', unknown>) => t('common.people.message', data), /* Hey, {numPersons, plural, =0 {no one} =1 {one person} other {# persons}} */
        messageComplex: (data: Record<'name' | 'numPersons' | 'productsAmount', unknown>) => t('common.people.messageComplex', data), /* Hey {name}, There are {numPersons, plural, =0 {no one} =1 {one person} other {# persons}} that want to change the {productsAmount, plural, =1 {price of 1 product} other {prices of # products}} */
        pluralMessage: (data: Record<'numPeople', unknown>) => t('common.people.pluralMessage', data), /* {numPeople, plural, =0 {No one is} =1 {One person is} other {# people are}} interested */
        ordinalMessage: (data: Record<'position', unknown>) => t('common.people.ordinalMessage', data), /* {position, selectordinal, one {You're 1st} two {You're 2nd} few {You're 3rd} other {You're #th}} */
        dateMessage: (data: Record<'currentDate', unknown>) => t('common.people.dateMessage', data), /* Today is {currentDate, date, long} */
        timeMessage: (data: Record<'currentTime', unknown>) => t('common.people.timeMessage', data), /* The current time is {currentTime, time, short} */
        selectMessage: (data: Record<'gender', unknown>) => t('common.people.selectMessage', data), /* {gender, select, male {He is} female {She is} other {They are} } interested */
        numberMessage: (data: Record<'numApples', unknown>) => t('common.people.numberMessage', data), /* You have {numApples, number} apples */
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
