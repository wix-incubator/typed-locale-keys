# Typed-Local-Keys

generate typescript code from locale keys JSON.


### Getting Started

```
vazi codegen [INPUT_JSON_FILE] --output [DESTINATION_DIRECTORY]
```

## example

input: `messages_eb.json`:

```
    {
      "home.header.title": "hello world",
      "home.header.subtitle": "this is my hello world",
      "home.body.header": "on this app you will do nothing",
      "home.body.description": "this describes the meaningless apps"
    }
```

output:
```
    export class LocaleKeys {
        constructor(private translate: Function) {
            //
        }

        public home = {
            header: {
                title: () => this.translate('home.header.title'),
                subtitle: () => this.translate('home.header.subtitle'),
            },
            body: {
                header: () => this.translate('home.body.header'),
                description: () => this.translate('home.body.description'),
            },
        };
    }

```

## Istanbul Code Coverage
`--coverage` option.
allows Istanbul break build by coverage check.
has `--threshold` option (default: 4 month), for grace period

### Translate
`--translate` option.
add translate function
