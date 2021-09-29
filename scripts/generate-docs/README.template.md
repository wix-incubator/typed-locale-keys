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

`tlk codegen --singleCurlyBraces`

or setting in configuration
`package.json`:
```javascript
"typedLocaleKeys": {
    "singleCurlyBraces" : true //optional field. default is false
},
```

## Example

input: `messages_en.json`:

```json
{
  "home.header": "header",
  "home.header.title": "{{greeting}} {{person.firstName }} {{ person.lastName }} today is {{date, DD/MM/YYYY}}",
  "home.header.subtitle": "this is my hello world",
  "home-empty.body.header": "on this app you will do nothing",
  "home.body.description.#phone.$value": "this describes the meaningless apps"
}
```

output:
```typescript
/* tslint:disable */
export type IFullExample = ReturnType<typeof fullExample>;

export function fullExample(translate: Function) {
    return {
        home: {
            header: {
                $value: () => translate('home.header') /* header */,
                title: (options: { greeting: any, person: { firstName: any, lastName: any }, date: any }) => translate('home.header.title', options) /* {{greeting}} {{person.firstName }} {{ person.lastName }} today is {{date, DD/MM/YYYY}} */,
                subtitle: () => translate('home.header.subtitle') /* this is my hello world */
            },
            body: {
                description: {
                    '#phone': {
                        $value: () => translate('home.body.description.#phone.$value') /* this describes the meaningless apps */
                    }
                }
            }
        },
        'home-empty': {
            body: {
                header: () => translate('home-empty.body.header') /* on this app you will do nothing */
            }
        }
    };
}
/* tslint:enable */
```

output with React Hook:
```tsx
/* tslint:disable */
/* eslint-disable */
import React, {createContext, useContext, FC,} from 'react';

export type ILocaleKeys = ReturnType<typeof LocaleKeys>;

export function LocaleKeys(translate: Function) {
    return {
        app: {
            title: () => translate('app.title') /* Hello World! */
        }
    };
}

const LocaleKeysContext = createContext({} as ILocaleKeys);

export const useLocaleKeys = () => useContext(LocaleKeysContext);

export const LocaleKeysProvider: FC<{
    localeKeys?: ILocaleKeys;
    translateFn?: Function;
}> = ({
    localeKeys,
    translateFn,
    children
}) => {
    const value = typeof translateFn === 'function'
        ? LocaleKeys(translateFn)
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

/* eslint-enable  */
/* tslint:enable */

```

## Configuration
`package.json`:
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

<img src="images/caporal-usage.png" alt="drawing" width="100%"/>

