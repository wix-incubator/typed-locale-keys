const LocaleKeysContext = createContext<ILocaleKeys>({} as ILocaleKeys);

export const useLocaleKeys = () => useContext(LocaleKeysContext);

export const LocaleKeysProvider: FC<{localeKeys: ILocaleKeys}> = ({localeKeys, children}) => (
  <LocaleKeysContext.Provider value={localeKeys}>{children}</LocaleKeysContext.Provider>
);
