const {TSLocaleKeysClassBuilder} = require('./tsLocaleKeysClassBuilder');
const loadJsonFile = require('load-json-file');
const fs = require('fs');
const objectPath = require("object-path");
const {analyzeAgeOfKey} = require('./analyze-age-of-key');
const shell = require('shelljs');

const unwrapUnneeded$value = function (localeKeys, allKeys) {
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

async function generateLocaleClass({input, output, className, nested, coverage, translate, gracePeriod, showTranslations}) {
    if (!input) {
        console.error('\033[31m', 'generateJsFile: expected argument \'--input\'');
        process.exit(1);
    }

    let analyzedAgeOfKey = {};

    if (coverage) {
        analyzedAgeOfKey = await analyzeAgeOfKey(input);
    }
    const localeKeysJSON = await loadJsonFile(input);

    let localeKeys = {};
    const allKeys = Object.keys(localeKeysJSON);
    if (nested) {
        allKeys.forEach((keyPath) => objectPath.set(localeKeys, `${keyPath}.$value`, {key: keyPath, translation: localeKeysJSON[keyPath]}));
        localeKeys = unwrapUnneeded$value(localeKeys, allKeys);
    } else {
        allKeys.forEach((key) => localeKeys[key.replace(/\./g, '_')] = {key, translation: localeKeysJSON[key]});
    }

    const tsClassBuilder = new TSLocaleKeysClassBuilder(coverage, translate, analyzedAgeOfKey, gracePeriod, localeKeysJSON, showTranslations);

    const finalClass = await tsClassBuilder.get(localeKeys, className);

    if (!fs.existsSync(output)) {
        shell.mkdir('-p', output);
    }

    fs.writeFileSync(`${output}/${className}.ts`, finalClass, 'utf-8');
}

module.exports = {generateLocaleClass};
