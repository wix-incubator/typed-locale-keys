const {TSLocaleKeysFunctionBuilder} = require('../utils/tsLocaleKeysFunctionBuilder');
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
            typeof current.$value === 'string') {
            objectPath.set(localeKeysUnwrapped, path, current.$value);
        }
    });

    return localeKeysUnwrapped;
};

async function generateLocaleFunction({input, output, functionName, nested, withTranslation, showTranslations}) {
    if (!input) {
        console.error('\033[31m', 'generateJsFile: expected argument \'--input\'');
        process.exit(1);
    }


    const localeKeysJSON = await loadJsonFile(input);

    // const getValue = (key, value) => JSON.stringify({key, translation: localeKeysJSON[key]});

    let localeKeys = {};
    const allKeys = Object.keys(localeKeysJSON);
    if (nested) {
        allKeys.forEach((key) => objectPath.set(localeKeys, `${key}.$value`, key));
        localeKeys = unwrapUnnecessary$value(localeKeys, allKeys);
    } else {
        allKeys.forEach(key => localeKeys[key] = key);//({key, translation: localeKeysJSON[key]}));
    }

    const tsFunctionBuilder = new TSLocaleKeysFunctionBuilder({withTranslation, localeKeysJSON, showTranslations});

    const finalFunction = await tsFunctionBuilder.get(localeKeys, functionName);

    if (!fs.existsSync(output)) {
        shell.mkdir('-p', output);
    }

    fs.writeFileSync(`${output}/${functionName}.ts`, finalFunction, 'utf-8');
}

module.exports = { generateLocaleFunction };
