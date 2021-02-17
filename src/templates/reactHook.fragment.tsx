const LocaleKeysContext = createContext({} as ILocaleKeysTemplate);

export const useLocaleKeysTemplate = () => useContext(LocaleKeysContext);

export const LocaleKeysProviderTemplate: FC<{
    localeKeys?: ILocaleKeysTemplate;
    translateFn?: Function;
}> = ({
    localeKeys,
    translateFn,
    children
}) => {
    const value = typeof translateFn === 'function'
        ? LocaleKeysTemplate(translateFn)
        : localeKeys;

    if (!value) {
        throw new Error('You must provide localeKeys or translateFn');
    }

    return (
        <LocaleKeysContext.Provider value={value}>
            {children}
        </LocaleKeysContext.Provider>
    )
};
