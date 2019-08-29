const {TSLocaleKeysFunctionBuilder} = require('../utils/tsLocaleKeysFunctionBuilder');
const loadJsonFile = require('load-json-file');
const fs = require('fs');
const objectPath = require("object-path");
const shell = require('shelljs');

async function generateLocaleFunction({input, output, functionName, nested, withTranslation, showTranslations}) {
    if (!input) {
        console.error('\033[31m', 'generateJsFile: expected argument \'--input\'');
        process.exit(1);
    }
    const localeKeysJSON = await loadJsonFile(input);
    const allKeys = Object.keys(localeKeysJSON);

    const tsFunctionBuilder = new TSLocaleKeysFunctionBuilder({nested, withTranslation, localeKeysJSON, showTranslations, functionName});

    const finalFunction = await tsFunctionBuilder.get(allKeys);

    if (!fs.existsSync(output)) {
        shell.mkdir('-p', output);
    }

    fs.writeFileSync(`${output}/${functionName}.ts`, finalFunction, 'utf-8');
}

module.exports = { generateLocaleFunction };
