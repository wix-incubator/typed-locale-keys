const util = require('util');
const fs = require('fs');
const objectPath = require("object-path");
const stringifyObject = require("stringify-object");

const translateFunction = 'translate';

class TSLocaleKeysFunctionBuilder {

    constructor({withTranslation, showTranslations, localeKeysJSON}) {
        this.localeKeysJSON = localeKeysJSON;
        this.withTranslation = withTranslation;
        this.showTranslations = showTranslations;
    }

    getArgumentsType(keyContent) {
        let argumentsDeclaration = '';
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
            argumentsDeclaration = JSON.stringify(options)
                .replace(/"/g, '')
                .replace(/,/g, ', ')
                .replace(/{/g, ' { ')
                .replace(/}/g, ' }');
        }

        return argumentsDeclaration;
    }

    getKeyConvertedValue(key) {
        const translation = this.localeKeysJSON[key];
        let functionValue = `'${key}'`;
        // console.log('checking:', key,' to =>  ' , translation);
        if (this.withTranslation) {
            let keyArguments = '';
            const keyArgumentsType = this.getArgumentsType(translation);
            let translateArguments = [functionValue];
            if (keyArgumentsType) {
                const keyArgumentName = 'options';
                keyArguments = `${keyArgumentName}:${keyArgumentsType}`;
                translateArguments.push(keyArgumentName)
            }

            const translateFunctionCall = `${translateFunction}(${translateArguments.join(', ')})`;

            functionValue = `(${keyArguments}) => ${translateFunctionCall}`;
        }

        if (this.showTranslations) {
            functionValue = `${functionValue} /* ${translation} */`
        }

        return functionValue;
    }

    convertValues(srcObj) {
        if(typeof srcObj === 'string') {
            // return this.getKeyConvertedValue(srcObj);
            return `<-- value wrapper --${srcObj}-->`
        }

        Object.keys(srcObj).forEach(key => srcObj[key] = this.convertValues(srcObj[key]));

        return srcObj;
    }

    getKeys(srcObj) {
        const indent = '    ';

        const convertedValues = this.convertValues(srcObj);

        const stringifiedObject = stringifyObject(srcObj, {
            indent,
            transform: (_obj, _prop, originalValue) => {
                const realKeyValueExp = originalValue.match(/^'<-- value wrapper --(.*?)-->'/);
                if (!realKeyValueExp  || realKeyValueExp.length > 2) {
                    return originalValue;
                }
                return this.getKeyConvertedValue(realKeyValueExp[1]);
            }
        }).trim();

        return stringifiedObject.replace(/(\n)/g, `\n${indent}`);
    }

    getConstructorArgs(file) {
        let args = '';

        if (this.withTranslation) {
            args += `${translateFunction}: Function`;
        }

        return args.trim();
    }

    async get(srcObj, functionName) {
        let templateFilte;
        try {
            const readFile = util.promisify(fs.readFile);

            templateFilte = await readFile(require.resolve('../templates/localeKeysFunctionTemplate.ts'), 'utf-8');
        } catch (err) {
            console.error(err);
        }

        templateFilte = templateFilte.replace('LocaleKeysTemplate', functionName.trim());
        templateFilte = templateFilte.replace('/* constructor args */', this.getConstructorArgs());
        templateFilte = templateFilte.replace('/* placeholder: keys here */', this.getKeys(srcObj));
        return templateFilte;
    }
}

module.exports = {TSLocaleKeysFunctionBuilder};
