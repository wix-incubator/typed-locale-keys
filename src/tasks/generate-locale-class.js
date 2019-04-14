const {TSLocaleKeysClassBuilder} = require('../utils/tsLocaleKeysClassBuilder');
const loadJsonFile = require('load-json-file');
const fs = require('fs');
const objectPath = require("object-path");
const shell = require('shelljs');

const unwrapUnnecessary$value = function (localeKeys, allKeys) {
    const localeKeysUnwrapped = Object.assign({}, localeKeys);
    Object.assign(allKeys).forEach((path) => {
        const current = objectPath.get(localeKeysUnwrapped, path);
        if (typeof current === 'object' &&
            Object.keys(current).length === 1 &&
            typeof current.$value === 'object' && typeof current.$value.key === 'string' ) {
            objectPath.set(localeKeysUnwrapped, path, current.$value);
        }
    });

    return localeKeysUnwrapped;
};

async function generateLocaleClass({input, output, className, nested, translate, showTranslations}) {
    if (!input) {
        console.error('\033[31m', 'generateJsFile: expected argument \'--input\'');
        process.exit(1);
    }

    const localeKeysJSON = await loadJsonFile(input);

    let localeKeys = {};
    const allKeys = Object.keys(localeKeysJSON);
    if (nested) {
        allKeys.forEach((key) => objectPath.set(localeKeys, `${key}.$value`, {key, translation: localeKeysJSON[key]}));
        localeKeys = unwrapUnnecessary$value(localeKeys, allKeys);
    } else {
        allKeys.forEach((key) => localeKeys[key.replace(/\./g, '_')] = {key, translation: localeKeysJSON[key]});
    }

    const tsClassBuilder = new TSLocaleKeysClassBuilder({withTranslation: translate, localeKeysJSON, showTranslations});

    const finalClass = await tsClassBuilder.get(localeKeys, className);

    if (!fs.existsSync(output)) {
        shell.mkdir('-p', output);
    }

    fs.writeFileSync(`${output}/${className}.ts`, finalClass, 'utf-8');
}

module.exports = { generateLocaleClass };
