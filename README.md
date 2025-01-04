# Typed-Locale-Keys

Generate typescript code from locale keys JSON.


### Getting Started

```
tlk codegen [INPUT_JSON_FILE] --output [DESTINATION_DIRECTORY]
```

## How to use

### In `package.json`

Add to `scripts`

```javascript
// package.json
{
  "scripts": {
    "pretest": "tlk codegen [ENTRY-DIRECTORY]/messages_en.json -o [OUTPUT-DIRECTORY]"
  }
}
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
```javascript
// package.json
{
  "typedLocaleKeys": {
    "singleCurlyBraces" : true //optional field. default is false
  }
}
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
/* tslint:disable */
export type ILocaleKeys = {
    common: {
        loggedIn: {
            /* common.loggedIn.message */
            /* Hey, {username}, you have successfully logged in! */
            message: (data: Record<'username', unknown>) => string;
        };
    };
    /* readingWarning */
    /* {reader} reads message from {writer} */
    readingWarning: (data: Record<'reader' | 'writer', unknown>) => string;
};
import { pathgen } from 'object-path-generator';

const createProxyImpl = <R extends string>(
    t = (...[k]: unknown[]) => k as R
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
) =>
    pathgen<R>(undefined, (path, ...options) => {
        const finalPath = path.split('.$value')[0];
        return t(finalPath, ...options);
    }) as unknown;

export function LocaleKeys<R extends string>(t: (...args: unknown[]) => R) {
    return createProxyImpl(t) as ILocaleKeys;
}


```

### **React Support**

Enable React integration by turning on the `--reactHook` flag or setting it in the configuration file.

#### **Usage Example**

```tsx
import { LocaleKeysProvider, useLocaleKeys } from './generated/localeKeys';

const App = () => {
    const { t } = useI18n(); // Your translation function

    return (
        <LocaleKeysProvider translateFn={t}>
            <ChildComponent />
        </LocaleKeysProvider>
    );
};

const ChildComponent = () => {
    const localeKeys = useLocaleKeys();

    return (
        <div>
            {localeKeys.common.loggedIn.message({ username: 'John' })}
        </div>
    );
};
```

## Configuration file

To read the configuration file [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) is used so it supports files like
`.typedlocalekeysrc.json`, `typedlocalekeys.config.js`, `package.json` etc.:
```javascript
{
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
  }
}
```

## More options:

```
$ tlk codegen --help


Generates a factory from the keys of a locale.json file

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
      --singleCurlyBraces  Read interpolation arguments using single curly
                           instead of double                           [boolean]
      --reactHook          Generate React bindings (Provider and hook) [boolean]

```

