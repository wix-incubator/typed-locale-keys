# Typed-Local-Keys

Generate typescript code from locale keys JSON.


### Getting Started

```
tlk codegen [INPUT_JSON_FILE] --output [DESTINATION_DIRECTORY]
```

## How to use

### In `package.json`

Add to `scripts`

```json lines
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
```json lines
// package.json
{
  "typedLocaleKeys": {
    "singleCurlyBraces" : true //optional field. default is false
  }
}
```

## Example

input: `messages_en.json`:

```json lines
{{source}}
```

output:
```typescript
{{output}}
```

output with React Hook:
```tsx
{{outputReact}}
```

## Configuration file

To read the configuration file [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) is used so it supports files like
`.typedlocalekeysrc.json`, `typedlocalekeys.config.js`, `package.json` etc.:
```json lines
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
{{cliHelp}}
```

