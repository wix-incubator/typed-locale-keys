/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    order: {
      shippingLabel: {
        customerDetailsCard: {
          address: (data: Record<'firstName' | 'lastName' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'zipCode' | 'country', unknown>) => t('order.shippingLabel.customerDetailsCard.address', data), /* {{firstName}} {{lastName}}, {{addressLine1, suffix ', '}}{{addressLine2, suffix ', '}}{{city, concat ', '}}{{state, suffix ' '}}{{zipCode, suffix ', '}}{{country}} */
        },
        labelDetailsCard: {
          shipFrom: {
            addressFormat: (data: Record<'addressLine1' | 'addressLine2' | 'city' | 'state' | 'zipCode' | 'country', unknown>) => t('order.shippingLabel.labelDetailsCard.shipFrom.addressFormat', data), /* {{addressLine1, suffix ', '}}{{addressLine2, suffix ', '}}{{city, suffix ', '}}{{state}} {{zipCode, suffix ', '}}{{country}} */
          },
        },
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
