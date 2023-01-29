/* eslint-disable */
/* tslint:disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      cancel: () => t('common.cancel'), /* Cancel */
    },
    model: {
      player: {
        name: () => t('model.player.name'), /* Name */
      },
    },
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;
