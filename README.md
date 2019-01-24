# Typed-Local-Keys

generate typescript code from locale keys JSON.


### Getting Started

```
tlk codegen [INPUT_JSON_FILE] --output [DESTINATION_DIRECTORY]
```

## example

input: `messages_eb.json`:

```
   {
     "home.header": "header",
     "home.header.title": "{{greeting}} {{person.firstName }} {{ person.lastName }} today is {{date, DD/MM/YYYY}}",
     "home.header.subtitle": "this is my hello world",
     "home.body.header": "on this app you will do nothing",
     "home.body.description": "this describes the meaningless apps"
   }
```

output:
```
    export class FullExample {
        constructor(private translate: Function) {
            //
        }

        public home = {
            header: {
                $value: () => this.translate('home.header'),
                title: (options: { greeting: any, person: { firstName: any, lastName: any }, date: any }) => this.translate('home.header.title', options),
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
