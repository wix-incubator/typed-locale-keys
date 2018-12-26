const loadJsonFile = require('load-json-file');
const fs = require('fs');
const util = require('util');

class TSClassBuilder {

    createTsClassStringMember(keyProp, realKey) {
        return `    public ${keyProp}: string = '${realKey}';\n`;
    }

    async get(srcObj, className = 'LocaleKeys') {
        let file;
        try {
            const readFile = util.promisify(fs.readFile);

            file = await readFile('./templates/localeKeysTemplate.ts', 'utf-8');
        } catch (err) {
            console.error(err);
        }

        let keysProps = '';
        Object.keys(srcObj).forEach(rootKey => keysProps += this.createTsClassStringMember(rootKey, srcObj[rootKey]));

        file = file.replace('/* placeholder: keys here */', keysProps.trim());
        file = file.replace('LocaleKeysTemplate', className.trim());
        return file;
    }
}

async function generateLocaleClass(input, outPutDir, className) {

    if (!input) {
        console.error('\033[31m', 'generateJsFile: expected argument \'--input\'');
        process.exit(1);
    }

    const localeKeys = await loadJsonFile(input).then(localeKeys => {
        const final = {};
        Object.keys(localeKeys).forEach((key) => final[key.replace(/\./g, '_')] = key);
        return final;
    });

    const tsClassBuilder = new TSClassBuilder();

    const finalClass = await tsClassBuilder.get(localeKeys, className);

    if (!fs.existsSync(outPutDir)) {
        fs.mkdirSync(outPutDir);
    }

    fs.writeFileSync(`${outPutDir}/${className}.ts`, finalClass, 'utf-8');
}

module.exports = {generateLocaleClass};
