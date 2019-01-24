const loadJsonFile = require('load-json-file');
const fs = require('fs');
const util = require('util');
const objectPath = require("object-path");
const {analyzeAgeOfKey} = require('./analyze-age-of-key');
const shell = require('shelljs');

const ignoreCoverage = (date) => date ? `/* istanbul ignore next (created at: ${date}) */` : '/* istanbul ignore next */';
const translateFunction = 'translate';

class TSClassBuilder {

    constructor(withCoverage, withTranslation, analyzedAgeOfKey, gracePeriod, localeKeysJSON) {
        this.withTranslation = withTranslation;
        this.localeKeysJSON = localeKeysJSON;
        this.withCoverage = withCoverage;
        this.gracePeriod = gracePeriod;
        this.analyzedAgeOfKey = analyzedAgeOfKey;
        this.asFunction = withCoverage || withTranslation;
    }

    getArgumentsType(keyContent) {
        let argumentsDecleration = '';
        const getParamWrapper = /{{[^}]+}}/g;
        const gettingParam = /[a-z0-9A-Z_$.]+/;
        const argumentsWrappers = keyContent.match(getParamWrapper);

        if (argumentsWrappers) {
            let options = {};
            argumentsWrappers.forEach(wrapper => {
                const argument = wrapper.match(gettingParam)[0];
                if (argument) {
                    objectPath.set(options, argument, ' any')
                }
            });
            argumentsDecleration = JSON.stringify(options)
                // .replace(/-9999/g, ' string')
                .replace(/"/g, '')
                .replace(/,/g, ', ')
                .replace(/{/g, ' { ')
                .replace(/}/g, ' }');
        }

        return argumentsDecleration;
    }

    getValue(stringValue) {
        if (this.asFunction) {
            let functionValue = `'${stringValue}'`;
            let keyArguments = '';

            if (this.withTranslation) {
                const keyArgumentsType = this.getArgumentsType(this.localeKeysJSON[stringValue]);
                let translateArguments = [functionValue];
                if (keyArgumentsType) {
                    const keyArgumentName = 'options';
                    keyArguments = `${keyArgumentName}:${keyArgumentsType}`;
                    translateArguments.push(keyArgumentName)
                }

                functionValue = `this.${translateFunction}(${translateArguments.join(', ')})`;
            }

            functionValue = `(${keyArguments}) => ${functionValue}`;

            if (this.withCoverage) {
                const {age} = this.analyzedAgeOfKey[stringValue] || {};
                const isInGracePeriod = age === undefined || age <= this.gracePeriod;
                if (isInGracePeriod) {
                    functionValue = `${ignoreCoverage()} ${functionValue}`;
                }
            }

            return functionValue;
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


const unwrapUnneeded$value = function (localeKeys, allKeys) {
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

async function generateLocaleClass({input, output, className, nested, coverage, translate, gracePeriod}) {
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
        allKeys.forEach((keyPath) => objectPath.set(localeKeys, `${keyPath}.$value`, keyPath));
        localeKeys = unwrapUnneeded$value(localeKeys, allKeys);
    } else {
        allKeys.forEach((key) => localeKeys[key.replace(/\./g, '_')] = key);
    }

    const tsClassBuilder = new TSClassBuilder(coverage, translate, analyzedAgeOfKey, gracePeriod, localeKeysJSON);

    const finalClass = await tsClassBuilder.get(localeKeys, className);

    if (!fs.existsSync(output)) {
        shell.mkdir('-p', output);
    }

    fs.writeFileSync(`${output}/${className}.ts`, finalClass, 'utf-8');
}

module.exports = {generateLocaleClass};
