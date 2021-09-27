# Typed-Local-Keys

generate typescript code from locale keys JSON.


### Getting Started

```
tlk codegen [INPUT_JSON_FILE] --output [DESTINATION_DIRECTORY]
```

## How to use

#### <u>in `package.json`</u>
add to `scripts`
```javascript
"pretest": "tlk codegen [ENTRY-DIRECTORY]/messages_en.json [OUTPUT-DIRECTORY]",
```

#### <u>initialize generated file with translate function</u>
```javascript
const localeKeys = LocaleKeys(i18nConf.t.bind(i18nConf));
```

#### <u>in root component ONLY</u>
add `@withTranslation`. it adds the `wait` logic that prevents rendering prior loading all keys
```typescript
import { withTranslation } from 'react-i18next';

@withTranslation
export class App extends React.Component<any> {
    // ... //
}
```

#### <u>Read interpolation arguments using single curly instead of of double</u>
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

```javascript
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

type AbstractTranslateFunction = (...args: any[]) => string | object | Array<string | object> | undefined | null;

export function fullExample<F extends AbstractTranslateFunction>(translate: F) {
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

type AbstractTranslateFunction = (...args: any[]) => string | object | Array<string | object> | undefined | null;

export function LocaleKeys<F extends AbstractTranslateFunction>(translate: F) {
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
    translateFn?: AbstractTranslateFunction;
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

## configuration
`package.json`:
```javascript
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

## more options:

<img src="images/caporal-usage.png" alt="drawing" width="100%"/>

