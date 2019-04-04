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
    const localeKeys = new LocaleKeys(i18nConf.t.bind(i18nConf));
```

#### <u>in root component ONLY</u>
add `@translate`
```typescript
    import {translate} from 'react-i18next';

    @translate
    export class App extends React.Component<any> {
        // ... //
    }
```

## Example

input: `messages_en.json`:

```json
    {
     "home.header": "header",
     "home.header.title": "{{greeting}} {{person.firstName }} {{ person.lastName }} today is {{date, DD/MM/YYYY}}",
     "home.header.subtitle": "this is my hello world",
     "home.body.header": "on this app you will do nothing",
     "home.body.description": "this describes the meaningless apps"
    }
```

output:
```typescript
    /* tslint:disable */
    export class FullExample {
        constructor(private translate: Function) {
            //
        }

        public home = {
            header: {
                $value: () => this.translate('home.header') /* header */,
                title: (options: { greeting: any, person: { firstName: any, lastName: any }, date: any }) => this.translate('home.header.title', options) /* {{greeting}} {{person.firstName }} {{ person.lastName }} today is {{date, DD/MM/YYYY}} */,
                subtitle: () => this.translate('home.header.subtitle') /* this is my hello world */,
            },
            body: {
                header: () => this.translate('home.body.header') /* on this app you will do nothing */,
                description: () => this.translate('home.body.description') /* this describes the meaningless apps */,
            },
        };
    }
    /* tslint:enable */

```

configuration area `package.json`:
```json
    "typedLocaleKeys": {
    "entries": {
      "GalleryKeys": {
        "source": "./locale/messages_en.json",
        "output": "./dist/gallery"
      },
      "CommonKeys": "./locale/sub/messages_en.json" // for source only
    },
    "primaryOutput": "./dist" // fallback output (after cli's `--output` fallback)
    },
```

more options:

<img src="images/caporal-usage.jpeg" alt="drawing" width="100%"/>

