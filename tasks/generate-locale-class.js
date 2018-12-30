const loadJsonFile = require('load-json-file');
const fs = require('fs');
const util = require('util');
const objectPath = require("object-path");

const ignoreCoverage = `/* istanbul ignore next line */`;
class TSClassBuilder {

    constructor(asFunction) {
        this.asFunction = asFunction;
    }

    getValue(stringValue) {
        if(this.asFunction) {
            return `() => '${stringValue}'`;
        }
        return `'${stringValue}'`;
    }

    getObjectToString(obj, indent = 2) {
        let final = '';
        const indentTemplate = '    ';
        let indentString = indentTemplate.repeat(indent);

        if(typeof obj === 'object') {
            const newIndent = ++indent;
            const printable = Object.keys(obj).map(key => (`${key}: ${this.getObjectToString(obj[key], newIndent)}`));
            final += `{\n`;
            printable.forEach(line => final += `${indentString}${line},\n`);
            final += `${indentString.slice(indentTemplate.length)}}`;
        } else {
            return `${this.getValue(obj)}`;
        }

        return final;
    }

    createTsClassStringMember(keyProp, realKey) {
        if (typeof realKey === 'string') {
            return `    public ${keyProp} = ${this.getValue(realKey)};\n`;
        } else {
            return `    public ${keyProp} = ${this.getObjectToString(realKey)};\n`;
        }
    }

    async get(srcObj, className = 'LocaleKeys') {
        let file;
        try {
            const readFile = util.promisify(fs.readFile);

            file = await readFile(require.resolve('../templates/localeKeysTemplate.ts'), 'utf-8');
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

async function generateLocaleClass({input}, {output, className, nested, coverage}) {
    if (!input) {
        console.error('\033[31m', 'generateJsFile: expected argument \'--input\'');
        process.exit(1);
    }

    const localeKeys = await loadJsonFile(input).then(localeKeys => {
        const final = {};
        if (nested) {
            Object.keys(localeKeys).forEach((key) => objectPath.set(final, key, key));
        } else {
            Object.keys(localeKeys).forEach((key) => final[key.replace(/\./g, '_')] = key);
        }
        return final;
    });

    const tsClassBuilder = new TSClassBuilder(coverage);

    const finalClass = await tsClassBuilder.get(localeKeys, className);

    if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
    }

    fs.writeFileSync(`${output}/${className}.ts`, finalClass, 'utf-8');
}

module.exports = {generateLocaleClass};
