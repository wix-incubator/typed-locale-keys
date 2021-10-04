# Typed-Local-Keys

Generate typescript code from locale keys JSON.


### Getting Started

```
tlk codegen [INPUT_JSON_FILE] --output [DESTINATION_DIRECTORY]
```

## How to use

### In `package.json`

Add to `scripts`

```javascript
"pretest": "tlk codegen [ENTRY-DIRECTORY]/messages_en.json [OUTPUT-DIRECTORY]",
```

### Initialize generated file with translate function
```javascript
const localeKeys = LocaleKeys(i18nConf.t.bind(i18nConf));
```

### Read interpolation arguments using single curly instead of of double
default is double curly braces. To use single mode pass:

`$ tlk codegen --singleCurlyBraces`

or setting in configuration
`package.json`:
```json
"typedLocaleKeys": {
    "singleCurlyBraces" : true //optional field. default is false
},
```

## Example

input: `messages_en.json`:

```json
{
  "common": {
    "loggedIn": {
      "message": "Hey, {{username}}, you have successfully logged in!"
    }
  },
  "readingWarning": "{{reader}} reads message from {{writer}}"
}

```

output:
```typescript
/* eslint-disable */
export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      loggedIn: {
        message: (data: Record<'username', unknown>) => t('common.loggedIn.message', data),
      },
    },
    readingWarning: (data: Record<'reader' | 'writer', unknown>) => t('readingWarning', data),
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;

```

output with React Hook:
```tsx
/* eslint-disable */
import React from 'react';

export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
  return {
    common: {
      loggedIn: {
        message: (data: Record<'username', unknown>) => t('common.loggedIn.message', data),
      },
    },
    readingWarning: (data: Record<'reader' | 'writer', unknown>) => t('readingWarning', data),
  };
}

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;

const LocaleKeysContext = React.createContext({} as ILocaleKeys);
export const LocaleKeysProvider: React.FC<{ translateFn?: (...args: unknown[]) => string; localeKeys?: ILocaleKeys }> = ({ translateFn, localeKeys, children }) => {
    if (!translateFn && !localeKeys) { throw new Error('Either translateFn or localeKeys must be provided') }
    const value = (typeof translateFn === 'function' ? LocaleKeys(translateFn) : localeKeys) as ILocaleKeys
    return <LocaleKeysContext.Provider value={value}>{children}</LocaleKeysContext.Provider>;
  };
export const useLocaleKeys = () => React.useContext(LocaleKeysContext);

```

## Configuration file

To read the configuration file [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) is used so it supports files like
`.typedlocalekeysrc.json`, `typedlocalekeys.config.js`, `package.json` etc.:
```json
"typedLocaleKeys": {
    "entries": {
      "GalleryKeys": {
        "source": "./locale/messages_en.json",
        "output": "./dist/gallery"
      },
      "CommonKeys": "./locale/sub/messages_en.json" // for source only
    },
    "primaryOutput": "./dist", // fallback output (after cli's `--output` fallback)
    "singleCurlyBraces" : false //optional field. default is false
    "reactHook": false //optional field. default is false
},
```

## More options:

```shell
$ tlk codegen --help


Generates a class from the keys of a locale.json file

Positionals:
  source  Locale JSON file path                                         [string]

Options:
      --help               Show help                                   [boolean]
      --version            Show version number                         [boolean]
  -o, --output             Distribution directory for generated factory [string]
  -n, --nested             Should create nested object [boolean] [default: true]
  -t, --translate          Should add translate function. NOTE: will wrap value
                           with function               [boolean] [default: true]
      --showTranslations   Add translations as function's comment
                                                       [boolean] [default: true]
  -f, --functionName       Generated function name
                                                [string] [default: "LocaleKeys"]
  -d, --dynamicNaming      Also modify type and react bindings names following
                           functionName value                          [boolean]
      --singleCurlyBraces  Read interpolation arguments using single curly
                           instead of double                           [boolean]
      --reactHook          Generate React bindings (Provider and hook) [boolean]

```

