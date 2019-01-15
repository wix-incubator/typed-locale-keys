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

configuration area `package.json`:
```
  "typedLocaleKeys": {
    "entries": {
      "GalleryKeys": {
        "source": "./locale/messages_en.json",
        "output": "./dist/gallery"
      },
      "CommonKeys": "./locale/sub/messages_en.json" // for source only
    },
    "primaryOutput": "./dist" // fallback output
  },
```

more options:

![Alt caporal usage](images/caporal-usage.jpeg?raw=true "Caporal usage")
