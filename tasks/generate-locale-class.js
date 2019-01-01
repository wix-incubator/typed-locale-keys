const loadJsonFile = require('load-json-file');
const fs = require('fs');
const util = require('util');
const objectPath = require("object-path");

const ignoreCoverage = `/* istanbul ignore next line */`;
const translateFunction = 'translate';

class TSClassBuilder {

    constructor(asFunction, withTranslation) {
        this.withTranslation = withTranslation;
        this.asFunction = asFunction || withTranslation;
    }

    getValue(stringValue) {
        if (this.asFunction) {
            let functionValue = `'${stringValue}'`;

            if (this.withTranslation) {
                functionValue = `this.${translateFunction}(${functionValue})`;
            }

            return `() => ${functionValue}`;
        }
        return `'${stringValue}'`;
    }

    convertObjectToString(obj, indent = 2) {
        let final = '';
        const indentTemplate = '    ';
        let indentString = indentTemplate.repeat(indent);

        if (typeof obj === 'object') {
            const newIndent = ++indent;
            const printable = Object.keys(obj).map(key => (`${key}: ${this.convertObjectToString(obj[key], newIndent)}`));
            final += `{\n`;
            printable.forEach(line => final += `${indentString}${line},\n`);
            final += `${indentString.slice(indentTemplate.length)}}`;
        } else {
            return `${this.getValue(obj)}`;
        }

        return final;
    }

    createTsClassStringProperty(keyProp, realKey) {
        if (typeof realKey === 'string') {
            return `    public ${keyProp} = ${this.getValue(realKey)};\n`;
        } else {
            return `    public ${keyProp} = ${this.convertObjectToString(realKey)};\n`;
        }
    }

    setKeysToProps(file, srcObj) {
        let keysProps = '';
        Object.keys(srcObj).forEach(rootKey => keysProps += this.createTsClassStringProperty(rootKey, srcObj[rootKey]));

        return file.replace('/* placeholder: keys here */', keysProps.trim());
    }

    setConstructorArgs(file) {
        let args = '';

        if (this.withTranslation) {
            args += `private ${translateFunction}: Function`;
        }

        return file.replace('/* constructor args */', args.trim());
    }

    async get(srcObj, className) {
        let file;
        try {
            const readFile = util.promisify(fs.readFile);

            file = await readFile(require.resolve('../templates/localeKeysTemplate.ts'), 'utf-8');
        } catch (err) {
            console.error(err);
        }

        file = file.replace('LocaleKeysTemplate', className.trim());
        file = this.setConstructorArgs(file);
        file = this.setKeysToProps(file, srcObj);
        return file;
    }
}

async function generateLocaleClass({input}, {output, className, nested, coverage, translate}) {
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

    const tsClassBuilder = new TSClassBuilder(coverage, translate);

    const finalClass = await tsClassBuilder.get(localeKeys, className);

    if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
    }

    fs.writeFileSync(`${output}/${className}.ts`, finalClass, 'utf-8');
}

module.exports = {generateLocaleClass};
