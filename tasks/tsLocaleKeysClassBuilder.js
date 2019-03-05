const util = require('util');
const fs = require('fs');
const objectPath = require("object-path");

const ignoreCoverage = (date) => date ? `/* istanbul ignore next (created at: ${date}) */` : '/* istanbul ignore next */';
const translateFunction = 'translate';

class TsLocaleKeysClassBuilder {

    constructor(withCoverage, withTranslation, analyzedAgeOfKey, gracePeriod, localeKeysJSON, showTranslations) {
        this.withTranslation = withTranslation;
        this.showTranslations = showTranslations;
        // this.localeKeysJSON = localeKeysJSON;
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

    getValue({key, translation}) {
        let functionValue = `'${key}'`;
        if (this.asFunction) {
            let keyArguments = '';

            if (this.withTranslation) {
                const keyArgumentsType = this.getArgumentsType(translation);
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
                const {age} = this.analyzedAgeOfKey[key] || {};
                const isInGracePeriod = age === undefined || age <= this.gracePeriod;
                if (isInGracePeriod) {
                    functionValue = `${ignoreCoverage()} ${functionValue}`;
                }
            }
        }

        if(this.showTranslations) {
            functionValue = `${functionValue} /* ${translation} */`
        }

        return functionValue;
    }

    convertObjectToString(obj, indent = 2) {
        let final = '';
        const indentTemplate = '    ';
        let indentString = indentTemplate.repeat(indent);

        if (typeof obj === 'object' && typeof obj.key === 'string' ) {
            return `${this.getValue(obj)}`;
        } else {
            const newIndent = ++indent;
            const printable = Object.keys(obj).map(key => (`${key}: ${this.convertObjectToString(obj[key], newIndent)}`));
            final += `{\n`;
            printable.forEach(line => final += `${indentString}${line},\n`);
            final += `${indentString.slice(indentTemplate.length)}}`;
        }

        return final;
    }

    createTsClassStringProperty(keyProp, realKey) {
        if (typeof realKey === 'object' && typeof realKey.key === 'string' ) {
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

module.exports = {TSLocaleKeysClassBuilder: TsLocaleKeysClassBuilder};
